/**
 * Submolt 验证器测试
 */

function validateCreateSubmolt(data) {
  const errors = [];

  // name
  if (!data.name || data.name.length === 0) {
    errors.push({ field: 'name', message: '子社区名称不能为空' });
  } else if (data.name.length > 50) {
    errors.push({ field: 'name', message: '子社区名称最多 50 个字符' });
  } else if (!/^[a-z0-9_]+$/.test(data.name)) {
    errors.push({ field: 'name', message: '只能包含小写字母、数字和下划线' });
  }

  // display_name
  if (!data.display_name || data.display_name.length === 0) {
    errors.push({ field: 'display_name', message: '显示名称不能为空' });
  } else if (data.display_name.length > 100) {
    errors.push({ field: 'display_name', message: '显示名称最多 100 个字符' });
  }

  // description (optional)
  if (data.description && data.description.length > 500) {
    errors.push({ field: 'description', message: '描述最多 500 个字符' });
  }

  return { valid: errors.length === 0, errors };
}

export function runSubmoltValidatorTests(runner) {
  runner.describe('createSubmoltSchema', () => {
    runner.it('accepts valid submolt data', () => {
      const result = validateCreateSubmolt({
        name: 'technology',
        display_name: 'Technology',
        description: 'Tech discussions',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts name with numbers and underscores', () => {
      const result = validateCreateSubmolt({
        name: 'tech_2024',
        display_name: 'Tech 2024',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts without description', () => {
      const result = validateCreateSubmolt({
        name: 'tech',
        display_name: 'Technology',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects uppercase letters in name', () => {
      const result = validateCreateSubmolt({
        name: 'Technology',
        display_name: 'Technology',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects special characters in name', () => {
      const result = validateCreateSubmolt({
        name: 'tech-discussion',
        display_name: 'Tech Discussion',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects spaces in name', () => {
      const result = validateCreateSubmolt({
        name: 'tech discussion',
        display_name: 'Tech Discussion',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty name', () => {
      const result = validateCreateSubmolt({
        name: '',
        display_name: 'Test',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects name longer than 50 characters', () => {
      const result = validateCreateSubmolt({
        name: 'a'.repeat(51),
        display_name: 'Test',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects missing display_name', () => {
      const result = validateCreateSubmolt({ name: 'tech' });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty display_name', () => {
      const result = validateCreateSubmolt({
        name: 'tech',
        display_name: '',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects display_name longer than 100 characters', () => {
      const result = validateCreateSubmolt({
        name: 'tech',
        display_name: 'a'.repeat(101),
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects description longer than 500 characters', () => {
      const result = validateCreateSubmolt({
        name: 'tech',
        display_name: 'Technology',
        description: 'a'.repeat(501),
      });
      runner.expect(result.valid).toBe(false);
    });
  });
}
