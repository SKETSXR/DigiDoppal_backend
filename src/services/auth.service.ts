import { UserModel } from '../models/user.model.js';
import { UserAuthService } from './user-auth.service.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { CustomError } from '../types/index.js';

export class AuthService {
  /**
   * Login user and create auth session
   */
  static async login(
    name: string, 
    password: string,
    accessToken: string,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await UserModel.findByName(name);
    
    if (!user) {
      const error: CustomError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      const error: CustomError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Create auth session with tokens
    const authSession = await UserAuthService.createAuthSession(
      user.id,
      accessToken,
      ipAddress,
      userAgent,
      '7d'
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      sessionId: authSession.id
    };
  }
}