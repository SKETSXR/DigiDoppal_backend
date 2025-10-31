
import axios from 'axios';
import { SensorService } from '../services/sensor.service.js';
import { testConnection, closeConnection } from '../db/index.js';

const MERAKI_API_KEY = process.env.MERAKI_API_KEY || 'b37d0a725ea9ad73663d44570c6ee238c1287630';
const NETWORK_ID = process.env.MERAKI_NETWORK_ID || 'L_833165931063547167';

async function syncMerakiSensors() {
  try {
    console.log('🔄 Fetching sensors from Meraki API...');
    
    await testConnection();

    const response = await axios.get(
      `https://api.meraki.com/api/v1/networks/${NETWORK_ID}/sensors`,
      {
        headers: {
          'X-Cisco-Meraki-API-Key': MERAKI_API_KEY,
        },
      }
    );

    const merakiData = {
      count: response.data.length,
      sensors: response.data,
    };

    console.log(`📥 Found ${merakiData.count} sensors`);

    const sensors = await SensorService.syncSensors(merakiData);

    console.log(`✅ Synced ${sensors.length} sensors successfully`);
    
    sensors.forEach((sensor) => {
      console.log(`   - ${sensor.name} (${sensor.serialNumber})`);
    });

    await closeConnection();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to sync sensors:', error.message);
    process.exit(1);
  }
}

syncMerakiSensors();