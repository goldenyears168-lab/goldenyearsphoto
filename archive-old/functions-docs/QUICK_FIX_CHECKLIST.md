# 快速修復檢查清單

## ✅ 立即檢查項目

### 1. 知識庫文件是否在構建輸出中？

**檢查方法**：
```bash
npm run build
ls -la _site/knowledge/
```

**應該看到**：
- `services.json`
- `personas.json`
- `policies.json`
- `contact_info.json`
- 其他 JSON 文件

**如果沒有**：
- 確認 `.eleventy.js` 中有 `eleventyConfig.addPassthroughCopy("knowledge")`
- 重新構建並部署

---

### 2. 環境變數是否已設置？

**檢查方法**：
1. 進入 Cloudflare Pages Dashboard
2. Settings → Environment variables
3. 確認 `GEMINI_API_KEY` 存在且值正確

**如果沒有**：
- 添加環境變數
- **重要**：重新部署才能生效

---

### 3. 依賴是否已安裝？

**檢查方法**：
```bash
cat functions/package.json
```

**應該看到**：
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0"
  }
}
```

**如果沒有**：
```bash
cd functions
npm install @google/generative-ai
```

---

### 4. 查看實際錯誤日誌

**方法 1：使用 Wrangler CLI**
```bash
npm run logs
```

**方法 2：Cloudflare Dashboard**
1. Pages → 你的專案 → Functions → Logs
2. 查看最近的錯誤

**關鍵錯誤訊息**：
- `Failed to fetch services.json: 404` → 知識庫文件問題
- `GEMINI_API_KEY not found` → 環境變數問題
- `Failed to load knowledge base` → 知識庫載入問題

---

## 🔧 快速修復步驟

### 如果錯誤是 404（知識庫文件找不到）

1. 確認 `.eleventy.js` 有：
   ```javascript
   eleventyConfig.addPassthroughCopy("knowledge");
   ```

2. 重新構建：
   ```bash
   npm run build
   ```

3. 檢查 `_site/knowledge/` 目錄

4. 重新部署到 Cloudflare Pages

---

### 如果錯誤是 API Key 相關

1. 在 Cloudflare Pages Dashboard 設定 `GEMINI_API_KEY`
2. **必須重新部署**才能生效
3. 驗證環境變數：
   - 進入 Settings → Environment variables
   - 確認變數名稱正確（大小寫敏感）
   - 確認值正確

---

### 如果錯誤是模組導入失敗

1. 確認 `functions/package.json` 有依賴
2. 如果使用本地測試：
   ```bash
   cd functions
   npm install
   ```

3. 在 Cloudflare Pages 中，依賴會自動從 `functions/package.json` 安裝

---

## 🧪 測試修復

修復後，測試 API：

```bash
curl -X POST https://your-domain.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "您好"}'
```

**成功回應應該包含**：
- `reply`: 非空字串
- `intent`: 例如 "greeting"
- `conversationId`: 非空字串

**如果還是 500 錯誤**：
- 查看日誌獲取詳細錯誤訊息
- 參考 `TROUBLESHOOTING.md` 獲取更多幫助

---

## 📋 部署前檢查清單

- [ ] `.eleventy.js` 包含 `addPassthroughCopy("knowledge")`
- [ ] `functions/package.json` 包含 `@google/generative-ai`
- [ ] Cloudflare Pages 環境變數已設置 `GEMINI_API_KEY`
- [ ] 本地構建成功，`_site/knowledge/` 目錄存在
- [ ] 本地測試通過（使用 `wrangler pages dev`）

---

## 🆘 還是無法解決？

1. 查看完整日誌：`npm run logs`
2. 檢查 `TROUBLESHOOTING.md` 獲取詳細診斷步驟
3. 提供以下資訊尋求協助：
   - 錯誤日誌
   - 構建日誌
   - 測試請求的完整響應


