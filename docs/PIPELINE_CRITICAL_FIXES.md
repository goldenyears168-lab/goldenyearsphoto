# Pipeline 重構關鍵修正清單

## ⚠️ 必須修正的關鍵點

本文檔列出 Pipeline 重構方案中必須修正的關鍵點，以確保 100% 結果一致性。

---

## 🔴 關鍵修正 1: setKnowledgeBase 調用時機

### 問題
`setKnowledgeBase(kb)` 必須在知識庫載入後立即調用（現有代碼行 556），影響 `responseTemplates` 模塊。

### 修正方案
```typescript
async function node_initializeServices(ctx: PipelineContext): Promise<PipelineContext> {
  try {
    ctx.knowledgeBase = await loadKnowledgeBase(ctx.request);
    
    // ⚠️ 關鍵：必須立即調用，不能延遲
    setKnowledgeBase(ctx.knowledgeBase);
    
    ctx.llmService = initLLMService(ctx.env);
    ctx.contextManager = initContextManager();
    
    return ctx;
  } catch (error) {
    // 知識庫錯誤必須重新拋出
    throw error;
  }
}
```

### 驗證
- [ ] 確保在所有使用 `responseTemplates` 之前已調用
- [ ] 測試驗證 responseTemplates 可以正常訪問知識庫

---

## 🔴 關鍵修正 2: LLM 不可用的特殊響應格式

### 問題
當 LLM 服務不可用時（行 715-729），返回格式與 `buildResponse` 不同：
- 狀態碼: 503
- 無 `suggestedQuickReplies` 欄位

### 修正方案
```typescript
async function node_llmGeneration(ctx: PipelineContext): Promise<PipelineContext | Response> {
  // ⚠️ 特殊情況：LLM 不可用時不能使用 buildResponse
  if (!ctx.llmService) {
    return new Response(
      JSON.stringify({
        reply: getApiErrorTemplate(),
        intent: 'handoff_to_human',
        conversationId: ctx.conversationContext!.conversationId,
        updatedContext: {
          last_intent: 'handoff_to_human',
          slots: ctx.mergedEntities!,
        },
        // ⚠️ 注意：無 suggestedQuickReplies 欄位
      }),
      { 
        status: 503, // ⚠️ 特殊狀態碼
        headers: { 
          ...ctx.corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
  
  // 正常 LLM 生成流程...
}
```

### 驗證
- [ ] 測試 LLM 不可用場景
- [ ] 驗證響應格式與現有實現完全一致
- [ ] 確認狀態碼為 503
- [ ] 確認無 suggestedQuickReplies

---

## 🔴 關鍵修正 3: 超時處理的資源清理

### 問題
LLM 超時處理（行 752-776）必須確保清理 `timeoutId`，防止內存泄漏。

### 修正方案
```typescript
async function node_llmGeneration(ctx: PipelineContext): Promise<PipelineContext> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  try {
    const replyPromise = ctx.llmService!.generateReply(/* ... */);
    const timeoutPromise = new Promise<string>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS);
    });
    
    try {
      ctx.reply = await Promise.race([replyPromise, timeoutPromise]) as string;
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        ctx.reply = getTimeoutTemplate();
      } else {
        // ⚠️ 非超時錯誤必須重新拋出
        throw error;
      }
    } finally {
      // ⚠️ 關鍵：無論成功或失敗都必須清理
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  } catch (error) {
    // ⚠️ 確保在 catch 中也清理
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    throw error; // 重新拋出給外層處理
  }
  
  return ctx;
}
```

### 驗證
- [ ] 測試正常流程，確保 timeoutId 被清理
- [ ] 測試超時場景，確保 timeoutId 被清理
- [ ] 測試錯誤場景，確保 timeoutId 被清理
- [ ] 內存泄漏測試

---

## 🔴 關鍵修正 4: 錯誤重新拋出機制

### 問題
某些錯誤必須重新拋出，由外層統一處理：
- 知識庫載入錯誤（行 552）
- LLM 錯誤（非超時，行 774）

### 修正方案
Pipeline 框架需要支持錯誤傳播：

```typescript
class Pipeline {
  async execute(context: PipelineContext): Promise<Response> {
    for (const { name, node } of this.nodes) {
      try {
        const result = await node(context);
        
        // 如果是 Response，直接返回（提前退出）
        if (result instanceof Response) {
          this.log(context, name, 'SUCCESS', 'Returned response, pipeline terminated');
          return result;
        }
        
        // 更新上下文
        context = result;
        this.log(context, name, 'SUCCESS', 'Node completed');
        
      } catch (error) {
        // ⚠️ 關鍵：節點錯誤必須重新拋出，由外層統一處理
        this.log(context, name, 'ERROR', `Node failed: ${error}`);
        throw error; // 不要捕獲，讓外層處理
      }
    }
    
    throw new Error('Pipeline execution completed without returning a response');
  }
}
```

### 驗證
- [ ] 測試知識庫錯誤是否正確傳播到外層
- [ ] 測試 LLM 錯誤是否正確傳播到外層
- [ ] 驗證外層錯誤處理邏輯正確執行

---

## 🔴 關鍵修正 5: 外層錯誤處理完全復現

### 問題
外層 catch 塊（行 794-832）有詳細的錯誤日誌和特殊處理，必須完全復現。

