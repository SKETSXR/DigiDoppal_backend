
import { FastifyInstance } from 'fastify';
import { MerakiController } from '../controllers/meraki.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

export async function merakiRoutes(fastify: FastifyInstance) {
  // Manual sync trigger (admin only)
  fastify.post('/sync/trigger', {
    schema: {
      tags: ['Meraki'],
      summary: 'Manually trigger sync',
      description: 'Manually fetch and sync sensor readings from Meraki',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [verifyToken, isAdmin],
    handler: MerakiController.triggerSync,
  });

  // Start cron job (admin only)
  fastify.post('/sync/start', {
    schema: {
      tags: ['Meraki'],
      summary: 'Start sync job',
      description: 'Start automatic sync cron job',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [verifyToken, isAdmin],
    handler: MerakiController.startJob,
  });

  // Stop cron job (admin only)
  fastify.post('/sync/stop', {
    schema: {
      tags: ['Meraki'],
      summary: 'Stop sync job',
      description: 'Stop automatic sync cron job',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [verifyToken, isAdmin],
    handler: MerakiController.stopJob,
  });

  // Get job status
  fastify.get('/sync/status', {
    schema: {
      tags: ['Meraki'],
      summary: 'Get sync job status',
      description: 'Check if sync job is running',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                isRunning: { type: 'boolean' },
                interval: { type: 'integer' },
                serials: { type: 'array' },
              },
            },
          },
        },
      },
    },
    preHandler: [verifyToken],
    handler: MerakiController.getJobStatus,
  });
}
