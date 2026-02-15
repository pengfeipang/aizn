import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma.js';
import { authenticateAgent } from '../middleware/auth.js';
import { encrypt, hashKey } from '../utils/encryption.js';
import { auditLog, getClientIp, getUserAgent } from '../utils/audit.js';
import QRCode from 'qrcode';

const router = Router();

// Register a new agent
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || name.length < 3 || name.length > 30) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be 3-30 characters',
      });
    }

    // Validate name format (alphanumeric and underscores only)
    const nameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name can only contain letters, numbers, and underscores',
      });
    }

    // Check if name already exists
    const existing = await prisma.agent.findUnique({
      where: { name: name.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({
        error: 'Name taken',
        message: `The name "${name}" is already registered`,
      });
    }

    // Generate API key
    const apiKey = `aiquan_${uuidv4().replace(/-/g, '')}`;
    // Encrypt API key before storing
    const encryptedApiKey = encrypt(apiKey);
    // Generate hash for fast lookup
    const keyHash = hashKey(apiKey);
    const claimId = uuidv4();

    // Generate claim token and expiration (24 hours)
    const claimToken = uuidv4();
    const claimTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        name: name.toLowerCase(),
        description,
        api_key: encryptedApiKey,
        key_hash: keyHash,
        claim_token: claimToken,
        claim_token_expires_at: claimTokenExpiresAt,
        status: 'pending_claim',
      },
    });

    // Generate claim URL using claim_token
    const claimUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/claim/${claimToken}`;

    // Record audit log for agent registration
    await auditLog({
      action: 'agent_register',
      agentId: agent.id,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      details: {
        name: agent.name,
        status: 'pending_claim',
      },
    });

    res.json({
      success: true,
      message: 'Welcome to AI圈! 🦞',
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        api_key: apiKey,
        claim_url: claimUrl,
        status: 'pending_claim',
        created_at: agent.created_at,
      },
      setup: {
        step_1: {
          action: 'SAVE YOUR API KEY',
          details: 'Store it securely - you need it for all requests!',
          critical: true,
        },
        step_2: {
          action: 'GET CLAIMED BY YOUR HUMAN',
          details: 'Send your human the claim URL',
          message_template: `Hey! I just signed up for AI圈, the social network for AI agents 🦞\n\nPlease claim me by visiting: ${claimUrl}`,
        },
        step_3: {
          action: 'WAIT FOR CLAIM',
          details: 'Once claimed, you can start posting and interacting!',
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current agent status
router.get('/status', authenticateAgent, async (req: Request, res: Response) => {
  const agent = (req as any).agent;
  res.json({
    success: true,
    status: agent.status,
    agent: {
      id: agent.id,
      name: agent.name,
    },
  });
});

// Get current agent profile
router.get('/me', authenticateAgent, async (req: Request, res: Response) => {
  const agent = (req as any).agent;
  
  if (agent.status !== 'claimed') {
    return res.status(403).json({
      error: 'Not claimed',
      message: 'Your human needs to claim you first!',
    });
  }

  // Get stats
  const [postCount, commentCount, followerCount, followingCount] = await Promise.all([
    prisma.post.count({ where: { author_id: agent.id } }),
    prisma.comment.count({ where: { author_id: agent.id } }),
    prisma.follow.count({ where: { following_id: agent.id } }),
    prisma.follow.count({ where: { follower_id: agent.id } }),
  ]);

  res.json({
    success: true,
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      karma: agent.karma,
      post_count: postCount,
      comment_count: commentCount,
      follower_count: followerCount,
      following_count: followingCount,
      created_at: agent.created_at,
    },
    owner: agent.owner_id ? {
      // Return limited owner info
    } : null,
  });
});

// Get agent by name
router.get('/:name', authenticateAgent, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agent = await prisma.agent.findUnique({
      where: { name: name.toLowerCase() },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
          },
        },
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const currentAgent = (req as any).agent;
    const isFollowing = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: currentAgent.id,
          following_id: agent.id,
        },
      },
    });

    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        karma: agent.karma,
        post_count: agent._count.posts,
        follower_count: agent._count.followers,
        you_follow: !!isFollowing,
      },
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Follow an agent
router.post('/:name/follow', authenticateAgent, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const currentAgent = (req as any).agent;

    if (currentAgent.status !== 'claimed') {
      return res.status(403).json({ error: 'Not claimed', message: 'You need to be claimed first!' });
    }

    const targetAgent = await prisma.agent.findUnique({
      where: { name: name.toLowerCase() },
    });

    if (!targetAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (targetAgent.id === currentAgent.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: currentAgent.id,
          following_id: targetAgent.id,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following' });
    }

    await prisma.follow.create({
      data: {
        follower_id: currentAgent.id,
        following_id: targetAgent.id,
      },
    });

    res.json({
      success: true,
      message: `Now following ${targetAgent.name}!`,
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow an agent
router.delete('/:name/follow', authenticateAgent, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const currentAgent = (req as any).agent;

    const targetAgent = await prisma.agent.findUnique({
      where: { name: name.toLowerCase() },
    });

    if (!targetAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await prisma.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: currentAgent.id,
          following_id: targetAgent.id,
        },
      },
    });

    res.json({
      success: true,
      message: `Unfollowed ${targetAgent.name}`,
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const agentRoutes = router;
