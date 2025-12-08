# Wrangler 开发环境设置

## 快速开始

使用 Wrangler 运行完整的 Cloudflare Pages Functions，包括完整的 Chat API 功能。

### 启动命令

```bash
npm run dev:wrangler
```

或者手动执行：

```bash
# 1. 构建静态站点
npm run build

# 2. 启动 wrangler
npx wrangler pages dev _site --project-name=goldenyearsphoto
```

### 测试 API

```bash
npm run test:wrangler
```

## 配置

### 环境变量

Wrangler 会自动读取 `.dev.vars` 文件中的环境变量。

当前配置：
- `GEMINI_API_KEY` - 已配置 ✅

### 端口

Wrangler 默认会选择一个可用端口（通常是 8081）。访问地址会在启动时显示。

## 功能验证

### ✅ FAQ Menu API

```bash
curl http://localhost:8081/api/faq-menu
```

应该返回 14 个分类。

### ✅ Chat API

```bash
curl -X POST http://localhost:8081/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"是否可以電話預約或取消呢?","conversationId":null}'
```

应该返回 AI 生成的回复。

## 前端代码自动适配

前端代码会自动检测是否使用 Wrangler：
- 如果使用 Wrangler（端口 8081/8788），使用相对路径 `/api/*`
- 如果使用独立 API 服务器（端口 8787），使用完整 URL

## 与独立开发服务器的区别

| 功能 | 独立 API 服务器 | Wrangler |
|------|----------------|----------|
| FAQ Menu | ✅ 完全支持 | ✅ 完全支持 |
| Chat API | ⚠️ 仅提示信息 | ✅ 完整 AI 功能 |
| 环境变量 | 需要 .env | 使用 .dev.vars |
| 端口 | 8787 (API) + 8080 (前端) | 8081 (统一) |

## 故障排除

### Wrangler 无法启动

**错误**: 端口被占用

**解决**:
```bash
# 检查端口占用
lsof -i :8081

# 或指定其他端口
npx wrangler pages dev _site --project-name=goldenyearsphoto --port=8788
```

### Chat API 返回错误

**检查清单**:
1. ✅ `.dev.vars` 文件是否存在？
2. ✅ `GEMINI_API_KEY` 是否正确配置？
3. ✅ Wrangler 是否完全启动？（等待几秒钟）
4. ✅ 查看 Wrangler 控制台的错误信息

### 前端无法连接 API

**原因**: 前端代码可能还在使用旧的 API URL

**解决**:
1. 硬刷新浏览器（Cmd+Shift+R 或 Ctrl+Shift+R）
2. 检查浏览器控制台的网络请求
3. 确认使用的是相对路径 `/api/*` 而不是 `http://localhost:8787/api/*`

## 开发工作流

### 推荐工作流

1. **开发前端和 FAQ 功能**: 使用 `npm run dev`（独立服务器）
2. **测试完整 Chat 功能**: 使用 `npm run dev:wrangler`（Wrangler）

### 同时运行两个环境

```bash
# 终端 1: 独立开发服务器（快速迭代）
npm run dev

# 终端 2: Wrangler（测试完整功能）
npm run dev:wrangler
```

## 生产部署

生产环境使用 Cloudflare Pages，会自动处理所有 Functions，无需本地配置。

