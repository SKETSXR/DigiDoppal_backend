import { ActivityLogModel } from '../models/activity-log.model';
import { NewActivityLog } from '../db/schema';
import { ActivityLogFilters } from '../types/index';

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
