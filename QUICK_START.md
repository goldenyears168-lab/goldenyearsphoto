# AI 客服系統快速啟動指南

## 🚀 5 分鐘快速啟動

### 步驟 1：啟動後端 API

```bash
cd backend
cp .env.example .env
# 編輯 .env，填入你的 GEMINI_API_KEY
npm install
npm run dev
```

後端將在 `http://localhost:3000` 啟動。

### 步驟 2：啟動前端網站

```bash
# 在專案根目錄
npm run dev
```

前端將在 `http://localhost:8080` 啟動。

### 步驟 3：測試 Widget

1. 開啟瀏覽器訪問 `http://localhost:8080`
2. 點擊右下角的 💬 按鈕
3. 開始對話！

---

## 📁 專案結構

```
goldenyearsphoto/
├── backend/                 # 後端 API
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 業務邏輯（LLM, 知識庫, 上下文）
│   │   ├── middleware/     # 中間件（Rate Limit, 驗證, 錯誤處理）
│   │   └── utils/          # 工具（Logger）
│   └── package.json
│
├── knowledge/              # 知識庫 JSON 檔案
│   ├── services.json       # 服務資料
│   ├── personas.json       # 客戶角色
│   ├── policies.json       # 政策類 FAQ
│   ├── contact_info.json   # 聯絡資訊
│   └── schema_ids.md       # ID 一覽表
│
├── src/
│   ├── assets/
│   │   ├── js/
│   │   │   └── gy-chatbot.js    # 前端 Widget JS
│   │   └── css/
│   │       └── 3-components/
│   │           └── _c-gy-chatbot.scss  # Widget 樣式
│   └── _includes/
│       └── base-layout.njk      # 已整合 Widget
│
└── docs/
    ├── engineering_prompts.md   # 工程提示詞
    ├── webchatbotplan.md        # 前端規格
    ├── 客服知識庫 gemini.md     # 知識庫
    └── IMPLEMENTATION_STATUS.md # 實施狀態
```

---

## 🔧 環境變數設定

### 後端 (.env)

```env
NODE_ENV=development
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=https://www.goldenyearsphoto.com,http://localhost:8080
```

---

## ✅ 驗證系統運作

### 1. 檢查後端健康狀態

```bash
curl http://localhost:3000/health
```

預期回應：
```json
{
  "status": "ok",
  "knowledgeBase": { "loaded": true },
  "contextManager": { "activeContexts": 0 }
}
```

### 2. 測試聊天 API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "我想拍形象照"}'
```

### 3. 檢查前端 Widget

- 開啟 `http://localhost:8080`
- 確認右下角有 💬 按鈕
- 點擊按鈕，確認聊天窗可以開啟

---

## 🐛 常見問題

### Q: 後端啟動失敗，提示找不到知識庫檔案

**A:** 確認 `backend/knowledge` 符號連結存在：
```bash
cd backend
ls -la knowledge  # 應該顯示 -> ../knowledge
```

如果不存在，建立連結：
```bash
ln -sf ../knowledge knowledge
```

### Q: 前端 Widget 沒有顯示

**A:** 檢查：
1. 確認 `gy-chatbot.js` 已載入（檢查瀏覽器 Console）
2. 確認 CSS 已編譯（檢查 `_site/assets/css/main.css`）
3. 確認沒有 JavaScript 錯誤

### Q: API 回傳 503 錯誤

**A:** 檢查：
1. 確認 `GEMINI_API_KEY` 已設定
2. 確認 API Key 有效
3. 檢查後端日誌

---

## 📚 詳細文檔

- **實施狀態**：`docs/IMPLEMENTATION_STATUS.md`
- **下一步建議**：`docs/NEXT_STEPS.md`
- **測試指南**：`backend/TESTING.md`
- **工程提示詞**：`docs/engineering_prompts.md`

---

## 🎯 下一步

1. **測試系統**：按照 `backend/TESTING.md` 進行完整測試
2. **優化 NLU**：改用 LLM 進行意圖分類和實體提取（見 `docs/NEXT_STEPS.md`）
3. **部署上線**：準備部署到生產環境

---

**系統已準備就緒，可以開始使用！** 🎉

