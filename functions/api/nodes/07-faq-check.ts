/**
 * 節點 7: FAQ 檢查
 * 統一 FAQ 檢查處理和菜單選擇的 FAQ 匹配
 */

import { PipelineContext } from '../lib/pipeline.js';
import { buildResponse, handleFAQIfNeeded } from '../chat.js';

/**
 * FAQ 檢查節點
 */
export async function node_faqCheck(ctx: PipelineContext): Promise<PipelineContext | Response> {
  if (!ctx.intent) {
    throw new Error('Intent not extracted');
  }

  if (!ctx.body) {
    throw new Error('Request body not validated');
  }

  if (!ctx.knowledgeBase) {
    throw new Error('KnowledgeBase not initialized');
  }

  if (!ctx.conversationContext) {
    throw new Error('ConversationContext not initialized');
  }

  if (!ctx.mergedEntities) {
    throw new Error('Merged entities not calculated');
  }

  if (!ctx.contextManager) {
    throw new Error('ContextManager not initialized');
  }

  if (!ctx.nextState) {
    throw new Error('Next state not determined');
  }

  // 統一 FAQ 檢查處理（減少重複代碼）
  // 注意：對於「如何預約」這類問題，不直接使用 FAQ，而是讓 LLM 處理以確保提供預約連結
  // 對於「價格詢問」，只有明確問政策時才用 FAQ，一般「多少錢」直接回答價格
  const faqResponse = handleFAQIfNeeded(
    ctx.intent,
    ctx.body.message,
    ctx.knowledgeBase,
    ctx.conversationContext,
    ctx.mergedEntities,
    ctx.contextManager,
    ctx.corsHeaders,
    ctx.nextState
  );
  
  if (faqResponse) {
    return faqResponse;
  }

  // 處理菜單選擇的消息：優先使用 FAQ 匹配
  // 當 source === 'menu' 時，優先使用 FAQ 匹配，匹配成功直接返回，不調用 LLM
  if (ctx.body.source === 'menu') {
    console.log('[Chat] Menu source detected, prioritizing FAQ match');
    const faqResults = ctx.knowledgeBase.searchFAQDetailed(ctx.body.message);
    
    if (faqResults && faqResults.length > 0) {
      // 找到匹配的 FAQ，使用統一響應構建函數
      const matchedFAQ = faqResults[0]; // 取分數最高的
      console.log('[Chat] FAQ matched:', matchedFAQ.id);
      
      return buildResponse(
        matchedFAQ.answer,
        ctx.intent,
        ctx.conversationContext.conversationId,
        ctx.mergedEntities,
        ctx.contextManager,
        ctx.knowledgeBase,
        ctx.body.message,
        ctx.corsHeaders,
        ctx.nextState
      );
    } else {
      // FAQ 匹配失敗，繼續使用 LLM 處理（作為 fallback）
      console.log('[Chat] FAQ match failed, falling back to LLM');
    }
  }

  // 沒有匹配的 FAQ，繼續流程
  return ctx;
}

