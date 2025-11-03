import { FastifyRequest } from 'fastify';
import { Coordinates } from '../db/schema.js';

export interface JWTPayload {
  id: number;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JWTPayload;
}

export interface CustomError extends Error {
  statusCode?: number;
}

export interface ActivityLogFilters {
  status?: 'verified' | 'no_face' | 'unknown';
  user_id?: number;
  camera_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface PredictionQuery {
  datetime: string;
  room_id?: number;
}

export interface ActivityLogInput {
  image: string; // base64
  confidence: number;
  datetime: string;
  identity: string;
  distance: number;
  frameHeight: string;
  frameWidth: string;
  status: string;
  threshold: string;
  coordinates: Coordinates[];
}

export interface IntruderData {
  image: string | null;
  datetime: string | null;
  status: string;
}

export interface IntruderHistoryData {
  time: string;
  total: number;
  intruder: number;
}

export interface MerakiSensorResponse {
  count: number;
  sensors: {
    serial: string;
    name: string;
    alertProfiles: string[];
    alertingOn: Record<string, any>;
  }[];
}

export interface SensorReading {
  serial: string;
  network: {
    id: string;
    name: string;
  };
  readings: {
    ts: string;
    metric: 'humidity' | 'temperature' | 'rawTemperature' | 'battery';
    humidity?: {
      relativePercentage: number;
    };
    temperature?: {
      fahrenheit: number;
      celsius: number;
    };
    rawTemperature?: {
      fahrenheit: number;
      celsius: number;
    };
    battery?: {
      percentage: number;
    };
  }[];
}