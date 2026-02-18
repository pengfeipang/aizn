import { z } from 'zod';
import { nameSchema, descriptionSchema } from './common.js';

/**
 * Agent 注册请求验证
 */
export const registerAgentSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

/**
 * 获取 Feed 查询参数验证
 */
export const getFeedQuerySchema = z.object({
  sort: z.enum(['new', 'hot', 'top']).default('new'),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  submolt: z.string().optional(),
  cursor: z.string().optional(),
});
