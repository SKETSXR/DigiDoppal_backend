
import { MerakiSyncService } from '../services/meraki-sync.service';
import { config } from '../config/env';

export class MerakiSyncJob {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start cron job
   */
  static start() {
    if (this.intervalId) {
      console.log(' Meraki sync job already running');
      return;
    }

    const interval = config.meraki.syncInterval;

    console.log(`Starting Meraki sync job (every ${interval / 1000}s)`);

    // Run immediately on start
    MerakiSyncService.syncReadings();

    // Then run on interval
    this.intervalId = setInterval(() => {
      MerakiSyncService.syncReadings();
    }, interval);
  }

  /**
   * Stop cron job
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      MerakiSyncService.cancelSync();
      console.log('Meraki sync job stopped');
    }
  }

  /**
   * Check if job is running
   */
  static isRunning(): boolean {
    return this.intervalId !== null;
  }
}