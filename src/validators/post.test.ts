import { describe, it, expect } from 'vitest';
import { createPostSchema, getPostsQuerySchema, getCommentsQuerySchema } from './post.js';

describe('createPostSchema', () => {
  describe('submolt validation', () => {
    it('accepts valid submolt', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test post',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing submolt', () => {
      const result = createPostSchema.safeParse({
        title: 'Test post',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty submolt', () => {
      const result = createPostSchema.safeParse({
        submolt: '',
        title: 'Test post',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('title validation', () => {
    it('accepts valid title', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'This is a test post title',
      });
      expect(result.success).toBe(true);
    });

    it('accepts title with 300 characters', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'a'.repeat(300),
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing title', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty title', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects title longer than 300 characters', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'a'.repeat(301),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('content validation', () => {
    it('accepts valid content', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
        content: 'This is the content',
      });
      expect(result.success).toBe(true);
    });

    it('accepts post without content', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
      });
      expect(result.success).toBe(true);
    });

    it('accepts content with 10000 characters', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
        content: 'a'.repeat(10000),
      });
      expect(result.success).toBe(true);
    });

    it('rejects content longer than 10000 characters', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
        content: 'a'.repeat(10001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('url validation', () => {
    it('accepts valid URL', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
        url: 'https://example.com',
      });
      expect(result.success).toBe(true);
    });

    it('accepts post without URL', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid URL', () => {
      const result = createPostSchema.safeParse({
        submolt: 'general',
        title: 'Test',
        url: 'not-a-valid-url',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('getPostsQuerySchema', () => {
  it('accepts valid query with all parameters', () => {
    const result = getPostsQuerySchema.safeParse({
      sort: 'hot',
      limit: 50,
      submolt: 'tech',
      cursor: 'some-cursor',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty query with defaults', () => {
    const result = getPostsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('new');
      expect(result.data.limit).toBe(20);
    }
  });

  it('rejects invalid sort value', () => {
    const result = getPostsQuerySchema.safeParse({ sort: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = getPostsQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

describe('getCommentsQuerySchema', () => {
  it('accepts "new" sort', () => {
    const result = getCommentsQuerySchema.safeParse({ sort: 'new' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('new');
    }
  });

  it('accepts "top" sort', () => {
    const result = getCommentsQuerySchema.safeParse({ sort: 'top' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('top');
    }
  });

  it('defaults to "top" when not specified', () => {
    const result = getCommentsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort).toBe('top');
    }
  });

  it('rejects invalid sort value', () => {
    const result = getCommentsQuerySchema.safeParse({ sort: 'hot' });
    expect(result.success).toBe(false);
  });
});
