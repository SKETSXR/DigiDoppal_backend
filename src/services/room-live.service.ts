
import { RoomLiveModel } from '../models/room-live.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { ActivityLogInput } from '../types/index';

export class RoomLiveService {
  /**
   * Get room live status
   */
  static async getRoomLiveStatus() {
    const totalUsers = await RoomLiveModel.getTotalUsersLast24Hours();
    const intruders = await RoomLiveModel.getRecentIntruders(10);

    return {
      'Total User': totalUsers,
      Intruders: intruders,
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
  static async getIntruderHistory(timeInterval: '10min' | '30min' = '10min') {
    return await RoomLiveModel.getIntruderHistory(timeInterval);
  }
}
