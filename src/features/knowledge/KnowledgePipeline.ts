import { KnowledgeItem, KnowledgeType } from './models/KnowledgeItem';
import { pdfProcessor } from './pdf/PDFProcessor';
import { noteRepository } from '../notes/NoteRepository';
import { logger } from '../../core/logging/Logger';
import { Platform } from '../../platform/Platform';

export class KnowledgePipeline {
  async ingestPDF(uri: string, name: string): Promise<void> {
    try {
      const text = await pdfProcessor.process(uri);
      const metadata = await pdfProcessor.extractMetadata(uri);

      // In a real app, we'd chunk here (Phase 11 Step 176)
      // and generate embeddings (Phase 11 Step 178).

      // For now, save as a KnowledgeItem
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
}

export const knowledgePipeline = new KnowledgePipeline();
