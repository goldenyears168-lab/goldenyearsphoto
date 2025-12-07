# 測試指南

## 快速測試

### 1. 啟動伺服器

```bash
cd backend
cp .env.example .env
# 編輯 .env，填入 GEMINI_API_KEY
npm run dev
```

### 2. 測試健康檢查

```bash
curl http://localhost:3000/health
```

預期回應：
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "goldenyears-chatbot-api",
  "knowledgeBase": {
    "loaded": true
  },
  "contextManager": {
    "activeContexts": 0,
    "totalContexts": 0
  }
}
```

### 3. 測試聊天 API

#### 基本測試（無上下文）

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我想拍形象照",
    "mode": "auto"
  }'
```

#### 測試多輪對話（帶 conversationId）

```bash
# 第一輪
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我想拍形象照",
    "mode": "auto"
  }'

# 記下回應中的 conversationId，在第二輪使用
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "多少錢？",
    "mode": "auto",
    "conversationId": "conv_xxxxx"
  }'
```

#### 測試 Critical FAQ（政策類問題）

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "如果我想改期或取消預約，要怎麼做？會收費嗎？",
    "mode": "faq_flow_price"
  }'
```

預期：應該直接返回 FAQ 答案，不經過 LLM。

#### 測試投訴處理

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "上次拍的照片我不滿意",
    "mode": "auto"
  }'
```

預期：應該使用投訴處理模板，不允許 LLM 自由生成補償方案。

#### 測試轉真人

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我們公司 20 個人要拍形象照，怎麼報價？",
    "mode": "auto"
  }'
```

預期：應該識別為 `handoff_to_human`，提供聯絡方式。

### 4. 測試 Rate Limiting

快速發送 61 個請求（超過 60 req/10min 限制）：

```bash
for i in {1..61}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}'
  echo ""
done
```

預期：第 61 個請求應該收到 429 狀態碼。

### 5. 測試錯誤處理

#### 無效請求格式

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"invalid": "request"}'
```

預期：應該收到 400 錯誤，說明缺少 `message` 欄位。

#### 無效 Origin

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -d '{"message": "test"}'
```

預期：應該收到 403 錯誤（如果設定了 Origin 驗證）。

## 測試場景

### 場景 1：新客戶諮詢

1. 使用者：「我想拍形象照」
   - 預期意圖：`service_inquiry`
   - 預期狀態：`INIT` → `COLLECTING_INFO`

2. 使用者：「我是準畢業生，主要是 LinkedIn 用」
   - 預期：提取 `persona: student_graduating`, `use_case: linkedin_resume`
   - 預期狀態：`COLLECTING_INFO` → `RECOMMENDING`

3. 使用者：「多少錢？」
   - 預期意圖：`price_inquiry`
   - 預期：應該從知識庫返回價格資訊

### 場景 2：價格敏感客戶

1. 使用者：「證件照多少錢？會不會很貴？」
   - 預期意圖：`price_inquiry`
   - 預期：返回價格範圍，強調「實際金額以現場公告為準」

### 場景 3：企業客戶

1. 使用者：「公司 20 個人要拍形象照，怎麼報價？」
   - 預期意圖：`handoff_to_human`
   - 預期：提供 Email/電話，不提供具體報價

### 場景 4：投訴處理

1. 使用者：「上次拍的照片我不滿意，可以退費嗎？」
   - 預期意圖：`complaint`
   - 預期：使用投訴處理模板，不承諾退費，引導至真人

### 場景 5：多輪對話上下文

1. 使用者：「我想拍形象照」
2. 使用者：「多少錢？」（沒有重複說「形象照」）
   - 預期：系統應該記住是「形象照」的價格詢問

## 驗收標準

- [ ] 健康檢查端點正常運作
- [ ] 基本聊天請求可以成功處理
- [ ] 多輪對話可以記住上下文
- [ ] Critical FAQ 直接返回，不經過 LLM
- [ ] 投訴處理使用模板
- [ ] 轉真人機制正確觸發
- [ ] Rate limiting 正常運作
- [ ] 錯誤處理正確（400, 403, 429, 500）
- [ ] 日誌記錄正常

