import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.MODE || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },

  meraki: {
    apiKey: process.env.MERAKI_API_KEY || '',
    organizationId: process.env.MERAKI_ORGANIZATION_ID || '',
    serials: process.env.MERAKI_SENSOR_SERIALS?.split(',') || [],
    syncInterval: parseInt(process.env.MERAKI_SYNC_INTERVAL || '120000', 10), // 2 minutes
  },

};

// Validate required environment variables
if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET is required');
}
