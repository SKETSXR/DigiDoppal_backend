
import { FastifyInstance } from 'fastify';
import { RoomLiveController } from '../controllers/room-live.controller.js';
// import { verifyToken } from '../middleware/auth.middleware';

export async function roomLiveRoutes(fastify: FastifyInstance) {
  // Get room live status
  fastify.get('/status', {
    schema: {
      tags: ['Room Live'],
      summary: 'Get room live status',
      description: 'Get total users (last 24h) and recent intruders',
    //   security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                'Total User': { type: 'integer' },
                Intruders: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      image: { type: 'string' },
                      datetime: { type: 'string' },
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
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
