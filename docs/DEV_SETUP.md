# 本地开发环境设置

## 问题说明

在本地开发时，Eleventy 的内置服务器不支持 Cloudflare Pages Functions。为了解决这个问题，我们创建了一个本地开发 API 服务器来模拟 Functions 的行为。

## 快速开始

### 方法 1: 使用集成开发命令（推荐）

```bash
npm run dev
```

这个命令会同时启动：
- API 服务器（端口 8787）
- Eleventy 开发服务器（端口 8080）
- 图片上传监听器

### 方法 2: 分别启动服务

```bash
# 终端 1: 启动 API 服务器
npm run dev:api

# 终端 2: 启动 Eleventy 服务器
npm run dev:eleventy
```

## 测试

### 测试 API 端点

```bash
# 测试 FAQ API 逻辑
npm run test:faq-api

# 测试完整开发环境配置
node scripts/test-dev-environment.mjs
```

### 手动测试 API

```bash
# 测试 FAQ 菜单端点
curl http://localhost:8787/api/faq-menu

# 使用 jq 格式化输出
curl -s http://localhost:8787/api/faq-menu | jq '.categories | length'

# 测试 Chat 端点
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"测试","conversationId":null}'
```

## 工作原理

1. **前端代码自动检测环境**
   - 检测到 `localhost` 或 `127.0.0.1` 时，使用 `http://localhost:8787/api/*`
   - 生产环境使用相对路径 `/api/*`

2. **本地 API 服务器**
   - `/api/faq-menu` (GET): 读取 `knowledge/faq_detailed.json`，返回 FAQ 菜单
   - `/api/chat` (POST): 基础实现，需要 GEMINI_API_KEY 才能使用完整功能
   - 支持 CORS

3. **开发流程**
   - **FAQ 菜单**: 本地开发服务器完全支持 ✅
   - **Chat API**: 
     - 基础版本：返回配置提示（当前实现）
     - 完整功能：需要使用 wrangler 或配置 GEMINI_API_KEY

## 故障排除

### API 服务器无法启动

**错误**: `端口 8787 已被占用`

**解决方案**:
1. 检查是否有其他进程占用端口: `lsof -i :8787`
2. 修改 `scripts/dev-api-server.mjs` 中的 `PORT` 变量
3. 同时修改 `src/assets/js/gy-chatbot.js` 中的 `devApiPort` 配置

### FAQ 菜单无法加载

**检查清单**:
1. ✅ API 服务器是否运行？访问 `http://localhost:8787/api/faq-menu`
2. ✅ 浏览器控制台是否有错误？
3. ✅ `knowledge/faq_detailed.json` 文件是否存在？
4. ✅ 前端代码是否正确检测到本地环境？

### 查看日志

```bash
# API 服务器日志（在运行 dev:api 的终端中）
[Dev API Server] GET /api/faq-menu

# 浏览器控制台
[GYChatbot] Loading FAQ menu from: http://localhost:8787/api/faq-menu
[GYChatbot] FAQ menu loaded: 14 categories
```

## 文件说明

- `scripts/dev-api-server.mjs` - 本地开发 API 服务器
- `scripts/test-faq-api.mjs` - API 逻辑测试脚本
- `scripts/test-dev-environment.mjs` - 开发环境配置测试
- `src/assets/js/gy-chatbot.js` - 前端 chatbot 代码（包含环境检测）

## Chat API 完整功能

### 方法 1: 使用 Wrangler（推荐）

```bash
# 1. 构建静态站点
npm run build

# 2. 使用 wrangler 运行（支持完整的 Functions）
wrangler pages dev _site --project-name=goldenyearsphoto
```

这会运行完整的 Cloudflare Pages Functions，包括完整的 Chat API。

### 方法 2: 配置 GEMINI_API_KEY

```bash
# 1. 创建 .env 文件
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 2. 重启开发服务器
npm run dev
```

**注意**: 当前本地开发服务器只提供基础响应。要使用完整的 AI 功能，建议使用方法 1（wrangler）。

## 生产部署

在生产环境中（Cloudflare Pages），不需要运行本地 API 服务器。Cloudflare Pages Functions 会自动处理所有 API 请求。

