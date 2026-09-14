import { pdfProcessor } from './pdf/PDFProcessor';
import { voiceProcessor } from './voice/VoiceProcessor';
import { webProcessor } from './web/WebProcessor';
import { noteRepository } from '../notes/NoteRepository';
import { chunkRepository } from './ChunkRepository';
import { logger } from '../../core/logging/Logger';
import { Platform } from '../../platform/Platform';
import { KnowledgeType } from './models/KnowledgeItem';
import { useKnowledgeStore } from './KnowledgeStore';

export class KnowledgePipeline {
  async ingestPDF(uri: string, name: string): Promise<void> {
    const { setLoading } = useKnowledgeStore.getState();
    try {
      setLoading(true, 'Extracting text... 📄');
      const text = await pdfProcessor.process(uri);

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from this PDF. It might be empty or unreadable.');
      }

      const note = await noteRepository.create(`PDF: ${name}`, text, KnowledgeType.PDF);

      setLoading(true, 'Finishing up... ✨');
      // Document chunking (MVP requirement 9)
      // High-precision chunking (200 chars) for 0.5B models to prevent cognitive overload
      const chunks = this.chunkText(text, 200);
      await chunkRepository.saveChunks(chunks.map((content, index) => ({
        knowledgeItemId: note.id,
        content,
        index,
      })));

      setLoading(false);
      logger.info(`Successfully ingested PDF: ${name} with ${chunks.length} chunks`);
    } catch (error) {
      setLoading(false);
      logger.error(`Failed to ingest PDF: ${name}`, error);
      throw error;
    }
  }

  private chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.substring(i, i + size));
    }
    return chunks;
  }

  async ingestImage(uri: string): Promise<void> {
    try {
      const text = await Platform.OCR.recognizeText(uri);
      await noteRepository.create('OCR Result', text, KnowledgeType.IMAGE);
      logger.info('Successfully ingested Image via OCR');
    } catch (error) {
      logger.error('Failed to ingest image', error);
      throw error;
    }
  }

  async ingestVoice(uri: string): Promise<void> {
    try {
      const text = await voiceProcessor.transcribe(uri);
      await noteRepository.create('Voice Note', text, KnowledgeType.VOICE);
      logger.info('Successfully ingested Voice Note');
    } catch (error) {
      logger.error('Failed to ingest voice', error);
      throw error;
    }
  }

  async ingestWebpage(url: string): Promise<void> {
    try {
      const text = await webProcessor.process(url);
      const metadata = await webProcessor.extractMetadata(url);
      await noteRepository.create(`Web: ${metadata.title}`, text, KnowledgeType.WEBPAGE);
      logger.info(`Successfully ingested Webpage: ${url}`);
    } catch (error) {
      logger.error(`Failed to ingest webpage: ${url}`, error);
      throw error;
    }
  }
}

export const knowledgePipeline = new KnowledgePipeline();
