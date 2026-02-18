/**
 * 应用自定义错误类
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 400,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建 404 错误
 */
export const notFound = (resource: string): AppError =>
  new AppError(`${resource} not found`, 404, 'NOT_FOUND');

/**
 * 创建 403 禁止访问错误
 */
export const forbidden = (message: string): AppError =>
  new AppError(message, 403, 'FORBIDDEN');

/**
 * 创建 400 错误请求错误
 */
export const badRequest = (message: string, code?: string): AppError =>
  new AppError(message, 400, code || 'BAD_REQUEST');

/**
 * 创建 401 未授权错误
 */
export const unauthorized = (message: string = 'Unauthorized'): AppError =>
  new AppError(message, 401, 'UNAUTHORIZED');

/**
 * 创建 500 服务器错误
 */
export const internalError = (message: string = 'Internal server error'): AppError =>
  new AppError(message, 500, 'INTERNAL_ERROR', false);

/**
 * 判断是否为操作型错误（可预期的错误）
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};
