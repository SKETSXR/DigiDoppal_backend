
import { UserAuthModel } from '../models/user-auth.model';
import { NewUserAuth } from '../db/schema';
import { CustomError } from '../types/index';
import crypto from 'crypto';

export class UserAuthService {
  /**
   * Generate refresh token
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Create auth session - CALLED AUTOMATICALLY ON LOGIN
   */
  static async createAuthSession(
    userId: number,
    accessToken: string,
    ipAddress: string,
    userAgent: string,
    expiresIn: string = '7d'
  ) {
    const refreshToken = this.generateRefreshToken();
    
    // Calculate expiration (7 days from now for refresh token)
    const expiresAt = new Date();
    const days = parseInt(expiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    const authData: NewUserAuth = {
      userId,
      accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true,
      lastUsedAt: new Date(),
    };

    const session = await UserAuthModel.create(authData);
    return session;
  }

  /**
   * Update access token in session
   */
  static async updateAccessToken(sessionId: number, newAccessToken: string) {
    const result = await UserAuthModel.updateAccessToken(sessionId, newAccessToken);
    return result;
  }

  /**
   * Validate refresh token and return session
   */
  static async validateRefreshToken(refreshToken: string) {
    const session = await UserAuthModel.findByRefreshToken(refreshToken);
    
    if (!session) {
      const error: CustomError = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
      await UserAuthModel.deactivate(session.id);
      const error: CustomError = new Error('Refresh token expired');
      error.statusCode = 401;
      throw error;
    }

    // Update last used
    await UserAuthModel.updateLastUsed(session.id);

    return session;
  }

  /**
   * Validate access token (for middleware)
   */
  static async validateAccessToken(accessToken: string) {
    const session = await UserAuthModel.findByAccessToken(accessToken);
    
    if (!session) {
      return null;
    }

    // Check if session expired
    if (new Date() > new Date(session.expiresAt)) {
      await UserAuthModel.deactivate(session.id);
      return null;
    }

    // Update last used
    await UserAuthModel.updateLastUsed(session.id);

    return session;
  }

  /**
   * Logout (deactivate session by access token)
   */
  static async logout(accessToken: string) {
    const session = await UserAuthModel.findByAccessToken(accessToken);
    
    if (session) {
      await UserAuthModel.deactivate(session.id);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices
   */
  static async logoutAllDevices(userId: number) {
    await UserAuthModel.deactivateAllUserSessions(userId);
    return { message: 'Logged out from all devices' };
  }

  /**
   * Get active sessions
   */
  static async getActiveSessions(userId: number) {
    const sessions = await UserAuthModel.getActiveSessions(userId);
    
    // Remove sensitive data
    return sessions.map(session => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceInfo: session.deviceInfo,
      location: session.location,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(sessionId: number, userId: number) {
    const session = await UserAuthModel.findById(sessionId);
    
    if (!session) {
      const error: CustomError = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      const error: CustomError = new Error('Unauthorized to revoke this session');
      error.statusCode = 403;
      throw error;
    }

    await UserAuthModel.deactivate(sessionId);
    return { message: 'Session revoked successfully' };
  }
}
