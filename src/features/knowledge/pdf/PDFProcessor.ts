import * as TextRecognition from '@dariyd/react-native-text-recognition';
import * as DigitalExtract from 'expo-pdf-text-extract';
import { logger } from '../../../core/logging/Logger';
import { getAIProvider } from '../../../ai/AIProviderFactory';
import { Platform } from '../../../platform/Platform';
import { useKnowledgeStore } from '../KnowledgeStore';

export interface PDFMetadata {
  title?: string;
  author?: string;
  pageCount?: number;
}

export class PDFProcessor {
  async process(uri: string): Promise<string> {
    const tempPath = `${Platform.FileSystem.documentDirectory}ingestion_temp.pdf`;

    try {
      const { setLoading } = useKnowledgeStore.getState();
      logger.info(`[PDF] STARTING ROBUST INGESTION: ${uri}`);

      // 1. AVAILABILITY CHECK
      const isDigitalAvailable = typeof DigitalExtract.isAvailable === 'function' && DigitalExtract.isAvailable();
      logger.info(`[PDF] Engine Status -> Digital: ${isDigitalAvailable}, Vision: ${typeof TextRecognition.recognizeText === 'function'}`);

      // 2. CREATE LOCAL COPY (CRITICAL FOR ANDROID)
      logger.info(`[PDF] Step 1: Copying to internal storage: ${tempPath}`);
      await Platform.FileSystem.copyFile(uri, tempPath);

      let finalText = "";
      let extractionMethod = "NONE";

      // 3. ENGINE A: VISION (ML KIT) - Best for complex layouts
      if (typeof TextRecognition.recognizeText === 'function') {
        try {
          setLoading(true, 'Analyzing visual layout... 👁️');

          const rawPath = tempPath.replace('file://', '');
          const contentUri = await Platform.FileSystem.getContentUri(tempPath);

          const attempts = [
            { name: 'Content URI (200 DPI)', path: contentUri, dpi: 200 },
            { name: 'Content URI (150 DPI)', path: contentUri, dpi: 150 },
            { name: 'File URI (100 DPI)', path: tempPath, dpi: 100 }
          ];

          for (const attempt of attempts) {
             if (finalText) break;
             try {
                logger.info(`[PDF] Vision Attempt: ${attempt.name}`);
                const result = await TextRecognition.recognizeText(attempt.path, {
                  pdfDpi: attempt.dpi,
                  preprocessImages: true,
                  recognitionLevel: 'line', // Best for columns
                  languages: ['en']
                });

                if (result && result.blocks && result.blocks.length > 0) {
                  finalText = this.sortByReadingOrder(result.blocks);
                  extractionMethod = "VISION";
                  logger.info(`[PDF] Vision Success with ${attempt.name}: Found ${result.blocks.length} blocks.`);
                } else {
                  // Small delay to allow ML Kit model download if pending
                  await new Promise(r => setTimeout(r, 1000));
                }
             } catch (err) {
                logger.warn(`[PDF] Vision ${attempt.name} failed`);
             }
          }

          if (!finalText) {
            logger.warn('[PDF] All Vision path formats returned 0 blocks.');
          }
        } catch (visionErr: any) {
          logger.warn(`[PDF] Vision Engine fatal error: ${visionErr.message || 'Unknown error'}`);
        }
      }

      // 4. ENGINE B: DIGITAL (PDFBox) - Fallback for clean text layers
      if ((!finalText || finalText.trim().length < 50) && isDigitalAvailable) {
        try {
          setLoading(true, 'Reading document layers... 📂');
          logger.info('[PDF] Step 3: Attempting Digital Engine fallback...');
          // Digital extractor often prefers the file:// URI on Android
          const digitalText = await DigitalExtract.extractText(tempPath);

          if (digitalText && digitalText.trim().length > 0) {
            finalText = this.cleanDigitalText(digitalText);
            extractionMethod = "DIGITAL";
            logger.info(`[PDF] Digital Success: Extracted ${finalText.length} characters.`);
          }
        } catch (digitalErr) {
          logger.error('[PDF] Digital Engine failed', digitalErr);
        }
      }

      // 5. VALIDATION
      if (!finalText || finalText.trim().length === 0) {
        throw new Error('All extraction engines failed. This PDF might be encrypted, empty, or use an unsupported format.');
      }

      // 6. AI REFINEMENT (The "Truth" Pass)
      logger.info('[PDF] Step 4: Running AI Refinement...');
      setLoading(true, 'Reconstructing logical flow... 🛠️');

      // console.log('--- RAW EXTRACTION START ---');
      // console.log(finalText);
      // console.log('--- RAW EXTRACTION END ---');

      const refinedText = await this.aiRefinementPass(finalText, extractionMethod === "DIGITAL");

      console.log('--- AI REFINED TEXT START ---');
      console.log(refinedText);
      console.log('--- AI REFINED TEXT END ---');

      // 7. CLEANUP
      await Platform.FileSystem.deleteFile(tempPath);

      // 8. TERMINAL VERIFICATION
      console.log('--- INDUSTRY PDF EXTRACTION SUCCESS ---');
      console.log(`Method: ${extractionMethod}`);
      console.log(`Initial Size: ${finalText.length} chars`);
      console.log(`Final Size: ${refinedText.length} chars`);
      console.log('---------------------------------------');

      return refinedText;

    } catch (error) {
      // Ensure cleanup even on error
      try { await Platform.FileSystem.deleteFile(tempPath); } catch {}
      logger.error('[PDF] INGESTION FAILED', error);
      throw error;
    }
  }

