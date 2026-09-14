import { pdfProcessor } from './pdf/PDFProcessor';
import { ocrRefiner } from './ocr/OCRRefiner';
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
      // Standard chunking (1000 chars) for better context retention
      const chunks = this.chunkText(text, 1000);
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
    const overlap = 200; // Added overlap to prevent splitting names/dates
    let start = 0;
    while (start < text.length) {
      chunks.push(text.substring(start, start + size + overlap));
      start += size;
    }
    return chunks;
  }

  async ingestImage(uri: string): Promise<void> {
    const { setLoading } = useKnowledgeStore.getState();
    try {
      setLoading(true, 'Scanning image for text... 👁️');
      const text = await Platform.OCR.recognizeText(uri);

      if (!text || text.trim().length === 0) {
        throw new Error('No text found in this image.');
      }

      console.log('--- IMAGE OCR EXTRACTION SUCCESS ---');
      console.log('--- EXTRACTED TEXT START ---');
      console.log(text);
      console.log('--- EXTRACTED TEXT END ---');
      console.log('---------------------------------------');

      setLoading(true, 'Cleaning up noise... ✨');
      const refinedText = await ocrRefiner.refine(text);

      if (refinedText !== text) {
        console.log('--- AI REFINEMENT SUCCESS ---');
        console.log('--- CLEANED TEXT START ---');
        console.log(refinedText);
        console.log('--- CLEANED TEXT END ---');
        console.log('---------------------------------------');
      }

      const note = await noteRepository.create('Scanned Image', refinedText, KnowledgeType.IMAGE);

      setLoading(true, 'Indexing knowledge... ✨');
      const chunks = this.chunkText(refinedText, 1000);
      await chunkRepository.saveChunks(chunks.map((content, index) => ({
        knowledgeItemId: note.id,
        content,
        index,
      })));

      setLoading(false);
      logger.info(`Successfully ingested Image via OCR with ${chunks.length} chunks`);
    } catch (error) {
      setLoading(false);
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
