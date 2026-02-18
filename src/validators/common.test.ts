import { describe, it, expect } from 'vitest';
import {
  nameSchema,
  descriptionSchema,
  titleSchema,
  contentSchema,
  urlSchema,
  emailSchema,
  submoltNameSchema,
  displayNameSchema,
  limitSchema,
} from './common.js';

describe('nameSchema', () => {
  it('accepts valid name with letters and numbers', () => {
    const result = nameSchema.safeParse('Agent123');
    expect(result.success).toBe(true);
  });

  it('accepts valid name with underscores', () => {
    const result = nameSchema.safeParse('test_agent_001');
    expect(result.success).toBe(true);
  });

  it('accepts minimum 3 characters', () => {
    const result = nameSchema.safeParse('abc');
    expect(result.success).toBe(true);
  });

  it('accepts maximum 30 characters', () => {
    const result = nameSchema.safeParse('a'.repeat(30));
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 3 characters', () => {
    const result = nameSchema.safeParse('ab');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名称至少 3 个字符');
    }
  });

  it('rejects name longer than 30 characters', () => {
    const result = nameSchema.safeParse('a'.repeat(31));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名称最多 30 个字符');
    }
  });

  it('rejects name with special characters', () => {
    const result = nameSchema.safeParse('test@agent');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('只能包含字母、数字和下划线');
    }
  });

  it('rejects name with spaces', () => {
    const result = nameSchema.safeParse('test agent');
    expect(result.success).toBe(false);
  });

  it('rejects name with Chinese characters', () => {
    const result = nameSchema.safeParse('测试Agent');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = nameSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('descriptionSchema', () => {
  it('accepts valid description', () => {
    const result = descriptionSchema.safeParse('This is a test agent');
    expect(result.success).toBe(true);
  });

  it('accepts undefined', () => {
    const result = descriptionSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('accepts maximum 500 characters', () => {
    const result = descriptionSchema.safeParse('a'.repeat(500));
    expect(result.success).toBe(true);
  });

  it('rejects description longer than 500 characters', () => {
    const result = descriptionSchema.safeParse('a'.repeat(501));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('描述最多 500 个字符');
    }
  });
});

describe('titleSchema', () => {
  it('accepts valid title', () => {
    const result = titleSchema.safeParse('This is a post title');
    expect(result.success).toBe(true);
  });

  it('accepts minimum 1 character', () => {
    const result = titleSchema.safeParse('a');
    expect(result.success).toBe(true);
  });

  it('accepts maximum 300 characters', () => {
    const result = titleSchema.safeParse('a'.repeat(300));
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = titleSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标题不能为空');
    }
  });

  it('rejects title longer than 300 characters', () => {
    const result = titleSchema.safeParse('a'.repeat(301));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标题最多 300 个字符');
    }
  });
});

describe('contentSchema', () => {
  it('accepts valid content', () => {
    const result = contentSchema.safeParse('This is post content');
    expect(result.success).toBe(true);
  });

  it('accepts undefined', () => {
    const result = contentSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('accepts empty string and transforms to undefined', () => {
    const result = contentSchema.safeParse('');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it('accepts maximum 10000 characters', () => {
    const result = contentSchema.safeParse('a'.repeat(10000));
    expect(result.success).toBe(true);
  });

  it('rejects content longer than 10000 characters', () => {
    const result = contentSchema.safeParse('a'.repeat(10001));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('内容最多 10000 个字符');
    }
  });
});

describe('urlSchema', () => {
  it('accepts valid http URL', () => {
    const result = urlSchema.safeParse('http://example.com');
    expect(result.success).toBe(true);
  });

  it('accepts valid https URL', () => {
    const result = urlSchema.safeParse('https://example.com/path?query=1');
    expect(result.success).toBe(true);
  });

  it('accepts undefined', () => {
    const result = urlSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('accepts empty string', () => {
    const result = urlSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL', () => {
    const result = urlSchema.safeParse('not a url');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('URL 格式不正确');
    }
  });

  it('rejects URL longer than 2000 characters', () => {
    const result = urlSchema.safeParse('https://example.com/' + 'a'.repeat(2000));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('URL 最多 2000 个字符');
    }
  });
});

describe('emailSchema', () => {
  it('accepts valid email', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
  });

  it('accepts undefined', () => {
    const result = emailSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('accepts empty string', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('rejects invalid email without @', () => {
    const result = emailSchema.safeParse('testexample.com');
    expect(result.success).toBe(false);
  });

  it('rejects invalid email without domain', () => {
    const result = emailSchema.safeParse('test@');
    expect(result.success).toBe(false);
  });

  it('rejects email longer than 255 characters', () => {
    const longEmail = 'a'.repeat(245) + '@example.com';
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('邮箱最多 255 个字符');
    }
  });
});

describe('submoltNameSchema', () => {
  it('accepts valid submolt name', () => {
    const result = submoltNameSchema.safeParse('general');
    expect(result.success).toBe(true);
  });

  it('accepts name with numbers and underscores', () => {
    const result = submoltNameSchema.safeParse('tech_2024');
    expect(result.success).toBe(true);
  });

  it('rejects uppercase letters', () => {
    const result = submoltNameSchema.safeParse('General');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('只能包含小写字母、数字和下划线');
    }
  });

  it('rejects special characters', () => {
    const result = submoltNameSchema.safeParse('general-tech');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = submoltNameSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('displayNameSchema', () => {
  it('accepts valid display name', () => {
    const result = displayNameSchema.safeParse('综合讨论');
    expect(result.success).toBe(true);
  });

  it('accepts maximum 100 characters', () => {
    const result = displayNameSchema.safeParse('a'.repeat(100));
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = displayNameSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = displayNameSchema.safeParse('a'.repeat(101));
    expect(result.success).toBe(false);
  });
});

describe('limitSchema', () => {
  it('accepts valid limit', () => {
    const result = limitSchema.safeParse(20);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(20);
    }
  });

  it('coerces string to number', () => {
    const result = limitSchema.safeParse('25');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(25);
    }
  });

  it('uses default value of 20', () => {
    const result = limitSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(20);
    }
  });

  it('accepts minimum 1', () => {
    const result = limitSchema.safeParse(1);
    expect(result.success).toBe(true);
  });

  it('accepts maximum 100', () => {
    const result = limitSchema.safeParse(100);
    expect(result.success).toBe(true);
  });

  it('rejects value less than 1', () => {
    const result = limitSchema.safeParse(0);
    expect(result.success).toBe(false);
  });

  it('rejects value greater than 100', () => {
    const result = limitSchema.safeParse(101);
    expect(result.success).toBe(false);
  });
});
