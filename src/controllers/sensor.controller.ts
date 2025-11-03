
import { FastifyRequest, FastifyReply } from 'fastify';
import { SensorService } from '../services/sensor.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { MerakiSensorResponse, SensorReading } from '../types/index.js';

export class SensorController {
  /**
   * Sync sensors from Meraki (manual trigger)
   */
  static async syncSensors(
    request: FastifyRequest<{ Body: MerakiSensorResponse }>,
    reply: FastifyReply
  ) {
    try {
      const merakiData = request.body;

      if (!merakiData.sensors || !Array.isArray(merakiData.sensors)) {
        return errorResponse(reply, 'Invalid sensor data format', 400);
      }

      const sensors = await SensorService.syncSensors(merakiData);

      return successResponse(
        reply,
        {
          synced: sensors.length,
          sensors,
        },
        'Sensors synced successfully',
        200
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to sync sensors';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Webhook endpoint for sensor readings
   */
  static async sensorReadingsWebhook(
    request: FastifyRequest<{ Body: SensorReading[] }>,
    reply: FastifyReply
  ) {
    try {
      const readings = request.body;

      if (!Array.isArray(readings)) {
        return errorResponse(reply, 'Invalid readings format', 400);
      }

      const result = await SensorService.processSensorReadings(readings);

      return successResponse(
        reply,
        result,
        'Sensor readings processed successfully',
        200
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to process sensor readings';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get all sensors
   */
  static async getAllSensors(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sensors = await SensorService.getAllSensors();

      return successResponse(
        reply,
        sensors,
        'Sensors retrieved successfully',
        200
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve sensors';
      return errorResponse(reply, message, statusCode);
    }
  }
}