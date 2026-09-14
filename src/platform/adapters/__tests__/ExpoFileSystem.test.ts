import { ExpoFileSystem } from '../ExpoFileSystem';
import * as FileSystem from 'expo-file-system/legacy';

describe('ExpoFileSystem', () => {
  let fileSystem: ExpoFileSystem;

  beforeEach(() => {
    fileSystem = new ExpoFileSystem();
    jest.clearAllMocks();
  });

  it('readAsBase64 should call readAsStringAsync with Base64 encoding', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

    const result = await fileSystem.readAsBase64('file:///test.txt');

    expect(result).toBe('base64data');
    expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
      'file:///test.txt',
      expect.objectContaining({ encoding: 'base64' })
    );
  });
});
