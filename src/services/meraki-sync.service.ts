
import axios from 'axios';
import { SensorService } from './sensor.service.js';
import { config } from '../config/env.js';
// import { read } from 'fs';

export class MerakiSyncService {
  private static isRunning = false;
  private static abortController: AbortController | null = null;

  /**
   * Fetch latest sensor readings from Meraki API
   */
  static async fetchLatestReadings() {
    const { apiKey, organizationId, serials } = config.meraki;

    if (!apiKey || !organizationId || serials.length === 0) {
      throw new Error('Meraki configuration missing');
    }

    // Build query string with serials
    const serialsQuery = serials.map((s) => `serials[]=${s.trim()}`).join('&');
    const url = `https://api.meraki.com/api/v1/organizations/${organizationId}/sensor/readings/latest?${serialsQuery}`;

    this.abortController = new AbortController();

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Cisco-Meraki-API-Key': apiKey,
        },
        timeout: 30000, // 30 second timeout
        signal: this.abortController.signal,
      });

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
        return null;
      }
      throw error;
    }
  }

  /**
   * Sync sensor readings
   */
  static async syncReadings() {
    // Prevent concurrent runs
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('Fetching sensor readings from Meraki...');

      const readings = await this.fetchLatestReadings();

      if (!readings || readings.length === 0) {
        console.log('📭 No readings received');
        return;
      }

      // Process readings (reuse existing webhook logic)
      const result = await SensorService.processSensorReadings(readings);

      const duration = Date.now() - startTime;
      console.log(`Sync completed in ${duration}ms`);
      console.log(` Temperature: ${result.temperature}, Humidity: ${result.humidity}`);

      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error(' Sync failed:', error.message);
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  /**
   * Cancel ongoing sync
   */
  static cancelSync() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}