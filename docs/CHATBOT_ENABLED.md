# AI 客服機器人啟用確認

## ✅ 啟用狀態

**日期**: 2025-01-20  
**狀態**: ✅ **已啟用**

---

## 📝 已完成的更改

### 1. 啟用 chatbot 代碼 ✅

**文件**: `src/_includes/base-layout.njk`

**更改**:
- ✅ 取消註釋 chatbot 配置元素
- ✅ 取消註釋 chatbot JavaScript 文件

**更改前**:
```njk
{# <div data-chatbot-config data-page-type="{{ pageType | default('home') }}" style="display: none;" aria-hidden="true"></div> #}
{# <script src="/assets/js/gy-chatbot.js" defer></script> #}
{# <script src="/assets/js/gy-chatbot-init.js" defer></script> #}
```

**更改後**:
```njk
<div data-chatbot-config data-page-type="{{ pageType | default('home') }}" style="display: none;" aria-hidden="true"></div>
<script src="/assets/js/gy-chatbot.js" defer></script>
<script src="/assets/js/gy-chatbot-init.js" defer></script>
```

---

## 🧪 測試步驟

### 方法 1: 瀏覽器測試（推薦）

1. **構建項目**:
   ```bash
   npm run build
   ```

2. **啟動服務器**:
   ```bash
   npm run start
   ```

3. **打開瀏覽器**:
   - 訪問 `http://localhost:8080`
   - 或 `http://localhost:8080?chatbot=open` (自動打開)

4. **測試 chatbot**:
   - 找到右下角的 "AI形象顧問" 按鈕
   - 點擊打開聊天窗口
   - 發送 "你好" 測試訊息
   - 驗證收到 AI 回應

### 方法 2: 使用 wrangler 本地測試（需要 Cloudflare Functions）

1. **構建項目**:
   ```bash
   npm run build
   ```

2. **啟動 wrangler pages dev**:
   ```bash
   wrangler pages dev _site --project-name=goldenyearsphoto
   ```

3. **測試 API**:
   ```bash
   API_URL=http://localhost:8788/api/chat node scripts/test-chatbot-api.mjs
   ```

### 方法 3: 測試生產環境

1. **部署到 Cloudflare Pages**:
   ```bash
   wrangler pages deploy _site --project-name=goldenyearsphoto
   ```

2. **測試 API**:
   ```bash
   node scripts/test-chatbot-production.mjs
   ```

---

## 🔍 驗證清單

### 前端驗證
- [ ] chatbot 按鈕出現在頁面上
- [ ] 可以點擊打開聊天窗口
- [ ] 可以輸入訊息
- [ ] 可以發送訊息

### API 驗證
- [ ] API 請求成功（200 狀態碼）
- [ ] 收到 AI 回應
- [ ] 回應內容合理
- [ ] 沒有錯誤訊息

### Pipeline 驗證
- [ ] 使用新的 Pipeline 實現
- [ ] 結構化日誌正常輸出（如果可見）
- [ ] 響應時間正常

---

## ⚠️ 注意事項

### 本地開發限制

Eleventy 本地服務器 (`npm run start`) **不支持 Cloudflare Pages Functions**。

要在本地測試完整的 API 功能，需要使用：
- `wrangler pages dev` - 模擬 Cloudflare Pages 環境
- 或部署到 Cloudflare Pages 測試

### 生產環境要求

- ✅ 需要配置 `GEMINI_API_KEY` 環境變數
- ✅ 需要部署 `functions/` 目錄到 Cloudflare Pages
- ✅ 需要部署 `knowledge/` 目錄

---

## 🚀 下一步

1. **本地測試**: 使用瀏覽器測試前端 UI
2. **API 測試**: 使用 wrangler 或部署後測試 API
3. **生產部署**: 部署到 Cloudflare Pages 並測試

---

**文檔版本**: v1.0  
**最後更新**: 2025-01-20

