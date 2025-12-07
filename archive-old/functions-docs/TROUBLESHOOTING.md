# 故障排除指南 - 500 錯誤

## 常見問題診斷

### 1. 知識庫文件載入失敗（最常見）

**症狀**：
- API 返回 500 錯誤
- 控制台顯示 "Failed to load knowledge base" 或 "Failed to fetch"

**解決方案**：

#### 步驟 1：確認知識庫文件在構建輸出中

確保 `.eleventy.js` 中有以下配置：

```javascript
eleventyConfig.addPassthroughCopy("knowledge");
```

#### 步驟 2：驗證構建輸出

部署後，檢查以下 URL 是否可以訪問：
- `https://your-domain.pages.dev/knowledge/services.json`
- `https://your-domain.pages.dev/knowledge/contact_info.json`
- `https://your-domain.pages.dev/knowledge/policies.json`

如果這些 URL 返回 404，說明知識庫文件沒有被正確複製到構建輸出。

#### 步驟 3：檢查 Cloudflare Pages 構建設定

在 Cloudflare Pages Dashboard：
1. 進入 Settings → Builds & deployments
2. 確認 Build output directory 設為 `_site`
3. 確認 Root directory 設為 `/`（專案根目錄）

### 2. 環境變數未設置

**症狀**：
- API 返回 500 或 503 錯誤
- 控制台顯示 "GEMINI_API_KEY not found" 或 "LLM service will not be available"

**解決方案**：

1. 進入 Cloudflare Pages Dashboard
2. 選擇你的專案
3. 進入 Settings → Environment variables
4. 添加環境變數：
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 你的 Google Gemini API Key
   - **Environment**: Production（或 Production + Preview）

5. **重要**：添加環境變數後，需要重新部署才能生效

### 3. 依賴未正確安裝

**症狀**：
- API 返回 500 錯誤
- 控制台顯示模組導入錯誤

**解決方案**：

確認 `functions/package.json` 包含以下依賴：

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0"
  }
}
```

如果沒有，執行：

```bash
cd functions
npm install @google/generative-ai
```

### 4. 查看詳細錯誤日誌

**使用 Wrangler CLI 查看日誌**：

```bash
# 查看即時日誌
wrangler pages deployment tail --project-name=goldenyearsphoto

# 或使用 npm script
npm run logs
```

**在 Cloudflare Dashboard 查看**：

1. 進入 Cloudflare Pages Dashboard
2. 選擇你的專案
3. 進入 Functions → Logs
4. 查看最近的錯誤日誌

## 快速診斷步驟

### 步驟 1：檢查知識庫文件

```bash
# 本地構建
npm run build

# 檢查構建輸出
ls -la _site/knowledge/
```

應該看到以下文件：
- `services.json`
- `personas.json`
- `policies.json`
- `contact_info.json`
- `response_templates.json`
- `service_summaries.json`
- `emotion_templates.json`
- `intent_nba_mapping.json`
- `faq_detailed.json`

### 步驟 2：本地測試

```bash
# 構建
npm run build

# 使用 Wrangler 本地測試
wrangler pages dev _site --functions functions
```

然後測試 API：

```bash
curl -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "您好"}'
```

### 步驟 3：檢查環境變數

在 Cloudflare Pages Dashboard 確認：
- `GEMINI_API_KEY` 已設置
- 環境變數應用於正確的環境（Production/Preview）

### 步驟 4：查看部署日誌

在 Cloudflare Pages Dashboard：
1. 進入 Deployments
2. 選擇最新的部署
3. 查看 Build logs 和 Functions logs

## 常見錯誤訊息對照

| 錯誤訊息 | 可能原因 | 解決方案 |
|---------|---------|---------|
| `Failed to fetch services.json: 404` | 知識庫文件不在構建輸出中 | 確認 `.eleventy.js` 有 `addPassthroughCopy("knowledge")` |
| `GEMINI_API_KEY not found` | 環境變數未設置 | 在 Cloudflare Pages 設定環境變數並重新部署 |
| `Failed to load knowledge base` | 知識庫載入失敗 | 檢查知識庫文件路徑和可訪問性 |
| `LLM service will not be available` | LLM 服務初始化失敗 | 檢查 API Key 是否正確 |
| `Module not found` | 依賴未安裝 | 確認 `functions/package.json` 包含所需依賴 |

## 驗證修復

修復後，測試 API：

```bash
curl -X POST https://your-domain.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "您好",
    "pageType": "home"
  }'
```

應該返回：

```json
{
  "reply": "嗨,我是好時有影的AI顧問...",
  "intent": "greeting",
  "conversationId": "conv_...",
  "suggestedQuickReplies": [...]
}
```

## 需要協助？

如果以上步驟都無法解決問題，請提供：

1. Cloudflare Pages Functions 的錯誤日誌
2. 構建日誌
3. 測試請求的完整響應（包括 headers）

可以使用以下命令獲取日誌：

```bash
npm run logs
```


