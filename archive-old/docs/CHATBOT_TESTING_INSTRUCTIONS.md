# AI 客服機器人測試指南

## ✅ 已完成的設置

1. **啟用 chatbot 代碼** ✅
   - 已取消 `base-layout.njk` 中的註釋
   - chatbot JavaScript 文件已啟用

2. **前端 UI 已加載** ✅
   - chatbot 按鈕已出現在頁面上
   - 可以通過 URL 參數自動打開（`?chatbot=open`）

---

## ⚠️ 重要限制

### 本地開發環境限制

**Eleventy 本地服務器 (`npm run start`)** 不支持 Cloudflare Pages Functions。

這意味著：
- ✅ chatbot UI 可以正常顯示和操作
- ❌ API 請求會失敗（因為 `/api/chat` 端點不存在於本地）

### 解決方案

#### 選項 1: 使用 wrangler 本地測試（推薦）

1. **構建項目**:
   ```bash
   npm run build
   ```

2. **啟動 wrangler pages dev**:
   ```bash
   wrangler pages dev _site --project-name=goldenyearsphoto
   ```

3. **訪問**:
   - 打開 `http://localhost:8788?chatbot=open`
   - 測試 chatbot 功能

#### 選項 2: 部署到 Cloudflare Pages 測試

1. **部署**:
   ```bash
   wrangler pages deploy _site --project-name=goldenyearsphoto
   ```

2. **測試生產環境**:
   - 訪問 `https://goldenyearsphoto.pages.dev?chatbot=open`
   - 或運行：`node scripts/test-chatbot-production.mjs`

---

## 🧪 測試步驟

### 使用 wrangler 本地測試（完整功能）

1. **啟動 wrangler**:
   ```bash
   npm run build
   wrangler pages dev _site --project-name=goldenyearsphoto
   ```

2. **打開瀏覽器**:
   - 訪問 `http://localhost:8788?chatbot=open`

3. **測試 chatbot**:
   - chatbot 應該自動打開
   - 輸入 "你好"
   - 點擊 "送出"
   - 等待 AI 回應

4. **驗證**:
   - ✅ 應該收到 AI 回應
   - ✅ 回應內容合理
   - ✅ 沒有錯誤訊息

### 使用生產環境測試

1. **部署**（如果需要）:
   ```bash
   npm run build
   wrangler pages deploy _site --project-name=goldenyearsphoto
   ```

2. **測試 API**:
   ```bash
   node scripts/test-chatbot-production.mjs
   ```

3. **或在瀏覽器中測試**:
   - 訪問 `https://goldenyearsphoto.pages.dev?chatbot=open`
   - 測試完整功能

---

## 🔍 當前狀態

### 前端狀態 ✅

- ✅ chatbot 按鈕已出現
- ✅ chatbot 已初始化
- ✅ 可以通過 URL 參數自動打開
- ✅ JavaScript 文件已加載

### API 狀態 ⚠️

- ⚠️ 本地環境不支持 Cloudflare Pages Functions
- ⚠️ 需要 wrangler 或生產環境才能測試 API

---

## 🚀 建議的下一步

### 立即測試（使用 wrangler）

```bash
# 1. 構建
npm run build

# 2. 啟動 wrangler
wrangler pages dev _site --project-name=goldenyearsphoto

# 3. 在瀏覽器打開
# http://localhost:8788?chatbot=open

# 4. 測試發送訊息
```

### 或部署後測試

```bash
# 1. 構建和部署
npm run build
wrangler pages deploy _site --project-name=goldenyearsphoto

# 2. 等待部署完成

# 3. 測試
node scripts/test-chatbot-production.mjs
```

---

## 📝 測試清單

- [ ] chatbot 按鈕出現 ✅
- [ ] chatbot 可以打開 ✅
- [ ] 可以輸入訊息 ⬜ (需要在 wrangler/生產環境)
- [ ] 可以發送訊息 ⬜ (需要在 wrangler/生產環境)
- [ ] 收到 AI 回應 ⬜ (需要在 wrangler/生產環境)

---

**文檔版本**: v1.0  
**最後更新**: 2025-01-20

