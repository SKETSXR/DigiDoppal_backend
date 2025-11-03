
import { FastifyRequest, FastifyReply } from 'fastify';
import { MerakiSyncJob } from '../jobs/meraki-sync.job';
import { MerakiSyncService } from '../services/meraki-sync.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { config } from '../config/env';

export class MerakiController {
  /**
   * Manually trigger sync
   */
  static async triggerSync(request: FastifyRequest, reply: FastifyReply) {
    try {
      await MerakiSyncService.syncReadings();
      return successResponse(reply, null, 'Sync triggered successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Start cron job
   */
  static async startJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (MerakiSyncJob.isRunning()) {
        return errorResponse(reply, 'Job already running', 400);
      }

      MerakiSyncJob.start();
      return successResponse(reply, null, 'Sync job started', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Stop cron job
   */
  static async stopJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!MerakiSyncJob.isRunning()) {
        return errorResponse(reply, 'Job not running', 400);
      }

      MerakiSyncJob.stop();
      return successResponse(reply, null, 'Sync job stopped', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Get job status
   */
  static async getJobStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const status = {
        isRunning: MerakiSyncJob.isRunning(),
        interval: config.meraki.syncInterval,
        serials: config.meraki.serials,
      };

      return successResponse(reply, status, 'Job status retrieved', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }
}
