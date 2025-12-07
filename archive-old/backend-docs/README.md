# 好時有影 AI 客服機器人後端 API

## 專案簡介

這是好時有影 AI 客服機器人的後端 API 服務，提供 `/api/chat` 端點處理使用者聊天請求。

## 技術棧

- Node.js 18+
- TypeScript
- Express.js
- Google Gemini API

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並填入實際值：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入：
- `GEMINI_API_KEY`: Gemini API Key
- `ALLOWED_ORIGINS`: 允許的 Origin（用逗號分隔）

### 3. 開發模式

```bash
npm run dev
```

伺服器會在 `http://localhost:3000` 啟動。

### 4. 建置與生產模式

```bash
# 建置
npm run build

# 啟動
npm start
```

## API 端點

### POST /api/chat

處理聊天請求。

**請求格式：**
```json
{
  "message": "我想拍形象照",
  "mode": "auto",
  "pageType": "home",
  "conversationId": "optional-uuid",
  "context": {
    "last_intent": "greeting",
    "slots": {
      "service_type": "portrait_pro"
    }
  }
}
```

**回應格式：**
```json
{
  "reply": "AI 回覆文字",
  "intent": "service_inquiry",
  "updatedContext": {
    "last_intent": "service_inquiry",
    "slots": {
      "service_type": "portrait_pro"
    }
  },
  "suggestedQuickReplies": ["選項1", "選項2"]
}
```

### GET /health

健康檢查端點。

## 安全功能

### Rate Limiting

- 限制：60 requests / 10 minutes per IP
- 超過限制回傳 429 狀態碼

### 請求驗證

- 驗證 Origin header
- 驗證請求格式（JSON schema）
- 驗證必要欄位

### 錯誤處理

- 統一錯誤處理中間件
- 記錄所有錯誤到日誌
- 嚴重錯誤觸發告警

## 專案結構

```
backend/
├── src/
│   ├── routes/
│   │   └── chat.ts          # /api/chat 路由
│   ├── middleware/
│   │   ├── rateLimit.ts     # Rate limiting
│   │   ├── validateRequest.ts # 請求驗證
│   │   └── errorHandler.ts  # 錯誤處理
│   ├── utils/
│   │   └── logger.ts        # 日誌工具
│   └── index.ts             # 入口文件
├── package.json
├── tsconfig.json
└── README.md
```

## 開發指南

詳細的開發指南請參考 `docs/engineering_prompts.md`。

## 部署

### Vercel

1. 安裝 Vercel CLI：`npm i -g vercel`
2. 部署：`vercel`

### Railway

1. 連接 GitHub repository
2. 設定環境變數
3. 自動部署

### Cloudflare Workers

需要額外的適配層，請參考 Cloudflare Workers 文檔。

## 授權

ISC

