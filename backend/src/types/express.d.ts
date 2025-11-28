/**
 * Express 类型扩展
 */

import { RateLimitInfo } from 'express-rate-limit';

declare global {
  namespace Express {
    interface Request {
      rateLimit?: RateLimitInfo;
    }
  }
}

export {};