### 修正方案
```typescript
export async function onRequestPost(context: {
  request: Request;
  env: any;
  waitUntil: (promise: Promise<any>) => void;
}): Promise<Response> {
  const startTime = Date.now();
  const corsHeaders = buildCorsHeaders(context.request);
  
  // OPTIONS 處理...
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  // Pipeline 初始化...
  const pipeline = new ChatRequestPipeline();
  const pipelineContext: PipelineContext = {
    request: context.request,
    env: context.env,
    corsHeaders,
    startTime,
    logs: []
  };
  
  try {
    return await pipeline.execute(pipelineContext);
  } catch (error) {
    // ⚠️ 關鍵：必須完全復現現有的錯誤處理邏輯
    
    // 1. 詳細錯誤日誌（行 796-804）
    console.error('[Chat Error] ========== ERROR START ==========');
    console.error('[Chat Error] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Chat Error] Error message:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      const stackPreview = error.stack.substring(0, 200);
      console.error('[Chat Error] Error stack preview:', stackPreview);
    }
    
    // 2. 知識庫錯誤特殊處理（行 806-813）
    if (error instanceof Error && error.message.includes('Failed to load knowledge base')) {
      console.error('[Chat Error] Knowledge base loading failed - this is likely the root cause');
      console.error('[Chat Error] Please check:');
      console.error('[Chat Error] 1. Knowledge files exist in _site/knowledge/ after build');
      console.error('[Chat Error] 2. Knowledge files are accessible via HTTP');
      console.error('[Chat Error] 3. Base URL is correctly constructed');
    }
    
    // 3. LLM 錯誤特殊處理（行 815-819）
    if (error instanceof Error && (error.message.includes('GEMINI_API_KEY') || error.message.includes('LLM'))) {
      console.error('[Chat Error] LLM service initialization failed');
      console.error('[Chat Error] Please check GEMINI_API_KEY environment variable in Cloudflare Pages');
    }
    
    console.error('[Chat Error] ========== ERROR END ==========');
    
    // 4. 錯誤響應（行 823-832）
    return new Response(
      JSON.stringify({
        reply: getApiErrorTemplate(),
        intent: 'handoff_to_human',
        updatedContext: {
          last_intent: 'handoff_to_human',
          slots: {},
        },
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}
```

### 驗證
- [ ] 對比重構前後的錯誤日誌格式
- [ ] 測試所有錯誤場景
- [ ] 驗證錯誤響應格式

---

## 🔴 關鍵修正 6: 響應時間日誌

### 問題
正常流程結束時（行 779-780）需要記錄響應時間。

### 修正方案
```typescript
async function node_buildFinalResponse(ctx: PipelineContext): Promise<Response> {
  const responseTime = Date.now() - ctx.startTime;
  console.log(`[Chat] ${ctx.intent} - ${responseTime}ms`);
  
  return buildResponse(
    ctx.reply!,
    ctx.intent!,
    ctx.conversationContext!.conversationId,
    ctx.mergedEntities!,
    ctx.contextManager!,
    ctx.knowledgeBase!,
    ctx.body.message,
    ctx.corsHeaders,
    ctx.nextState
  );
}
```

### 驗證
- [ ] 驗證響應時間日誌格式
- [ ] 確認 intent 正確記錄

---

## ✅ 完整驗證清單

### 功能測試
- [ ] OPTIONS 請求返回 204
- [ ] 所有驗證錯誤返回 400，格式正確
- [ ] 知識庫錯誤正確處理和日誌
- [ ] setKnowledgeBase 正確調用
- [ ] 上下文創建邏輯正確
- [ ] 意圖分類和實體提取正確
- [ ] 狀態轉換 fallback 正確
- [ ] Line 詢問正確處理
- [ ] 投訴和轉真人正確處理
- [ ] FAQ 檢查正確
- [ ] 菜單選擇正確處理
- [ ] LLM 不可用返回 503，格式正確
- [ ] LLM 超時正確處理，資源清理
- [ ] 正常響應格式正確
- [ ] 錯誤響應格式正確

### 性能測試
- [ ] 響應時間記錄正確
- [ ] 超時處理邏輯正確
- [ ] 無內存泄漏（timeoutId 清理）

### 對比測試
- [ ] 重構前後響應完全對比（JSON 結構）
- [ ] 重構前後狀態碼對比
- [ ] 重構前後日誌格式對比

---

## 📋 實施檢查點

在每個階段完成後，必須驗證：

### 階段 1 完成後
- [ ] Pipeline 框架支持提前退出（返回 Response）
- [ ] Pipeline 框架支持錯誤重新拋出
- [ ] 日誌系統正常工作

### 階段 2 完成後
- [ ] 所有節點實現關鍵修正
- [ ] 節點順序正確
- [ ] 數據依賴正確

### 階段 3 完成後
- [ ] 主流程與現有實現對比測試通過
- [ ] 所有提前退出點正確
- [ ] 錯誤處理正確

### 階段 4 完成後
- [ ] 日誌格式符合要求
- [ ] 響應時間記錄正確

### 階段 5 完成後
- [ ] 所有測試通過
- [ ] 性能達標
- [ ] 文檔完整

---

**文檔版本**: v1.0
**最後更新**: 2025-01-20

