# 瀏覽器測試 AI 客服機器人

## 🧪 手動測試步驟

### 1. 確保代碼已構建

```bash
npm run build
```

### 2. 啟動本地服務器

```bash
npm run start
# 或
npx @11ty/eleventy --serve
```

服務器會在 `http://localhost:8080` 啟動

### 3. 在瀏覽器中打開網站

1. 打開瀏覽器訪問 `http://localhost:8080`
2. 或訪問 `http://localhost:8080?chatbot=open` （自動打開 chatbot）

### 4. 測試 AI 客服機器人

1. **找到 chatbot 按鈕**
   - 頁面右下角應該有 "AI形象顧問" 按鈕
   - 點擊打開聊天窗口

2. **發送測試訊息**
   - 輸入 "你好"
   - 點擊 "送出" 或按 Enter
   - 等待 AI 回應

3. **驗證回應**
   - ✅ 應該收到 AI 的回應
   - ✅ 回應應該合理且相關
   - ✅ 如果有錯誤，檢查瀏覽器控制台

### 5. 檢查瀏覽器控制台

打開瀏覽器開發者工具（F12），檢查：

- **Console 標籤**:
  - 查看是否有錯誤訊息
  - 查看 Pipeline 日誌（如果有的話）

- **Network 標籤**:
  - 檢查 `/api/chat` 請求
  - 查看請求狀態碼（應該是 200）
  - 查看回應內容

### 6. 測試多個場景

測試以下場景確保功能正常：

1. **基本問候**: "你好"
2. **服務詢問**: "我想拍形象照"
3. **價格詢問**: "價格多少"
4. **特殊意圖**: "line" (應該返回 Line 資訊)
5. **投訴**: "不滿意" (應該返回投訴處理模板)

## 🔍 故障排查

### 如果 chatbot 沒有出現

1. 檢查 `src/_includes/base-layout.njk` 中的註釋是否已取消
2. 檢查瀏覽器控制台是否有 JavaScript 錯誤
3. 確認 `gy-chatbot.js` 和 `gy-chatbot-init.js` 已正確載入

### 如果 API 請求失敗

1. 檢查 API 端點是否正確（應該是 `/api/chat`）
2. 檢查請求格式是否正確
3. 查看 Network 標籤中的錯誤詳情

### 如果獲得 500 錯誤

1. 檢查 Cloudflare Pages Functions 是否正確部署
2. 檢查環境變數（GEMINI_API_KEY）是否配置
3. 查看 Cloudflare Pages 日誌

## ✅ 成功標準

測試成功應該滿足：

- ✅ chatbot 按鈕出現並可點擊
- ✅ 聊天窗口可以打開
- ✅ 可以發送訊息
- ✅ 能夠收到 AI 回應
- ✅ 回應內容合理且相關
- ✅ 沒有 JavaScript 錯誤
- ✅ API 請求返回 200 狀態碼

