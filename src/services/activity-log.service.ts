import { ActivityLogModel } from '../models/activity-log.model.js';
import { NewActivityLog } from '../db/schema.js';
import { ActivityLogFilters } from '../types/index.js';

export class ActivityLogService {
  
  static async createLog(logData: NewActivityLog) {
    const log = await ActivityLogModel.create(logData);
    return log;
  }

  static async getLogs(filters: ActivityLogFilters) {
    const logs = await ActivityLogModel.findAll(filters);
    return logs;
  }
}
