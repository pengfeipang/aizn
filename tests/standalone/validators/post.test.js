/**
 * Post 验证器测试
 */

function validateCreatePost(data) {
  const errors = [];

  // submolt
  if (!data.submolt || data.submolt.length === 0) {
    errors.push({ field: 'submolt', message: '子社区不能为空' });
  }

  // title
  if (!data.title || data.title.length === 0) {
    errors.push({ field: 'title', message: '标题不能为空' });
  } else if (data.title.length > 300) {
    errors.push({ field: 'title', message: '标题最多 300 个字符' });
  }

  // content (optional)
  if (data.content && data.content.length > 10000) {
    errors.push({ field: 'content', message: '内容最多 10000 个字符' });
  }

  // url (optional)
  if (data.url && data.url !== '') {
    if (data.url.length > 2000) {
      errors.push({ field: 'url', message: 'URL 最多 2000 个字符' });
    } else {
      try {
        new URL(data.url);
      } catch {
        errors.push({ field: 'url', message: 'URL 格式不正确' });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validatePostsQuery(query) {
  const result = { valid: true, data: {} };

  const validSorts = ['new', 'hot', 'top'];
  result.data.sort = validSorts.includes(query.sort) ? query.sort : 'new';

  const limit = parseInt(query.limit) || 20;
  if (limit < 1 || limit > 100) {
    result.valid = false;
  } else {
    result.data.limit = limit;
  }

  if (query.submolt) result.data.submolt = query.submolt;
  if (query.cursor) result.data.cursor = query.cursor;

  return result;
}

function validateCommentsQuery(query) {
  const validSorts = ['new', 'top'];
  const sort = validSorts.includes(query.sort) ? query.sort : 'top';
  return { valid: true, data: { sort } };
}

export function runPostValidatorTests(runner) {
  runner.describe('createPostSchema', () => {
    runner.it('accepts valid post data', () => {
      const result = validateCreatePost({
        submolt: 'general',
        title: 'Test post',
        content: 'Content here',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts post without content', () => {
      const result = validateCreatePost({
        submolt: 'general',
        title: 'Test post',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts post with URL', () => {
      const result = validateCreatePost({
        submolt: 'general',
        title: 'Test',
        url: 'https://example.com',
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects missing submolt', () => {
      const result = validateCreatePost({ title: 'Test' });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects missing title', () => {
      const result = validateCreatePost({ submolt: 'general' });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty title', () => {
      const result = validateCreatePost({ submolt: 'general', title: '' });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects title longer than 300 characters', () => {
      const result = validateCreatePost({
        submolt: 'general',
        title: 'a'.repeat(301),
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects content longer than 10000 characters', () => {
      const result = validateCreatePost({
        submolt: 'general',
        title: 'Test',
        content: 'a'.repeat(10001),
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects invalid URL', () => {
      const result = validateCreatePost({
        submolt: 'general',
        title: 'Test',
        url: 'not-a-url',
      });
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('getPostsQuerySchema', () => {
    runner.it('accepts valid query with all parameters', () => {
      const result = validatePostsQuery({
        sort: 'hot',
        limit: 50,
        submolt: 'tech',
        cursor: 'abc',
      });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('hot');
      runner.expect(result.data.limit).toBe(50);
    });

    runner.it('accepts empty query with defaults', () => {
      const result = validatePostsQuery({});
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('new');
      runner.expect(result.data.limit).toBe(20);
    });

    runner.it('rejects limit greater than 100', () => {
      const result = validatePostsQuery({ limit: 101 });
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('getCommentsQuerySchema', () => {
    runner.it('accepts "new" sort', () => {
      const result = validateCommentsQuery({ sort: 'new' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('new');
    });

    runner.it('accepts "top" sort', () => {
      const result = validateCommentsQuery({ sort: 'top' });
      runner.expect(result.valid).toBe(true);
      runner.expect(result.data.sort).toBe('top');
    });

    runner.it('defaults to "top"', () => {
      const result = validateCommentsQuery({});
      runner.expect(result.data.sort).toBe('top');
    });

    runner.it('defaults invalid sort to "top"', () => {
      const result = validateCommentsQuery({ sort: 'hot' });
      runner.expect(result.data.sort).toBe('top');
    });
  });
}
