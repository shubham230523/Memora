import { logger } from '../../../core/logging/Logger';

export class WebProcessor {
  async process(url: string): Promise<string> {
    logger.info(`Fetching webpage: ${url}`);
    // Real implementation would use a readability library or backend proxy
    return "This is extracted content from webpage " + url;
  }

  async extractMetadata(url: string) {
    return {
      title: 'Sample Webpage',
      url,
    };
  }
}

export const webProcessor = new WebProcessor();
