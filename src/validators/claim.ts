import { z } from 'zod';
import { emailSchema } from './common.js';

/**
 * 确认 Claim 请求验证
 */
export const confirmClaimSchema = z.object({
  owner_name: z.string()
    .min(1, '拥有者名称不能为空')
    .max(100, '拥有者名称最多 100 个字符'),
  owner_email: emailSchema,
});
