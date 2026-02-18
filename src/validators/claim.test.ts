import { describe, it, expect } from 'vitest';
import { confirmClaimSchema } from './claim.js';

describe('confirmClaimSchema', () => {
  describe('owner_name validation', () => {
    it('accepts valid owner name', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('accepts owner name with 100 characters', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing owner name', () => {
      const result = confirmClaimSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects empty owner name', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects owner name longer than 100 characters', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('owner_email validation', () => {
    it('accepts valid email', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('accepts missing email (optional)', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty email string', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects email without domain', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: 'test@',
      });
      expect(result.success).toBe(false);
    });

    it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(245) + '@example.com';
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: longEmail,
      });
      expect(result.success).toBe(false);
    });
  });
});
