export interface FilePickerResult {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface IFilePickerProvider {
  pickDocument(options?: { type?: string | string[] }): Promise<FilePickerResult | null>;
  pickImage(): Promise<FilePickerResult | null>;
}
