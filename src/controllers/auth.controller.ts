
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { UserAuthService } from '../services/user-auth.service';
import { UserModel } from '../models/user.model';
import { successResponse, errorResponse } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/index';

interface LoginBody {
  name: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

export class AuthController {
  /**
   * Login controller with automatic session creation
   */
  static async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const { name, password } = request.body;

      // Generate JWT access token FIRST
      const accessToken = request.server.jwt.sign(
        { name },
        { expiresIn: '60m' } 
      );

      // Get client information
      const ipAddress = request.ip || 'unknown';
      const userAgent = request.headers['user-agent'] || 'unknown';

      // Login and create session (stores tokens in database)
      const loginResult = await AuthService.login(
        name,
        password,
        accessToken,
        ipAddress,
        userAgent
      );

      // Generate proper JWT with user info
      const finalAccessToken = request.server.jwt.sign(
        { 
          id: loginResult.user.id, 
          name: loginResult.user.name, 
          role: loginResult.user.roleName 
        },
        { expiresIn: '60m' } // 60 minutes access token
      );

      // Update the session with the final access token
      await UserAuthService.updateAccessToken(
        loginResult.sessionId,
        finalAccessToken
      );

      return successResponse(
        reply,
        {
          user: loginResult.user,
          accessToken: finalAccessToken
        },
        'Login successful',
        200
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Login failed';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenBody }>,
    reply: FastifyReply
  ) {
    try {
      const { refreshToken } = request.body;

      if (!refreshToken) {
        return errorResponse(reply, 'Refresh token is required', 400);
      }

      // Validate refresh token and get session
      const session = await UserAuthService.validateRefreshToken(refreshToken);

      if (!session) {
        return errorResponse(reply, 'Invalid or expired refresh token', 401);
      }

      // Get user details
      const user = await UserModel.findById(session.userId);

      if (!user) {
        return errorResponse(reply, 'User not found', 404);
      }

      // Generate new access token
      const newAccessToken = request.server.jwt.sign(
        { 
          id: user.id, 
          name: user.name, 
          role: user.roleName 
        },
        { expiresIn: '60m' }
      );

      // Update session with new access token
      await UserAuthService.updateAccessToken(session.id, newAccessToken);

      return successResponse(
        reply,
        {
          accessToken: newAccessToken,
          refreshToken: session.refreshToken, // Keep same refresh token
          tokenType: 'Bearer',
          expiresIn: 3600, // 15 minutes
        },
        'Token refreshed successfully',
        200
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to refresh token';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Logout (deactivate current session)
   */
  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        return errorResponse(reply, 'No token provided', 401);
      }

      const token = authHeader.replace('Bearer ', '');
      await UserAuthService.logout(token);

      return successResponse(reply, null, 'Logged out successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Logout failed';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAllDevices(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as AuthenticatedRequest).user;
      await UserAuthService.logoutAllDevices(user.id);

      return successResponse(reply, null, 'Logged out from all devices', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to logout from all devices';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get active sessions
   */
  static async getActiveSessions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as AuthenticatedRequest).user;
      const sessions = await UserAuthService.getActiveSessions(user.id);

      return successResponse(reply, sessions, 'Active sessions retrieved', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve sessions';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as AuthenticatedRequest).user;
      const { sessionId } = request.params;

      await UserAuthService.revokeSession(parseInt(sessionId), user.id);

      return successResponse(reply, null, 'Session revoked successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to revoke session';
      return errorResponse(reply, message, statusCode);
    }
  }
}
