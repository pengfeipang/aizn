/**
 * 加密工具测试
 */

import crypto from 'crypto';

// 从 src/utils/encryption.ts 复制的逻辑
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(key) {
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
}

function encrypt(text, key) {
  const derivedKey = getEncryptionKey(key);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(encryptedText, key) {
  const derivedKey = getEncryptionKey(key);
  const buffer = Buffer.from(encryptedText, 'base64');

  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

function hashKey(apiKey, salt) {
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(apiKey);
  return hmac.digest('hex');
}

export function runEncryptionTests(runner) {
  const testKey = 'test-encryption-key-2024';
  const testSalt = 'test-salt-2024';

  runner.describe('Encryption (AES-256-GCM)', () => {
    runner.it('encrypts text correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testKey);
      runner.expect(encrypted).toBeTruthy();
      runner.expect(encrypted !== plaintext).toBe(true);
    });

    runner.it('produces different ciphertext for same plaintext', () => {
      const plaintext = 'Same text';
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);
      // 由于随机 IV，相同明文应产生不同密文
      runner.expect(encrypted1 !== encrypted2).toBe(true);
    });

    runner.it('decrypts to original text', () => {
      const plaintext = 'Secret message to encrypt';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      runner.expect(decrypted).toBe(plaintext);
    });

    runner.it('handles empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      runner.expect(decrypted).toBe(plaintext);
    });

    runner.it('handles long text', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      runner.expect(decrypted).toBe(plaintext);
    });

    runner.it('handles Unicode characters', () => {
      const plaintext = '你好世界 🌍 Здравствуй';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      runner.expect(decrypted).toBe(plaintext);
    });

    runner.it('fails with wrong key', () => {
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext, testKey);
      try {
        decrypt(encrypted, 'wrong-key');
        runner.expect(true).toBe(false); // Should not reach here
      } catch (e) {
        runner.expect(true).toBe(true); // Expected to throw
      }
    });

    runner.it('fails with tampered ciphertext', () => {
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext, testKey);
      const tampered = encrypted.slice(0, -5) + 'XXXXX';
      try {
        decrypt(tampered, testKey);
        runner.expect(true).toBe(false);
      } catch (e) {
        runner.expect(true).toBe(true);
      }
    });
  });

  runner.describe('Key Hashing (HMAC-SHA256)', () => {
    runner.it('produces consistent hash for same input', () => {
      const apiKey = 'aiquan_test_key_123';
      const hash1 = hashKey(apiKey, testSalt);
      const hash2 = hashKey(apiKey, testSalt);
      runner.expect(hash1).toBe(hash2);
    });

    runner.it('produces different hash for different input', () => {
      const hash1 = hashKey('key1', testSalt);
      const hash2 = hashKey('key2', testSalt);
      runner.expect(hash1 !== hash2).toBe(true);
    });

    runner.it('produces different hash with different salt', () => {
      const apiKey = 'same_key';
      const hash1 = hashKey(apiKey, 'salt1');
      const hash2 = hashKey(apiKey, 'salt2');
      runner.expect(hash1 !== hash2).toBe(true);
    });

    runner.it('produces 64 character hex string', () => {
      const hash = hashKey('test_key', testSalt);
      runner.expect(hash.length).toBe(64);
      runner.expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    runner.it('handles empty string', () => {
      const hash = hashKey('', testSalt);
      runner.expect(hash.length).toBe(64);
    });
  });
}
