import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config/env';
import { testConnection, closeConnection } from './db/index';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { activityLogRoutes } from './routes/activity-log.routes';
import { predictionRoutes } from './routes/prediction.routes';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifySwagger from '@fastify/swagger';
import { roomLiveRoutes } from './routes/room-live.routes';
import { sensorRoutes } from './routes/sensor.routes';
import { MerakiSyncJob } from './jobs/meraki-sync.job';
import { merakiRoutes } from './routes/meraki.routes';
import { sensorDashboardRoutes } from './routes/sensor-dashboard.routes';

const app = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'info' : 'error',
    transport: config.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});


app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'My Fastify API',
      description: 'API documentation for my Fastify application',
      version: '1.0.0',
    },
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // JWT
  await app.register(jwt, {
    secret: config.jwt.secret,
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  app.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    };
  });

  // API routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/user' });
  await app.register(activityLogRoutes, { prefix: '/api/activity-logs' });
  await app.register(predictionRoutes, { prefix: '/api/predictions' });
  await app.register(roomLiveRoutes, { prefix: '/api/room-live' });
  await app.register(sensorRoutes, { prefix: '/api/sensors' });
  await app.register(merakiRoutes, { prefix: '/api/meraki' });
  await app.register(sensorDashboardRoutes, { prefix: '/api/sensor-dashboard' });
}

// Setup error handler
function setupErrorHandler() {
  app.setErrorHandler(errorHandler);
}

async function startCronJobs() {
  if (config.nodeEnv === 'production' || process.env.ENABLE_MERAKI_SYNC === 'true') {
    MerakiSyncJob.start();
  }
}


// Start server
async function start() {
  try {
    await testConnection();
    await registerPlugins();
    await registerRoutes();
    setupErrorHandler();
    await startCronJobs();

    // Start listening
    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(` Server is running! ${config.host}:${config.port} `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n⏳ Shutting down gracefully...');
  try {
    MerakiSyncJob.stop();
    await app.close();
    await closeConnection();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start the server
start();