export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  temperature?: number;
  stream?: boolean;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIStreamChunk {
  text: string;
  isFinal: boolean;
}
