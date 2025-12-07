# Pipeline MVP 驗證檢查清單

## 📋 階段 0 MVP 驗證目標

驗證 Pipeline 框架可行性，確保關鍵修正點正確實施。

---

## ✅ 驗證清單

### 1. Pipeline 框架基礎功能

#### 1.1 節點執行順序
- [ ] 節點按註冊順序執行
- [ ] 節點可以返回 PipelineContext 繼續流程
- [ ] 節點可以返回 Response 提前結束流程
- [ ] 後續節點在提前退出時不執行

**測試方法**:
```typescript
// 執行 pipeline，檢查日誌中的節點執行順序
const result = await pipeline.execute(context);
console.log(context.logs.map(l => l.node));
```

#### 1.2 錯誤處理機制
- [ ] 節點錯誤正確傳播到外層
- [ ] 錯誤日誌正確記錄
- [ ] 錯誤不會阻止後續節點（如果已在 try-catch 中）

**測試方法**:
```typescript
// 在節點中拋出錯誤，檢查是否正確傳播
const errorNode = async (ctx) => { throw new Error('test'); };
pipeline.addNode('error', errorNode);
await expect(pipeline.execute(ctx)).rejects.toThrow();
```

#### 1.3 日誌系統
- [ ] 每個節點執行都有日誌記錄
- [ ] 日誌包含節點名稱、級別、訊息、時間戳
- [ ] 日誌包含執行時間（duration）
- [ ] console 輸出格式正確

**測試方法**:
```typescript
// 檢查 context.logs 數組
expect(context.logs.length).toBeGreaterThan(0);
expect(context.logs[0]).toMatchObject({
  node: expect.any(String),
  level: expect.stringMatching(/INFO|SUCCESS|ERROR|WARN/),
  message: expect.any(String),
  timestamp: expect.any(Number),
});
```

---

### 2. 節點 1: 請求驗證

#### 2.1 OPTIONS 請求處理
- [ ] OPTIONS 請求返回 204 狀態碼
- [ ] 響應包含正確的 CORS headers
- [ ] 響應體為 null

**對比測試**:
```bash
# 原實現
curl -X OPTIONS http://localhost/api/chat -H "Origin: http://localhost:8080"

# Pipeline 實現
# 應該返回相同的響應
```

#### 2.2 Content-Type 驗證
- [ ] 缺少 Content-Type 返回 400
- [ ] Content-Type 不是 application/json 返回 400
- [ ] 錯誤響應格式與原實現一致

**測試用例**:
- [ ] Content-Type: text/plain → 400
- [ ] Content-Type: application/xml → 400
- [ ] 無 Content-Type header → 400

#### 2.3 JSON 解析驗證
- [ ] 無效 JSON 返回 400
- [ ] 錯誤訊息格式與原實現一致

**測試用例**:
- [ ] 空 body → 400
- [ ] 無效 JSON `{invalid}` → 400
- [ ] 缺少 message 欄位 → 400

#### 2.4 參數驗證（9 個驗證點）
- [ ] message 為空 → 400
- [ ] message 長度 > 1000 → 400
- [ ] conversationId 格式錯誤 → 400
- [ ] mode 值錯誤 → 400
- [ ] source 值錯誤 → 400
- [ ] pageType 值錯誤 → 400
- [ ] 所有驗證通過 → 繼續流程

**對比測試**:
```typescript
// 對比原實現和 Pipeline 實現的響應
const originalResponse = await originalOnRequestPost(request);
const pipelineResponse = await pipelineOnRequestPost(request);

// JSON 結構必須完全一致
expect(JSON.parse(await pipelineResponse.text())).toEqual(
  JSON.parse(await originalResponse.text())
);

// 狀態碼必須一致
expect(pipelineResponse.status).toBe(originalResponse.status);
```

---

### 3. 節點 2: 服務初始化

#### 3.1 ⚠️ 關鍵修正 1: setKnowledgeBase 調用時機
- [ ] 知識庫載入後立即調用 setKnowledgeBase(kb)
- [ ] setKnowledgeBase 在 LLM 初始化之前調用
- [ ] setKnowledgeBase 在 ContextManager 初始化之前調用

**驗證方法**:
```typescript
// 在節點中添加日誌
console.log('Before setKnowledgeBase');
setKnowledgeBase(kb);
console.log('After setKnowledgeBase');

// 檢查日誌順序
// 應該在 "Knowledge base loaded successfully" 之後立即執行
```

**測試**:
- [ ] 檢查日誌順序正確
- [ ] 驗證 responseTemplates 可以訪問知識庫

#### 3.2 ⚠️ 關鍵修正 4: 錯誤重新拋出
- [ ] 知識庫載入錯誤正確拋出
- [ ] 錯誤傳播到外層 catch
- [ ] 外層錯誤處理正確執行

**測試方法**:
```typescript
// 模擬知識庫載入失敗
const mockRequest = {
  url: 'http://invalid-url/knowledge/services.json',
};

// 應該拋出錯誤，不返回 Response
await expect(node_initializeServices(ctx)).rejects.toThrow();
```

#### 3.3 服務初始化正確性
- [ ] KnowledgeBase 正確載入
- [ ] LLMService 正確初始化（如果 API key 存在）
- [ ] ContextManager 正確初始化

**驗證**:
- [ ] ctx.knowledgeBase 不為 undefined
- [ ] ctx.llmService 可能為 null（如果無 API key）
- [ ] ctx.contextManager 不為 undefined

