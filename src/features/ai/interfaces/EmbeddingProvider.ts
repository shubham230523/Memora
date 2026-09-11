export interface IEmbeddingProvider {
  generateEmbeddings(text: string): Promise<number[]>;
}
