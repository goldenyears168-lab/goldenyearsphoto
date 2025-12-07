# Cloudflare Pages Functions 設置完成

## 已創建的文件

1. **functions/api/chat.ts** - 主要的 API 處理函數
2. **functions/api/lib/knowledge.ts** - 知識庫載入服務
3. **functions/api/lib/llm.ts** - LLM 服務（Gemini）
4. **functions/api/lib/contextManager.ts** - 對話上下文管理器
5. **functions/api/lib/responseTemplates.ts** - 回應模板
6. **functions/package.json** - Functions 依賴項
7. **functions/README.md** - Functions 說明文檔
8. **functions/DEPLOYMENT.md** - 部署指南

## 已更新的文件

1. **.eleventy.js** - 添加了 `knowledge` 目錄的 passthrough，確保 JSON 文件在構建輸出中

## 下一步

1. **設定環境變數**：在 Cloudflare Pages Dashboard 中設定 `GEMINI_API_KEY`
2. **推送到 GitHub**：將代碼推送到 main 分支
3. **部署**：Cloudflare Pages 會自動部署
4. **測試**：訪問 `/api/chat` 端點測試功能

## 重要提醒

- 確保 `knowledge/*.json` 文件在構建輸出中（已通過 `.eleventy.js` 配置）
- 環境變數 `GEMINI_API_KEY` 必須在 Cloudflare Pages 中設定
- 前端 Widget 已配置為使用相對路徑 `/api/chat`，部署後會自動工作

## 驗證清單

- [x] Functions 文件已創建
- [x] 知識庫載入邏輯已實現
- [x] LLM 服務已整合
- [x] 上下文管理器已實現
- [x] 回應模板已創建
- [x] CORS headers 已配置
- [x] 錯誤處理已實現
- [x] 知識庫文件會複製到構建輸出
- [ ] 環境變數已設定（需要在 Cloudflare Dashboard 中設定）
- [ ] 已部署並測試（需要推送到 GitHub）

## 測試命令

部署後，可以使用以下命令測試：

```bash
curl -X POST https://your-domain.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.goldenyearsphoto.com" \
  -d '{
    "message": "我想拍形象照",
    "pageType": "home"
  }'
```

預期回應應該包含 `reply`、`intent` 和 `conversationId` 欄位。

