
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userAuth, user, NewUserAuth } from '../db/schema.js';

export class UserAuthModel {
  /**
   * Create new auth session
   */
  static async create(authData: NewUserAuth) {
    const result = await db.insert(userAuth).values(authData).returning();
    return result[0];
  }

  /**
   * Find session by ID
   */
  static async findById(id: number) {
    const result = await db
      .select()
      .from(userAuth)
      .where(eq(userAuth.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find auth session by access token
   */
  static async findByAccessToken(accessToken: string) {
    const result = await db
      .select({
        id: userAuth.id,
        userId: userAuth.userId,
        accessToken: userAuth.accessToken,
        refreshToken: userAuth.refreshToken,
        ipAddress: userAuth.ipAddress,
        userAgent: userAuth.userAgent,
        isActive: userAuth.isActive,
        expiresAt: userAuth.expiresAt,
        userName: user.name,
        userRoleId: user.roleId,
      })
      .from(userAuth)
      .leftJoin(user, eq(userAuth.userId, user.id))
      .where(and(eq(userAuth.accessToken, accessToken), eq(userAuth.isActive, true)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find auth session by refresh token
   */
  static async findByRefreshToken(refreshToken: string) {
    const result = await db
      .select()
      .from(userAuth)
      .where(and(eq(userAuth.refreshToken, refreshToken), eq(userAuth.isActive, true)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Update access token
   */
  static async updateAccessToken(id: number, newAccessToken: string) {
    const result = await db
      .update(userAuth)
      .set({ 
        accessToken: newAccessToken, 
        lastUsedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(userAuth.id, id))
      .returning();

    return result[0];
  }

  /**
   * Update last used timestamp
   */
  static async updateLastUsed(id: number) {
    const result = await db
      .update(userAuth)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(eq(userAuth.id, id))
      .returning();

    return result[0];
  }

  /**
   * Deactivate auth session
   */
  static async deactivate(id: number) {
    const result = await db
      .update(userAuth)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userAuth.id, id))
      .returning();

    return result[0];
  }

  /**
   * Deactivate all user sessions
   */
  static async deactivateAllUserSessions(userId: number) {
    const result = await db
      .update(userAuth)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userAuth.userId, userId))
      .returning();

    return result;
  }

  /**
   * Get active sessions for user
   */
  static async getActiveSessions(userId: number) {
    const result = await db
      .select()
      .from(userAuth)
      .where(and(eq(userAuth.userId, userId), eq(userAuth.isActive, true)))
      .orderBy(desc(userAuth.createdAt));

    return result;
  }

  /**
   * Delete expired sessions
   */
  static async deleteExpiredSessions() {
    const now = new Date();
    const result = await db
      .delete(userAuth)
      .where(and(eq(userAuth.isActive, false)))
      .returning();

    return result;
  }
}