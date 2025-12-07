# Pipeline MVP 測試指南

## 🎯 測試目標

驗證 Pipeline 框架的核心功能，確保：
1. Pipeline 框架正確工作
2. 節點可以正常執行和提前退出
3. 錯誤處理機制正確
4. 關鍵修正點正確實施

---

## 📋 測試步驟

### 步驟 1: 編譯檢查

```bash
cd functions/api
npx tsc --noEmit
```

**預期結果**: 無編譯錯誤

---

### 步驟 2: Linter 檢查

```bash
npm run lint
```

**預期結果**: 無 Linter 錯誤

---

### 步驟 3: 運行單元測試

```bash
# 如果使用 Jest
npm test -- pipeline-mvp.test.ts

# 或直接運行
node --test functions/api/__tests__/pipeline-mvp.test.ts
```

**預期結果**: 所有測試通過

---

### 步驟 4: 手動測試 MVP 端點

#### 4.1 測試 OPTIONS 請求

```bash
curl -X OPTIONS http://localhost:8788/api/chat-mvp \
  -H "Origin: http://localhost:8080" \
  -v
```

**預期結果**:
- 狀態碼: 204
- CORS headers 正確

#### 4.2 測試驗證錯誤

```bash
# 測試無效 Content-Type
curl -X POST http://localhost:8788/api/chat-mvp \
  -H "Content-Type: text/plain" \
  -d "test" \
  -v

# 預期: 400 狀態碼
```

```bash
# 測試空 message
curl -X POST http://localhost:8788/api/chat-mvp \
  -H "Content-Type: application/json" \
  -d '{"message": ""}' \
  -v

# 預期: 400 狀態碼，錯誤訊息 "message 欄位為必填且不能為空"
```

#### 4.3 測試正常請求（僅驗證和初始化）

```bash
curl -X POST http://localhost:8788/api/chat-mvp \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"message": "你好"}' \
  -v
```

**預期結果**:
- 狀態碼: 200
- 響應包含 success: true
- 響應包含 nodesExecuted 數組
- 響應包含 logs 數組

**檢查日誌**:
- 應該看到 Pipeline 節點執行日誌
- 日誌格式: `[Pipeline:節點名] [級別] 訊息 (時間ms)`

---

### 步驟 5: 驗證關鍵修正點

#### 5.1 驗證 setKnowledgeBase 調用時機

**檢查方法**:
1. 在 `node_initializeServices` 中添加詳細日誌
2. 執行測試請求
3. 檢查日誌順序

**預期日誌順序**:
```
[Chat] Loading knowledge base...
[Chat] Knowledge base loaded successfully
[Pipeline:initializeServices] [INFO] After setKnowledgeBase
[Chat] Initializing services...
```

#### 5.2 驗證錯誤重新拋出

**測試方法**:
1. 模擬知識庫載入失敗（修改請求 URL 為無效地址）
2. 執行請求
3. 檢查錯誤是否傳播到外層

**預期結果**:
- 節點拋出錯誤
- 外層 catch 捕獲錯誤
- 執行 `handlePipelineError`
- 返回 500 錯誤響應

#### 5.3 驗證錯誤處理格式

**測試方法**:
觸發一個錯誤，檢查響應格式

**預期響應**:
```json
{
  "reply": "...",
  "intent": "handoff_to_human",
  "updatedContext": {
    "last_intent": "handoff_to_human",
    "slots": {}
  }
}
```

**狀態碼**: 500

---

## 📊 測試結果記錄

### 測試結果表格

| 測試項 | 預期結果 | 實際結果 | 狀態 |
|--------|----------|----------|------|
| 編譯檢查 | 無錯誤 | | ⬜ |
| Linter 檢查 | 無錯誤 | | ⬜ |
| OPTIONS 請求 | 204 | | ⬜ |
| 驗證錯誤 | 400 | | ⬜ |
| 正常請求 | 200 | | ⬜ |
| setKnowledgeBase 時機 | 正確 | | ⬜ |
| 錯誤重新拋出 | 正確 | | ⬜ |
| 錯誤處理格式 | 正確 | | ⬜ |

---

## ✅ MVP 通過標準

### 必須全部通過

- [ ] 編譯無錯誤
- [ ] Linter 無錯誤
- [ ] 所有單元測試通過
- [ ] OPTIONS 請求正確處理
- [ ] 所有驗證錯誤正確處理（9 個驗證點）
- [ ] 正常請求可以執行到服務初始化
- [ ] setKnowledgeBase 正確調用
- [ ] 錯誤正確重新拋出
- [ ] 錯誤處理格式與原實現一致

### 如果通過

✅ **可以繼續階段 1**

記錄測試結果，開始實施完整的節點拆分。

### 如果失敗

❌ **停止重構，修復問題**

1. 記錄失敗原因
2. 修復問題
3. 重新驗證
4. 如果無法修復，重新評估方案

---

## 🐛 常見問題排查

### 問題 1: 模塊導入錯誤

**錯誤**: `Cannot find module '../chat.js'`

**解決方案**:
- 檢查導入路徑是否正確
- 確保函數已正確導出

### 問題 2: TypeScript 類型錯誤

**錯誤**: `Type 'X' is not assignable to type 'Y'`

**解決方案**:
- 檢查 PipelineContext 類型定義
- 確保所有類型匹配

### 問題 3: 節點不執行

**原因**: 前面的節點返回了 Response

**解決方案**:
- 檢查前面的節點是否提前退出
- 查看日誌確認執行順序

---

## 📝 下一步

如果 MVP 驗證通過：

1. ✅ 記錄測試結果
2. ✅ 更新計劃書狀態
3. → 開始階段 1: 基礎框架完善
4. → 開始階段 2: 完整節點拆分

---

**文檔版本**: v1.0
**最後更新**: 2025-01-20

