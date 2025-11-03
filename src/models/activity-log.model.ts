import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { activityLog, user, camera, NewActivityLog } from '../db/schema';
import { ActivityLogFilters } from '../types/index';

export class ActivityLogModel {

  static async create(logData: NewActivityLog) {
    const result = await db.insert(activityLog).values({
      ...logData,
      coordinates: logData.coordinates || [],
    }).returning();
    return result[0];
  }

  static async findAll(filters: ActivityLogFilters) {
    const { status, user_id, camera_id, start_date, end_date, limit = 100, offset = 0 } = filters;

    let query = db
      .select({
        id: activityLog.id,
        type: activityLog.type,
        data: activityLog.data,
        datetime: activityLog.datetime,
        status: activityLog.status,
        identity: activityLog.identity,
        confidence: activityLog.confidence,
        distance: activityLog.distance,
        filePath: activityLog.filePath,
        userId: activityLog.userId,
        cameraId: activityLog.cameraId,
        userName: user.name,
        cameraName: camera.cameraName,
        createdAt: activityLog.createdAt,
        updatedAt: activityLog.updatedAt,
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .leftJoin(camera, eq(activityLog.cameraId, camera.id))
      .$dynamic();

    // Apply filters
    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(activityLog.status, status));
    }

    if (user_id) {
      conditions.push(eq(activityLog.userId, user_id));
    }

    if (camera_id) {
      conditions.push(eq(activityLog.cameraId, camera_id));
    }

    if (start_date) {
      conditions.push(gte(activityLog.createdAt, new Date(start_date)));
    }

    if (end_date) {
      conditions.push(lte(activityLog.createdAt, new Date(end_date)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }
}