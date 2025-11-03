
import { FastifyInstance } from 'fastify';
import { RoomLiveController } from '../controllers/room-live.controller.js';
// import { verifyToken } from '../middleware/auth.middleware';

export async function roomLiveRoutes(fastify: FastifyInstance) {
  // Get room live status
  fastify.get('/status', {
    schema: {
      tags: ['Room Live'],
      summary: 'Get room live status',
      description: 'Get total users and recent intruders for specified time range (default: 5 minutes)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          time: { 
            type: 'string', 
            description: 'Time range in minutes (e.g., 5, 10, 30)',
            default: '5',
            examples: ['5', '10', '30', '60']
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                'Total User': { type: 'integer', description: 'Total unique users + unknowns in time range' },
                Intruders: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      image: { type: 'string', nullable: true, description: 'File path or base64 image' },
                      datetime: { type: 'string', nullable: true },
                      status: { type: 'string' },
                    },
                  },
                },
                timeRange: { type: 'string', description: 'Time range description' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: RoomLiveController.getRoomLiveStatus,
  });

  // Save bulk activity logs (from AI backend)
  fastify.post('/activity-logs/bulk', {
    schema: {
      tags: ['Room Live'],
      summary: 'Save bulk activity logs',
      description: 'Save multiple activity logs from AI backend websocket',
    //   security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          camera_id: { type: 'integer' },
          room_id: { type: 'integer' },
        },
      },
      body: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                image: { type: 'string' },
                confidence: { type: 'number' },
                datetime: { type: 'string' },
                identity: { type: 'string' },
                distance: { type: 'number' },
                frameHeight: { type: 'integer' },
                frameWidth: { type: 'integer' },
                status: { type: 'string' },
                threshold: { type: 'number' },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                      w: { type: 'string' },
                      h: { type: 'string' },
                      distance: { type: 'number' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: RoomLiveController.saveBulkActivityLogs,
  });

  // Get intruder history
  fastify.get('/intruder-history', {
    schema: {
      tags: ['Room Live'],
      summary: 'Get intruder history',
      description: 'Get intruder count over time intervals',
    //   security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          time: { 
            type: 'string', 
            default: '10',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  total: { type: 'integer' },
                  intruder: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: RoomLiveController.getIntruderHistory,
  });
}
