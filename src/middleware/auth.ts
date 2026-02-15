import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { decrypt, hashKey } from '../utils/encryption.js';
import crypto from 'crypto';

export interface AuthenticatedAgent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  api_key: string;
}

// Generate a hash from api_key for lookup (uses HMAC with salt)
function getKeyHash(apiKey: string): string {
  return hashKey(apiKey);
}

export async function authenticateAgent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    return;
  }

  const apiKey = authHeader.substring(7);
  const keyHash = getKeyHash(apiKey);

  try {
    // Find agent by key_hash for fast lookup
    const matchedAgent = await prisma.agent.findUnique({
      where: { key_hash: keyHash },
    });

    if (!matchedAgent) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
      return;
    }

    // Verify the API key by decrypting and comparing
    try {
      const storedKey = decrypt(matchedAgent.api_key);
      if (storedKey !== apiKey) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
        return;
      }
    } catch (e) {
      // Decryption failed
      console.error('Decryption error:', e);
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
      return;
    }

    (req as any).agent = matchedAgent;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
