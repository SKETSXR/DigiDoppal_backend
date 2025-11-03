
import { FastifyInstance } from 'fastify';
import { SensorDashboardController } from '../controllers/sensor-dashboard.controller.js';
// import { verifyToken } from '../middleware/auth.middleware';

export async function sensorDashboardRoutes(fastify: FastifyInstance) {
  // Get current readings
  fastify.get('/current-reading', {
    schema: {
      tags: ['Sensor Dashboard'],
      summary: 'Get current readings',
      description: 'Get current temperature and humidity. If time param provided, get closest record to that time',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          time: { type: 'string', description: 'Format: DD-MM-YYYY HH:mm:ss or ISO 8601' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorDashboardController.getCurrentReadings,
  });

  // Get sensor list
  fastify.get('/sensor-list', {
    schema: {
      tags: ['Sensor Dashboard'],
      summary: 'Get sensor list',
      description: 'Get all sensors with their active status',
      security: [{ bearerAuth: [] }],
    },
    // preHandler: [verifyToken],
    handler: SensorDashboardController.getSensorList,
  });

  // Get temperature records
  fastify.get('/temperature-record', {
    schema: {
      tags: ['Sensor Dashboard'],
      summary: 'Get temperature records',
      description: 'Get actual temperature records and predictions. Default: last 24 hours',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          from_date: { type: 'string', format: 'date-time' },
          to_date: { type: 'string', format: 'date-time' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorDashboardController.getTemperatureRecords,
  });

  // Get humidity records
  fastify.get('/humidity-record', {
    schema: {
      tags: ['Sensor Dashboard'],
      summary: 'Get humidity records',
      description: 'Get actual humidity records and predictions. Default: last 24 hours',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          from_date: { type: 'string', format: 'date-time' },
          to_date: { type: 'string', format: 'date-time' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorDashboardController.getHumidityRecords,
  });

  // Get temperature drift
  fastify.get('/temperature-drift', {
    schema: {
      tags: ['Sensor Dashboard'],
      summary: 'Get temperature drift',
      description: 'Compare actual vs predicted temperature. Default: last 24 hours',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          from_date: { type: 'string', format: 'date-time' },
          to_date: { type: 'string', format: 'date-time' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorDashboardController.getTemperatureDrift,
  });

  // Get humidity drift
  fastify.get('/humidity-drift', {
    schema: {
      tags: ['Sensor Dashboard'],
      summary: 'Get humidity drift',
      description: 'Compare actual vs predicted humidity. Default: last 24 hours',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          from_date: { type: 'string', format: 'date-time' },
          to_date: { type: 'string', format: 'date-time' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: SensorDashboardController.getHumidityDrift,
  });
}
