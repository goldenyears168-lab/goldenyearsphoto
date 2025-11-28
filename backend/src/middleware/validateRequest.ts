/**
 * 請求驗證中間件
 * 驗證請求格式和必要欄位
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

interface ChatRequest {
  message: string;
  mode?: 'auto' | 'decision_recommendation' | 'faq_flow_price';
  pageType?: 'home' | 'qa';
  conversationId?: string;
  context?: {
    last_intent?: string;
    slots?: {
      service_type?: string;
      use_case?: string;
      persona?: string;
    };
  };
}

/**
 * 驗證 /api/chat 請求格式
 */
export const validateChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 檢查 Content-Type
  if (req.get('content-type') !== 'application/json') {
    logger.warn('Invalid content-type', {
      contentType: req.get('content-type'),
      ip: req.ip || req.socket.remoteAddress,
    });
    res.status(400).json({
      error: 'Invalid Content-Type',
      message: '請求必須使用 application/json',
    });
    return;
  }

  // 檢查請求體
  if (!req.body) {
    logger.warn('Missing request body', {
      ip: req.ip || req.socket.remoteAddress,
    });
    res.status(400).json({
      error: 'Missing request body',
      message: '請求體不能為空',
    });
    return;
  }

  const body = req.body as ChatRequest;

  // 驗證必要欄位
  if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
    logger.warn('Invalid message field', {
      ip: req.ip || req.socket.remoteAddress,
      hasMessage: !!body.message,
    });
    res.status(400).json({
      error: 'Invalid request',
      message: 'message 欄位為必填且不能為空',
    });
    return;
  }

  // 驗證 message 長度
  if (body.message.length > 1000) {
    logger.warn('Message too long', {
      ip: req.ip || req.socket.remoteAddress,
      length: body.message.length,
    });
    res.status(400).json({
      error: 'Invalid request',
      message: 'message 長度不能超過 1000 字元',
    });
    return;
  }

  // 驗證 mode（如果提供）
  if (body.mode && !['auto', 'decision_recommendation', 'faq_flow_price'].includes(body.mode)) {
    logger.warn('Invalid mode', {
      ip: req.ip || req.socket.remoteAddress,
      mode: body.mode,
    });
    res.status(400).json({
      error: 'Invalid request',
      message: 'mode 必須是 auto、decision_recommendation 或 faq_flow_price',
    });
    return;
  }

  // 驗證 pageType（如果提供）
  if (body.pageType && !['home', 'qa'].includes(body.pageType)) {
    logger.warn('Invalid pageType', {
      ip: req.ip || req.socket.remoteAddress,
      pageType: body.pageType,
    });
    res.status(400).json({
      error: 'Invalid request',
      message: 'pageType 必須是 home 或 qa',
    });
    return;
  }

  // 驗證通過，繼續處理
  next();
};

