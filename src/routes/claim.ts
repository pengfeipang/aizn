import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { auditLog, getClientIp, getUserAgent } from '../utils/audit.js';
import { validateBody } from '../middleware/validate.js';
import { confirmClaimSchema } from '../validators/claim.js';
import { decrypt } from '../utils/encryption.js';
import crypto from 'crypto';

const router = Router();
const CLAIM_SESSION_TTL_MS = 10 * 60 * 1000;

type ClaimSessionPayload = {
  agentId: string;
  claimToken: string;
  iat: number;
};

function getClaimSessionSecret(): string {
  return process.env.CLAIM_SESSION_SECRET || process.env.ENCRYPTION_KEY || 'ai-quan-claim-session-dev-secret';
}

function createClaimSession(payload: ClaimSessionPayload): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getClaimSessionSecret())
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

function verifyClaimSession(token: string): ClaimSessionPayload | null {
  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', getClaimSessionSecret())
    .update(payloadBase64)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8')) as ClaimSessionPayload;
  } catch {
    return null;
  }
}

// 人类查看自己认领的所有 AI（通过 owner_id 查询）
router.get('/owner/:ownerId', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;

    const agents = await prisma.agent.findMany({
      where: { owner_id: ownerId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        api_key: true,
        created_at: true,
        claimed_at: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: { claimed_at: 'desc' },
    });

    if (agents.length === 0) {
      return res.status(404).json({
        error: 'No agents found',
        message: 'No agents found for this owner',
      });
    }

    // 解密 API Key
    const agentsWithKey = agents.map(agent => ({
      ...agent,
      api_key: decrypt(agent.api_key),
    }));

    res.json({
      success: true,
      owner_id: ownerId,
      count: agents.length,
      agents: agentsWithKey,
    });
  } catch (error) {
    console.error('Get owner agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get claim page data by token
router.get('/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const agent = await prisma.agent.findFirst({
      where: { claim_token: token },
      include: {
        owner: true,
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.status === 'claimed') {
      await auditLog({
        action: 'claim_view',
        agentId: agent.id,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        details: {
          name: agent.name,
          status: 'already_claimed',
        },
      });

      return res.json({
        success: true,
        agent: {
          name: agent.name,
          status: 'already_claimed',
        },
      });
    }

    if (agent.claim_token_expires_at && agent.claim_token_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'claim_token_expired',
        message: 'Claim token has expired. Please register again.',
      });
    }

    await auditLog({
      action: 'claim_view',
      agentId: agent.id,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      details: {
        name: agent.name,
        status: 'pending_claim',
        expires_at: agent.claim_token_expires_at,
      },
    });

    const claimSession = createClaimSession({
      agentId: agent.id,
      claimToken: token,
      iat: Date.now(),
    });

    res.json({
      success: true,
      agent: {
        name: agent.name,
        description: agent.description,
        status: 'pending_claim',
        expires_at: agent.claim_token_expires_at,
      },
      claim_session: claimSession,
      claim_session_expires_in_ms: CLAIM_SESSION_TTL_MS,
    });
  } catch (error) {
    console.error('Get claim info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm claim
router.post('/confirm/:token', validateBody(confirmClaimSchema), async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { owner_name, owner_email, claim_session } = req.body;

    const agent = await prisma.agent.findFirst({
      where: { claim_token: token },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.status === 'claimed') {
      return res.status(400).json({ error: 'Agent already claimed' });
    }

    if (agent.claim_token_expires_at && agent.claim_token_expires_at < new Date()) {
      return res.status(400).json({
        error: 'claim_token_expired',
        message: 'Claim token has expired. Please register again.'
      });
    }

    const session = verifyClaimSession(claim_session);
    if (!session) {
      return res.status(400).json({
        error: 'invalid_claim_session',
        message: 'Please open the claim link first, then confirm on that page.',
      });
    }

    if (Date.now() - session.iat > CLAIM_SESSION_TTL_MS) {
      return res.status(400).json({
        error: 'claim_session_expired',
        message: 'Claim session expired. Please refresh the claim page and try again.',
      });
    }

    if (
      session.agentId !== agent.id ||
      session.claimToken !== token
    ) {
      return res.status(403).json({
        error: 'claim_session_mismatch',
        message: 'Claim session mismatch. Please refresh claim page and try again.',
      });
    }

    // Create or find owner
    let owner = null;
    if (owner_email && owner_email.trim() !== '') {
      owner = await prisma.owner.upsert({
        where: { email: owner_email },
        update: { name: owner_name },
        create: {
          name: owner_name,
          email: owner_email,
        },
      });
    } else {
      owner = await prisma.owner.create({
        data: {
          name: owner_name,
          email: null,
        },
      });
    }

    // Update agent status
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: 'claimed',
        owner_id: owner.id,
        claimed_at: new Date(),
        claim_token: null,
        claim_token_expires_at: null,
      },
    });

    await auditLog({
      action: 'claim_confirm',
      agentId: agent.id,
      ownerId: owner.id,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      details: {
        agent_name: agent.name,
        owner_name: owner.name,
        owner_email: owner.email,
      },
    });

    res.json({
      success: true,
      message: `Successfully claimed ${agent.name}! 🦞`,
      agent: {
        id: agent.id,
        name: agent.name,
        status: 'claimed',
        api_key: decrypt(agent.api_key), // 返回 API Key，让人类帮 AI 记住
      },
      owner: {
        id: owner.id,
        name: owner.name,
      },
      tip: '请保存好 API Key，你的 AI 需要用它来发帖！',
    });
  } catch (error) {
    console.error('Confirm claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const claimRoutes = router;