  private sortByReadingOrder(blocks: any[]): string {
    if (blocks.length === 0) return "";

    // 1. Identify "Starting Lanes" (Columns)
    // We cluster blocks that start at similar X coordinates
    const lanes: { x: number; blocks: any[] }[] = [];
    const X_TOLERANCE = 50; // Pixels allowed for minor alignment drift

    // Sort by X to process lanes left-to-right
    const xSortedBlocks = [...blocks].sort((a, b) => a.frame.x - b.frame.x);

    xSortedBlocks.forEach(block => {
      let foundLane = lanes.find(lane => Math.abs(lane.x - block.frame.x) < X_TOLERANCE);
      if (foundLane) {
        foundLane.blocks.push(block);
      } else {
        lanes.push({ x: block.frame.x, blocks: [block] });
      }
    });

    // 2. Sort within each lane by Y (Top-to-Bottom)
    // And sort lanes by X (Left-to-Right)
    const orderedLanes = lanes.sort((a, b) => a.x - b.x);

    let resultText = "";
    orderedLanes.forEach((lane, index) => {
      const sortedBlocks = lane.blocks.sort((a, b) => a.frame.y - b.frame.y);
      const laneText = sortedBlocks.map(b => b.text).join('\n\n');

      resultText += (index > 0 ? '\n\n' : '') + laneText;
      logger.info(`[PDF] Processed Lane ${index + 1} at X=${lane.x} with ${lane.blocks.length} blocks.`);
    });

    return resultText;
  }

  private cleanDigitalText(text: string): string {
    // PRE-PROCESS: Add explicit column markers for the AI to see
    // We look for at least 3 consecutive spaces which often indicates a column gutter
    return text
      .replace(/ {3,}/g, ' [COLUMN_GAP] ')
      .replace(/\s+/g, ' ')
      .replace(/(\w+)-\s+(\w+)/g, '$1$2')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  private async aiRefinementPass(text: string, isJumbled: boolean): Promise<string> {
    try {
      const { useAIModelStore } = await import('../../../ai/AIModelManager');
      const { setLoading } = useKnowledgeStore.getState();
      const modelStore = useAIModelStore.getState();

      if (modelStore.state === 'LOADING' || modelStore.state === 'READY') {
        setLoading(true, 'Waiting for AI engine to wake up... 🧠\n(Finishing background setup)');
        await modelStore.waitForModelReady();
      }

      if (useAIModelStore.getState().state !== 'LOADED') return text;

      const aiProvider = getAIProvider();

      // CONTEXTUAL CHUNKING: Split by major resume/document headers to preserve section context
      const parts = text.split(/(?=TECHNICAL STACK|WORK EXPERIENCE|ACHIEVEMENTS|PROJECTS|CERTIFICATIONS|Languages:|Mobile Core:|Cross-Platform \u0026 Web:|Mobile AI \u0026 SDKs:|AI Productivity:|Agile \u0026 DevOps:)/i)
                       .filter(p => p.trim().length > 0);

      let refinedResult = "";
      for (let i = 0; i < parts.length; i++) {
        setLoading(true, `Reconstructing document... 🛠️\n(Section ${i + 1} of ${parts.length})`);
        logger.info(`[PDF] AI Refinement: Processing section ${i + 1}/${parts.length}...`);

        const systemPrompt = `You are a Document Reconstructor.
A 2-column document was read horizontally, mixing words from different columns.

STRICT INSTRUCTIONS:
1. UNTANGLE the text so it reads vertically, column by column.
2. OUTPUT ONLY THE UNTANGLED TEXT.
3. DO NOT change any words. DO NOT summarize.
4. If you see "[COLUMN_GAP]", it means the text to the left is Column 1 and the text to the right is Column 2.
5. Process ONLY the provided segment. Do not repeat previous sections.`;

        const response = await aiProvider.generate({
          prompt: `<segment_to_untangle>\n${parts[i]}\n</segment_to_untangle>\n\nUntangled Text:`,
          systemPrompt,
          temperature: 0.0
        });

        const cleanedPart = response.text.replace(/<.*?>/g, '').trim();

        // Prevent duplication: only add if this part isn't already a significant portion of refinedResult
        if (cleanedPart.length > 10 && !refinedResult.includes(cleanedPart.substring(0, 30))) {
          refinedResult += cleanedPart + "\n\n";
        }
      }

      return refinedResult.trim();
    } catch (e) {
      logger.warn('[PDF] AI Refinement pass failed or timed out.', e);
      return text;
    }
  }

  async extractMetadata(uri: string): Promise<PDFMetadata> {
    try {
      const count = await DigitalExtract.getPageCount(uri);
      return { title: 'PDF Document', pageCount: count };
    } catch {
      return { title: 'PDF Document' };
    }
  }
}

export const pdfProcessor = new PDFProcessor();
