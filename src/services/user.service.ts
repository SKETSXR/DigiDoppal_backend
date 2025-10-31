import { UserModel } from '../models/user.model';
import { hashPassword } from '../utils/password.util';
import { CustomError } from '../types/index';
import { User } from '../db/schema';

export class UserService {

  static async createUser(userData: { name: string; password: string; photo?: string }) {
    const { name, password, photo } = userData;

    // Check if user already exists
    const existingUser = await UserModel.findByName(name);
    if (existingUser) {
      const error: CustomError = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with viewer role by default
    const user = await UserModel.create({
      name,
      password: hashedPassword,
      photo: photo || null,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(
    id: number,
    userData: Partial<{ name: string; password: string; photo: string; role_id: number }>
  ) {
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.photo !== undefined) updateData.photo = userData.photo;
    if (userData.role_id !== undefined) updateData.roleId = userData.role_id;

    // If password is being updated, hash it
    if (userData.password) {
      updateData.password = await hashPassword(userData.password);
    }

    // Update user
    const updatedUser = await UserModel.update(id, updateData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  static async deleteUser(id: number) {
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete user
    const deletedUser = await UserModel.delete(id);
    return deletedUser;
  }

  static async getUserById(id: number) {
    const user = await UserModel.findById(id);
    if (!user) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getAllUsers() {
    const users : any = await UserModel.findAll();
    
    // Remove passwords from all users
    return users.map((user : any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}