#!/usr/bin/env node
/**
 * 診斷腳本：檢查 Chatbot API 端點問題
 * 
 * 使用方法：
 *   node scripts/diagnose-chatbot.mjs [--url <部署URL>]
 * 
 * 例如：
 *   node scripts/diagnose-chatbot.mjs --url https://www.goldenyearsphoto.com
 *   或
 *   node scripts/diagnose-chatbot.mjs --url https://goldenyearsphoto.pages.dev
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

// 解析命令行參數
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: 'https://www.goldenyearsphoto.com',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      config.url = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
診斷腳本：檢查 Chatbot API 端點問題

使用方法：
  node scripts/diagnose-chatbot.mjs [選項]

選項：
  --url <URL>    指定要測試的部署 URL (預設: https://www.goldenyearsphoto.com)
  --help, -h      顯示此幫助訊息

範例：
  node scripts/diagnose-chatbot.mjs --url https://goldenyearsphoto.pages.dev
      `);
      process.exit(0);
    }
  }

  return config;
}

// 檢查環境變數
async function checkEnvironmentVariables() {
  logSection('1. 檢查環境變數');

  const envFile = join(projectRoot, '.env');
  const envExists = existsSync(envFile);

  if (envExists) {
    logInfo('找到 .env 文件');
    try {
      const envContent = readFileSync(envFile, 'utf-8');
      const hasGeminiKey = envContent.includes('GEMINI_API_KEY');
      
      if (hasGeminiKey) {
        const lines = envContent.split('\n');
        const keyLine = lines.find(line => line.startsWith('GEMINI_API_KEY'));
        if (keyLine) {
          const keyValue = keyLine.split('=')[1]?.trim();
          if (keyValue && keyValue.length > 0) {
            logSuccess(`GEMINI_API_KEY 在 .env 中已設置 (長度: ${keyValue.length})`);
          } else {
            logError('GEMINI_API_KEY 在 .env 中為空');
          }
        }
      } else {
        logWarning('GEMINI_API_KEY 未在 .env 中找到');
      }
    } catch (error) {
      logError(`讀取 .env 文件失敗: ${error.message}`);
    }
  } else {
    logWarning('.env 文件不存在（這在生產環境中是正常的）');
  }

  logInfo('注意：在 Cloudflare Pages 中，環境變數需要在 Dashboard 中設置');
  logInfo('請確認在 Cloudflare Pages Dashboard → Settings → Environment variables 中設置了 GEMINI_API_KEY');
}

// 檢查 Knowledge 文件
async function checkKnowledgeFiles() {
  logSection('2. 檢查 Knowledge 文件');

  const knowledgeDir = join(projectRoot, 'knowledge');
  const requiredFiles = [
    'services.json',
    'personas.json',
    'policies.json',
    'contact_info.json',
  ];

  let allExists = true;
  for (const file of requiredFiles) {
    const filePath = join(knowledgeDir, file);
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        logSuccess(`${file} 存在且格式正確`);
        
        // 檢查文件內容
        if (file === 'services.json' && Array.isArray(data.services)) {
          logInfo(`  - 包含 ${data.services.length} 個服務`);
        } else if (file === 'personas.json' && Array.isArray(data.personas)) {
          logInfo(`  - 包含 ${data.personas.length} 個 persona`);
        } else if (file === 'policies.json' && Array.isArray(data.policies)) {
          logInfo(`  - 包含 ${data.policies.length} 個政策`);
        }
      } catch (error) {
        logError(`${file} 存在但 JSON 格式錯誤: ${error.message}`);
        allExists = false;
      }
    } else {
      logError(`${file} 不存在`);
      allExists = false;
    }
  }

  // 檢查是否會複製到 _site
  const eleventyConfig = join(projectRoot, '.eleventy.js');
  if (existsSync(eleventyConfig)) {
    const configContent = readFileSync(eleventyConfig, 'utf-8');
    if (configContent.includes('addPassthroughCopy("knowledge")')) {
      logSuccess('knowledge 目錄已配置為複製到構建輸出');
    } else {
      logWarning('knowledge 目錄可能未配置為複製到構建輸出');
      logInfo('請確認 .eleventy.js 中包含: eleventyConfig.addPassthroughCopy("knowledge")');
    }
  }

  return allExists;
}

// 測試 API 端點
async function testApiEndpoint(baseUrl) {
  logSection('3. 測試 API 端點');

  const apiUrl = `${baseUrl}/api/chat`;
  logInfo(`測試 URL: ${apiUrl}`);

  const testPayload = {
    message: '測試',
    pageType: 'home',
    mode: 'auto',
  };

  try {
    logInfo('發送測試請求...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseUrl,
      },
      body: JSON.stringify(testPayload),
    });

    logInfo(`響應狀態: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (response.ok) {
      logSuccess('API 端點響應正常');
      if (responseData.reply) {
        logInfo(`回覆: ${responseData.reply.substring(0, 100)}...`);
      }
      if (responseData.intent) {
        logInfo(`意圖: ${responseData.intent}`);
      }
      return { success: true, data: responseData };
    } else {
      logError(`API 端點返回錯誤: ${response.status}`);
      logError(`響應內容: ${responseText.substring(0, 500)}`);
      
      // 嘗試解析錯誤信息
      if (responseData.error || responseData.message) {
        logError(`錯誤信息: ${responseData.error || responseData.message}`);
      }

      return { success: false, status: response.status, data: responseData };
    }
  } catch (error) {
    logError(`請求失敗: ${error.message}`);
    if (error.cause) {
      logError(`原因: ${error.cause}`);
    }
    return { success: false, error: error.message };
  }
}

// 測試 Knowledge 文件可訪問性
async function testKnowledgeFilesAccess(baseUrl) {
  logSection('4. 測試 Knowledge 文件可訪問性');

  const knowledgeFiles = [
    'services.json',
    'personas.json',
    'policies.json',
    'contact_info.json',
  ];

  let allAccessible = true;
  for (const file of knowledgeFiles) {
    const url = `${baseUrl}/knowledge/${file}`;
    try {
      logInfo(`測試: ${url}`);
      const response = await fetch(url);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          logSuccess(`${file} 可訪問且格式正確`);
        } else {
          logWarning(`${file} 可訪問但 Content-Type 不正確: ${contentType}`);
        }
      } else {
        logError(`${file} 無法訪問: ${response.status} ${response.statusText}`);
        allAccessible = false;
      }
    } catch (error) {
      logError(`${file} 請求失敗: ${error.message}`);
      allAccessible = false;
    }
  }

  return allAccessible;
}

// 生成診斷報告
function generateReport(results) {
  logSection('診斷報告');

  const issues = [];
  const recommendations = [];

  // 分析結果
  if (!results.env.hasGeminiKey) {
    issues.push('GEMINI_API_KEY 環境變數未設置');
    recommendations.push('在 Cloudflare Pages Dashboard → Settings → Environment variables 中設置 GEMINI_API_KEY');
  }

  if (!results.knowledge.filesExist) {
    issues.push('Knowledge 文件缺失或格式錯誤');
    recommendations.push('檢查 knowledge 目錄中的 JSON 文件是否完整且格式正確');
  }

  if (!results.knowledge.accessible) {
    issues.push('Knowledge 文件無法通過 HTTP 訪問');
    recommendations.push('確認 knowledge 目錄已通過 .eleventy.js 的 addPassthroughCopy 複製到構建輸出');
    recommendations.push('確認部署後 _site/knowledge/ 目錄存在');
  }

  if (!results.api.success) {
    issues.push('API 端點返回錯誤');
    if (results.api.status === 500) {
      recommendations.push('檢查 Cloudflare Pages 的實時日誌，查看具體錯誤信息');
      recommendations.push('確認環境變數已正確設置並重新部署');
      recommendations.push('確認 knowledge 文件可以正確加載');
    } else if (results.api.status === 503) {
      recommendations.push('LLM 服務初始化失敗，檢查 GEMINI_API_KEY 是否正確');
    }
  }

  // 輸出問題
  if (issues.length > 0) {
    logError('發現的問題:');
    issues.forEach((issue, index) => {
      logError(`  ${index + 1}. ${issue}`);
    });
  } else {
    logSuccess('未發現明顯問題');
  }

  // 輸出建議
  if (recommendations.length > 0) {
    console.log('\n');
    logInfo('修復建議:');
    recommendations.forEach((rec, index) => {
      logInfo(`  ${index + 1}. ${rec}`);
    });
  }

  // 輸出下一步
  console.log('\n');
  logInfo('下一步:');
  if (!results.api.success) {
    logInfo('1. 查看 Cloudflare Pages Dashboard → Logs 或 Real-time Logs');
    logInfo('2. 觸發一次 API 請求，然後查看日誌中的詳細錯誤信息');
    logInfo('3. 檢查日誌中的 [Init LLM] 和 [Knowledge] 標記，定位具體問題');
  } else {
    logSuccess('API 端點工作正常！');
  }
}

// 主函數
async function main() {
  const config = parseArgs();

  logSection('Chatbot API 診斷工具');
  logInfo(`目標 URL: ${config.url}`);
  logInfo(`項目根目錄: ${projectRoot}`);

  const results = {
    env: { hasGeminiKey: false },
    knowledge: { filesExist: false, accessible: false },
    api: { success: false },
  };

  // 1. 檢查環境變數
  await checkEnvironmentVariables();
  // 注意：這裡無法直接檢查 Cloudflare 的環境變數，只能檢查本地 .env

  // 2. 檢查 Knowledge 文件
  results.knowledge.filesExist = await checkKnowledgeFiles();

  // 3. 測試 Knowledge 文件可訪問性
  results.knowledge.accessible = await testKnowledgeFilesAccess(config.url);

  // 4. 測試 API 端點
  results.api = await testApiEndpoint(config.url);

  // 5. 生成報告
  generateReport(results);

  // 退出碼
  const hasIssues = !results.api.success || !results.knowledge.filesExist || !results.knowledge.accessible;
  process.exit(hasIssues ? 1 : 0);
}

// 執行
main().catch((error) => {
  logError(`診斷過程出錯: ${error.message}`);
  console.error(error);
  process.exit(1);
});

