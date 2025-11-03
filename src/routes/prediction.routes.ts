import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.middleware';
import { PredictionController } from '../controllers/prediction.controller';

export async function predictionRoutes(fastify: FastifyInstance) {
  // Get prediction by datetime (protected)
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        required: ['datetime'],
        properties: {
          datetime: { type: 'string' },
          room_id: { type: 'integer' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: PredictionController.getPrediction,
  });

  // Get predictions by date range (protected)
  fastify.get('/range', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          room_id: { type: 'integer' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: PredictionController.getPredictions,
  });

  // Create prediction (protected)
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          datetime: { type: 'string' },
          temperaturePrediction: { type: 'number' },
          maxTemperaturePrediction: { type: 'number' },
          minTemperaturePrediction: { type: 'number' },
          maxHumidityPrediction: { type: 'number' },
          minHumidityPrediction: { type: 'number' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: PredictionController.createPrediction,
  });
}