# 故障排除指南

## FAQ API 连接错误

### 错误信息
```
GET http://localhost:8787/api/faq-menu net::ERR_CONNECTION_REFUSED
[GYChatbot] Failed to load FAQ menu: TypeError: Failed to fetch
```

### 原因
API 服务器（端口 8787）未运行。

### 解决方案

#### 方法 1: 使用集成开发命令（推荐）

```bash
# 停止当前的 dev 进程（Ctrl+C）
# 然后重新启动
npm run dev
```

这会同时启动：
- API 服务器（端口 8787）
- Eleventy 服务器（端口 8080）
- 图片上传监听器

#### 方法 2: 单独启动 API 服务器

如果 `npm run dev` 中的 API 服务器启动失败，可以单独启动：

```bash
# 新开一个终端
npm run dev:api
```

#### 方法 3: 手动启动 API 服务器

```bash
node scripts/dev-api-server.mjs
```

### 验证 API 服务器是否运行

```bash
# 检查端口是否被占用
lsof -i :8787

# 测试 API 端点
curl http://localhost:8787/api/faq-menu

# 应该返回 JSON 数据，包含 categories 数组
```

### 常见问题

#### Q: API 服务器启动后立即退出

**可能原因**:
1. 端口被占用
2. `knowledge/faq_detailed.json` 文件不存在或格式错误

**解决方法**:
```bash
# 检查端口占用
lsof -i :8787
# 如果有其他进程占用，kill 它或修改端口

# 检查 FAQ 数据文件
ls -la knowledge/faq_detailed.json
node scripts/test-faq-api.mjs
```

#### Q: 浏览器仍然显示连接错误

**检查清单**:
1. ✅ API 服务器是否运行？访问 `http://localhost:8787/api/faq-menu`
2. ✅ 浏览器控制台是否显示正确的 API URL？
3. ✅ 是否刷新了页面？
4. ✅ 是否有浏览器缓存问题？（尝试硬刷新 Cmd+Shift+R）

#### Q: concurrently 没有启动所有服务

**可能原因**: concurrently 配置问题或某个服务启动失败

**解决方法**:
1. 检查 concurrently 输出，查看哪个服务失败
2. 分别启动服务进行调试：
   ```bash
   npm run dev:api        # 终端 1
   npm run dev:eleventy   # 终端 2
   ```

## 其他常见问题

### Eleventy 服务器无法启动

**错误**: 端口 8080 被占用

**解决**:
```bash
# 查找占用进程
lsof -i :8080

# 或使用其他端口
npx @11ty/eleventy --serve --port=8081
```

### 前端代码修改后不生效

**解决**:
1. 硬刷新浏览器（Cmd+Shift+R 或 Ctrl+Shift+R）
2. 清除浏览器缓存
3. 检查 Eleventy 是否检测到文件变化

### 开发环境配置检查

运行完整的环境检查：

```bash
node scripts/test-dev-environment.mjs
```

这会检查：
- FAQ 数据文件是否存在
- API 服务器是否运行
- 前端代码配置是否正确
- package.json 脚本是否配置

