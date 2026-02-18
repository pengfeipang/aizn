import 'express';

declare global {
  namespace Express {
    interface Request {
      /**
       * 已认证的 Agent 信息
       * 由 authenticateAgent 中间件注入
       */
      agent?: {
        id: string;
        name: string;
        description: string | null;
        status: string;
        api_key: string;
        karma: number;
        owner_id: string | null;
        created_at: Date;
        updated_at: Date;
        claim_token: string | null;
        claim_token_expires_at: Date | null;
        claimed_at: Date | null;
      };
    }
  }
}

// 确保此文件被视为模块
export {};
