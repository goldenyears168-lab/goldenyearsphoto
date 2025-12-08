#!/usr/bin/env node
/**
 * 本地开发 API 服务器
 * 模拟 Cloudflare Pages Functions 的 API 端点
 * 用于本地开发时测试 chatbot
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量（如果存在 .env 文件）
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (error) {
  // dotenv 不存在或加载失败，继续运行
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const PORT = 8787; // Cloudflare Pages Functions 默认端口
const ELEVENTY_PORT = 8080; // Eleventy 默认端口

// 读取 FAQ 数据
function loadFAQData() {
  try {
    const faqPath = path.join(projectRoot, 'knowledge', 'faq_detailed.json');
    const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
    return faqData;
  } catch (error) {
    console.error('[Dev API Server] Error loading FAQ data:', error);
    return null;
  }
}

// 处理 /api/faq-menu 请求
function handleFAQMenu(req, res) {
  const faqData = loadFAQData();
  
  if (!faqData || !faqData.categories) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'FAQ data not available' }));
    return;
  }

  // 构建菜单结构（与 Cloudflare Functions 逻辑一致）
  const categories = Object.entries(faqData.categories)
    .map(([categoryId, category]) => {
      if (!category || !category.questions) {
        return null;
      }

      // 每个分类最多返回 8 个常见问题
      const questions = category.questions
        .slice(0, 8)
        .map(q => ({
          id: q.id,
          question: q.question,
        }));

      return {
        id: categoryId,
        title: category.title,
        questions: questions,
      };
    })
    .filter(cat => cat !== null);

  const response = {
    categories: categories,
  };

  // CORS headers
  const origin = req.headers.origin || '*';
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  
  res.end(JSON.stringify(response));
}

// 处理 /api/chat 请求
async function handleChat(req, res) {
  // 读取请求体
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      const requestData = JSON.parse(body);
      const message = requestData.message || '';
      
      // 检查是否有 GEMINI_API_KEY
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        // 没有 API key，返回友好的提示信息
        const response = {
          reply: '⚠️ 本地开发模式：Chat API 需要配置 GEMINI_API_KEY 环境变量。\n\n' +
                 '请执行以下步骤：\n' +
                 '1. 创建 .env 文件（如果还没有）\n' +
                 '2. 添加: GEMINI_API_KEY=your_api_key_here\n' +
                 '3. 或使用 wrangler 运行完整功能: wrangler pages dev _site --project-name=goldenyearsphoto\n\n' +
                 'FAQ 菜单功能可以正常使用。',
          conversationId: requestData.conversationId || null,
        };
        
        const origin = req.headers.origin || '*';
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end(JSON.stringify(response));
        return;
      }
      
      // 有 API key，但本地开发服务器不实现完整的 chat 逻辑
      // 建议使用 wrangler 来运行完整的 Functions
      const response = {
        reply: '⚠️ 本地开发模式：完整的 Chat API 功能需要使用 wrangler 运行。\n\n' +
               '请使用以下命令启动完整功能：\n' +
               '```bash\n' +
               'npm run build\n' +
               'wrangler pages dev _site --project-name=goldenyearsphoto\n' +
               '```\n\n' +
               '或者配置 GEMINI_API_KEY 后，本地 API 服务器可以尝试调用 Gemini API。\n\n' +
               '当前消息: ' + message,
        conversationId: requestData.conversationId || null,
      };
      
      const origin = req.headers.origin || '*';
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end(JSON.stringify(response));
      
    } catch (error) {
      console.error('[Dev API Server] Error handling chat request:', error);
      const origin = req.headers.origin || '*';
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
    }
  });
}

// 处理 OPTIONS 请求（CORS preflight）
function handleOptions(req, res) {
  const origin = req.headers.origin || '*';
  res.writeHead(204, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

// 创建服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  console.log(`[Dev API Server] ${req.method} ${url.pathname}`);

  // 处理 CORS preflight
  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  // 路由处理
  if (url.pathname === '/api/faq-menu' && req.method === 'GET') {
    handleFAQMenu(req, res);
  } else if (url.pathname === '/api/chat' && req.method === 'POST') {
    handleChat(req, res);
  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: url.pathname }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n🚀 本地开发 API 服务器已启动`);
  console.log(`   API 端点:`);
  console.log(`   - GET  http://localhost:${PORT}/api/faq-menu`);
  console.log(`   - POST http://localhost:${PORT}/api/chat`);
  console.log(`   前端地址: http://localhost:${ELEVENTY_PORT}`);
  
  // 检查环境变量
  if (!process.env.GEMINI_API_KEY) {
    console.log(`\n   ⚠️  注意: GEMINI_API_KEY 未配置`);
    console.log(`   Chat API 将返回提示信息，不会调用实际的 AI 服务`);
    console.log(`   要使用完整功能，请:`);
    console.log(`   1. 创建 .env 文件并添加 GEMINI_API_KEY`);
    console.log(`   2. 或使用: wrangler pages dev _site --project-name=goldenyearsphoto\n`);
  } else {
    console.log(`\n   ✅ GEMINI_API_KEY 已配置`);
    console.log(`   注意: 本地开发服务器提供基础响应，完整功能建议使用 wrangler\n`);
  }
});

// 错误处理
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ 端口 ${PORT} 已被占用`);
    console.error(`   请关闭占用该端口的程序，或修改脚本中的 PORT 变量\n`);
  } else {
    console.error('[Dev API Server] Error:', error);
  }
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n👋 正在关闭开发 API 服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭\n');
    process.exit(0);
  });
});

