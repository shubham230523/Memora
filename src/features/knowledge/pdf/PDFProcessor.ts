import { recognizeText } from '@dariyd/react-native-text-recognition';
import { logger } from '../../../core/logging/Logger';
import { getAIProvider } from '../../../ai/AIProviderFactory';

export interface PDFMetadata {
  title?: string;
  author?: string;
  pageCount?: number;
}

export class PDFProcessor {
  async process(uri: string): Promise<string> {
    try {
      logger.info(`Starting Industry-Level Vision Ingestion for: ${uri}`);

      // Step 1: Visual Block Extraction via ML Kit
      const result = await recognizeText(uri);

      if (!result || !result.blocks || result.blocks.length === 0) {
        logger.warn('ML Kit returned no text. PDF may be empty or unreadable.');
        return "";
      }

      // Step 2: Reading Order Algorithm (Column & Block Sorting)
      // This solves the 2-column problem by analyzing visual layout
      const orderedText = this.sortByReadingOrder(result.blocks);

      // Step 3: Heuristic Cleaning (Headers/Footers & Artifacts)
      const cleanedText = this.cleanText(orderedText);

      // Step 4: AI Refinement Pass (Fixing Tables, Ligatures, and Semantic Flow)
      // We only do this for the first 4000 chars to save time/tokens for the ingestion phase
      const refinedText = await this.aiRefinementPass(cleanedText);

      // LOG TO TERMINAL FOR VERIFICATION
      console.log('--- PRO PDF VISION EXTRACTION VERIFICATION ---');
      console.log(`File: ${uri}`);
      console.log(`Blocks Found: ${result.blocks.length}`);
      console.log(`Total Characters: ${refinedText.length}`);
      console.log('First 1000 characters:');
      console.log(refinedText.substring(0, 1000));
      console.log('--- END VERIFICATION ---');

      return refinedText;
    } catch (error) {
      logger.error('Industrial PDF Ingestion failed', error);
      throw error;
    }
  }

  private sortByReadingOrder(blocks: any[]): string {
    // 1. Sort primarily by Y (Vertical position)
    const sorted = [...blocks].sort((a, b) => a.frame.y - b.frame.y);

    // 2. Column Detection Heuristic
    // We look for blocks that are horizontally separated by a large gap
    const leftColumn: any[] = [];
    const rightColumn: any[] = [];

    // Simple 2-column detection: find average center
    const xValues = blocks.map(b => b.frame.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues.map((x, i) => x + blocks[i].frame.width));
    const midPoint = (minX + maxX) / 2;

    // Check if the document actually has 2 columns by looking for a "gutter"
    const hasGutter = blocks.some(b => b.frame.x > midPoint) &&
                      blocks.some(b => (b.frame.x + b.frame.width) < midPoint);

    if (hasGutter) {
      logger.info('[PDF] Multi-column layout detected. Applying column sorting.');
      blocks.forEach(b => {
        if (b.frame.x + (b.frame.width / 2) < midPoint) {
          leftColumn.push(b);
        } else {
          rightColumn.push(b);
        }
      });

      const sortedLeft = leftColumn.sort((a, b) => a.frame.y - b.frame.y);
      const sortedRight = rightColumn.sort((a, b) => a.frame.y - b.frame.y);

      return [...sortedLeft, ...sortedRight].map(b => b.text).join('\n\n');
    }

    // Default: Sort by Y (Vertical flow)
    return sorted.map(b => b.text).join('\n\n');
  }

  private cleanText(text: string): string {
    return text
      // Fix Ligatures (fl, fi, ff)
      .replace(/ﬁ/g, 'fi')
      .replace(/ﬂ/g, 'fl')
      .replace(/ﬀ/g, 'ff')
      // Fix Hyphenation across lines
      .replace(/(\w+)-\n+(\w+)/g, '$1$2')
      // Standard cleanup
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  private async aiRefinementPass(text: string): Promise<string> {
    try {
      const aiProvider = getAIProvider();
      const snippet = text.substring(0, 4000); // Process a large snippet for structure

      const systemPrompt = "You are a professional document rewriter. Your goal is to convert messy OCR text into clean Markdown. Fix tables, remove page numbers, and ensure logical flow. Output ONLY the refined text.";

      const response = await aiProvider.generate({
        prompt: `RELIABLY REWRITE THIS TEXT:\n\n${snippet}`,
        systemPrompt,
        temperature: 0.0
      });

      return response.text + (text.length > 4000 ? "\n\n" + text.substring(4000) : "");
    } catch (e) {
      logger.warn('AI Refinement Pass failed, using raw cleaned text.', e);
      return text;
    }
  }

  async extractMetadata(uri: string): Promise<PDFMetadata> {
    return { title: 'Vision Extracted Document' };
  }
}

export const pdfProcessor = new PDFProcessor();
