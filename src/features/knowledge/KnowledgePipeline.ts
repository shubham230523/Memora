import { pdfProcessor } from './pdf/PDFProcessor';
import { voiceProcessor } from './voice/VoiceProcessor';
import { noteRepository } from '../notes/NoteRepository';
import { logger } from '../../core/logging/Logger';
import { Platform } from '../../platform/Platform';

export class KnowledgePipeline {
  async ingestPDF(uri: string, name: string): Promise<void> {
    try {
      const text = await pdfProcessor.process(uri);
      await noteRepository.create(`PDF: ${name}`, text);
      logger.info(`Successfully ingested PDF: ${name}`);
    } catch (error) {
      logger.error(`Failed to ingest PDF: ${name}`, error);
      throw error;
    }
  }

  async ingestImage(uri: string): Promise<void> {
    try {
      const text = await Platform.OCR.recognizeText(uri);
      await noteRepository.create('OCR Result', text);
      logger.info('Successfully ingested Image via OCR');
    } catch (error) {
      logger.error('Failed to ingest image', error);
      throw error;
    }
  }

  async ingestVoice(uri: string): Promise<void> {
    try {
      const text = await voiceProcessor.transcribe(uri);
      await noteRepository.create('Voice Note', text);
      logger.info('Successfully ingested Voice Note');
    } catch (error) {
      logger.error('Failed to ingest voice', error);
      throw error;
    }
  }
}

export const knowledgePipeline = new KnowledgePipeline();
