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

          // TRY 1: Raw Path (No file://)
          const rawPath = tempPath.replace('file://', '');
          logger.info(`[PDF] Vision Try 1 (Raw Path): ${rawPath}`);
          let result = await TextRecognition.recognizeText(rawPath);

          // TRY 2: URI (if Try 1 failed to find blocks)
          if (!result || !result.blocks || result.blocks.length === 0) {
            logger.info(`[PDF] Vision Try 2 (Full URI): ${tempPath}`);
            result = await TextRecognition.recognizeText(tempPath);
          }

          if (result && result.blocks && result.blocks.length > 0) {
            finalText = this.sortByReadingOrder(result.blocks);
            extractionMethod = "VISION";
            logger.info(`[PDF] Vision Success: Found ${result.blocks.length} blocks.`);
          } else {
            logger.warn('[PDF] Vision returned 0 blocks. Document might be digital-only or native module is restricted.');
          }
        } catch (visionErr: any) {
          logger.warn(`[PDF] Vision Engine failed: ${visionErr.message || 'Unknown error'}`);
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

      console.log('--- RAW EXTRACTION START ---');
      console.log(finalText);
      console.log('--- RAW EXTRACTION END ---');

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
    return text
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

      // SEGMENTED REFINEMENT: Break text into 1500 char pieces to avoid AI memory crash
      const chunkSize = 1500;
      const parts = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        parts.push(text.substring(i, i + chunkSize));
      }

      let refinedResult = "";
      for (let i = 0; i < parts.length; i++) {
        setLoading(true, `Reconstructing document... 🛠️\n(Part ${i + 1} of ${parts.length})`);
        logger.info(`[PDF] AI Refinement: Processing part ${i + 1}/${parts.length}...`);

        const systemPrompt = `You are a Document Layout Reconstructor.
Your goal is to fix text that was read horizontally across multiple vertical columns.

INSTRUCTIONS:
1. Identify blocks of text that belong together vertically (like a "Work Experience" section or a "Skills" list).
2. UNTANGLE lines where words from different columns were mixed together.
3. OUTPUT ONLY the verbatim text from the document, but in the correct top-to-bottom, column-by-column order.
4. DO NOT summarize. DO NOT say "Here is the text". DO NOT change any words.

EXAMPLE:
INPUT: "Skill: React, Work: Google, Year: 2024, Location: NY"
OUTPUT:
"Skill: React
Year: 2024

Work: Google
Location: NY"`;

        const response = await aiProvider.generate({
          prompt: `RESTORE THIS JUMBLED TEXT:\n\n${parts[i]}`,
          systemPrompt,
          temperature: 0.0
        });

        refinedResult += response.text + "\n\n";
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
