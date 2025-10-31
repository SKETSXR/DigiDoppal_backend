// src/controllers/user.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response.util';

interface CreateUserBody {
  name: string;
  password: string;
  photo?: string;
}

interface UpdateUserBody {
  name?: string;
  password?: string;
  photo?: string;
  role_id?: number;
}

interface UserParams {
  id: string;
}

export class UserController {
  /**
   * Create user
   */
  static async createUser(
    request: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply
  ) {
    try {
      const userData = request.body;
      const user = await UserService.createUser(userData);

      return successResponse(reply, user, 'User created successfully', 201);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to create user';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    request: FastifyRequest<{ Params: UserParams; Body: UpdateUserBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userData = request.body;

      const user = await UserService.updateUser(parseInt(id), userData);

      return successResponse(reply, user, 'User updated successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to update user';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await UserService.deleteUser(parseInt(id));

      return successResponse(reply, null, 'User deleted successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to delete user';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const user = await UserService.getUserById(parseInt(id));

      return successResponse(reply, user, 'User retrieved successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve user';
      return errorResponse(reply, message, statusCode);
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await UserService.getAllUsers();

      return successResponse(reply, users, 'Users retrieved successfully', 200);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Failed to retrieve users';
      return errorResponse(reply, message, statusCode);
    }
  }
}