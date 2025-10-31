import { FastifyRequest, FastifyReply } from 'fastify';
import { PredictionService } from '../services/prediction.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { NewPrediction } from '../db/schema';
import { PredictionQuery } from '../types/index';

export class PredictionController {
  /**
   * Get prediction by datetime
   */
  static async getPrediction(
    request: FastifyRequest<{ Querystring: PredictionQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { datetime, room_id } = request.query;

      if (!datetime) {
        return errorResponse(reply, 'datetime is required', 400);
      }

      const prediction = await PredictionService.getPrediction(datetime);

      return successResponse(reply, prediction, 'Prediction retrieved successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve prediction';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get predictions by date range
   */
  static async getPredictions(
    request: FastifyRequest<{ Querystring: { start_date?: string; end_date?: string; room_id?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { start_date, end_date, room_id } = request.query;

      const predictions = await PredictionService.getPredictions(start_date, end_date);

      return successResponse(reply, predictions, 'Predictions retrieved successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve predictions';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Create prediction
   */
  static async createPrediction(
    request: FastifyRequest<{ Body: NewPrediction }>,
    reply: FastifyReply
  ) {
    try {
      const predictionData = request.body;
      const prediction = await PredictionService.createPrediction(predictionData);

      return successResponse(reply, prediction, 'Prediction created successfully', 201);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to create prediction';
      return errorResponse(reply, message, statusCode);
    }
  }
}