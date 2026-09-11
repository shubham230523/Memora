import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { logger } from '../logging/Logger';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

export class BackgroundProcessor {
  async registerTasks() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });
        logger.info('Background sync task registered');
      }
    } catch (error) {
      logger.error('Failed to register background task', error);
    }
  }
}

// Define the task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  logger.info('Background sync task running');
  try {
    // TODO: Perform sync
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    logger.error('Background sync failed', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const backgroundProcessor = new BackgroundProcessor();
