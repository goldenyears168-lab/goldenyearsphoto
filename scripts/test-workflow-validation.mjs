#!/usr/bin/env node

/**
 * 驗證 CI/CD Workflow 配置
 * 檢查 workflow 文件是否存在、格式正確
 */

import { readFileSync, existsSync } from 'fs';
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

console.log('🔍 CI/CD Workflow 驗證測試\n');
console.log('='.repeat(70));

// 1. 檢查 workflow 文件存在
console.log('\n📋 檢查 Workflow 文件');

const workflowFiles = [
  '.github/workflows/test-pipeline-nodes.yml',
  '.github/workflows/test-backend.yml',
  '.github/workflows/knowledge-validation.yml',
];

workflowFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  const exists = existsSync(filePath);
  test(
    `Workflow 文件存在: ${file}`,
    exists,
    exists ? `路徑: ${filePath}` : '文件不存在'
  );
});

// 2. 檢查 workflow 文件內容
console.log('\n📋 檢查 Workflow 內容');

workflowFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      // 基本結構檢查
      test(
        `${file} 包含 name`,
        content.includes('name:'),
        `有 name 欄位`
      );
      
      test(
        `${file} 包含 on 觸發條件`,
        content.includes('on:'),
        `有 on 觸發條件`
      );
      
      test(
        `${file} 包含 jobs`,
        content.includes('jobs:'),
        `有 jobs 定義`
      );
      
      // 檢查是否有 steps
      test(
        `${file} 包含 steps`,
        content.includes('steps:'),
        `有 steps 定義`
      );
      
    } catch (error) {
      test(
        `${file} 可讀取`,
        false,
        `讀取錯誤: ${error.message}`
      );
    }
  }
});

// 3. 檢查 test-pipeline-nodes.yml 特定內容
console.log('\n📋 檢查 Test Pipeline Nodes Workflow');

const pipelineWorkflowPath = join(projectRoot, '.github/workflows/test-pipeline-nodes.yml');
if (existsSync(pipelineWorkflowPath)) {
  const content = readFileSync(pipelineWorkflowPath, 'utf-8');
  
  test(
    '包含 pull_request 觸發',
    content.includes('pull_request:'),
    '會在 PR 時觸發'
  );
  
  test(
    '包含 push 觸發',
    content.includes('push:'),
    '會在 push 時觸發'
  );
  
  test(
    '包含 test-pipeline-structure job',
    content.includes('test-pipeline-structure:'),
    '有 Pipeline 結構測試 job'
  );
  
  test(
    '包含 test-pipeline-nodes job',
    content.includes('test-pipeline-nodes:'),
    '有 Pipeline 節點測試 job'
  );
  
  test(
    '包含 verify-mvp 測試',
    content.includes('verify-mvp.mjs'),
    '會運行 MVP 驗證'
  );
  
  test(
    '包含 test-pipeline-comparison 測試',
    content.includes('test-pipeline-comparison.mjs'),
    '會運行 Pipeline 對比測試'
  );
}

// 4. 檢查 test-backend.yml 特定內容
console.log('\n📋 檢查 Test Backend Workflow');

const backendWorkflowPath = join(projectRoot, '.github/workflows/test-backend.yml');
if (existsSync(backendWorkflowPath)) {
  const content = readFileSync(backendWorkflowPath, 'utf-8');
  
  test(
    '包含 pull_request 觸發',
    content.includes('pull_request:'),
    '會在 PR 時觸發'
  );
  
  test(
    '包含 push 觸發',
    content.includes('push:'),
    '會在 push 時觸發'
  );
  
  test(
    '包含 test-backend-structure job',
    content.includes('test-backend-structure:'),
    '有後端結構測試 job'
  );
  
  test(
    '包含 lint-code job',
    content.includes('lint-code:'),
    '有代碼檢查 job'
  );
  
  test(
    '包含 test-api-integration job',
    content.includes('test-api-integration:'),
    '有 API 集成測試 job'
  );
}

// 5. 檢查 package.json 測試命令
console.log('\n📋 檢查 Package.json 測試命令');

const packageJsonPath = join(projectRoot, 'package.json');
if (existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};
    
    test(
      '包含 test:pipeline 命令',
      scripts['test:pipeline'] !== undefined,
      scripts['test:pipeline'] || '未定義'
    );
    
    test(
      '包含 test:backend 命令',
      scripts['test:backend'] !== undefined,
      scripts['test:backend'] || '未定義'
    );
    
    test(
      '包含 test:all 命令',
      scripts['test:all'] !== undefined,
      scripts['test:all'] || '未定義'
    );
    
  } catch (error) {
    test(
      'package.json 可解析',
      false,
      `解析錯誤: ${error.message}`
    );
  }
}

// 總結
console.log('\n' + '='.repeat(70));
console.log(`\n📊 測試結果總結`);
console.log(`   總測試數: ${testCount}`);
console.log(`   ✅ 通過: ${passCount}`);
console.log(`   ❌ 失敗: ${failCount}`);

if (failCount === 0) {
  console.log(`\n🎉 所有 CI/CD Workflow 驗證測試通過！`);
  console.log(`\n✅ Workflow 配置正確，可以在 GitHub 上使用。`);
  console.log(`\n💡 下一步:`);
  console.log(`   1. 提交這些 workflow 文件到 GitHub`);
  console.log(`   2. 創建一個 PR 或 push 到 main 分支`);
  console.log(`   3. 在 GitHub Actions 頁面查看測試結果`);
  process.exit(0);
} else {
  console.log(`\n⚠️  有 ${failCount} 個測試失敗，請檢查上述錯誤。`);
  process.exit(1);
}

