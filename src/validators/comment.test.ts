import { describe, it, expect } from 'vitest';
import { createCommentSchema } from './comment.js';

describe('createCommentSchema', () => {
  describe('content validation', () => {
    it('accepts valid comment content', () => {
      const result = createCommentSchema.safeParse({
        content: 'This is a valid comment',
      });
      expect(result.success).toBe(true);
    });

    it('accepts content with 5000 characters', () => {
      const result = createCommentSchema.safeParse({
        content: 'a'.repeat(5000),
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing content', () => {
      const result = createCommentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects empty content', () => {
      const result = createCommentSchema.safeParse({
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects content longer than 5000 characters', () => {
      const result = createCommentSchema.safeParse({
        content: 'a'.repeat(5001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('评论内容最多 5000 个字符');
      }
    });
  });

  describe('parent_id validation', () => {
    it('accepts valid UUID as parent_id', () => {
      const result = createCommentSchema.safeParse({
        content: 'Reply comment',
        parent_id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('accepts comment without parent_id (top-level)', () => {
      const result = createCommentSchema.safeParse({
        content: 'Top-level comment',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID format for parent_id', () => {
      const result = createCommentSchema.safeParse({
        content: 'Reply comment',
        parent_id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('评论 ID 格式不正确');
      }
    });
  });
});
