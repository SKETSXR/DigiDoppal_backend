
import { SensorDashboardModel } from '../models/sensor-dashboard.model.js';

export class SensorDashboardService {
  /**
   * Get current readings
   */
  static async getCurrentReadings(datetime?: string) {
    console.log("date", datetime)
    const readings = await SensorDashboardModel.getCurrentReadings(datetime);

    return {
      temperature: readings.temperature
        ? {
            value: readings.temperature.temperature,
            data: readings.temperature.data,
            datetime: readings.temperature.datetime || readings.temperature.createdAt,
          }
        : null,
      humidity: readings.humidity
        ? {
            value: readings.humidity.humidity,
            data: readings.humidity.data,
            datetime: readings.humidity.datetime || readings.humidity.createdAt,
          }
        : null,
    };
  }

  /**
   * Get sensor list with status
   */
  static async getSensorList() {
    const sensors = await SensorDashboardModel.getAllSensorsWithStatus();

    return sensors.map((sensor) => ({
      id: sensor.id,
      serialNumber: sensor.serialNumber,
      name: sensor.name,
      alertProfile: sensor.alertProfile,
      isActive: sensor.is_active || false,
    }));
  }

  /**
   * Get temperature records with defaults
   */
  static async getTemperatureRecords(fromDate?: string, toDate?: string) {
    const now = new Date();

    // Normalize to full-day range
    const dayStart = fromDate
      ? new Date(fromDate)
      : new Date(now.getTime() - 24* 60 * 60 * 1000)
    const dayEnd = toDate
      ? new Date(toDate)
      : new Date();

    const records = await SensorDashboardModel.getTemperatureRecords(dayStart, dayEnd);

    // Aggregate by hour; fill gaps with nearest record
    
    const actualData = records.actual
    const predictedData = records.predicted

    return {
      actual: actualData,
      predicted: predictedData,
      prediction_found: records.predicted?.length > 0,
      range: {
        from: dayStart.toISOString(),
        to: dayEnd.toISOString(),
      },
    };
  }


  /**
   * Get humidity records with defaults
   */
  static async getHumidityRecords(fromDate?: string, toDate?: string) {
    const now = new Date();

    // Normalize full-day time window (00:00 - 23:59)
    const dayStart = fromDate
      ? new Date(fromDate)
      : new Date(now.getTime() - 24* 60 * 60 * 1000)
    const dayEnd = toDate
      ? new Date(toDate)
      : new Date();

    // Fetch from DB model
    const records = await SensorDashboardModel.getHumidityRecords(dayStart, dayEnd);

    const actualData = records.actual
    const predictedData = records.predicted
    
    return {
      actual: actualData,
      predicted: predictedData,
      range: {
        from: dayStart.toISOString(),
        to: dayEnd.toISOString(),
      },
    };
  }


  /**
   * Get temperature drift
   */
  static async getTemperatureDrift(fromDate?: string, toDate?: string) {
    const now = new Date();

    // Normalize to full-day range
    const dayStart = fromDate
      ? new Date(fromDate)
      : new Date(now.getTime() - 24* 60 * 60 * 1000)
    const dayEnd = toDate
      ? new Date(toDate)
      : new Date();
    // Fetch actual and predicted data
    const drift = await SensorDashboardModel.getTemperatureDrift(dayStart, dayEnd);
    // console.log("drift", drift);

    const actualData = drift.actual
    const predictedData = drift.predicted
    
    return {
      drift: actualData,
      predictedDrift: predictedData,
      // summary: { avgDrift, maxDrift, minDrift },
      range: { from: dayStart, to: dayEnd },
    };
  }


  /**
   * Get humidity drift
   */
  static async getHumidityDrift(fromDate?: string, toDate?: string) {
    const now = new Date();

    // Normalize to full-day range
    const dayStart = fromDate
      ? new Date(fromDate)
      : new Date(now.getTime() - 24* 60 * 60 * 1000)
    const dayEnd = toDate
      ? new Date(toDate)
      : new Date();

    const drift = await SensorDashboardModel.getHumidityDrift(dayStart, dayEnd);

    const actualData = drift.actual
    const predictedData = drift.predicted
    
    return {
      drift: actualData,
      predictedDrift: predictedData,
      range: { from: dayStart.toISOString(), to: dayEnd.toISOString() },
    };
  }

}
