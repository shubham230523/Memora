import * as TextRecognition from '@dariyd/react-native-text-recognition';
import * as DigitalExtract from 'expo-pdf-text-extract';
import { logger } from '../../../core/logging/Logger';
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
      let wasUntangled = false;

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

                if (result.success && result.fullText) {
                  // For PDFs, we use the fullText directly if we want a simple flow,
                  // or we can attempt to extract blocks from result.pages if we want layout-aware sorting.
                  // For now, let's use the fullText which is already concatenated.
                  finalText = result.fullText;
                  extractionMethod = "VISION";
                  logger.info(`[PDF] Vision Success with ${attempt.name}: Found ${finalText.length} characters.`);
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
            const result = this.cleanDigitalText(digitalText);
            finalText = result.text;
            wasUntangled = result.wasUntangled;
            extractionMethod = wasUntangled ? "DIGITAL_STATISTICAL" : "DIGITAL";
            logger.info(`[PDF] Digital Success: Extracted ${finalText.length} characters (Untangled: ${wasUntangled}).`);
          }
        } catch (digitalErr) {
          logger.error('[PDF] Digital Engine failed', digitalErr);
        }
      }

      // 6. VALIDATION
      if (!finalText || finalText.trim().length === 0) {
        throw new Error('All extraction engines failed. This PDF might be encrypted, empty, or use an unsupported format.');
      }

      // 7. CLEANUP
      await Platform.FileSystem.deleteFile(tempPath);

      // 8. TERMINAL VERIFICATION
      console.log('--- INDUSTRY PDF EXTRACTION SUCCESS ---');
      console.log(`Method: ${extractionMethod}`);
      console.log(`Initial Size: ${finalText.length} chars`);
      console.log('--- EXTRACTED TEXT START ---');
      console.log(finalText);
      console.log('--- EXTRACTED TEXT END ---');
      console.log('---------------------------------------');

      return finalText;

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

  private cleanDigitalText(text: string): { text: string; wasUntangled: boolean } {
    const { text: untangledText, detected } = this.statisticalUntangle(text);

    if (detected) {
      // For untangled text, we preserve structure but clean minor artifacts
      const cleaned = untangledText
        .replace(/(\w+)-\s+(\w+)/g, '$1$2') // Fix hyphenation
        .replace(/ {2,}/g, ' ') // Squash multiple spaces
        .trim();
      return { text: cleaned, wasUntangled: true };
    }

    // Standard linear cleaning fallback
    const cleaned = text
      .replace(/ {3,}/g, ' [COLUMN_GAP] ')
      .replace(/\s+/g, ' ')
      .replace(/(\w+)-\s+(\w+)/g, '$1$2')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return { text: cleaned, wasUntangled: false };
  }

  private statisticalUntangle(text: string): { text: string; detected: boolean } {
    const lines = text.split('\n');
    if (lines.length < 10) return { text, detected: false };

    const gapCounts: Record<number, number> = {};
    lines.forEach(line => {
      // Find the first gap of 3+ spaces
      const match = line.match(/ {3,}/);
      if (match && match.index !== undefined) {
        const index = match.index;
        gapCounts[index] = (gapCounts[index] || 0) + 1;
      }
    });

    let bestGutter = -1;
    let maxCount = 0;
    for (const [index, count] of Object.entries(gapCounts)) {
      const c = count as number;
      if (c > maxCount) {
        maxCount = c;
        bestGutter = parseInt(index);
      }
    }

    const MIN_LINE_PERCENTAGE = 0.3;
    if (bestGutter === -1 || maxCount / lines.length < MIN_LINE_PERCENTAGE) {
      return { text, detected: false };
    }

    logger.info(`[PDF] Statistical Gutter Detected at char ${bestGutter} (${maxCount} lines)`);

    const leftLane: string[] = [];
    const rightLane: string[] = [];

    lines.forEach(line => {
      const left = line.substring(0, bestGutter).trim();
      const right = line.substring(bestGutter).trim();
      if (left) leftLane.push(left);
      if (right) rightLane.push(right);
    });

    const untangled = [
      ...leftLane,
      "\n--- COLUMN BREAK ---\n",
      ...rightLane
    ].join('\n');

    return { text: untangled, detected: true };
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
