import { FastifyInstance } from 'fastify';
// import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller.js';

export async function userRoutes(fastify: FastifyInstance) {
  // Create user (public)
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'password'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          password: { type: 'string', minLength: 6 },
          photo: { type: 'string' },
        },
      },
    },
    handler: UserController.createUser,
  });

  // Get all users (protected)
  fastify.get('/', {
    // preHandler: [verifyToken],
    handler: UserController.getAllUsers,
  });

  // Get user by ID (protected)
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: UserController.getUser,
  });

  // Update user (protected)
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          password: { type: 'string', minLength: 6 },
          photo: { type: 'string' },
          role_id: { type: 'integer' },
        },
      },
    },
    // preHandler: [verifyToken],
    handler: UserController.updateUser,
  });

  // Delete user (protected, admin only)
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    },
    // preHandler: [verifyToken, isAdmin],
    handler: UserController.deleteUser,
  });
}