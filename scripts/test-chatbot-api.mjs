#!/usr/bin/env node

/**
 * 測試 AI 客服機器人 API
 * 確保 API 正常工作並能獲得 AI 回應
 */

const API_URL = process.env.API_URL || 'http://localhost:8080/api/chat';

async function testChatAPI() {
  console.log('🧪 開始測試 AI 客服機器人 API\n');
  console.log('='.repeat(70));
  console.log(`API URL: ${API_URL}\n`);

  const testCases = [
    {
      name: '測試 1: 簡單問候',
      message: '你好',
      description: '測試基本功能'
    },
    {
      name: '測試 2: 服務詢問',
      message: '我想拍形象照',
      description: '測試服務詢問功能'
    },
    {
      name: '測試 3: 價格詢問',
      message: '價格多少',
      description: '測試價格詢問功能'
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`   描述: ${testCase.description}`);
    console.log(`   訊息: "${testCase.message}"`);
    console.log('   ' + '-'.repeat(66));

    try {
      const startTime = Date.now();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080',
        },
        body: JSON.stringify({
          message: testCase.message,
          source: 'input',
          mode: 'auto',
          pageType: 'home',
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`   ✅ 狀態: ${response.status} OK`);
      console.log(`   ⏱️  響應時間: ${responseTime}ms`);
      console.log(`   💬 Intent: ${data.intent || 'N/A'}`);
      console.log(`   🆔 Conversation ID: ${data.conversationId || 'N/A'}`);
      
      if (data.reply) {
        const replyPreview = data.reply.substring(0, 100);
        console.log(`   📝 回應預覽: ${replyPreview}${data.reply.length > 100 ? '...' : ''}`);
        console.log(`   ✅ 獲得 AI 回應成功！`);
        successCount++;
      } else {
        console.log(`   ❌ 回應中沒有 reply 欄位`);
        failCount++;
      }

      if (data.suggestedQuickReplies && data.suggestedQuickReplies.length > 0) {
        console.log(`   💡 快速回覆建議: ${data.suggestedQuickReplies.length} 個`);
      }

    } catch (error) {
      console.log(`   ❌ 測試失敗: ${error.message}`);
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        console.log(`   ⚠️  無法連接到 API，請確保：`);
        console.log(`      1. 本地開發服務器正在運行 (npm run start)`);
        console.log(`      2. API 端點正確: ${API_URL}`);
      }
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 測試結果: ${successCount}/${testCases.length} 成功`);

  if (successCount === testCases.length) {
    console.log('✅ 所有測試通過！AI 客服機器人正常工作。\n');
    process.exit(0);
  } else {
    console.log(`❌ ${failCount} 個測試失敗，請檢查錯誤訊息。\n`);
    process.exit(1);
  }
}

// 執行測試
testChatAPI().catch(error => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});

