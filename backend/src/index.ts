/**
 * 好時有影 AI 客服機器人後端 API
 * 入口文件
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import { chatRateLimiter, validateOrigin } from './middleware/rateLimit.js';
import { validateChatRequest } from './middleware/validateRequest.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { knowledgeBase } from './services/knowledge.js';

// 載入環境變數
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中間件設定
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://www.goldenyearsphoto.com', 'http://localhost:8080'],
  credentials: true,
}));

// 解析 JSON 請求體
app.use(express.json({ limit: '10mb' }));

// 信任代理（如果部署在反向代理後，如 Vercel、Cloudflare）
app.set('trust proxy', 1);

// 請求日誌（開發環境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug('Incoming request', {
      method: req.method,
      path: req.path,
      ip: req.ip || req.socket.remoteAddress,
    });
    next();
  });
}

// 健康檢查端點
app.get('/health', async (req, res) => {
  const { contextManager } = await import('./services/contextManager.js');
  const stats = contextManager.getStats();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'goldenyears-chatbot-api',
    knowledgeBase: {
      loaded: knowledgeBase.isLoaded(),
    },
    contextManager: stats,
  });
});

// API 路由
app.use(
  '/api/chat',
  validateOrigin,        // 驗證 Origin
  chatRateLimiter,      // Rate limiting
  validateChatRequest,   // 驗證請求格式
  chatRoutes            // 聊天路由
);

// 404 處理
app.use(notFoundHandler);

// 錯誤處理（必須放在最後）
app.use(errorHandler);

// 載入知識庫
try {
  knowledgeBase.load();
  logger.info('Knowledge base loaded successfully');
} catch (error) {
  logger.logError(error as Error, { context: 'Knowledge base loading' });
  logger.warn('Server will start but knowledge base features may not work');
}

// 啟動伺服器
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    knowledgeBaseLoaded: knowledgeBase.isLoaded(),
  });
});

// 優雅關閉
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // 清理上下文管理器
  import('./services/contextManager.js').then(({ contextManager }) => {
    contextManager.stop();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  // 清理上下文管理器
  import('./services/contextManager.js').then(({ contextManager }) => {
    contextManager.stop();
    process.exit(0);
  });
});

