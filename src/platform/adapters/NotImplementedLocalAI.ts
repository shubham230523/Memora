import { ILocalAIProvider } from '../interfaces/LocalAI';

export class NotImplementedLocalAI implements ILocalAIProvider {
  async isModelReady() { return false; }
  async loadModel() { throw new Error('Local AI not implemented on this platform'); }
  async unloadModel() {}
  async generate() { throw new Error('Local AI not implemented on this platform'); }
  async streamGenerate() { throw new Error('Local AI not implemented on this platform'); }
}
