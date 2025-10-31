import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { prediction, NewPrediction } from '../db/schema';

export class PredictionModel {
  /**
   * Get predictions by datetime
   */
  static async findByDatetime(datetime: string) {
    const targetDate = new Date(datetime);
    
    const result = await db
      .select()
      .from(prediction)
      .where(
        sql`DATE(${prediction.datetime}) = DATE(${targetDate})`
      )
      .orderBy(desc(prediction.datetime))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get predictions within date range
   */
  static async findByDateRange(startDate?: string, endDate?: string) {
    let query = db.select().from(prediction).$dynamic();

    const conditions: any[] = [];

    if (startDate) {
      conditions.push(gte(prediction.datetime, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(prediction.datetime, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(prediction.datetime));
    return result;
  }

  /**
   * Create prediction
   */
  static async create(predictionData: NewPrediction) {
    const result = await db.insert(prediction).values(predictionData).returning();
    return result[0];
  }
}