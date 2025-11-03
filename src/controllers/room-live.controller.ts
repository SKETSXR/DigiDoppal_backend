
import { FastifyRequest, FastifyReply } from 'fastify';
import { RoomLiveService } from '../services/room-live.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { ActivityLogInput } from '../types/index.js';

export class RoomLiveController {
  /**
   * Get room live status
   */
  static async getRoomLiveStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await RoomLiveService.getRoomLiveStatus();

      return successResponse(reply, data, 'Data fetched successful', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to fetch room live status';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Save bulk activity logs (from AI backend websocket)
   */
  static async saveBulkActivityLogs(
    request: FastifyRequest<{ 
      Body: { data: ActivityLogInput[] };
      Querystring: { camera_id?: number; room_id?: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { data } = request.body;
      const { camera_id, room_id } = request.query;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return errorResponse(reply, 'Invalid data format', 400);
      }

      await RoomLiveService.saveBulkActivityLogs(data, camera_id, room_id);

      return successResponse(reply, null, 'Data Saved successfully', 201);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to save activity logs';
      console.log(error)
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get intruder history
   */
  static async getIntruderHistory(
    request: FastifyRequest<{ Querystring: { time?: '10min' | '30min' } }>,
    reply: FastifyReply
  ) {
    try {
      const { time = '10min' } = request.query;

    //   if (!['10min', '30min'].includes(time)) {
    //     return errorResponse(reply, 'Invalid time parameter. Use 10min or 30min', 400);
    //   }

      const data = await RoomLiveService.getIntruderHistory(time);

      return successResponse(reply, data, 'Data fetched successful', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to fetch intruder history';
      return errorResponse(reply, message, statusCode);
    }
  }
}
