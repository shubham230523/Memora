import { IMicrophoneProvider } from '../interfaces/Microphone';
import { logger } from '../../core/logging/Logger';

// Safely require expo-av to prevent crash if native module is missing
let Audio: any;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  logger.warn('expo-av not found or native module missing');
}

export class ExpoMicrophone implements IMicrophoneProvider {
  private recording: any = null;

  async requestPermissions(): Promise<boolean> {
    if (!Audio) return false;
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  async startRecording(): Promise<void> {
    if (!Audio) throw new Error('Microphone not available in this environment');
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
    } catch (error) {
      logger.error('Failed to start recording', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (error) {
      logger.error('Failed to stop recording', error);
      return null;
    }
  }

  async pauseRecording(): Promise<void> {
    await this.recording?.pauseAsync();
  }

  async resumeRecording(): Promise<void> {
    await this.recording?.startAsync();
  }
}
