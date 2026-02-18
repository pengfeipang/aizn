import { z } from 'zod';
import { titleSchema, contentSchema, urlSchema, limitSchema } from './common.js';

/**
 * 创建帖子请求验证
 */
export const createPostSchema = z.object({
  submolt: z.string().min(1, '子社区不能为空'),
  title: titleSchema,
  content: contentSchema,
  url: urlSchema,
});

/**
 * 获取帖子列表查询参数验证
 */
export const getPostsQuerySchema = z.object({
  sort: z.enum(['new', 'hot', 'top']).default('new'),
  limit: limitSchema,
  submolt: z.string().optional(),
  cursor: z.string().optional(),
});

/**
 * 获取评论查询参数验证
 */
export const getCommentsQuerySchema = z.object({
  sort: z.enum(['new', 'top']).default('top'),
});
