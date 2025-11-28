# Cloudflare Pages Functions 部署指南

## 前置要求

1. Cloudflare 帳號
2. GitHub repository 已連接 Cloudflare Pages
3. Google Gemini API Key

## 部署步驟

### 1. 配置環境變數

在 Cloudflare Pages Dashboard 中：

1. 進入你的 Pages 專案
2. 點擊 "Settings" → "Environment variables"
3. 添加以下環境變數：
   - `GEMINI_API_KEY`: 你的 Google Gemini API Key

### 2. 確保知識庫文件可訪問

確保 `knowledge/*.json` 文件在構建輸出中。有兩種方式：

#### 方式 A：將 knowledge 目錄複製到 _site（推薦）

在 `.eleventy.js` 中添加：

```javascript
eleventyConfig.addPassthroughCopy("knowledge");
```

#### 方式 B：將 knowledge 文件放在 functions 目錄

將 `knowledge` 目錄複製到 `functions/knowledge`，然後修改 `functions/api/lib/knowledge.ts` 中的路徑。

### 3. 配置構建設定

在 Cloudflare Pages Dashboard：

1. 進入 "Settings" → "Builds & deployments"
2. 設定：
   - **Build command**: `npm run build`
   - **Build output directory**: `_site`
   - **Root directory**: `/` (專案根目錄)

### 4. 部署

推送到 GitHub main 分支，Cloudflare Pages 會自動部署。

## 驗證部署

部署完成後，測試 API：

```bash
curl -X POST https://your-domain.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我想拍形象照",
    "pageType": "home"
  }'
```

## 注意事項

1. **JSON 文件路徑**：確保 `knowledge/*.json` 文件在構建輸出中可訪問
2. **環境變數**：`GEMINI_API_KEY` 必須在 Cloudflare Pages 環境變數中設定
3. **CORS**：Functions 已包含 CORS headers，允許來自官網的請求
4. **Rate Limiting**：可以在 Cloudflare Dashboard 中配置 Rate Limiting 規則

## 故障排除

### 問題：JSON 文件載入失敗

**解決方案**：
- 確保 `knowledge` 目錄在構建輸出中
- 檢查 `functions/api/lib/knowledge.ts` 中的路徑是否正確
- 在 Cloudflare Pages 中，JSON 文件可能需要通過 fetch 載入

### 問題：GEMINI_API_KEY 未找到

**解決方案**：
- 確認環境變數已在 Cloudflare Pages Dashboard 中設定
- 確認變數名稱正確（大小寫敏感）
- 重新部署以應用環境變數變更

### 問題：Functions 返回 500 錯誤

**解決方案**：
- 檢查 Cloudflare Pages Functions 日誌
- 確認所有依賴項已正確安裝
- 檢查 `@google/generative-ai` 是否在 `functions/package.json` 中

## 本地測試

使用 Wrangler CLI 進行本地測試：

```bash
# 安裝 Wrangler
npm install -g wrangler

# 構建前端
npm run build

# 啟動本地開發服務器
wrangler pages dev _site --functions functions
```

## 升級到 KV 存儲（可選）

如果需要持久化對話上下文，可以升級到 Cloudflare KV：

1. 在 Cloudflare Dashboard 創建 KV namespace
2. 在 Pages 設定中綁定 KV namespace
3. 修改 `functions/api/lib/contextManager.ts` 使用 KV 存儲

