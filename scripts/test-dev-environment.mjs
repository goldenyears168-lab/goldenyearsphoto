#!/usr/bin/env node
/**
 * 测试完整开发环境
 * 验证 API 服务器和前端配置
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_PORT = 8787;
const TEST_TIMEOUT = 5000;

console.log('🧪 测试开发环境配置...\n');

// 测试 1: 检查 FAQ 数据文件
console.log('1️⃣  检查 FAQ 数据文件...');
try {
  const fs = await import('fs');
  const path = await import('path');
  const projectRoot = path.resolve(__dirname, '..');
  const faqPath = path.join(projectRoot, 'knowledge', 'faq_detailed.json');
  
  if (!fs.existsSync(faqPath)) {
    console.error('   ❌ FAQ 数据文件不存在:', faqPath);
    process.exit(1);
  }
  
  const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
  console.log(`   ✅ FAQ 数据文件存在 (${Object.keys(faqData.categories || {}).length} 个分类)`);
} catch (error) {
  console.error('   ❌ 无法读取 FAQ 数据文件:', error.message);
  process.exit(1);
}

// 测试 2: 测试 API 服务器响应
console.log('\n2️⃣  测试 API 服务器响应...');
const testApiServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${API_PORT}/api/faq-menu`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            if (json.categories && Array.isArray(json.categories)) {
              console.log(`   ✅ API 服务器响应正常 (${json.categories.length} 个分类)`);
              resolve(true);
            } else {
              reject(new Error('API 响应格式不正确'));
            }
          } catch (error) {
            reject(new Error('无法解析 API 响应 JSON'));
          }
        } else {
          reject(new Error(`API 返回状态码: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ⚠️  API 服务器未运行 (端口 ${API_PORT})`);
        console.log(`   💡 提示: 运行 'npm run dev:api' 启动 API 服务器`);
        resolve(false); // 不视为错误，只是提示
      } else {
        reject(error);
      }
    });
    
    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error('API 请求超时'));
    });
  });
};

try {
  await testApiServer();
} catch (error) {
  console.log(`   ⚠️  ${error.message}`);
  console.log(`   💡 提示: 运行 'npm run dev:api' 启动 API 服务器`);
}

// 测试 3: 检查前端代码配置
console.log('\n3️⃣  检查前端代码配置...');
try {
  const fs = await import('fs');
  const path = await import('path');
  const projectRoot = path.resolve(__dirname, '..');
  const chatbotPath = path.join(projectRoot, 'src', 'assets', 'js', 'gy-chatbot.js');
  
  if (!fs.existsSync(chatbotPath)) {
    console.error('   ❌ Chatbot 文件不存在');
    process.exit(1);
  }
  
  const chatbotCode = fs.readFileSync(chatbotPath, 'utf8');
  
  // 检查是否包含 getApiBaseUrl 方法
  if (chatbotCode.includes('getApiBaseUrl')) {
    console.log('   ✅ 前端代码包含 API URL 检测逻辑');
  } else {
    console.error('   ❌ 前端代码缺少 API URL 检测逻辑');
    process.exit(1);
  }
  
  // 检查是否包含 devApiPort 配置
  if (chatbotCode.includes('devApiPort')) {
    console.log('   ✅ 前端代码包含开发 API 端口配置');
  } else {
    console.error('   ❌ 前端代码缺少开发 API 端口配置');
    process.exit(1);
  }
} catch (error) {
  console.error('   ❌ 检查前端代码时出错:', error.message);
  process.exit(1);
}

// 测试 4: 检查 package.json 脚本
console.log('\n4️⃣  检查 package.json 脚本...');
try {
  const fs = await import('fs');
  const path = await import('path');
  const projectRoot = path.resolve(__dirname, '..');
  const packagePath = path.join(projectRoot, 'package.json');
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (packageJson.scripts['dev:api']) {
    console.log('   ✅ dev:api 脚本已配置');
  } else {
    console.error('   ❌ dev:api 脚本未配置');
    process.exit(1);
  }
  
  if (packageJson.scripts['test:faq-api']) {
    console.log('   ✅ test:faq-api 脚本已配置');
  } else {
    console.log('   ⚠️  test:faq-api 脚本未配置（可选）');
  }
} catch (error) {
  console.error('   ❌ 检查 package.json 时出错:', error.message);
  process.exit(1);
}

console.log('\n✅ 开发环境配置检查完成！');
console.log('\n📝 使用说明:');
console.log('   1. 启动开发环境: npm run dev');
console.log('   2. 或分别启动:');
console.log('      - npm run dev:api (API 服务器)');
console.log('      - npm run dev:eleventy (Eleventy 服务器)');
console.log('   3. 访问: http://localhost:8080');
console.log('');

