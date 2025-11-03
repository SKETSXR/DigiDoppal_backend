import { FastifyRequest, FastifyReply } from 'fastify';
import { errorResponse } from '../utils/response.util.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Verify JWT token middleware
 */
export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return errorResponse(reply, 'Unauthorized - Invalid or missing token', 401);
  }
}

/**
 * Check if user has admin role
 */
export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = (request as AuthenticatedRequest).user;
    
    if (user.role !== 'admin') {
      return errorResponse(reply, 'Forbidden - Admin access required', 403);
    }
  } catch (error) {
    return errorResponse(reply, 'Forbidden', 403);
  }
}