export interface STTProvider {
  transcribe(uri: string): Promise<string>;
}
