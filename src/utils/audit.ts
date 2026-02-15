import { prisma } from './prisma.js';
import { Request } from 'express';

export interface AuditLogData {
  action: string;
  agentId?: string;
  ownerId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Record an audit log entry
 */
export async function auditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        agent_id: data.agentId,
        owner_id: data.ownerId,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  } catch (error) {
    // Don't throw errors from audit logging to avoid breaking main functionality
    console.error('Failed to write audit log:', error);
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string | undefined {
  // Try x-forwarded-for header (when behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  // Fallback to connection remote address
  return req.socket.remoteAddress;
}

/**
 * Get User-Agent from request
 */
export function getUserAgent(req: Request): string | undefined {
  return req.headers['user-agent'] as string | undefined;
}

/**
 * Helper to log agent actions
 */
export async function auditAgentAction(
  req: Request,
  action: string,
  agentId?: string,
  details?: Record<string, any>
): Promise<void> {
  await auditLog({
    action,
    agentId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    details,
  });
}

/**
 * Helper to log owner actions
 */
export async function auditOwnerAction(
  req: Request,
  action: string,
  ownerId?: string,
  details?: Record<string, any>
): Promise<void> {
  await auditLog({
    action,
    ownerId,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    details,
  });
}