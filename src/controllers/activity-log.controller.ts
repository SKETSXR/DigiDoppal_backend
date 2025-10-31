import { FastifyRequest, FastifyReply } from 'fastify';
import { ActivityLogService } from '../services/activity-log.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { NewActivityLog } from '../db/schema';
import { ActivityLogFilters } from '../types/index';

export class ActivityLogController {
  /**
   * Create activity log
   */
  static async createLog(
    request: FastifyRequest<{ Body: NewActivityLog }>,
    reply: FastifyReply
  ) {
    try {
      const logData = request.body;
      const log = await ActivityLogService.createLog(logData);

      return successResponse(reply, log, 'Activity log created successfully', 201);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to create activity log';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get activity logs
   */
  static async getLogs(
    request: FastifyRequest<{ Querystring: ActivityLogFilters }>,
    reply: FastifyReply
  ) {
    try {
      const filters = request.query;
      const logs = await ActivityLogService.getLogs(filters);

      return successResponse(reply, logs, 'Activity logs retrieved successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve activity logs';
      return errorResponse(reply, message, statusCode);
    }
  }
}