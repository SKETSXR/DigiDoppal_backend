
import { SensorModel, TemperatureModel, HumidityModel } from '../models/sensor.model';
import { MerakiSensorResponse, SensorReading } from '../types/index';

export class SensorService {
  /**
   * Sync sensors from Meraki API
   */
  static async syncSensors(merakiData: MerakiSensorResponse) {
    const syncedSensors = [];

    for (const sensor of merakiData.sensors) {
      const alertProfile = sensor.alertProfiles.join(', ');

      const savedSensor = await SensorModel.upsert({
        serialNumber: sensor.serial,
        name: sensor.name,
        alertProfile,
      });

      syncedSensors.push(savedSensor);
    }

    return syncedSensors;
  }

  /**
   * Process sensor readings webhook
   */
  static async processSensorReadings(readings: SensorReading[]) {
    const processed = {
      temperature: 0,
      humidity: 0,
      battery: 0,
      errors: [] as string[],
    };

    for (const reading of readings) {
      try {
        // Find sensor
        const sensor = await SensorModel.findBySerial(reading.serial);

        if (!sensor) {
          processed.errors.push(`Sensor ${reading.serial} not found`);
          continue;
        }

        // Process each reading
        for (const data of reading.readings) {
          const timestamp = data.ts;

          switch (data.metric) {
            case 'temperature':
            case 'rawTemperature':
              if (data.temperature || data.rawTemperature) {
                const tempData = data.temperature || data.rawTemperature!;
                await TemperatureModel.create({
                  data: tempData,
                  datetime: timestamp,
                  temperature: tempData.celsius.toString(),
                  sensorId: sensor.id,
                });
                processed.temperature++;
              }
              break;

            case 'humidity':
              if (data.humidity) {
                await HumidityModel.create({
                  data: data.humidity,
                  datetime: timestamp,
                  humidity: data.humidity.relativePercentage.toString(),
                  sensorId: sensor.id,
                });
                processed.humidity++;
              }
              break;

            case 'battery':
              // Store battery info if needed (can add battery table)
              processed.battery++;
              break;
          }
        }
      } catch (error: any) {
        processed.errors.push(`Error processing ${reading.serial}: ${error.message}`);
      }
    }

    return processed;
  }

  /**
   * Get all sensors
   */
  static async getAllSensors() {
    return await SensorModel.findAll();
  }
}