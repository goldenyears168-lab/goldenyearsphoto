# Cloudflare Pages Functions

這個目錄包含 Cloudflare Pages Functions，用於處理 `/api/chat` 端點。

## 結構

```
functions/
└── api/
    ├── chat.ts          # 主要的 API 處理函數
    └── lib/
        ├── knowledge.ts        # 知識庫載入服務
        ├── llm.ts              # LLM 服務（Gemini）
        ├── contextManager.ts   # 對話上下文管理器
        └── responseTemplates.ts # 回應模板
```

## 環境變數

在 Cloudflare Pages 設定中，需要配置以下環境變數：

- `GEMINI_API_KEY`: Google Gemini API Key

## 部署

1. 將代碼推送到 GitHub
2. 在 Cloudflare Pages 中連接 repository
3. 設定環境變數 `GEMINI_API_KEY`
4. 部署

## 注意事項

1. **知識庫文件**：`knowledge/*.json` 文件需要能被 Functions 訪問。確保這些文件在構建輸出中。

2. **JSON Import**：Cloudflare Pages Functions 支持直接 import JSON 文件，但路徑需要正確。

3. **Context Manager**：目前使用內存存儲，在 Cloudflare Workers 中可能不會持久化。如果需要持久化，建議使用 Cloudflare KV。

4. **Rate Limiting**：可以通過 Cloudflare 的 Rate Limiting 功能在 Dashboard 中配置，或使用 Cloudflare Workers 的 Rate Limiting API。

## 本地測試

使用 Wrangler CLI 進行本地測試：

```bash
npm install -g wrangler
wrangler pages dev _site --functions functions
```

## 依賴

Functions 需要以下依賴（需要在 `package.json` 中定義）：

- `@google/generative-ai`: Google Gemini API 客戶端

