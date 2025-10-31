import { FastifyReply } from 'fastify';

interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

export function successResponse<T>(
  reply: FastifyReply,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): FastifyReply {
  return reply.code(statusCode).send({
    success: true,
    message,
    data,
  } as SuccessResponse<T>);
}

export function errorResponse(
  reply: FastifyReply,
  message: string = 'Error',
  statusCode: number = 500,
  errors: any = null
): FastifyReply {
  return reply.code(statusCode).send({
    success: false,
    message,
    errors,
  } as ErrorResponse);
}