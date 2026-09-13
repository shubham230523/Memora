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
          setLoading(true, 'Extracting text layout... (10s)');
          logger.info('[PDF] Step 2: Attempting Vision Engine...');
          // On Android, remove file:// for ML Kit if needed
          const visionPath = tempPath.replace('file://', '');
          const result = await TextRecognition.recognizeText(visionPath);

          if (result && result.blocks && result.blocks.length > 0) {
            finalText = this.sortByReadingOrder(result.blocks);
            extractionMethod = "VISION";
            logger.info(`[PDF] Vision Success: Found ${result.blocks.length} blocks.`);
          }
        } catch (visionErr) {
          logger.warn('[PDF] Vision Engine failed', visionErr);
        }
      }

      // 4. ENGINE B: DIGITAL (PDFBox) - Fallback for clean text layers
      if ((!finalText || finalText.trim().length < 50) && isDigitalAvailable) {
        try {
          setLoading(true, 'Reading document layers... (5s)');
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

      // 6. AI REFINEMENT (SKIP FOR NOW DUE TO TRUNCATION)
      logger.info('[PDF] Step 4: Finalizing text (AI Refinement skipped to prevent character loss)...');
      const refinedText = finalText; // Keep 100% of characters

      // 7. CLEANUP
      await Platform.FileSystem.deleteFile(tempPath);

      // 8. TERMINAL VERIFICATION & DUMP
      console.log('--- INDUSTRY PDF EXTRACTION SUCCESS ---');
      console.log(`Method: ${extractionMethod}`);
      console.log(`Final Size: ${refinedText.length} chars`);
      console.log('FULL_TEXT_DUMP_START');
      console.log(refinedText);
      console.log('FULL_TEXT_DUMP_END');
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
    const xValues = blocks.map(b => b.frame.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues.map((x, i) => x + blocks[i].frame.width));
    const midPoint = (minX + maxX) / 2;

    const hasGutter = blocks.some(b => b.frame.x > midPoint) &&
                      blocks.some(b => (b.frame.x + b.frame.width) < midPoint);

    if (hasGutter) {
      const left = blocks.filter(b => b.frame.x + (b.frame.width / 2) < midPoint).sort((a, b) => a.frame.y - b.frame.y);
      const right = blocks.filter(b => b.frame.x + (b.frame.width / 2) >= midPoint).sort((a, b) => a.frame.y - b.frame.y);
      return [...left, ...right].map(b => b.text).join('\n\n');
    }

    return blocks.sort((a, b) => a.frame.y - b.frame.y).map(b => b.text).join('\n\n');
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

      // If model is not loaded but ready on disk, load it now
      if (modelStore.state === 'READY') {
        setLoading(true, 'Waking up AI engine... (10s)');
        logger.info('[PDF] AI Model ready on disk but not in memory. Loading for refinement...');
        await modelStore.loadModel();
      }

      // Re-check state after potential load
      const currentState = useAIModelStore.getState().state;
      if (currentState !== 'LOADED') {
        logger.warn(`[PDF] AI Model state is ${currentState}, skipping refinement pass to avoid crash.`);
        return text;
      }

      const aiProvider = getAIProvider();
      const snippet = text.substring(0, 4000);

      const systemPrompt = isJumbled
        ? "You are a document extraction expert. Reorder the horizontally jumbled 2-column text into a logical single column. Fix word breaks. Output ONLY the reordered text."
        : "You are a professional text cleaner. Fix OCR errors, remove PDF artifacts, and normalize formatting. Output ONLY the cleaned text.";

      const response = await aiProvider.generate({
        prompt: `EXTRACTED DATA:\n\n${snippet}`,
        systemPrompt,
        temperature: 0.0
      });

      return response.text + (text.length > 4000 ? "\n\n" + text.substring(4000) : "");
    } catch (e) {
      logger.warn('[PDF] AI Refinement pass failed or skipped.', e);
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
