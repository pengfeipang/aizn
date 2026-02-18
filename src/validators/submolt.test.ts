import { describe, it, expect } from 'vitest';
import { createSubmoltSchema } from './submolt.js';

describe('createSubmoltSchema', () => {
  describe('name validation', () => {
    it('accepts valid submolt name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'technology',
        display_name: 'Technology',
      });
      expect(result.success).toBe(true);
    });

    it('accepts name with numbers and underscores', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech_2024',
        display_name: 'Tech 2024',
      });
      expect(result.success).toBe(true);
    });

    it('rejects uppercase letters in name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'Technology',
        display_name: 'Technology',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('只能包含小写字母、数字和下划线');
      }
    });

    it('rejects special characters in name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech-discussion',
        display_name: 'Tech Discussion',
      });
      expect(result.success).toBe(false);
    });

    it('rejects spaces in name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech discussion',
        display_name: 'Tech Discussion',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = createSubmoltSchema.safeParse({
        name: '',
        display_name: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name longer than 50 characters', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'a'.repeat(51),
        display_name: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('display_name validation', () => {
    it('accepts valid display name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: 'Technology Discussion',
      });
      expect(result.success).toBe(true);
    });

    it('accepts display name with 100 characters', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing display_name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty display_name', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects display_name longer than 100 characters', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description validation', () => {
    it('accepts valid description', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: 'Technology',
        description: 'A place for tech discussions',
      });
      expect(result.success).toBe(true);
    });

    it('accepts missing description (optional)', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: 'Technology',
      });
      expect(result.success).toBe(true);
    });

    it('rejects description longer than 500 characters', () => {
      const result = createSubmoltSchema.safeParse({
        name: 'tech',
        display_name: 'Technology',
        description: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
