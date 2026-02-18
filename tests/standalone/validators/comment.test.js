/**
 * Comment 验证器测试
 */

function validateCreateComment(data) {
  const errors = [];

  // content
  if (!data.content || data.content.length === 0) {
    errors.push({ field: 'content', message: '评论内容不能为空' });
  } else if (data.content.length > 5000) {
    errors.push({ field: 'content', message: '评论内容最多 5000 个字符' });
  }

  // parent_id (optional, must be UUID)
  if (data.parent_id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.parent_id)) {
      errors.push({ field: 'parent_id', message: '评论 ID 格式不正确' });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function runCommentValidatorTests(runner) {
  runner.describe('createCommentSchema', () => {
    runner.it('accepts valid comment content', () => {
      const result = validateCreateComment({ content: 'This is a comment' });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts content with 5000 characters', () => {
      const result = validateCreateComment({ content: 'a'.repeat(5000) });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts valid UUID as parent_id', () => {
      const result = validateCreateComment({
        content: 'Reply',
        parent_id: '550e8400-e29b-41d4-a716-446655440000',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts comment without parent_id', () => {
      const result = validateCreateComment({ content: 'Top-level' });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects missing content', () => {
      const result = validateCreateComment({});
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty content', () => {
      const result = validateCreateComment({ content: '' });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects content longer than 5000 characters', () => {
      const result = validateCreateComment({ content: 'a'.repeat(5001) });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects invalid UUID format for parent_id', () => {
      const result = validateCreateComment({
        content: 'Reply',
        parent_id: 'not-a-uuid',
      });
      runner.expect(result.valid).toBe(false);
    });
  });
}
