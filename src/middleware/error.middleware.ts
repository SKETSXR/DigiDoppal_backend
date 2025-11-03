import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Global error handler
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  reply.code(statusCode).send({
    success: false,
    message,
    error: process.env.MODE === 'development' ? error.stack : undefined,
  });
}