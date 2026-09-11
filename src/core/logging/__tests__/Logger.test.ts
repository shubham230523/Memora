import { logger } from '../Logger';
import { appConfig } from '../../config/appConfig';

jest.mock('../../config/appConfig', () => ({
  appConfig: {
    logging: {
      level: 'info',
    },
  },
}));

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not log debug when level is info', () => {
    logger.debug('test debug');
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should log info when level is info', () => {
    logger.info('test info');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] test info')
    );
  });

  it('should sanitize secrets', () => {
    const data = {
      apiKey: 'secret-key',
      user: {
        password: 'my-password',
        name: 'John'
      },
      public: 'hello'
    };

    logger.info('secrets', data);

    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] secrets'),
      expect.objectContaining({
        apiKey: '[REDACTED]',
        user: expect.objectContaining({
          password: '[REDACTED]',
          name: 'John'
        }),
        public: 'hello'
      })
    );
  });

  it('should handle all log levels', () => {
    logger.warn('warning');
    logger.error('error');
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle non-object data in sanitize', () => {
    logger.info('text', 'plain string');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] text'),
      'plain string'
    );
  });
});
