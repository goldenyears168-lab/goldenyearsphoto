# 好時有影 AI 客服知識庫

## 📋 概述

本目錄包含好時有影 AI 客服系統的所有知識庫數據文件。**JSON 檔案是單一事實來源**，系統直接從這些檔案載入數據。

## 📁 檔案結構

### 核心數據檔案

- **`services.json`** - 服務基本資訊（價格、時長、特色等）
- **`personas.json`** - 客戶角色分析（目標客群、推薦服務等）
- **`policies.json`** - 重要政策和FAQ（價格範圍、改期規則、隱私政策等）
- **`contact_info.json`** - 聯絡資訊（分店地址、營業時間、聯絡方式等）
- **`faq_detailed.json`** - 詳細FAQ問答集（56+ 個常見問題，分類整理）
- **`response_templates.json`** - 三段式回覆模板（主要回答、補充資訊、下一步動作）
- **`service_summaries.json`** - 服務摘要（快速查詢用）
- **`emotion_templates.json`** - 情緒場景模板（緊張、焦慮、不滿意等情境）
- **`intent_nba_mapping.json`** - 意圖對應表（意圖 → 下一步最佳動作）

## 🔄 單一事實來源原則

**重要**：所有知識庫內容應直接在 JSON 檔案中編輯。

- ✅ **JSON 檔案是數據源**：系統直接從 JSON 載入數據
- ✅ **直接編輯 JSON**：更新內容時，直接修改對應的 JSON 檔案
- ✅ **驗證優先**：任何變更都必須通過 `npm run validate-knowledge` 檢查
- ❌ **不要依賴 MD 文件**：`docs/客服知識庫 gemini.md` 僅為參考文檔

## 📝 更新流程

### 1. 編輯對應的 JSON 檔案

根據變更類型選擇對應檔案：
- 價格變更 → `services.json`
- 營業時間/地址 → `contact_info.json`
- FAQ 問題 → `faq_detailed.json` 或 `policies.json`
- 回覆模板 → `response_templates.json`

### 2. 更新 `last_updated` 日期

每個 JSON 檔案都有 `last_updated` 欄位，記得更新為當前日期（格式：`YYYY-MM-DD`）。

### 3. 執行驗證

```bash
npm run validate-knowledge
```

### 4. 測試（建議）

```bash
npm run diagnose-chatbot
```

## 📊 FAQ 統計

目前 `faq_detailed.json` 包含：

- **預約問題**：14 個問題
- **交件問題**：13 個問題
- **拍攝&服飾問題**：17 個問題
- **基本資訊**：4 個問題
- **價格、費用、付款**：8 個問題
- **造型、妝髮、服裝**：10 個問題
- **修圖與後製**：12 個問題
- **授權與隱私**：6 個問題
- **特殊拍攝服務**：6 個問題
- **企業與商業合作**：6 個問題
- **情緒安撫與信任建立**：8 個問題
- **比較與差異化**：4 個問題
- **例外狀況與補救**：5 個問題
- **其他問題**：10 個問題

**總計：123 個 FAQ 問題**

## 🔍 檔案說明

### `faq_detailed.json`

包含詳細的FAQ問答，結構如下：

```json
{
  "categories": {
    "booking": {
      "title": "預約問題",
      "phone_handling": { ... },  // 電話接聽流程指南
      "questions": [ ... ]         // FAQ 問題列表
    },
    "delivery": { ... },
    "shooting": { ... },
    "general": { ... },
    "pricing": { ... },
    "other": {
      "questions": [ ... ],
      "internal_operations": { ... }  // 內部操作指南
    }
  }
}
```

每個問題包含：
- `id`: 唯一識別碼
- `question`: 問題內容
- `answer`: 答案內容
- `keywords`: 關鍵字陣列（用於搜尋匹配）
- `critical_note`: （可選）重要備註
- `handling_guideline`: （可選）處理指南

### 其他檔案

詳細結構請參考各 JSON 檔案的註解或 `docs/客服知識庫 gemini.md`（參考文檔）。

## ⚠️ 注意事項

1. **JSON 格式**：確保 JSON 格式正確，可以使用 `npm run validate-knowledge` 檢查
2. **ID 唯一性**：所有 ID 必須唯一，且符合 `schema_ids.md` 中的定義
3. **關鍵字**：為每個 FAQ 問題添加適當的關鍵字，有助於 AI 匹配
4. **版本控制**：每次變更都要更新 `last_updated` 並提交清晰的 commit message

## 🔗 相關文檔

- `docs/客服知識庫 gemini.md` - 參考文檔（架構說明、對話流程等）
- `knowledge/schema_ids.md` - ID 定義規範

## 📞 聯絡

如有問題或建議，請聯絡開發團隊。

