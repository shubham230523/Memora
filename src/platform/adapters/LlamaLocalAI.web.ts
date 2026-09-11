import { ILocalAIProvider } from '../interfaces/LocalAI';

export class LlamaLocalAI implements ILocalAIProvider {
  async isModelReady() { return false; }
  async loadModel() { throw new Error('Local AI not implemented on Web yet (Needs WebGPU/WASM)'); }
  async unloadModel() {}
  async generate() { throw new Error('Local AI not implemented on Web yet'); }
  async streamGenerate() { throw new Error('Local AI not implemented on Web yet'); }
}
