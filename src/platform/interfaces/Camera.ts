export interface CameraCaptureResult {
  uri: string;
  width: number;
  height: number;
}

export interface ICameraProvider {
  takePhoto(): Promise<CameraCaptureResult | null>;
  requestPermissions(): Promise<boolean>;
}
