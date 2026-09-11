import { AIRequest, AIResponse, AIStreamChunk } from '../models/AIModels';

export interface IAIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
  streamGenerate(request: AIRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<void>;
}
