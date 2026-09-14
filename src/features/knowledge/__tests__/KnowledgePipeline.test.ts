import { knowledgePipeline } from '../KnowledgePipeline';
import { pdfProcessor } from '../pdf/PDFProcessor';
import { ocrRefiner } from '../ocr/OCRRefiner';
import { voiceProcessor } from '../voice/VoiceProcessor';
import { noteRepository } from '../../notes/NoteRepository';
import { chunkRepository } from '../ChunkRepository';
import { Platform } from '../../../platform/Platform';
import { useKnowledgeStore } from '../KnowledgeStore';

jest.mock('../pdf/PDFProcessor', () => ({
  pdfProcessor: {
    process: jest.fn(),
  },
}));

jest.mock('../ocr/OCRRefiner', () => ({
  ocrRefiner: {
    refine: jest.fn(text => Promise.resolve(text)),
  },
}));

jest.mock('../voice/VoiceProcessor', () => ({
  voiceProcessor: {
    transcribe: jest.fn(),
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
    FileSystem: {
      readAsBase64: jest.fn(),
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
    it('should perform OCR, refine text and save note/chunks', async () => {
      (Platform.OCR.recognizeText as jest.Mock).mockResolvedValue('OCR Text with Noise');
      (ocrRefiner.refine as jest.Mock).mockResolvedValue('Cleaned OCR Text');
      (noteRepository.create as jest.Mock).mockResolvedValue({ id: 'note-2' });

      await knowledgePipeline.ingestImage('image-uri');

      expect(Platform.OCR.recognizeText).toHaveBeenCalledWith('image-uri');
      expect(ocrRefiner.refine).toHaveBeenCalledWith('OCR Text with Noise');
      expect(noteRepository.create).toHaveBeenCalledWith(expect.stringContaining('Scan:'), 'Cleaned OCR Text', expect.any(String));
      expect(chunkRepository.saveChunks).toHaveBeenCalled();
    });

    it('should throw error if OCR returns empty', async () => {
      (Platform.OCR.recognizeText as jest.Mock).mockResolvedValue('  ');

      await expect(knowledgePipeline.ingestImage('uri')).rejects.toThrow('No text found');
    });
  });

  describe('ingestVoice', () => {
    it('should transcribe and save note', async () => {
      (voiceProcessor.transcribe as jest.Mock).mockResolvedValue('Transcribed Text');
      (noteRepository.create as jest.Mock).mockResolvedValue({ id: 'note-3' });
      await knowledgePipeline.ingestVoice('voice-uri');
      expect(noteRepository.create).toHaveBeenCalledWith(expect.stringContaining('Transcribed Text'), 'Transcribed Text', expect.any(String));
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
