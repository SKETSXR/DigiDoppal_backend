
import { RoomLiveModel } from '../models/room-live.model.js';
import { ActivityLogModel } from '../models/activity-log.model.js';
import { ActivityLogInput } from '../types/index.js';

export class RoomLiveService {
  /**
   * Get room live status
   */
static async getRoomLiveStatus(timeInMinutes: number = 5) {
    const {total_user,Intruders } = await RoomLiveModel.getTotalUsersByTime(timeInMinutes);
    const intruders = await RoomLiveModel.getRecentIntruders(10, timeInMinutes);

    return {
      'Total User': total_user,
      'Toal Intruders': Intruders,
      Intruder: intruders,
      timeRange: `Last ${timeInMinutes} minutes`,
    };
  }

  /**
   * Save bulk activity logs from AI backend
   */
  static async saveBulkActivityLogs(data: ActivityLogInput[], cameraId?: number, roomId?: number) {
    const savedLogs = [];

    for (const item of data) {
      const logData = {
        type: 'face_detection',
        data: JSON.stringify(item), // base64 image
        filePath: item.image,
        datetime: item.datetime,
        status: item.status,
        identity: item.identity,
        confidence: item.confidence,
        distance: item.distance,
        coordinates: item.coordinates,
        frameHeight: item.frameHeight,
        frameWidth: item.frameWidth,
        threshold: item.threshold,
        cameraId: cameraId || null,
        roomId: roomId || null,
        userId: null,
      };

      const saved = await ActivityLogModel.create(logData);
      savedLogs.push(saved);
    }

    return savedLogs;
  }

  /**
   * Get intruder history
   */
  static async getIntruderHistory(timeInterval: '10' | '30' = '10') {
    return await RoomLiveModel.getIntruderHistory(timeInterval);
  }
}
