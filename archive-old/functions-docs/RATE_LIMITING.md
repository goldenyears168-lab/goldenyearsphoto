# Rate Limiting 配置指南

## 為什麼需要 Rate Limiting？

防止 API 被濫用，保護系統資源，避免 DoS 攻擊。

## Cloudflare Pages Functions Rate Limiting

### 方法 1：使用 Cloudflare Dashboard（推薦）

1. 進入 Cloudflare Dashboard
2. 選擇你的域名
3. 進入 **Security** → **WAF** → **Rate limiting rules**
4. 創建新規則：
   - **Rule name**: `Chat API Rate Limit`
   - **Path**: `/api/chat`
   - **Method**: `POST`
   - **Rate**: `10 requests per 1 minute`（根據需求調整）
   - **Action**: `Block`

### 方法 2：使用 Cloudflare Workers（進階）

如果需要更細粒度的控制，可以創建一個 Worker 來處理 rate limiting。

### 方法 3：在代碼中實現簡單的 Rate Limiting（不推薦）

在 Cloudflare Pages Functions 中，可以使用 KV 存儲實現簡單的 rate limiting，但建議使用 Cloudflare 的內建功能。

## 建議的 Rate Limit 配置

- **一般用戶**: 10 請求/分鐘
- **預覽環境**: 5 請求/分鐘（更嚴格）
- **生產環境**: 20 請求/分鐘（根據實際需求調整）

## 監控

在 Cloudflare Dashboard 中監控：
- **Analytics** → **Security Events** → 查看被 rate limit 攔截的請求
- 根據實際情況調整限制

