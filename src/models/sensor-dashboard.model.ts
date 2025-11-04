
import { db } from '../db/index.js';
import { sensors, temperature, humidity, prediction } from '../db/schema.js';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

export class SensorDashboardModel {
  /**
   * Get current temperature and humidity for a specific datetime or latest
   */
  static async getCurrentReadings(datetime?: string) {
    let tempQuery = db.select().from(temperature).orderBy(desc(temperature.createdAt)).limit(1).$dynamic();
    let humQuery = db.select().from(humidity).orderBy(desc(humidity.createdAt)).limit(1).$dynamic();

    if (datetime) {
      const targetDate = new Date(datetime);
      tempQuery = db
        .select()
        .from(temperature)
        .where(lte(temperature.createdAt, targetDate))
        .orderBy(desc(temperature.createdAt))
        .limit(1).$dynamic();

      humQuery = db
        .select()
        .from(humidity)
        .where(lte(humidity.createdAt, targetDate))
        .orderBy(desc(humidity.createdAt))
        .limit(1).$dynamic();
    }

    const { sql, params } = tempQuery.toSQL()
    console.log( sql, params )
    
    const [temp, hum] = await Promise.all([tempQuery, humQuery]);
    console.log(temp, hum, datetime)
    
    return {
      temperature: temp[0] || null,
      humidity: hum[0] || null,
    };
  }

  /**
   * Get all sensors with active status
   */
  static async getAllSensorsWithStatus() {
    return await db.select().from(sensors).orderBy(sensors.name);
  }

  /**
   * Get temperature records (actual + predicted)
   */
static async getTemperatureRecords(fromDate: Date, toDate: Date) {
    const now = new Date();

    // Default fromDate/toDate if not provided
    const start = fromDate || new Date(0); // earliest possible date
    const end = toDate || now;             // now UTC

    console.log(start, fromDate, end, toDate)

    // Fetch actual temperature records
    const actualRecords = await db
      .select()
      .from(temperature)
      .where(and(gte(temperature.createdAt, start), lte(temperature.createdAt, end)))
      .orderBy(asc(temperature.id));

      console.log(db
      .select()
      .from(temperature)
      .where(and(gte(temperature.createdAt, start), lte(temperature.createdAt, end)))
      .orderBy(asc(temperature.createdAt)).toSQL())

    // Fetch predicted temperature records
    const predictedRecords = await db
      .select()
      .from(prediction)
      .where(and(gte(prediction.datetime, start), lte(prediction.datetime, end)))
      .orderBy(asc(prediction.id));

    return {
      actual: actualRecords,
      predicted: predictedRecords,
      prediction_found: predictedRecords.length > 0,
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
      },
    };
  }

  /**
   * Get humidity records (actual + predicted)
   */
  static async getHumidityRecords(fromDate: Date, toDate: Date) {
    const now = new Date();

    // Default fromDate/toDate if not provided
    const start = fromDate || new Date(0); // earliest possible date
    const end = toDate || now;             // now UTC

    // Get actual humidity records up to current time
    const actualRecords = await db
      .select()
      .from(humidity)
      .where(and(gte(humidity.createdAt, start), lte(humidity.createdAt, end)))
      .orderBy(asc(humidity.id));

    // If toDate is in the future, get predictions
    let predictedRecords: any[] = [];
    if (toDate > now) {
      predictedRecords = await db
        .select()
        .from(prediction)
        .where(and(gte(prediction.datetime, start), lte(prediction.datetime, end)))
        .orderBy(asc(prediction.datetime));
    }

    return {
      actual: actualRecords,
      predicted: predictedRecords,
    };
  }

  /**
   * Get temperature drift (actual vs predicted)
   */
  static async getTemperatureDrift(fromDate: Date, toDate: Date) {
    const now = new Date();

    // Get actual records up to now
    const actualRecords = await db
      .select({
        datetime: temperature.createdAt,
        temperature: temperature.temperature,
        data: temperature.data,
      })
      .from(temperature)
      .where(and(gte(temperature.createdAt, fromDate), lte(temperature.createdAt, now)))
      .orderBy(asc(temperature.createdAt));

    // Get prediction records for the entire date range
    const predictedRecords = await db
      .select({
        datetime: prediction.datetime,
        temperaturePrediction: prediction.temperaturePrediction,
        maxTemperaturePrediction: prediction.maxTemperaturePrediction,
        minTemperaturePrediction: prediction.minTemperaturePrediction,
      })
      .from(prediction)
      .where(and(gte(prediction.datetime, fromDate), lte(prediction.datetime, toDate)))
      .orderBy(asc(prediction.datetime));

    return {
      actual: actualRecords,
      predicted: predictedRecords,
    };
  }

  /**
   * Get humidity drift (actual vs predicted)
   */
  static async getHumidityDrift(fromDate: Date, toDate: Date) {
    const now = new Date();

    // Get actual records up to now
    const actualRecords = await db
      .select({
        datetime: humidity.createdAt,
        humidity: humidity.humidity,
        data: humidity.data,
      })
      .from(humidity)
      .where(and(gte(humidity.createdAt, fromDate), lte(humidity.createdAt, now)))
      .orderBy(asc(humidity.createdAt));

    // Get prediction records for the entire date range
    const predictedRecords = await db
      .select({
        datetime: prediction.datetime,
        maxHumidityPrediction: prediction.maxHumidityPrediction,
        minHumidityPrediction: prediction.minHumidityPrediction,
      })
      .from(prediction)
      .where(and(gte(prediction.datetime, fromDate), lte(prediction.datetime, toDate)))
      .orderBy(asc(prediction.datetime));

    return {
      actual: actualRecords,
      predicted: predictedRecords,
    };
  }
}
