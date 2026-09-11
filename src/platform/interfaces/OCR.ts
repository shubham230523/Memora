export interface IOCRProvider {
  recognizeText(imageUri: string): Promise<string>;
}
