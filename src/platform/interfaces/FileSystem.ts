export interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export type DownloadCallback = (progress: DownloadProgress) => void;

export interface IFileSystemProvider {
  documentDirectory: string | null;
  downloadFile(url: string, fileUri: string, onProgress?: DownloadCallback): Promise<string>;
  exists(fileUri: string): Promise<boolean>;
  deleteFile(fileUri: string): Promise<void>;
}
