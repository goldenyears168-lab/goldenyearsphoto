/**
 * Rate Limiting 中間件
 * 防止 API 濫用：60 requests / 10 minutes per IP
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

// 允許的域名列表（從環境變數讀取，預設為官網域名）
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://www.goldenyearsphoto.com', 'http://localhost:8080'];

export const chatRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 分鐘
  max: 60, // 最多 60 次請求
  message: {
    error: '請求過於頻繁',
    message: '為了確保服務品質，請稍後再試。如有緊急需求，請透過 Email 或電話聯絡我們。',
  },
  standardHeaders: true, // 回傳 rate limit info 在 `RateLimit-*` headers
  legacyHeaders: false, // 停用 `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    logger.logRateLimit(ip, req.path);
    
    let retryAfter = 600; // 預設 10 分鐘
    if (req.rateLimit?.resetTime) {
      const resetTime = typeof req.rateLimit.resetTime === 'number' 
        ? req.rateLimit.resetTime 
        : req.rateLimit.resetTime.getTime();
      retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      if (retryAfter < 0) retryAfter = 600;
    }
    
    res.status(429).json({
      error: '請求過於頻繁',
      message: '為了確保服務品質，請稍後再試。如有緊急需求，請透過 Email 或電話聯絡我們。',
      retryAfter,
    });
  },
  // 根據 IP 地址進行限制
  keyGenerator: (req: Request) => {
    // 優先使用 X-Forwarded-For header（如果部署在反向代理後）
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

/**
 * 驗證 Origin header
 */
export const validateOrigin = (req: Request, res: Response, next: Function) => {
  const origin = req.headers.origin;
  
  // 允許沒有 origin 的請求（例如 Postman、curl）
  if (!origin) {
    return next();
  }

  // 檢查是否在允許列表中
  if (ALLOWED_ORIGINS.includes(origin)) {
    return next();
  }

  logger.warn('Invalid origin', {
    origin,
    ip: req.ip || req.socket.remoteAddress,
    path: req.path,
  });

  res.status(403).json({
    error: 'Forbidden',
    message: '請求來源不被允許',
  });
};

