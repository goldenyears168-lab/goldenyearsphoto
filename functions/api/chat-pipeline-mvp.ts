/**
 * MVP 版本：使用 Pipeline 模式的聊天處理
 * 這個文件用於階段 0 驗證，不替換原有 chat.ts
 */

import { Pipeline, PipelineContext } from './lib/pipeline.js';
import { node_validateRequest, node_initializeServices, handlePipelineError } from './nodes/index.js';

/**
 * MVP 版本的 onRequestPost（使用 Pipeline）
 * 只實現前 3 個節點進行驗證
 */
export async function onRequestPostMVP(context: {
  request: Request;
  env: any;
  waitUntil: (promise: Promise<any>) => void;
}): Promise<Response> {
  const startTime = Date.now();

  // 創建 Pipeline
  const pipeline = new Pipeline({
    enableDetailedLogging: true,
    logLevel: 'INFO',
  });

  // 註冊節點（MVP 版本只有 3 個節點）
  pipeline.addNode('validateRequest', node_validateRequest);
  pipeline.addNode('initializeServices', node_initializeServices);
  // 注意：MVP 版本只到服務初始化，不包含完整流程
  // 後續節點將在階段 2 中添加

  // 初始化 PipelineContext
  const pipelineContext: PipelineContext = {
    request: context.request,
    env: context.env,
    corsHeaders: {},
    startTime,
    logs: [],
  };

  try {
    // ⚠️ MVP 版本：執行 Pipeline
    // 由於 MVP 只有 2 個節點（驗證和初始化），且都不返回 Response
    // 所以 Pipeline 執行完成後會拋出錯誤（這是正常的）
    // 我們需要手動處理這種情況
    
    try {
      // 嘗試執行 Pipeline
      const response = await pipeline.execute(pipelineContext);
      
      // 如果有節點提前返回 Response（例如驗證錯誤），直接返回
      return response;
    } catch (error) {
      // 檢查是否是預期的錯誤（節點未返回 Response）
      if (error instanceof Error && error.message.includes('without returning a response')) {
        // MVP 階段：這表示所有節點執行成功，但沒有返回響應
        // 這是正常的 MVP 行為，因為我們只實現了 2 個節點
        // 返回成功響應表示 MVP 驗證通過
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Pipeline MVP test passed - all nodes executed successfully',
            nodesExecuted: pipeline.getNodeNames(),
            logs: pipelineContext.logs.map(log => ({
              node: log.node,
              level: log.level,
              message: log.message,
              duration: log.duration,
            })),
            context: {
              hasKnowledgeBase: !!pipelineContext.knowledgeBase,
              hasLLMService: !!pipelineContext.llmService,
              hasContextManager: !!pipelineContext.contextManager,
            },
          }),
          {
            status: 200,
            headers: {
              ...pipelineContext.corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      // 其他錯誤重新拋出，由外層處理
      throw error;
    }
  } catch (error) {
    // 使用統一的錯誤處理
    return handlePipelineError(error, pipelineContext);
  }
}