---

### 4. 節點 99: 錯誤處理

#### 4.1 ⚠️ 關鍵修正 5: 完全復現錯誤日誌
- [ ] 錯誤日誌格式與原實現完全一致
- [ ] 包含 "========== ERROR START =========="
- [ ] 包含錯誤類型、訊息、堆棧預覽
- [ ] 包含 "========== ERROR END =========="

**對比測試**:
```typescript
// 對比錯誤日誌輸出
const originalError = new Error('Test error');
const originalLogs = captureConsoleLogs(() => {
  // 原實現的錯誤處理
});

const pipelineLogs = captureConsoleLogs(() => {
  handlePipelineError(originalError, ctx);
});

expect(pipelineLogs).toEqual(originalLogs);
```

#### 4.2 知識庫錯誤特殊處理
- [ ] 知識庫錯誤有特殊日誌訊息
- [ ] 包含 "Knowledge base loading failed - this is likely the root cause"
- [ ] 包含 3 個檢查提示

**測試**:
```typescript
const kbError = new Error('Failed to load knowledge base');
const logs = captureConsoleLogs(() => {
  handlePipelineError(kbError, ctx);
});

expect(logs).toContain('Knowledge base loading failed');
expect(logs).toContain('1. Knowledge files exist');
```

#### 4.3 LLM 錯誤特殊處理
- [ ] LLM 錯誤有特殊日誌訊息
- [ ] 包含 "LLM service initialization failed"
- [ ] 包含 GEMINI_API_KEY 檢查提示

**測試**:
```typescript
const llmError = new Error('GEMINI_API_KEY is required');
const logs = captureConsoleLogs(() => {
  handlePipelineError(llmError, ctx);
});

expect(logs).toContain('LLM service initialization failed');
expect(logs).toContain('GEMINI_API_KEY');
```

#### 4.4 錯誤響應格式
- [ ] 響應狀態碼為 500
- [ ] 響應包含正確的 JSON 結構
- [ ] intent 為 'handoff_to_human'
- [ ] updatedContext 格式正確
- [ ] 與原實現完全一致

**對比測試**:
```typescript
const error = new Error('Test error');
const originalResponse = /* 原實現的錯誤響應 */;
const pipelineResponse = handlePipelineError(error, ctx);

expect(pipelineResponse.status).toBe(originalResponse.status);
expect(await pipelineResponse.json()).toEqual(await originalResponse.json());
```

---

## 🎯 對比測試腳本

### 自動化對比測試

創建一個對比測試腳本，驗證 Pipeline MVP 與原實現的響應一致性：

```typescript
// functions/api/__tests__/comparison.test.ts

describe('Pipeline vs Original Implementation Comparison', () => {
  const testCases = [
    {
      name: 'OPTIONS request',
      request: new Request('http://localhost/api/chat', { method: 'OPTIONS' }),
      expectedStatus: 204,
    },
    {
      name: 'Invalid Content-Type',
      request: new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
      }),
      expectedStatus: 400,
    },
    {
      name: 'Empty message',
      request: new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      }),
      expectedStatus: 400,
    },
    // ... 更多測試用例
  ];

  testCases.forEach(({ name, request, expectedStatus }) => {
    it(`should match original for: ${name}`, async () => {
      // 執行原實現
      const originalResponse = await originalOnRequestPost({ request, env: {}, waitUntil: () => {} });
      
      // 執行 Pipeline 實現
      const pipelineResponse = await pipelineOnRequestPost({ request, env: {}, waitUntil: () => {} });
      
      // 對比狀態碼
      expect(pipelineResponse.status).toBe(originalResponse.status);
      expect(pipelineResponse.status).toBe(expectedStatus);
      
      // 對比響應體（如果狀態碼相同）
      if (originalResponse.status === pipelineResponse.status) {
        const originalBody = await originalResponse.text();
        const pipelineBody = await pipelineResponse.text();
        
        if (originalBody && pipelineBody) {
          const originalJson = JSON.parse(originalBody);
          const pipelineJson = JSON.parse(pipelineBody);
          expect(pipelineJson).toEqual(originalJson);
        }
      }
    });
  });
});
```

---

## ✅ 驗收標準

### MVP 通過標準

- [ ] ✅ 所有單元測試通過
- [ ] ✅ 所有對比測試通過（響應 100% 一致）
- [ ] ✅ 所有關鍵修正點驗證通過
- [ ] ✅ 日誌格式正確且可讀
- [ ] ✅ 無 TypeScript 編譯錯誤
- [ ] ✅ 無 Linter 錯誤

### 如果 MVP 失敗

1. **記錄失敗原因**
2. **修復問題**
3. **重新驗證**
4. **如果無法修復，停止重構並重新評估方案**

---

## 📝 驗證報告模板

```markdown
# Pipeline MVP 驗證報告

## 驗證日期
2025-01-20

## 驗證結果
✅ 通過 / ❌ 失敗

## 測試結果摘要
- 單元測試: X/Y 通過
- 對比測試: X/Y 通過
- 關鍵修正點驗證: X/6 通過

## 發現的問題
1. 問題描述
2. 問題描述

## 建議
- 建議 1
- 建議 2

## 結論
✅ 可以繼續階段 1 / ❌ 需要修復後重新驗證
```

---

**文檔版本**: v1.0
**最後更新**: 2025-01-20

