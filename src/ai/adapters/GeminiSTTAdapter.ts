import { appConfig } from '../../core/config/appConfig';
import { AppError, ErrorCode } from '../../core/errors/AppError';
import { logger } from '../../core/logging/Logger';

export class GeminiSTTAdapter {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = appConfig.ai.gemini.apiKey;
  }

  async transcribe(base64Audio: string, mimeType: string = 'audio/m4a'): Promise<string> {
    if (!this.apiKey) {
      throw new AppError(ErrorCode.AI_PROVIDER, 'Gemini API key is missing');
    }

    logger.info(`[GeminiSTT] Sending audio to Gemini for transcription (${mimeType})...`);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Transcribe this audio verbatim. No conversational filler. If there is no speech, return an empty string." },
              {
                inlineData: {
                  mimeType,
                  data: base64Audio,
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.0,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('[GeminiSTT] Request failed', errorData);
        throw new AppError(ErrorCode.AI_PROVIDER, `Gemini STT failed: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      logger.info(`[GeminiSTT] Transcription successful. Length: ${text.length} chars`);
      return text.trim();
    } catch (error) {
      logger.error('[GeminiSTT] Error during transcription', error);
      throw error;
    }
  }
}

export const geminiSTTAdapter = new GeminiSTTAdapter();
