/**
 * Claim 验证器测试
 */

function validateConfirmClaim(data) {
  const errors = [];

  // owner_name
  if (!data.owner_name || data.owner_name.length === 0) {
    errors.push({ field: 'owner_name', message: '拥有者名称不能为空' });
  } else if (data.owner_name.length > 100) {
    errors.push({ field: 'owner_name', message: '拥有者名称最多 100 个字符' });
  }

  // owner_email (optional)
  if (data.owner_email && data.owner_email !== '') {
    if (data.owner_email.length > 255) {
      errors.push({ field: 'owner_email', message: '邮箱最多 255 个字符' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.owner_email)) {
      errors.push({ field: 'owner_email', message: '邮箱格式不正确' });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function runClaimValidatorTests(runner) {
  runner.describe('confirmClaimSchema', () => {
    runner.it('accepts valid owner name', () => {
      const result = validateConfirmClaim({ owner_name: 'John Doe' });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts valid email', () => {
      const result = validateConfirmClaim({
        owner_name: 'John Doe',
        owner_email: 'john@example.com',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts missing email (optional)', () => {
      const result = validateConfirmClaim({ owner_name: 'John Doe' });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts empty email string', () => {
      const result = validateConfirmClaim({
        owner_name: 'John Doe',
        owner_email: '',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects missing owner name', () => {
      const result = validateConfirmClaim({});
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty owner name', () => {
      const result = validateConfirmClaim({ owner_name: '' });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects owner name longer than 100 characters', () => {
      const result = validateConfirmClaim({ owner_name: 'a'.repeat(101) });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects invalid email format', () => {
      const result = validateConfirmClaim({
        owner_name: 'John',
        owner_email: 'invalid-email',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects email without domain', () => {
      const result = validateConfirmClaim({
        owner_name: 'John',
        owner_email: 'test@',
      });
      runner.expect(result.valid).toBe(false);
    });
  });
}
