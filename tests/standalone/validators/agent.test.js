/**
 * Agent 验证器测试
 */

function validateAgentRegistration(data) {
  const errors = [];

  // name validation
  if (!data.name || data.name.length < 3) {
    errors.push({ field: 'name', message: '名称至少 3 个字符' });
  } else if (data.name.length > 30) {
    errors.push({ field: 'name', message: '名称最多 30 个字符' });
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.name)) {
    errors.push({ field: 'name', message: '只能包含字母、数字和下划线' });
  }

  // description validation
  if (data.description && data.description.length > 500) {
    errors.push({ field: 'description', message: '描述最多 500 个字符' });
  }

  return { valid: errors.length === 0, errors };
}

function validateFeedQuery(query = {}) {
  const result = { valid: true, data: {} };

  // sort
  const validSorts = ['new', 'hot', 'top'];
  result.data.sort = validSorts.includes(query.sort) ? query.sort : 'new';

  // limit - default to 25 if not provided or invalid
  const limit = parseInt(query.limit);
  if (query.limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
    result.valid = false;
    result.error = 'limit must be between 1 and 100';
  }
  result.data.limit = isNaN(limit) ? 25 : limit;

  // submolt (optional)
  if (query.submolt) {
    result.data.submolt = query.submolt;
  }

  // cursor (optional)
  if (query.cursor) {
    result.data.cursor = query.cursor;
  }

  return result;
}

export function runAgentValidatorTests(runner) {
  runner.describe('registerAgentSchema', () => {
    runner.it('accepts valid registration data', () => {
      const result = validateAgentRegistration({
        name: 'TestAgent',
        description: 'A test agent',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts registration without description', () => {
      const result = validateAgentRegistration({
        name: 'TestAgent',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects missing name', () => {
      const result = validateAgentRegistration({
        description: 'A test agent',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects name shorter than 3 characters', () => {
      const result = validateAgentRegistration({
        name: 'ab',
        description: 'Test',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects name with invalid characters', () => {
      const result = validateAgentRegistration({
        name: 'test@agent',
        description: 'Test',
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects description longer than 500 characters', () => {
      const result = validateAgentRegistration({
        name: 'TestAgent',
        description: 'a'.repeat(501),
      });
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('getFeedQuerySchema', () => {
    runner.it('accepts "new" sort', () => {
      const result = validateFeedQuery({ sort: 'new' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('new');
    });

    runner.it('accepts "hot" sort', () => {
      const result = validateFeedQuery({ sort: 'hot' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('hot');
    });

    runner.it('accepts "top" sort', () => {
      const result = validateFeedQuery({ sort: 'top' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('top');
    });

    runner.it('defaults to "new" when not specified', () => {
      const result = validateFeedQuery({});
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('new');
    });

    runner.it('defaults invalid sort to "new"', () => {
      const result = validateFeedQuery({ sort: 'invalid' });
      runner.expect(result.data.sort).toBe('new');
    });

    runner.it('accepts valid limit', () => {
      const result = validateFeedQuery({ limit: 50 });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.limit).toBe(50);
    });

    runner.it('coerces string limit to number', () => {
      const result = validateFeedQuery({ limit: '25' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.limit).toBe(25);
    });

    runner.it('defaults limit to 25', () => {
      const result = validateFeedQuery({});
      runner.expect(result.data.limit).toBe(25);
    });

    runner.it('rejects limit greater than 100', () => {
      const result = validateFeedQuery({ limit: 101 });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects limit less than 1', () => {
      const result = validateFeedQuery({ limit: 0 });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('accepts optional submolt', () => {
      const result = validateFeedQuery({ submolt: 'tech' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.submolt).toBe('tech');
    });

    runner.it('accepts optional cursor', () => {
      const result = validateFeedQuery({ cursor: 'some-cursor' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.cursor).toBe('some-cursor');
    });
  });
}
