import { knowledgePipeline } from '../KnowledgePipeline';
import { pdfProcessor } from '../pdf/PDFProcessor';
import { noteRepository } from '../../notes/NoteRepository';
import { chunkRepository } from '../ChunkRepository';
import { Platform } from '../../../platform/Platform';
import { useKnowledgeStore } from '../KnowledgeStore';

jest.mock('../pdf/PDFProcessor', () => ({
  pdfProcessor: {
    process: jest.fn(),
  },
}));

jest.mock('../../notes/NoteRepository', () => ({
  noteRepository: {
    create: jest.fn(),
  },
}));

jest.mock('../ChunkRepository', () => ({
  chunkRepository: {
    saveChunks: jest.fn(),
  },
}));

jest.mock('../../../platform/Platform', () => ({
  Platform: {
    OCR: {
      recognizeText: jest.fn(),
    },
  },
}));

describe('KnowledgePipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ingestPDF', () => {
    it('should process PDF, save note and chunks', async () => {
      (pdfProcessor.process as jest.Mock).mockResolvedValue('Extracted Text');
      (noteRepository.create as jest.Mock).mockResolvedValue({ id: 'note-1' });

      await knowledgePipeline.ingestPDF('uri', 'test.pdf');

      expect(pdfProcessor.process).toHaveBeenCalledWith('uri');
      expect(noteRepository.create).toHaveBeenCalledWith('PDF: test.pdf', 'Extracted Text', expect.any(String));
      expect(chunkRepository.saveChunks).toHaveBeenCalled();
      expect(useKnowledgeStore.getState().isLoading).toBe(false);
    });

    it('should throw error if no text extracted', async () => {
      (pdfProcessor.process as jest.Mock).mockResolvedValue('');

      await expect(knowledgePipeline.ingestPDF('uri', 'test.pdf')).rejects.toThrow('No text could be extracted');
      expect(useKnowledgeStore.getState().isLoading).toBe(false);
    });
  });

  describe('ingestImage', () => {
    it('should perform OCR and save note/chunks', async () => {
      (Platform.OCR.recognizeText as jest.Mock).mockResolvedValue('OCR Text');
      (noteRepository.create as jest.Mock).mockResolvedValue({ id: 'note-2' });

      await knowledgePipeline.ingestImage('image-uri');

      expect(Platform.OCR.recognizeText).toHaveBeenCalledWith('image-uri');
      expect(noteRepository.create).toHaveBeenCalledWith('Scanned Image', 'OCR Text', expect.any(String));
      expect(chunkRepository.saveChunks).toHaveBeenCalled();
    });

    it('should throw error if OCR returns empty', async () => {
      (Platform.OCR.recognizeText as jest.Mock).mockResolvedValue('  ');

      await expect(knowledgePipeline.ingestImage('uri')).rejects.toThrow('No text found');
    });
  });

  describe('ingestVoice', () => {
    it('should transcribe and save note', async () => {
      (noteRepository.create as jest.Mock).mockResolvedValue({ id: 'note-3' });
      await knowledgePipeline.ingestVoice('voice-uri');
      expect(noteRepository.create).toHaveBeenCalledWith('Voice Note', expect.any(String), expect.any(String));
    });
  });

  describe('ingestWebpage', () => {
    it('should process URL and save note', async () => {
      (noteRepository.create as jest.Mock).mockResolvedValue({ id: 'note-4' });
      await knowledgePipeline.ingestWebpage('http://test.com');
      expect(noteRepository.create).toHaveBeenCalledWith(expect.stringContaining('Web:'), expect.any(String), expect.any(String));
    });
  });
});
