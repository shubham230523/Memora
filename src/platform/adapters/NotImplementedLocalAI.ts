import { ILocalAIProvider } from '../interfaces/LocalAI';
import { AIResponse } from '../../ai/models/AIModels';

export class NotImplementedLocalAI implements ILocalAIProvider {
  async isModelReady() { return false; }
  async loadModel() { throw new Error('Local AI not implemented on this platform'); }
  async unloadModel() {}
  async generate(): Promise<AIResponse> { throw new Error('Local AI not implemented on this platform'); }
  async streamGenerate() { throw new Error('Local AI not implemented on this platform'); }
}
