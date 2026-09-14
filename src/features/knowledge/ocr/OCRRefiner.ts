import { getAIProvider } from '../../../ai/AIProviderFactory';
import { logger } from '../../../core/logging/Logger';
import { useAIModelStore } from '../../../ai/AIModelManager';

const REFINEMENT_SYSTEM_PROMPT = `You are a precision OCR cleanup tool.
Your goal is to extract meaningful knowledge and prose from noisy OCR data.

STRICT RULES:
1. REMOVE: UI labels (Search, Share, Back), System info (Battery, 10:28 AM), Keyboard keys (F1, Del, Ctrl), and random symbols.
2. KEEP: All paragraphs, article text, headers, and factual information.
3. VERBATIM: Do not rephrase, summarize, or fix grammar of the content you keep.
4. NO_CONTENT: If the text contains ONLY noise and no meaningful knowledge, respond with: NO_CONTENT_FOUND.

Output ONLY the cleaned text. No conversational filler.`;

export class OCRRefiner {
  async refine(rawText: string): Promise<string> {
    const { state } = useAIModelStore.getState();

    // Fallback if local model is not ready to avoid blocking the pipeline
    if (state !== 'LOADED') {
      logger.info('[OCR] AI Model not loaded, skipping refinement pass');
      return rawText;
    }

    logger.info('[OCR] Starting AI refinement pass...');

    try {
      const aiProvider = getAIProvider();
      const response = await aiProvider.generate({
        prompt: `RAW OCR DATA:\n---\n${rawText}\n---\n\nCLEANED TEXT:`,
        systemPrompt: REFINEMENT_SYSTEM_PROMPT,
        temperature: 0.0,
      });

      const refinedText = response.text.trim();

      if (refinedText === 'NO_CONTENT_FOUND') {
        logger.warn('[OCR] AI determined image contains no meaningful content');
        return rawText; // Fallback to raw rather than deleting everything, for safety
      }

      if (refinedText.length < rawText.length * 0.1 && rawText.length > 500) {
        logger.warn('[OCR] AI removed >90% of text, suspicious. Falling back to raw.');
        return rawText;
      }

      logger.info(`[OCR] Refinement complete. Reduced noise: ${rawText.length} -> ${refinedText.length} chars`);
      return refinedText;
    } catch (error) {
      logger.error('[OCR] AI refinement failed', error);
      return rawText;
    }
  }
}

export const ocrRefiner = new OCRRefiner();
