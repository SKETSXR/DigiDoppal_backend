
import { FastifyInstance } from 'fastify';
import { SensorController } from '../controllers/sensor.controller.js';
// import { verifyToken } from '../middleware/auth.middleware';

export async function sensorRoutes(fastify: FastifyInstance) {
  // Sync sensors from Meraki API
  fastify.post('/sync', {
    schema: {
      tags: ['Sensors'],
      summary: 'Sync sensors from Meraki',
      description: 'Manually sync sensors from Meraki API response',
      // security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          count: { type: 'integer' },
          sensors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                serial: { type: 'string' },
                name: { type: 'string' },
                alertProfiles: { type: 'array', items: { type: 'string' } },
                alertingOn: { type: 'object' },
              },
            },
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
                synced: { type: 'integer' },
                sensors: { type: 'array' },
              },
            },
          },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorController.syncSensors,
  });

  // Webhook for sensor readings (no auth - webhook from Meraki)
  fastify.post('/readings/webhook', {
    schema: {
      tags: ['Sensors'],
      summary: 'Sensor readings webhook',
      description: 'Receive sensor readings from Meraki webhook',
      body: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            serial: { type: 'string' },
            network: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
            readings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ts: { type: 'string' },
                  metric: { type: 'string' },
                  humidity: { type: 'object' },
                  temperature: { type: 'object' },
                  rawTemperature: { type: 'object' },
                  battery: { type: 'object' },
                },
              },
            },
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
                temperature: { type: 'integer' },
                humidity: { type: 'integer' },
                battery: { type: 'integer' },
                errors: { type: 'array' },
              },
            },
          },
        },
      },
    },
    handler: SensorController.sensorReadingsWebhook,
  });

  // Get all sensors
  fastify.get('/', {
    schema: {
      tags: ['Sensors'],
      summary: 'Get all sensors',
      description: 'Retrieve all registered sensors',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array' },
          },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorController.getAllSensors,
  });
}