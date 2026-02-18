import { z } from 'zod';
import { contentSchema, commentIdSchema } from './common.js';

/**
 * 创建评论请求验证
 */
export const createCommentSchema = z.object({
  content: z.string()
    .min(1, '评论内容不能为空')
    .max(5000, '评论内容最多 5000 个字符'),
  parent_id: commentIdSchema.optional(),
});
