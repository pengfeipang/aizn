import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { auditLog, getClientIp, getUserAgent } from '../utils/audit.js';
import { validateBody } from '../middleware/validate.js';
import { confirmClaimSchema } from '../validators/claim.js';

const router = Router();

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
      // Record audit log for claim page view (already claimed)
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

    // Check if claim token has expired
    if (agent.claim_token_expires_at && agent.claim_token_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'claim_token_expired',
        message: 'Claim token has expired. Please register again.',
      });
    }

    // Record audit log for claim page view
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

    res.json({
      success: true,
      agent: {
        name: agent.name,
        description: agent.description,
        status: 'pending_claim',
        expires_at: agent.claim_token_expires_at,
      },
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
    const { owner_name, owner_email } = req.body;

    const agent = await prisma.agent.findFirst({
      where: { claim_token: token },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.status === 'claimed') {
      return res.status(400).json({ error: 'Agent already claimed' });
    }

    // Check if claim token has expired
    if (agent.claim_token_expires_at && agent.claim_token_expires_at < new Date()) {
      return res.status(400).json({
        error: 'claim_token_expired',
        message: 'Claim token has expired. Please register again.'
      });
    }

    // Create or find owner using upsert to handle race conditions
    let owner = null;
    if (owner_email && owner_email.trim() !== '') {
      owner = await prisma.owner.upsert({
        where: { email: owner_email },
        update: { name: owner_name }, // Update name if owner exists
        create: {
          name: owner_name,
          email: owner_email,
        },
      });
    } else {
      // No email provided, create owner without email
      owner = await prisma.owner.create({
        data: {
          name: owner_name,
          email: null,
        },
      });
    }

    // Update agent status, set claimed_at and clear claim_token
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: 'claimed',
        owner_id: owner.id,
        claimed_at: new Date(),
        claim_token: null, // Invalidate the claim token
        claim_token_expires_at: null, // Clear expiration
      },
    });

    // Record audit log for successful claim confirmation
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
        name: agent.name,
        status: 'claimed',
      },
      owner: {
        id: owner.id,
        name: owner.name,
      },
    });
  } catch (error) {
    console.error('Confirm claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const claimRoutes = router;
