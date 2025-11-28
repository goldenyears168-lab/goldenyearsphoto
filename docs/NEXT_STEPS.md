# 下一步實施建議

## 當前狀態

### ✅ 已完成
1. **後端基礎架構** - 完成
   - API 路由、中間件、錯誤處理
   - Rate limiting、請求驗證
   - 日誌記錄

2. **知識庫系統** - 完成
   - JSON 結構化資料
   - 知識庫載入服務
   - 驗證腳本

3. **LLM 整合** - 完成
   - Gemini API 整合
   - System Prompt 約束
   - 回覆生成

4. **多輪對話** - 完成
   - 上下文管理器
   - 狀態機
   - 歷史記錄

5. **基礎 NLU** - 完成（基礎版）
   - 關鍵字匹配的意圖分類
   - 關鍵字匹配的實體提取

### ⚠️ 待優化
1. **意圖分類與實體提取** - 目前是基礎版本
   - 可改用 LLM 提升準確率
   - 處理複雜表達和上下文

2. **FAQ 匹配** - 基礎版本
   - 可優化搜尋演算法
   - 支援向量搜尋（未來）

### ❌ 待實現
1. **前端 Widget** - 尚未實現
   - 這是用戶直接接觸的部分，優先級最高

---

## 建議優先順序

### 🎯 Phase 1: 前端 Widget 開發（最高優先級）

**原因：**
- 用戶直接接觸的界面
- 後端 API 已就緒，可以立即測試
- 完成後可以進行端到端測試

**任務：**
1. 實現 `src/assets/js/gy-chatbot.js`
2. 實現 `src/assets/css/gy-chatbot.css`
3. 整合到 Eleventy layout
4. 測試與後端 API 的連接

**預估時間：** 2-3 小時

---

### 🔧 Phase 2: 優化 NLU（中優先級）

**原因：**
- 提升系統準確率
- 改善用戶體驗

**任務：**
1. 實現 `backend/src/services/intentClassifier.ts`（使用 LLM）
2. 實現 `backend/src/services/entityExtractor.ts`（使用 LLM）
3. 建立 `backend/entity_dictionary.json`（作為 fallback）
4. 整合到 `/api/chat` 路由

**預估時間：** 3-4 小時

---

### 📚 Phase 3: FAQ 匹配優化（低優先級）

**原因：**
- 目前基礎版本已可用
- 可後續優化

**任務：**
1. 優化關鍵字匹配演算法
2. 加入同義詞支援
3. 未來可加入向量搜尋

**預估時間：** 2-3 小時

---

## 立即開始：前端 Widget 開發

根據 `docs/webchatbotplan.md` 的規格，開始實現前端 Widget。

