import { describe, it, expect } from 'vitest';
import { registerAgentSchema, getFeedQuerySchema } from './agent.js';

describe('registerAgentSchema', () => {
  describe('name validation', () => {
    it('accepts valid registration data', () => {
      const result = registerAgentSchema.safeParse({
        name: 'TestAgent',
        description: 'A test agent',
      });
      expect(result.success).toBe(true);
    });

    it('accepts registration without description', () => {
      const result = registerAgentSchema.safeParse({
        name: 'TestAgent',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
      const result = registerAgentSchema.safeParse({
        description: 'A test agent',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name shorter than 3 characters', () => {
      const result = registerAgentSchema.safeParse({
        name: 'ab',
        description: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name with invalid characters', () => {
      const result = registerAgentSchema.safeParse({
        name: 'test@agent',
        description: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description validation', () => {
    it('accepts valid description', () => {
      const result = registerAgentSchema.safeParse({
        name: 'TestAgent',
        description: 'A valid description',
      });
      expect(result.success).toBe(true);
    });

    it('accepts description up to 500 characters', () => {
      const result = registerAgentSchema.safeParse({
        name: 'TestAgent',
        description: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it('rejects description longer than 500 characters', () => {
      const result = registerAgentSchema.safeParse({
        name: 'TestAgent',
        description: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('getFeedQuerySchema', () => {
  describe('sort validation', () => {
    it('accepts "new" sort', () => {
      const result = getFeedQuerySchema.safeParse({ sort: 'new' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe('new');
      }
    });

    it('accepts "hot" sort', () => {
      const result = getFeedQuerySchema.safeParse({ sort: 'hot' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe('hot');
      }
    });

    it('accepts "top" sort', () => {
      const result = getFeedQuerySchema.safeParse({ sort: 'top' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe('top');
      }
    });

    it('defaults to "new" when not specified', () => {
      const result = getFeedQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe('new');
      }
    });

    it('rejects invalid sort value', () => {
      const result = getFeedQuerySchema.safeParse({ sort: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('limit validation', () => {
    it('accepts valid limit', () => {
      const result = getFeedQuerySchema.safeParse({ limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('coerces string limit to number', () => {
      const result = getFeedQuerySchema.safeParse({ limit: '25' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it('defaults to 25 when not specified', () => {
      const result = getFeedQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it('rejects limit greater than 100', () => {
      const result = getFeedQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('rejects limit less than 1', () => {
      const result = getFeedQuerySchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('submolt validation', () => {
    it('accepts optional submolt', () => {
      const result = getFeedQuerySchema.safeParse({ submolt: 'tech' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.submolt).toBe('tech');
      }
    });

    it('accepts empty submolt filter', () => {
      const result = getFeedQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.submolt).toBeUndefined();
      }
    });
  });

  describe('cursor validation', () => {
    it('accepts optional cursor', () => {
      const result = getFeedQuerySchema.safeParse({ cursor: 'some-cursor-value' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cursor).toBe('some-cursor-value');
      }
    });
  });
});
