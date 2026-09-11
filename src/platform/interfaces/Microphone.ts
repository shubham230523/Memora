export interface IMicrophoneProvider {
  startRecording(): Promise<void>;
  stopRecording(): Promise<string | null>; // Returns URI of recording
  pauseRecording(): Promise<void>;
  resumeRecording(): Promise<void>;
  requestPermissions(): Promise<boolean>;
}
