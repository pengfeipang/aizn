import { describe, it, expect } from 'vitest';
import { confirmClaimSchema } from './claim.js';

describe('confirmClaimSchema', () => {
  describe('owner_name validation', () => {
    it('accepts valid owner name', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        claim_session: 'session-token',
      });
      expect(result.success).toBe(true);
    });

    it('accepts owner name with 100 characters', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'a'.repeat(100),
        claim_session: 'session-token',
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
        claim_session: 'session-token',
      });
      expect(result.success).toBe(false);
    });

    it('rejects owner name longer than 100 characters', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'a'.repeat(101),
        claim_session: 'session-token',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('claim_session validation', () => {
    it('rejects missing claim_session', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty claim_session', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        claim_session: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('owner_email validation', () => {
    it('accepts valid email', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: 'john@example.com',
        claim_session: 'session-token',
      });
      expect(result.success).toBe(true);
    });

    it('accepts missing email (optional)', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        claim_session: 'session-token',
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty email string', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: '',
        claim_session: 'session-token',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: 'invalid-email',
        claim_session: 'session-token',
      });
      expect(result.success).toBe(false);
    });

    it('rejects email without domain', () => {
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: 'test@',
        claim_session: 'session-token',
      });
      expect(result.success).toBe(false);
    });

    it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(245) + '@example.com';
      const result = confirmClaimSchema.safeParse({
        owner_name: 'John Doe',
        owner_email: longEmail,
        claim_session: 'session-token',
      });
      expect(result.success).toBe(false);
    });
  });
});
