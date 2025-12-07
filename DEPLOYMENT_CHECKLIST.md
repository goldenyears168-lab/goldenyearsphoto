# 部署檢查清單

## 🚀 部署前必做項目

### 1. 環境變數配置 ⚠️ **必需**

在 Cloudflare Pages Dashboard 配置：

- [ ] 進入 Cloudflare Pages Dashboard
- [ ] 選擇專案: `goldenyearsphoto`
- [ ] Settings → Environment variables
- [ ] 添加變數:
  - **Name**: `GEMINI_API_KEY`
  - **Value**: [您的 Gemini API Key]
  - **Environment**: Production (或 Production + Preview)

### 2. 構建設定檢查 ✅ **建議**

在 Cloudflare Pages Dashboard 確認：

- [ ] Settings → Builds & deployments
- [ ] Build command: `npm install && npm run build`
- [ ] Build output directory: `_site`
- [ ] Root directory: `/`
- [ ] Node.js version: `18` 或更高

### 3. 本地測試 ✅ **建議**

在部署前進行本地測試：

```bash
# 1. 構建前端
npm run build

# 2. 檢查構建輸出
ls -la _site/knowledge/

# 3. 測試 Functions（需要先安裝 functions 依賴）
cd functions && npm install && cd ..
wrangler pages dev _site --functions functions

# 4. 測試 API（在另一個終端）
curl -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "您好", "pageType": "home"}'
```

### 4. 代碼提交 ✅

確保所有更改已提交：

```bash
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 📋 部署後驗證

### 1. 構建狀態

- [ ] 檢查 Cloudflare Pages 構建日誌
- [ ] 確認構建成功（無錯誤）
- [ ] 確認 `knowledge` 目錄已複製到 `_site`

### 2. API 測試

```bash
# 測試健康檢查（如果有）
curl https://your-domain.pages.dev/health

# 測試聊天 API
curl -X POST https://your-domain.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "您好",
    "pageType": "home"
  }'
```

**預期回應**:
```json
{
  "reply": "嗨,我是好時有影的AI顧問...",
  "intent": "greeting",
  "conversationId": "conv_...",
  "suggestedQuickReplies": [...]
}
```

### 3. 前端測試

- [ ] 訪問首頁，確認聊天機器人出現
- [ ] 測試打開/關閉聊天機器人
- [ ] 測試發送消息
- [ ] 測試快速回覆按鈕

### 4. 日誌檢查

```bash
# 查看實時日誌
npm run logs

# 或
wrangler pages deployment tail --project-name=goldenyearsphoto
```

檢查是否有錯誤訊息。

---

## ⚠️ 常見問題排查

### 問題 1: 構建失敗

**檢查**:
- [ ] 構建日誌中的錯誤訊息
- [ ] Node.js 版本是否正確
- [ ] 構建命令是否正確

### 問題 2: API 返回 500

**檢查**:
- [ ] `GEMINI_API_KEY` 是否已配置
- [ ] 環境變數是否應用於正確的環境
- [ ] Functions 日誌中的錯誤訊息

**參考**: `functions/TROUBLESHOOTING.md`

### 問題 3: 知識庫文件找不到

**檢查**:
- [ ] 構建日誌中是否顯示 `knowledge` 目錄已複製
- [ ] `_site/knowledge/` 目錄是否存在
- [ ] 訪問 `https://your-domain.pages.dev/knowledge/services.json` 是否可訪問

### 問題 4: CORS 錯誤

**檢查**:
- [ ] 前端域名是否在 `functions/api/chat.ts` 的 `allowedOrigins` 中
- [ ] 瀏覽器控制台的錯誤訊息

---

## 📊 部署狀態追蹤

### 第一次部署

- [ ] 環境變數已配置
- [ ] 構建成功
- [ ] API 測試通過
- [ ] 前端測試通過
- [ ] 日誌無錯誤

### 後續更新

- [ ] 代碼已提交
- [ ] 構建成功
- [ ] 快速功能測試通過

---

## 🔗 相關文檔

- `DEPLOYMENT_READINESS_AUDIT.md` - 完整審計報告
- `functions/DEPLOYMENT.md` - 部署指南
- `functions/TROUBLESHOOTING.md` - 故障排除
- `functions/QUICK_FIX_CHECKLIST.md` - 快速修復清單

---

**最後更新**: 2025-01-XX

