// src/db/schema.ts
import { pgTable, serial, varchar, text, integer, timestamp, boolean, doublePrecision, jsonb, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// User Roles Table
export const userRole = pgTable('user_role', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users Table
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  photo: text('photo'),
  password: text('password').notNull(),
  roleId: integer('role_id').references(() => userRole.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profile Images Table
export const profileImages = pgTable('profile_images', {
  id: serial('id').primaryKey(),
  image: text('image').notNull(),
  userId: integer('user_id').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Rooms Table
export const room = pgTable('room', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cameras Table
export const camera = pgTable('camera', {
  id: serial('id').primaryKey(),
  cameraNumber: varchar('camera_number', { length: 50 }).notNull(),
  cameraName: varchar('camera_name', { length: 100 }).notNull(),
  companyName: varchar('company_name', { length: 100 }),
  roomId: integer('room_id').references(() => room.id, { onDelete: 'set null' }),
  isOn: boolean('is_on').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export interface Coordinates {
  x: number;
  y: number;
  w: string;
  h: string;
  distance: number;
  name: string;
}

// Activity Log Table
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  data: text('data').notNull(),
  datetime: text('datetime'),
  status: varchar('status', { length: 20 }).default('no_face').notNull(),
  identity: varchar('identity', { length: 255 }),
  confidence: doublePrecision('confidence'),
  distance: doublePrecision('distance'),
  filePath: text('file_path'),
  coordinates: jsonb('coordinates').$type<Coordinates[]>(),
  frameHeight : text('frame_height'),
  frameWidth : text('frame_width'),
  threshold : text('threshold'),
  userId: integer('user_id').references(() => user.id, { onDelete: 'set null' }),
  cameraId: integer('camera_id').references(() => camera.id, { onDelete: 'set null' }),
  roomId: integer('room_id').references(() => room.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusCheck: check('status_check', sql`${table.status} IN ('verified', 'no_face', 'unknown')`),
}));

// Temperature Table
export const temperature = pgTable('temperature', {
  id: serial('id').primaryKey(),
  data: jsonb('data').notNull(),
  datetime:text('datetime'),
  temperature: text('temperature'),
  sensorId: integer('sensor_id').references(() => sensors.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Humidity Table
export const humidity = pgTable('humidity', {
  id: serial('id').primaryKey(),
  data: jsonb('data').notNull(),
  datetime:text('datetime'),
  humidity: text('humidity'),
  sensorId: integer('sensor_id').references(() => sensors.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Prediction Table
export const prediction = pgTable('prediction', {
  id: serial('id').primaryKey(),
  datetime: timestamp('datetime').defaultNow().notNull(),
  temperaturePrediction: doublePrecision('temperature_prediction'),
  maxTemperaturePrediction: doublePrecision('max_temperature_prediction'),
  minTemperaturePrediction: doublePrecision('min_temperature_prediction'),
  maxHumidityPrediction: doublePrecision('max_humidity_prediction'),
  minHumidityPrediction: doublePrecision('min_humidity_prediction'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userAuth = pgTable('user_auth', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  deviceInfo: text('device_info'),
  location: varchar('location', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Humidity Table
export const sensors = pgTable('sensors', {
  id: serial('id').primaryKey(),
  serialNumber: text('serial_number').notNull().unique(),
  name:text('name').notNull(),
  alertProfile: text('alert_profile'),
  is_active: boolean("is_active").default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const userRelations = relations(user, ({ one, many }) => ({
  role: one(userRole, {
    fields: [user.roleId],
    references: [userRole.id],
  }),
  profileImages: many(profileImages),
  activityLogs: many(activityLog),
  authSessions: many(userAuth)
}));

export const userRoleRelations = relations(userRole, ({ many }) => ({
  users: many(user),
}));

export const roomRelations = relations(room, ({ many }) => ({
  cameras: many(camera),
}));

export const cameraRelations = relations(camera, ({ one, many }) => ({
  room: one(room, {
    fields: [camera.roomId],
    references: [room.id],
  }),
  activityLogs: many(activityLog),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(user, {
    fields: [activityLog.userId],
    references: [user.id],
  }),
  camera: one(camera, {
    fields: [activityLog.cameraId],
    references: [camera.id],
  }),
}));

export const userAuthRelations = relations(userAuth, ({ one }) => ({
  user: one(user, {
    fields: [userAuth.userId],
    references: [user.id],
  }),
}));


// Type exports
export type UserAuth = typeof userAuth.$inferSelect;
export type NewUserAuth = typeof userAuth.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type UserRole = typeof userRole.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
export type Prediction = typeof prediction.$inferSelect;
export type NewPrediction = typeof prediction.$inferInsert;
export type Sensor = typeof sensors.$inferSelect;
export type NewSensor = typeof sensors.$inferInsert;
export type Temperature = typeof temperature.$inferSelect;
export type NewTemperature = typeof temperature.$inferInsert;
export type Humidity = typeof humidity.$inferSelect;
export type NewHumidity = typeof humidity.$inferInsert;