import bcrypt from 'bcrypt';
import { config } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
}
