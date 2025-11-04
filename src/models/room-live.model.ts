
import { db } from '../db/index.js';
import { activityLog } from '../db/schema.js';
import { sql, gte, desc, between, lte, and } from 'drizzle-orm';
import { IntruderData } from '../types';

export class RoomLiveModel {
  /**
   * Get unique users from last 24 hours based on coordinates
   */
  static async getTotalUsersByTime(timeInMinutes: number) {
    const now = new Date(); // UTC
    const timeAgo = new Date(now.getTime() - timeInMinutes * 60 * 1000);

    const logs = await db
      .select({
        coordinates: activityLog.coordinates,
        createdAt: activityLog.createdAt,
        status: activityLog.status
      })
      .from(activityLog)
      .where(and(
            gte(activityLog.createdAt, new Date(timeAgo.toISOString())),
            lte(activityLog.createdAt, new Date(now.toISOString()))
          )
      );

    // Extract unique user names from coordinates
    const uniqueUsers = new Set<string>();
    let unknownCount = 0;
    
    logs.forEach((log: any) => {
      if (log.coordinates && Array.isArray(log.coordinates)) {
        const hasUnknown = log.coordinates.some(
          (coord: any) => coord.name === 'unknown' || !coord.name
        );
        if (log.name && log.name !== 'unknown') {
          uniqueUsers.add(log.name);
        }
        else if (hasUnknown || log.status === 'unknown') {
          unknownCount++;
        }
      }
    });

    return {
      total_user : uniqueUsers.size + unknownCount,
      Intruders: unknownCount
    };
  }

  /**
   * Get last 10 intruders (unknown or unverified)
   */
static async getRecentIntruders(limit: number = 10, timeInMinutes: number = 5) {
    const now = new Date(); // UTC
    const timeAgo = new Date(now.getTime() - timeInMinutes * 60 * 1000);

    const logs = await db
      .select({
        filePath: activityLog.filePath,
        data: activityLog.data, // base64 image
        datetime: activityLog.datetime,
        status: activityLog.status,
        coordinates: activityLog.coordinates,
        createdAt: activityLog.createdAt,
      })
      .from(activityLog)
      .where(between(activityLog.createdAt, timeAgo, now))
      .orderBy(desc(activityLog.createdAt))
      .limit(50); // Get more to filter

    const intruders: IntruderData[] = [];

    for (const log of logs) {
      if (intruders.length >= limit) break;

      // Check if any coordinate has unknown name
      if (log.coordinates && Array.isArray(log.coordinates)) {
        const hasUnknown = log.coordinates.some(
          (coord: any) => coord.name === 'unknown' || !coord.name
        );

        if (hasUnknown || log.status === 'unknown') {
          intruders.push({
            image: log.filePath || log.data || null,
            datetime: log.datetime || log?.createdAt?.toString() || "",
            status: log.status,
          });
        }
      }
    }

    return intruders;
  }

  /**
   * Get intruder history with time intervals
   */
  static async getIntruderHistory(timeInterval = '10') {
    // const intervalMinutes = timeInterval === '10' ? 10 : 30;
    const now = new Date();
    const startTime = new Date(now.getTime() - 60 * 60 * 1000); // Last 1 hour

    const logs = await db
      .select({
        coordinates: activityLog.coordinates,
        createdAt: activityLog.createdAt,
      })
      .from(activityLog)
      .where(gte(activityLog.createdAt, startTime))
      .orderBy(activityLog.createdAt);

    // Group by time intervals
    const intervals: Map<string, { total: Set<string>; intruders: number }> = new Map();

    logs.forEach((log) => {
      const logTime = new Date(log.createdAt || "");
      const intervalKey = this.getIntervalKey(logTime, parseFloat(timeInterval));

      if (!intervals.has(intervalKey)) {
        intervals.set(intervalKey, { total: new Set(), intruders: 0 });
      }

      const interval = intervals.get(intervalKey)!;

      if (log.coordinates && Array.isArray(log.coordinates)) {
        log.coordinates.forEach((coord: any) => {
          if (coord.name) {
            interval.total.add(coord.name);
            if (coord.name === 'unknown' || !coord.name.trim()) {
              interval.intruders++;
            }
          }
        });
      }
    });

    // Convert to array
    return Array.from(intervals.entries()).map(([time, data]) => ({
      time,
      total: data.total.size,
      intruder: data.intruders,
    }));
  }

  /**
   * Helper to get interval key
   */
  private static getIntervalKey(date: Date, minutes: number): string {
    const rounded = new Date(
      Math.floor(date.getTime() / (minutes * 60 * 1000)) * (minutes * 60 * 1000)
    );
    return rounded.toISOString();
  }
}