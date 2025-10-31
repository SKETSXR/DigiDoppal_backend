
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { sensors, temperature, humidity, NewSensor, NewTemperature, NewHumidity } from '../db/schema';

export class SensorModel {
  /**
   * Create or update sensor
   */
  static async upsert(sensorData: NewSensor) {
    const existing = await db
      .select()
      .from(sensors)
      .where(eq(sensors.serialNumber, sensorData.serialNumber))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const result = await db
        .update(sensors)
        .set({
          name: sensorData.name,
          alertProfile: sensorData.alertProfile,
          updatedAt: new Date(),
        })
        .where(eq(sensors.serialNumber, sensorData.serialNumber))
        .returning();
      return result[0];
    } else {
      // Insert new
      const result = await db.insert(sensors).values(sensorData).returning();
      return result[0];
    }
  }

  /**
   * Find sensor by serial number
   */
  static async findBySerial(serialNumber: string) {
    const result = await db
      .select()
      .from(sensors)
      .where(eq(sensors.serialNumber, serialNumber))
      .limit(1);
    return result[0] || null;
  }

  /**
   * Get all sensors
   */
  static async findAll() {
    return await db.select().from(sensors);
  }
}

export class TemperatureModel {
  /**
   * Create temperature reading
   */
  static async create(data: NewTemperature) {
    const result = await db.insert(temperature).values(data).returning();
    return result[0];
  }
}

export class HumidityModel {
  /**
   * Create humidity reading
   */
  static async create(data: NewHumidity) {
    const result = await db.insert(humidity).values(data).returning();
    return result[0];
  }
}