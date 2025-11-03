
import { FastifyRequest, FastifyReply } from 'fastify';
import { SensorDashboardService } from '../services/sensor-dashboard.service';
import { successResponse, errorResponse } from '../utils/response.util';

export class SensorDashboardController {
  /**
   * Get current readings
   */
  static async getCurrentReadings(
    request: FastifyRequest<{ Querystring: { time?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { time } = request.query;
      const data = await SensorDashboardService.getCurrentReadings(time);

      return successResponse(reply, data, 'Current readings retrieved successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Get sensor list
   */
  static async getSensorList(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await SensorDashboardService.getSensorList();

      return successResponse(reply, data, 'Sensor list retrieved successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Get temperature records
   */
  static async getTemperatureRecords(
    request: FastifyRequest<{ Querystring: { from_date?: string; to_date?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { from_date, to_date } = request.query;
      const data = await SensorDashboardService.getTemperatureRecords(from_date, to_date);

      return successResponse(reply, data, 'Temperature records retrieved successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Get humidity records
   */
  static async getHumidityRecords(
    request: FastifyRequest<{ Querystring: { from_date?: string; to_date?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { from_date, to_date } = request.query;
      const data = await SensorDashboardService.getHumidityRecords(from_date, to_date);

      return successResponse(reply, data, 'Humidity records retrieved successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Get temperature drift
   */
  static async getTemperatureDrift(
    request: FastifyRequest<{ Querystring: { from_date?: string; to_date?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { from_date, to_date } = request.query;
      const data = await SensorDashboardService.getTemperatureDrift(from_date, to_date);

      return successResponse(reply, data, 'Temperature drift retrieved successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }

  /**
   * Get humidity drift
   */
  static async getHumidityDrift(
    request: FastifyRequest<{ Querystring: { from_date?: string; to_date?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { from_date, to_date } = request.query;
      const data = await SensorDashboardService.getHumidityDrift(from_date, to_date);

      return successResponse(reply, data, 'Humidity drift retrieved successfully', 200);
    } catch (error: any) {
      return errorResponse(reply, error.message, 500);
    }
  }
}