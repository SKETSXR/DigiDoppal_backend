import { PredictionModel } from '../models/prediction.model';
import { NewPrediction } from '../db/schema';
import { CustomError } from '../types/index';

export class PredictionService {
  /**
   * Get prediction by datetime
   */
  static async getPrediction(datetime: string) {
    const prediction = await PredictionModel.findByDatetime(datetime);
    
    if (!prediction) {
      const error: CustomError = new Error('Prediction not found for the given date');
      error.statusCode = 404;
      throw error;
    }

    return prediction;
  }

  /**
   * Get predictions by date range
   */
  static async getPredictions(startDate?: string, endDate?: string) {
    const predictions = await PredictionModel.findByDateRange(startDate, endDate);
    return predictions;
  }

  /**
   * Create prediction
   */
  static async createPrediction(predictionData: NewPrediction) {
    const prediction = await PredictionModel.create(predictionData);
    return prediction;
  }
}