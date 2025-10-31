import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.middleware';
import { ActivityLogController } from '../controllers/activity-log.controller';

export async function activityLogRoutes(fastify: FastifyInstance) {
  // Create activity log (protected)
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['type', 'data'],
        properties: {
          type: { type: 'string', minLength: 1, maxLength: 50 },
          data: { type: 'string' },
          datetime: { type: 'string' },
          status: { type: 'string', enum: ['verified', 'no_face', 'unknown'] },
          identity: { type: 'string' },
          confidence: { type: 'number' },
          distance: { type: 'number' },
          filePath: { type: 'string' },
          userId: { type: 'integer' },
          cameraId: { type: 'integer' },
        },
      },
    },
    preHandler: [verifyToken],
    handler: ActivityLogController.createLog,
  });

  // Get activity logs with filters (protected)
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['verified', 'no_face', 'unknown'] },
          user_id: { type: 'integer' },
          camera_id: { type: 'integer' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
    preHandler: [verifyToken],
    handler: ActivityLogController.getLogs,
  });
}
