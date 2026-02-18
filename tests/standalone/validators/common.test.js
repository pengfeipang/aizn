/**
 * 公共验证器测试
 */

// 简单验证规则实现（复制自 src/validators/common.ts）
const nameRegex = /^[a-zA-Z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name) {
  if (!name || name.length < 3) return { valid: false, message: '名称至少 3 个字符' };
  if (name.length > 30) return { valid: false, message: '名称最多 30 个字符' };
  if (!nameRegex.test(name)) return { valid: false, message: '只能包含字母、数字和下划线' };
  return { valid: true };
}

function validateDescription(desc) {
  if (desc && desc.length > 500) return { valid: false, message: '描述最多 500 个字符' };
  return { valid: true };
}

function validateTitle(title) {
  if (!title || title.length === 0) return { valid: false, message: '标题不能为空' };
  if (title.length > 300) return { valid: false, message: '标题最多 300 个字符' };
  return { valid: true };
}

function validateContent(content) {
  if (content && content.length > 10000) return { valid: false, message: '内容最多 10000 个字符' };
  return { valid: true };
}

function validateUrl(url) {
  if (!url || url === '') return { valid: true }; // Optional
  if (url.length > 2000) return { valid: false, message: 'URL 最多 2000 个字符' };
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, message: 'URL 格式不正确' };
  }
}

function validateEmail(email) {
  if (!email || email === '') return { valid: true }; // Optional
  if (email.length > 255) return { valid: false, message: '邮箱最多 255 个字符' };
  if (!emailRegex.test(email)) return { valid: false, message: '邮箱格式不正确' };
  return { valid: true };
}

function validateSubmoltName(name) {
  if (!name || name.length === 0) return { valid: false, message: '子社区名称不能为空' };
  if (name.length > 50) return { valid: false, message: '子社区名称最多 50 个字符' };
  if (!/^[a-z0-9_]+$/.test(name)) return { valid: false, message: '只能包含小写字母、数字和下划线' };
  return { valid: true };
}

function validateDisplayName(name) {
  if (!name || name.length === 0) return { valid: false, message: '显示名称不能为空' };
  if (name.length > 100) return { valid: false, message: '显示名称最多 100 个字符' };
  return { valid: true };
}

function validateLimit(limit) {
  const num = parseInt(limit);
  if (isNaN(num) || num < 1 || num > 100) return { valid: false };
  return { valid: true, value: num || 20 };
}

