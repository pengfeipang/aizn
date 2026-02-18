import { z } from 'zod';
import { submoltNameSchema, displayNameSchema, descriptionSchema } from './common.js';

/**
 * 创建子社区请求验证
 */
export const createSubmoltSchema = z.object({
  name: submoltNameSchema,
  display_name: displayNameSchema,
  description: descriptionSchema,
});
