/**
 * Pipeline 版本的 onRequestPost
 * 使用 Pipeline 模式重構的主流程
 */

import { Pipeline, PipelineContext } from './lib/pipeline.js';
import {
  node_validateRequest,
  node_initializeServices,
  node_contextManagement,
  node_intentExtraction,
  node_stateTransition,
  node_specialIntents,
  node_faqCheck,
  node_llmGeneration,
  node_buildResponse,
  handlePipelineError,
} from './nodes/index.js';

/**
 * Pipeline 版本的 onRequestPost
 */
export async function onRequestPostPipeline(context: {
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

  // 註冊所有節點（按順序）
  pipeline.addNode('validateRequest', node_validateRequest);
  pipeline.addNode('initializeServices', node_initializeServices);
  pipeline.addNode('contextManagement', node_contextManagement);
  pipeline.addNode('intentExtraction', node_intentExtraction);
  pipeline.addNode('stateTransition', node_stateTransition);
  pipeline.addNode('specialIntents', node_specialIntents);
  pipeline.addNode('faqCheck', node_faqCheck);
  pipeline.addNode('llmGeneration', node_llmGeneration);
  pipeline.addNode('buildResponse', node_buildResponse);

  // 初始化 PipelineContext
  const pipelineContext: PipelineContext = {
    request: context.request,
    env: context.env,
    corsHeaders: {},
    startTime,
    logs: [],
  };

  try {
    // 執行 Pipeline
    return await pipeline.execute(pipelineContext);
  } catch (error) {
    // 使用統一的錯誤處理
    return handlePipelineError(error, pipelineContext);
  }
}

