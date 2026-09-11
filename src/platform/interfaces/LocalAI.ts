import { AIRequest, AIResponse, AIStreamChunk } from '../../ai/models/AIModels';

export interface ILocalAIProvider {
  isModelReady(): Promise<boolean>;
  loadModel(modelPath: string): Promise<void>;
  unloadModel(): Promise<void>;
  generate(request: AIRequest): Promise<AIResponse>;
  streamGenerate(request: AIRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<void>;
}
