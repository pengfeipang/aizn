import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

type ZodSchema = z.ZodType<any, any, any>;

/**
 * Zod 验证中间件
 * 验证请求体是否符合指定的 Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: '请求参数验证失败',
          details: error.issues.map((e: z.core.$ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Zod 验证中间件
 * 验证查询参数是否符合指定的 Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: '查询参数验证失败',
          details: error.issues.map((e: z.core.$ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Zod 验证中间件
 * 验证路径参数是否符合指定的 Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: '路径参数验证失败',
          details: error.issues.map((e: z.core.$ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
