import { webProcessor } from '../WebProcessor';

describe('WebProcessor', () => {
  it('process should return placeholder text', async () => {
    const result = await webProcessor.process('http://example.com');
    expect(result).toContain('webpage');
  });

  it('extractMetadata should return title', async () => {
    const result = await webProcessor.extractMetadata('http://example.com');
    expect(result.title).toBe('Sample Webpage');
  });
});