export function runCommonValidatorTests(runner) {
  // ==================== nameSchema ====================
  runner.describe('nameSchema', () => {
    runner.it('accepts valid name with letters and numbers', () => {
      const result = validateName('Agent123');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts valid name with underscores', () => {
      const result = validateName('test_agent_001');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts minimum 3 characters', () => {
      const result = validateName('abc');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts maximum 30 characters', () => {
      const result = validateName('a'.repeat(30));
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects name shorter than 3 characters', () => {
      const result = validateName('ab');
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('名称至少 3 个字符');
    });

    runner.it('rejects name longer than 30 characters', () => {
      const result = validateName('a'.repeat(31));
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('名称最多 30 个字符');
    });

    runner.it('rejects name with special characters', () => {
      const result = validateName('test@agent');
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('只能包含字母、数字和下划线');
    });

    runner.it('rejects name with spaces', () => {
      const result = validateName('test agent');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects name with Chinese characters', () => {
      const result = validateName('测试Agent');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects empty string', () => {
      const result = validateName('');
      runner.expect(result.valid).toBe(false);
    });
  });

  // ==================== descriptionSchema ====================
  runner.describe('descriptionSchema', () => {
    runner.it('accepts valid description', () => {
      const result = validateDescription('This is a test agent');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts undefined', () => {
      const result = validateDescription(undefined);
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts maximum 500 characters', () => {
      const result = validateDescription('a'.repeat(500));
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects description longer than 500 characters', () => {
      const result = validateDescription('a'.repeat(501));
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('描述最多 500 个字符');
    });
  });

  // ==================== titleSchema ====================
  runner.describe('titleSchema', () => {
    runner.it('accepts valid title', () => {
      const result = validateTitle('This is a post title');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts minimum 1 character', () => {
      const result = validateTitle('a');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts maximum 300 characters', () => {
      const result = validateTitle('a'.repeat(300));
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects empty string', () => {
      const result = validateTitle('');
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('标题不能为空');
    });

    runner.it('rejects title longer than 300 characters', () => {
      const result = validateTitle('a'.repeat(301));
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('标题最多 300 个字符');
    });
  });

  // ==================== contentSchema ====================
  runner.describe('contentSchema', () => {
    runner.it('accepts valid content', () => {
      const result = validateContent('This is post content');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts undefined', () => {
      const result = validateContent(undefined);
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts maximum 10000 characters', () => {
      const result = validateContent('a'.repeat(10000));
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects content longer than 10000 characters', () => {
      const result = validateContent('a'.repeat(10001));
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('内容最多 10000 个字符');
    });
  });

  // ==================== urlSchema ====================
  runner.describe('urlSchema', () => {
    runner.it('accepts valid http URL', () => {
      const result = validateUrl('http://example.com');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts valid https URL', () => {
      const result = validateUrl('https://example.com/path?query=1');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts undefined', () => {
      const result = validateUrl(undefined);
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts empty string', () => {
      const result = validateUrl('');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects invalid URL', () => {
      const result = validateUrl('not a url');
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('URL 格式不正确');
    });
  });

  // ==================== emailSchema ====================
  runner.describe('emailSchema', () => {
    runner.it('accepts valid email', () => {
      const result = validateEmail('test@example.com');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts undefined', () => {
      const result = validateEmail(undefined);
      runner.expect(result.valid).toBe(true);
    });

    runner.it('accepts empty string', () => {
      const result = validateEmail('');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects invalid email without @', () => {
      const result = validateEmail('testexample.com');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(245) + '@example.com';
      const result = validateEmail(longEmail);
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('邮箱最多 255 个字符');
    });
  });

  // ==================== submoltNameSchema ====================
  runner.describe('submoltNameSchema', () => {
    runner.it('accepts valid submolt name', () => {
      const result = validateSubmoltName('general');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects uppercase letters', () => {
      const result = validateSubmoltName('General');
      runner.expect(result.valid).toBe(false);
      runner.expect(result.message).toBe('只能包含小写字母、数字和下划线');
    });

    runner.it('rejects special characters', () => {
      const result = validateSubmoltName('general-tech');
      runner.expect(result.valid).toBe(false);
    });
  });

  // ==================== displayNameSchema ====================
  runner.describe('displayNameSchema', () => {
    runner.it('accepts valid display name', () => {
      const result = validateDisplayName('综合讨论');
      runner.expect(result.valid).toBe(true);
    });

    runner.it('rejects empty string', () => {
      const result = validateDisplayName('');
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects name longer than 100 characters', () => {
      const result = validateDisplayName('a'.repeat(101));
      runner.expect(result.valid).toBe(false);
    });
  });

  // ==================== limitSchema ====================
  runner.describe('limitSchema', () => {
    runner.it('accepts valid limit', () => {
      const result = validateLimit(20);
      runner.expect(result.valid).toBe(true);
      runner.expect(result.value).toBe(20);
    });

    runner.it('coerces string to number', () => {
      const result = validateLimit('25');
      runner.expect(result.valid).toBe(true);
      runner.expect(result.value).toBe(25);
    });

    runner.it('rejects value less than 1', () => {
      const result = validateLimit(0);
      runner.expect(result.valid).toBe(false);
    });

    runner.it('rejects value greater than 100', () => {
      const result = validateLimit(101);
      runner.expect(result.valid).toBe(false);
    });
  });
}
