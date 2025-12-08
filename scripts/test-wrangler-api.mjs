#!/usr/bin/env node
/**
 * 测试 Wrangler Pages Dev API 端点
 */

const WRANGLER_PORT = process.env.WRANGLER_PORT || '8081';
const BASE_URL = `http://localhost:${WRANGLER_PORT}`;

console.log(`🧪 测试 Wrangler Pages Dev API (端口 ${WRANGLER_PORT})...\n`);

// 测试 FAQ Menu API
async function testFAQMenu() {
  console.log('1️⃣  测试 /api/faq-menu...');
  try {
    const response = await fetch(`${BASE_URL}/api/faq-menu`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const categoryCount = data.categories?.length || 0;
    console.log(`   ✅ 成功！返回 ${categoryCount} 个分类`);
    return true;
  } catch (error) {
    console.error(`   ❌ 失败: ${error.message}`);
    return false;
  }
}

// 测试 Chat API
async function testChatAPI() {
  console.log('\n2️⃣  测试 /api/chat...');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      body: JSON.stringify({
        message: '是否可以電話預約或取消呢?',
        conversationId: null,
        source: 'input',
        mode: 'auto',
        pageType: 'home',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    if (data.reply && data.reply.length > 0) {
      console.log(`   ✅ 成功！收到 AI 回复 (${data.reply.length} 字符)`);
      console.log(`   回复预览: ${data.reply.substring(0, 100)}...`);
      return true;
    } else {
      console.error(`   ❌ 回复为空`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ 失败: ${error.message}`);
    return false;
  }
}

// 运行测试
async function runTests() {
  const faqResult = await testFAQMenu();
  const chatResult = await testChatAPI();
  
  console.log('\n' + '='.repeat(50));
  if (faqResult && chatResult) {
    console.log('✅ 所有测试通过！');
    console.log(`\n📝 访问地址: ${BASE_URL}`);
    console.log('   现在可以在浏览器中测试完整的 chatbot 功能了！\n');
    process.exit(0);
  } else {
    console.log('❌ 部分测试失败');
    console.log(`\n💡 提示:`);
    console.log(`   1. 确保 wrangler 正在运行: npx wrangler pages dev _site --project-name=goldenyearsphoto`);
    console.log(`   2. 检查 .dev.vars 文件是否包含 GEMINI_API_KEY`);
    console.log(`   3. 等待几秒钟让服务器完全启动\n`);
    process.exit(1);
  }
}

runTests();

