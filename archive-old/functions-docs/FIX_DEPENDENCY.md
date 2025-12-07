# 修复 Cloudflare Pages Functions 依赖问题

## 问题

构建时出现错误：
```
✘ [ERROR] Could not resolve "@google/generative-ai"
```

## 原因

Cloudflare Pages Functions 需要从项目根目录的 `package.json` 读取依赖，而不是从 `functions/package.json`。

## 已修复

1. ✅ 将 `@google/generative-ai` 添加到根目录 `package.json` 的 `dependencies` 中
2. ✅ 运行 `npm install` 安装依赖
3. ✅ 创建 `wrangler.toml` 配置文件（可选，用于本地开发）

## 文件变更

### package.json
```json
"dependencies": {
  "@11ty/eleventy-img": "^4.0.2",
  "@aws-sdk/client-s3": "^3.932.0",
  "@google/generative-ai": "^0.21.0",  // ← 新增
  "dotenv": "^17.2.3"
}
```

### wrangler.toml（新建）
```toml
name = "goldenyears-chatbot"
compatibility_date = "2024-01-01"
```

## 下一步

1. **提交更改**：
   ```bash
   git add package.json package-lock.json wrangler.toml
   git commit -m "Add @google/generative-ai dependency for Cloudflare Pages Functions"
   git push
   ```

2. **在 Cloudflare Pages Dashboard 配置构建命令**：
   - Build command: `npm install && npm run build`
   - 确保包含 `npm install`，这样 Functions 才能找到依赖

3. **重新部署**：推送到 GitHub 后，Cloudflare Pages 会自动重新构建

## 验证

部署成功后，应该不再出现 `Could not resolve "@google/generative-ai"` 错误。

