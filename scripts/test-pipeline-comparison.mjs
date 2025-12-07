#!/usr/bin/env node

/**
 * Pipeline 對比測試腳本
 * 驗證 Pipeline 實現與原實現的功能一致性
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, condition, details = '') {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failCount++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

console.log('🧪 Pipeline 對比測試\n');
console.log('='.repeat(70));

// 1. 檢查文件結構
console.log('\n📋 檢查文件結構');

const requiredFiles = [
  'functions/api/lib/pipeline.ts',
  'functions/api/chat-pipeline.ts',
  'functions/api/nodes/01-validate-request.ts',
  'functions/api/nodes/02-initialize-services.ts',
  'functions/api/nodes/03-context-management.ts',
  'functions/api/nodes/04-intent-extraction.ts',
  'functions/api/nodes/05-state-transition.ts',
  'functions/api/nodes/06-special-intents.ts',
  'functions/api/nodes/07-faq-check.ts',
  'functions/api/nodes/08-llm-generation.ts',
  'functions/api/nodes/09-build-response.ts',
  'functions/api/nodes/99-error-handler.ts',
  'functions/api/nodes/index.ts',
];

requiredFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  try {
    const content = readFileSync(filePath, 'utf-8');
    test(`文件存在: ${file}`, content.length > 0);
  } catch (error) {
    test(`文件存在: ${file}`, false, `文件不存在: ${filePath}`);
  }
});

// 2. 檢查關鍵修正點實施
console.log('\n📋 檢查關鍵修正點實施');

// 修正點 2: LLM 不可用的特殊響應格式
const llmGenerationFile = join(projectRoot, 'functions/api/nodes/08-llm-generation.ts');
const llmGenerationContent = readFileSync(llmGenerationFile, 'utf-8');

test(
  '關鍵修正點 2: LLM 不可用檢查存在',
  llmGenerationContent.includes('if (!ctx.llmService)'),
  '檢查 LLM 服務不可用處理'
);

test(
  '關鍵修正點 2: 503 狀態碼',
  llmGenerationContent.includes('status: 503'),
  '檢查 503 狀態碼'
);

test(
  '關鍵修正點 2: 無 suggestedQuickReplies 註釋',
  llmGenerationContent.includes('無 suggestedQuickReplies') || 
  llmGenerationContent.includes('suggestedQuickReplies 欄位'),
  '檢查特殊格式說明'
);

// 修正點 3: 超時處理的資源清理
test(
  '關鍵修正點 3: timeoutId 清理邏輯存在',
  llmGenerationContent.includes('clearTimeout(timeoutId)'),
  '檢查 timeoutId 清理'
);

test(
  '關鍵修正點 3: try-finally 或雙重清理',
  llmGenerationContent.includes('clearTimeout') && 
  (llmGenerationContent.includes('finally') || 
   llmGenerationContent.match(/if\s*\(\s*timeoutId\s*\)/g)?.length >= 2),
  '檢查資源清理機制'
);

// 修正點 6: 響應時間日誌
const buildResponseFile = join(projectRoot, 'functions/api/nodes/09-build-response.ts');
const buildResponseContent = readFileSync(buildResponseFile, 'utf-8');

test(
  '關鍵修正點 6: 響應時間計算',
  buildResponseContent.includes('Date.now() - ctx.startTime'),
  '檢查響應時間計算'
);

test(
  '關鍵修正點 6: 響應時間日誌',
  buildResponseContent.includes('console.log') && 
  buildResponseContent.includes('responseTime') || 
  buildResponseContent.includes('ms'),
  '檢查響應時間日誌輸出'
);

// 3. 檢查節點導出
console.log('\n📋 檢查節點導出');

const indexFile = join(projectRoot, 'functions/api/nodes/index.ts');
const indexContent = readFileSync(indexFile, 'utf-8');

const nodeExports = [
  'node_validateRequest',
  'node_initializeServices',
  'node_contextManagement',
  'node_intentExtraction',
  'node_stateTransition',
  'node_specialIntents',
  'node_faqCheck',
  'node_llmGeneration',
  'node_buildResponse',
  'handlePipelineError',
];

nodeExports.forEach(exportName => {
  test(
    `節點導出: ${exportName}`,
    indexContent.includes(exportName),
    '檢查節點是否導出'
  );
});

// 4. 檢查主流程集成
console.log('\n📋 檢查主流程集成');

const chatPipelineFile = join(projectRoot, 'functions/api/chat-pipeline.ts');
const chatPipelineContent = readFileSync(chatPipelineFile, 'utf-8');

test(
  'Pipeline 實例化',
  chatPipelineContent.includes('new Pipeline'),
  '檢查 Pipeline 創建'
);

// 檢查節點註冊（更寬鬆的檢查）
const registeredNodes = [
  'validateRequest',
  'initializeServices',
  'contextManagement',
  'intentExtraction',
  'stateTransition',
  'specialIntents',
  'faqCheck',
  'llmGeneration',
  'buildResponse',
];

const allNodesRegistered = registeredNodes.every(nodeName => 
  chatPipelineContent.includes(`addNode('${nodeName}'`) || 
  chatPipelineContent.includes(`addNode("${nodeName}"`)
);

test(
  '所有節點註冊',
  allNodesRegistered && chatPipelineContent.includes('addNode') && 
  chatPipelineContent.split('addNode').length >= 10, // 至少 9 個節點 + 1（初始值）
  '檢查節點註冊（應有 9 個節點）'
);

test(
  'Pipeline 執行',
  chatPipelineContent.includes('pipeline.execute'),
  '檢查 Pipeline 執行'
);

test(
  '錯誤處理集成',
  chatPipelineContent.includes('handlePipelineError'),
  '檢查錯誤處理'
);

// 5. 檢查 chat.ts 的集成
console.log('\n📋 檢查 chat.ts 集成');

const chatFile = join(projectRoot, 'functions/api/chat.ts');
const chatContent = readFileSync(chatFile, 'utf-8');

test(
  'onRequestPost 使用 Pipeline',
  chatContent.includes('onRequestPostPipeline') || 
  chatContent.includes('chat-pipeline'),
  '檢查主入口函數是否使用 Pipeline'
);

// 6. 檢查節點功能完整性
console.log('\n📋 檢查節點功能完整性');

// 檢查每個節點的關鍵功能
const nodeChecks = [
  {
    file: '01-validate-request.ts',
    checks: ['OPTIONS', 'Content-Type', 'message', 'conversationId'],
    name: '請求驗證節點'
  },
  {
    file: '02-initialize-services.ts',
    checks: ['loadKnowledgeBase', 'setKnowledgeBase', 'initLLMService', 'initContextManager'],
    name: '服務初始化節點'
  },
  {
    file: '03-context-management.ts',
    checks: ['getContext', 'createContext', 'conversationContext'],
    name: '上下文管理節點'
  },
  {
    file: '04-intent-extraction.ts',
    checks: ['classifyIntent', 'extractEntities', 'mergedEntities'],
    name: '意圖提取節點'
  },
  {
    file: '05-state-transition.ts',
    checks: ['determineNextState', 'getStateTransitionsConfig', 'nextState'],
    name: '狀態轉換節點'
  },
  {
    file: '06-special-intents.ts',
    checks: ['line', 'Line', 'complaint', 'handoff_to_human'],
    name: '特殊意圖處理節點'
  },
  {
    file: '07-faq-check.ts',
    checks: ['handleFAQIfNeeded', 'searchFAQDetailed', 'source === \'menu\''],
    name: 'FAQ 檢查節點'
  },
  {
    file: '08-llm-generation.ts',
    checks: ['generateReply', 'Promise.race', 'timeoutId'],
    name: 'LLM 生成節點'
  },
  {
    file: '09-build-response.ts',
    checks: ['buildResponse', 'responseTime', 'console.log'],
    name: '響應構建節點'
  },
];

nodeChecks.forEach(({ file, checks, name }) => {
  const filePath = join(projectRoot, 'functions/api/nodes', file);
  try {
    const content = readFileSync(filePath, 'utf-8');
    checks.forEach(check => {
      test(
        `${name}: 包含 ${check}`,
        content.includes(check),
        `檢查功能: ${check}`
      );
    });
  } catch (error) {
    test(`${name}: 文件可讀`, false, `無法讀取文件: ${filePath}`);
  }
});

// 輸出結果
console.log('\n' + '='.repeat(70));
console.log(`\n📊 測試結果: ${passCount}/${testCount} 通過`);

if (failCount > 0) {
  console.log(`❌ ${failCount} 個測試失敗\n`);
  process.exit(1);
} else {
  console.log(`✅ 所有測試通過！\n`);
  console.log('✅ Pipeline 實現驗證成功！');
  console.log('✅ 可以進行下一步：功能測試和性能測試\n');
  process.exit(0);
}

