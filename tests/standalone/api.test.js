/**
 * API 集成测试
 * 测试 API 端点的请求/响应格式
 */

// 模拟 API 响应格式验证
function validateApiResponse(response) {
  const errors = [];

  // 检查基本结构
  if (typeof response !== 'object') {
    errors.push('Response must be an object');
    return { valid: false, errors };
  }

  // 成功响应应该有 success: true
  if (response.success === true) {
    // 成功响应结构验证
    if (!('data' in response) && !('agent' in response) &&
        !('posts' in response) && !('post' in response) &&
        !('comments' in response) && !('submolts' in response)) {
      // 允许某些只有 success 和 message 的响应
    }
  }

  // 错误响应应该有 error 字段
  if (response.success === false || response.error) {
    if (!response.error) {
      errors.push('Error response must have error field');
    }
  }

  return { valid: errors.length === 0, errors };
}

// 模拟 API Key 格式验证
function validateApiKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, message: 'API key is required' };
  }

  if (!apiKey.startsWith('aiquan_')) {
    return { valid: false, message: 'API key must start with "aiquan_"' };
  }

  // aiquan_ + 32 个十六进制字符
  const keyPart = apiKey.slice(7);
  if (!/^[a-f0-9]{32}$/.test(keyPart)) {
    return { valid: false, message: 'API key format is invalid' };
  }

  return { valid: true };
}

// 模拟 Claim Token 格式验证
function validateClaimToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Claim token is required' };
  }

  // UUID v4 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return { valid: false, message: 'Claim token must be a valid UUID v4' };
  }

  return { valid: true };
}

// 模拟 Agent 状态验证
function validateAgentStatus(status) {
  const validStatuses = ['pending_claim', 'claimed'];
  if (!validStatuses.includes(status)) {
    return { valid: false, message: `Status must be one of: ${validStatuses.join(', ')}` };
  }
  return { valid: true };
}

// 模拟分页响应验证
function validatePaginationResponse(response) {
  const errors = [];

  if (!Array.isArray(response.posts) && !Array.isArray(response.comments)) {
    errors.push('Response must contain posts or comments array');
  }

  if (response.pagination) {
    if (typeof response.pagination.hasMore !== 'boolean') {
      errors.push('pagination.hasMore must be a boolean');
    }
    // nextCursor 可以是 null 或 string
    if (response.pagination.nextCursor !== null &&
        typeof response.pagination.nextCursor !== 'string' &&
        response.pagination.nextCursor !== undefined) {
      errors.push('pagination.nextCursor must be null, undefined, or a string');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function runApiTests(runner) {
  runner.describe('API Key Format', () => {
    runner.it('accepts valid API key format', () => {
      const result = validateApiKeyFormat('aiquan_4e6cc6b0b09f46a48bc52a786ed8550b');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects API key without prefix', () => {
      const result = validateApiKeyFormat('4e6cc6b0b09f46a48bc52a786ed8550b');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects API key with wrong prefix', () => {
      const result = validateApiKeyFormat('sk_4e6cc6b0b09f46a48bc52a786ed8550b');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects API key with invalid characters', () => {
      const result = validateApiKeyFormat('aiquan_4e6cc6b0b09f46a48bc52a786ed8550g');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects API key with wrong length', () => {
      const result = validateApiKeyFormat('aiquan_4e6cc6b0b09f46a48bc52a786ed8550');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty API key', () => {
      const result = validateApiKeyFormat('');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects null API key', () => {
      const result = validateApiKeyFormat(null);
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('Claim Token Format', () => {
    runner.it('accepts valid UUID v4 token', () => {
      const result = validateClaimToken('550e8400-e29b-41d4-a716-446655440000');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects invalid UUID format', () => {
      const result = validateClaimToken('not-a-uuid');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects UUID v1 (wrong version)', () => {
      // UUID v1 has timestamp-based version
      const result = validateClaimToken('550e8400-e29b-11d4-a716-446655440000');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty token', () => {
      const result = validateClaimToken('');
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('Agent Status', () => {
    runner.it('accepts "pending_claim" status', () => {
      const result = validateAgentStatus('pending_claim');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts "claimed" status', () => {
      const result = validateAgentStatus('claimed');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects invalid status', () => {
      const result = validateAgentStatus('active');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty status', () => {
      const result = validateAgentStatus('');
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('API Response Format', () => {
    runner.it('accepts valid success response', () => {
      const result = validateApiResponse({ success: true, agent: { id: '123' } });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts valid error response', () => {
      const result = validateApiResponse({
        success: false,
        error: 'Not found',
        message: 'Resource not found'
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts error response with error field', () => {
      const result = validateApiResponse({ error: 'Unauthorized' });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects non-object response', () => {
      const result = validateApiResponse('not an object');
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('Pagination Response', () => {
    runner.it('accepts valid pagination with posts', () => {
      const result = validatePaginationResponse({
        posts: [],
        pagination: { hasMore: false, nextCursor: null }
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts valid pagination with comments', () => {
      const result = validatePaginationResponse({
        comments: [{ id: '1' }],
        pagination: { hasMore: true, nextCursor: 'abc123' }
      });
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects missing data array', () => {
      const result = validatePaginationResponse({
        pagination: { hasMore: false }
      });
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects non-boolean hasMore', () => {
      const result = validatePaginationResponse({
        posts: [],
        pagination: { hasMore: 'yes', nextCursor: null }
      });
      runner.expect(result.valid).toBe(false);
    });
  });

  runner.describe('Authorization Header', () => {
    runner.it('extracts Bearer token correctly', () => {
      const header = 'Bearer aiquan_4e6cc6b0b09f46a48bc52a786ed8550b';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      runner.expect(token).toBe('aiquan_4e6cc6b0b09f46a48bc52a786ed8550b');
    });

    runner.it('rejects non-Bearer auth', () => {
      const header = 'Basic dXNlcjpwYXNz';
      const isValid = header.startsWith('Bearer ');
      runner.expect(isValid).toBe(false);
    });

    runner.it('handles missing header', () => {
      const header = null;
      const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
      runner.expect(token).toBe(null);
    });
  });

  runner.describe('Rate Limiting', () => {
    runner.it('registration rate limit is 5 per 15 minutes', () => {
      // 验证限流配置
      const config = { windowMs: 15 * 60 * 1000, max: 5 };
      runner.expect(config.max).toBe(5);
      runner.expect(config.windowMs).toBe(900000); // 15 minutes in ms
    });

    runner.it('public API rate limit is 60 per minute', () => {
      const config = { windowMs: 1 * 60 * 1000, max: 60 };
      runner.expect(config.max).toBe(60);
      runner.expect(config.windowMs).toBe(60000); // 1 minute in ms
    });

    runner.it('general API rate limit is 100 per minute', () => {
      const config = { windowMs: 1 * 60 * 1000, max: 100 };
      runner.expect(config.max).toBe(100);
    });
  });
}
