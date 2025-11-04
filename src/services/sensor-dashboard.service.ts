
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

    // Normalize to a single day (00:00 → 23:59)
    const dayStart = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayEnd = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch actual and predicted data
    const drift = await SensorDashboardModel.getTemperatureDrift(dayStart, dayEnd);
    // console.log("drift", drift);

    // Helper: find nearest record if hour is missing
    const findNearest = (records: any[], target: Date, field: string) => {
      if (!records.length) return null;
      let nearest = records[0];
      let minDiff = Math.abs(target.getTime() - new Date(nearest.datetime).getTime());
      for (const r of records) {
        const diff = Math.abs(target.getTime() - new Date(r.datetime).getTime());
        if (diff < minDiff) {
          minDiff = diff;
          nearest = r;
        }
      }
      return nearest[field] ?? null;
    };

    // Generate 24 hourly drift points
    const driftData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(dayStart);
      hourStart.setHours(hour, 0, 0, 0);

      // Get nearest actual & predicted temps for that hour
      const actualTemp = findNearest(drift.actual, hourStart, "temperature");
      const predictedTemp = findNearest(drift.predicted, hourStart, "temperaturePrediction");

      if (actualTemp === null || predictedTemp === null) continue;

      const driftValue = actualTemp - predictedTemp;

      driftData.push({
        datetime: hourStart,
        actual: actualTemp,
        predicted: predictedTemp,
        drift: driftValue,
        driftPercentage:
          predictedTemp !== 0 ? ((driftValue / predictedTemp) * 100).toFixed(2) : "0",
      });
    }

    console.log("drift", driftData);


    // Calculate summary stats
    const avgDrift =
      driftData.length > 0
        ? (driftData.reduce((sum, d) => sum + d.drift, 0) / driftData.length).toFixed(2)
        : "0";
    const maxDrift =
      driftData.length > 0 ? Math.max(...driftData.map((d) => d.drift)).toFixed(2) : "0";
    const minDrift =
      driftData.length > 0 ? Math.min(...driftData.map((d) => d.drift)).toFixed(2) : "0";

    return {
      drift: driftData,
      summary: { avgDrift, maxDrift, minDrift },
      range: { from: dayStart.toISOString(), to: dayEnd.toISOString() },
    };
  }


  /**
   * Get humidity drift
   */
  static async getHumidityDrift(fromDate?: string, toDate?: string) {
    const now = new Date();

    // Normalize to a single day (00:00 → 23:59)
    const dayStart = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayEnd = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const drift = await SensorDashboardModel.getHumidityDrift(dayStart, dayEnd);

    const findNearest = (records: any[], target: Date, fields: string[]) => {
      if (!records.length) return null;
      let nearest = records[0];
      let minDiff = Math.abs(target.getTime() - new Date(nearest.datetime).getTime());
      for (const r of records) {
        const diff = Math.abs(target.getTime() - new Date(r.datetime).getTime());
        if (diff < minDiff) {
          minDiff = diff;
          nearest = r;
        }
      }

      // If prediction, average max/min
      if (fields.length === 2) {
        const max = nearest[fields[0]] ?? 0;
        const min = nearest[fields[1]] ?? 0;
        return (max + min) / 2;
      }
      return nearest[fields[0]] ?? null;
    };

    const driftData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(dayStart);
      hourStart.setHours(hour, 0, 0, 0);

      const actualHum = findNearest(drift.actual, hourStart, ["humidity"]);
      const predictedHum = findNearest(drift.predicted, hourStart, [
        "maxHumidityPrediction",
        "minHumidityPrediction",
      ]);

      if (actualHum === null || predictedHum === null) continue;

      const driftValue = actualHum - predictedHum;

      driftData.push({
        datetime: hourStart,
        actual: actualHum,
        predicted: predictedHum,
        drift: driftValue,
        driftPercentage:
          predictedHum !== 0 ? ((driftValue / predictedHum) * 100).toFixed(2) : "0",
      });
    }

    const avgDrift =
      driftData.length > 0
        ? (driftData.reduce((sum, d) => sum + d.drift, 0) / driftData.length).toFixed(2)
        : "0";
    const maxDrift =
      driftData.length > 0 ? Math.max(...driftData.map((d) => d.drift)).toFixed(2) : "0";
    const minDrift =
      driftData.length > 0 ? Math.min(...driftData.map((d) => d.drift)).toFixed(2) : "0";

    return {
      drift: driftData,
      summary: { avgDrift, maxDrift, minDrift },
      range: { from: dayStart.toISOString(), to: dayEnd.toISOString() },
    };
  }

}
