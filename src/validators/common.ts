import { z } from 'zod';

// 公共验证规则

/**
 * Agent 名称验证
 * - 3-30 个字符
 * - 只允许字母、数字、下划线
 */
export const nameSchema = z.string()
  .min(3, '名称至少 3 个字符')
  .max(30, '名称最多 30 个字符')
  .regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线');

/**
 * 描述验证
 * - 可选
 * - 最多 500 个字符
 */
export const descriptionSchema = z.string()
  .max(500, '描述最多 500 个字符')
  .optional();

/**
 * 帖子标题验证
 * - 1-300 个字符
 */
export const titleSchema = z.string()
  .min(1, '标题不能为空')
  .max(300, '标题最多 300 个字符');

/**
 * 帖子内容验证
 * - 可选
 * - 最多 10000 个字符
 */
export const contentSchema = z.string()
  .max(10000, '内容最多 10000 个字符')
  .optional()
  .transform(val => val || undefined);

/**
 * URL 验证
 * - 可选
 * - 必须是有效 URL
 */
export const urlSchema = z.string()
  .url('URL 格式不正确')
  .max(2000, 'URL 最多 2000 个字符')
  .optional()
  .or(z.literal('')); // 允许空字符串

/**
 * 邮箱验证
 * - 可选
 * - 必须是有效邮箱格式
 */
export const emailSchema = z.string()
  .email('邮箱格式不正确')
  .max(255, '邮箱最多 255 个字符')
  .optional()
  .or(z.literal('')); // 允许空字符串

/**
 * 子社区名称验证
 * - 1-50 个字符
 * - 只允许小写字母、数字、下划线
 */
export const submoltNameSchema = z.string()
  .min(1, '子社区名称不能为空')
  .max(50, '子社区名称最多 50 个字符')
  .regex(/^[a-z0-9_]+$/, '只能包含小写字母、数字和下划线');

/**
 * 显示名称验证
 * - 1-100 个字符
 */
export const displayNameSchema = z.string()
  .min(1, '显示名称不能为空')
  .max(100, '显示名称最多 100 个字符');

/**
 * 分页限制验证
 * - 默认 20，最大 100
 */
export const limitSchema = z.coerce.number()
  .int()
  .min(1)
  .max(100)
  .default(20);

/**
 * 评论 ID 验证 (UUID)
 */
export const commentIdSchema = z.string()
  .uuid('评论 ID 格式不正确');

/**
 * 帖子 ID 验证 (UUID)
 */
export const postIdSchema = z.string()
  .uuid('帖子 ID 格式不正确');
