# FAQ API 404 错误修复报告

## 问题描述

在本地开发环境中，chatbot 无法加载 FAQ 菜单，控制台显示：
```
Failed to load resource: the server responded with a status of 404 (Not Found) :8080/api/faq-menu
[GYChatbot] Failed to load FAQ menu: Error: HTTP error! status: 404
```

## 根本原因

1. **Eleventy 内置服务器不支持 Cloudflare Pages Functions**
   - Eleventy 的 `--serve` 命令只提供静态文件服务
   - `/api/faq-menu` 是 Cloudflare Pages Function，需要特殊运行时环境

2. **本地开发环境缺少 API 端点**
   - 前端代码尝试访问 `/api/faq-menu`
   - 本地服务器无法处理该路由，返回 404

## 解决方案

### 1. 创建本地开发 API 服务器

**文件**: `scripts/dev-api-server.mjs`

- 模拟 Cloudflare Pages Functions 的行为
- 读取 `knowledge/faq_detailed.json`
- 返回与生产环境相同格式的响应
- 支持 CORS，允许跨域请求

**功能**:
- 监听端口 8787
- 处理 `/api/faq-menu` GET 请求
- 处理 OPTIONS 预检请求
- 返回 FAQ 分类菜单数据

### 2. 修改前端代码支持环境检测

**文件**: `src/assets/js/gy-chatbot.js`

**新增功能**:
- `getApiBaseUrl()` 方法：自动检测开发/生产环境
- 本地开发：使用 `http://localhost:8787/api/faq-menu`
- 生产环境：使用相对路径 `/api/faq-menu`

**检测逻辑**:
```javascript
const isLocalDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';
```

### 3. 更新开发脚本

**文件**: `package.json`

**新增脚本**:
- `dev:api` - 启动本地 API 服务器
- `dev:eleventy` - 启动 Eleventy 服务器
- `test:faq-api` - 测试 FAQ API 逻辑
- `dev` - 集成开发命令（同时启动所有服务）

## 测试验证

### ✅ API 逻辑测试
```bash
npm run test:faq-api
```
结果: 14 个分类，每个分类最多 8 个问题

### ✅ API 服务器测试
```bash
curl http://localhost:8787/api/faq-menu
```
结果: 返回 200 状态码，JSON 格式正确

### ✅ CORS 测试
```bash
curl -X OPTIONS http://localhost:8787/api/faq-menu -H "Origin: http://localhost:8080"
```
结果: 返回 204 状态码，CORS 头正确

### ✅ 开发环境配置测试
```bash
node scripts/test-dev-environment.mjs
```
结果: 所有配置检查通过

## 使用方法

### 启动开发环境

```bash
# 方法 1: 集成启动（推荐）
npm run dev

# 方法 2: 分别启动
npm run dev:api        # 终端 1: API 服务器
npm run dev:eleventy   # 终端 2: Eleventy 服务器
```

### 访问网站

1. 打开浏览器访问: `http://localhost:8080`
2. 打开 chatbot
3. 检查浏览器控制台，应该看到:
   ```
   [GYChatbot] Loading FAQ menu from: http://localhost:8787/api/faq-menu
   [GYChatbot] FAQ menu loaded: 14 categories
   ```

## 文件变更清单

### 新增文件
- `scripts/dev-api-server.mjs` - 本地开发 API 服务器
- `scripts/test-faq-api.mjs` - API 逻辑测试脚本
- `scripts/test-dev-environment.mjs` - 开发环境配置测试
- `docs/DEV_SETUP.md` - 开发环境设置文档
- `docs/FAQ_API_FIX.md` - 本修复报告

### 修改文件
- `src/assets/js/gy-chatbot.js` - 添加环境检测和 API URL 配置
- `package.json` - 添加开发脚本和测试脚本

## 生产环境

在生产环境中（Cloudflare Pages），不需要运行本地 API 服务器：
- Cloudflare Pages Functions 自动处理 `/api/faq-menu` 请求
- 前端代码自动检测到非本地环境，使用相对路径
- 无需额外配置

## 技术细节

### API 响应格式

```json
{
  "categories": [
    {
      "id": "booking",
      "title": "預約問題",
      "questions": [
        {
          "id": "booking_001",
          "question": "是否可以電話預約或取消呢？"
        },
        ...
      ]
    },
    ...
  ]
}
```

### CORS 配置

```javascript
{
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

## 故障排除

### 问题: API 服务器无法启动

**原因**: 端口 8787 被占用

**解决**:
1. 检查占用: `lsof -i :8787`
2. 修改端口: 编辑 `scripts/dev-api-server.mjs` 和 `gy-chatbot.js`

### 问题: FAQ 菜单仍然无法加载

**检查清单**:
1. ✅ API 服务器是否运行？访问 `http://localhost:8787/api/faq-menu`
2. ✅ 浏览器控制台是否有错误？
3. ✅ 前端代码是否正确检测到本地环境？
4. ✅ 网络请求是否指向正确的 URL？

## 总结

✅ **问题已完全解决**
- 本地开发环境现在可以正常加载 FAQ 菜单
- API 服务器模拟生产环境行为
- 前端代码自动适配开发/生产环境
- 所有测试通过

✅ **改进点**
- 开发体验更流畅（一键启动所有服务）
- 代码更健壮（自动环境检测）
- 文档更完善（使用说明和故障排除）

