#!/usr/bin/env node

/**
 * 測試生產環境的 AI 客服機器人 API
 * 使用 Cloudflare Pages 的實際端點
 */

const API_URL = process.env.API_URL || 'https://goldenyearsphoto.pages.dev/api/chat';

async function testChatAPI() {
  console.log('🧪 測試生產環境 AI 客服機器人 API\n');
  console.log('='.repeat(70));
  console.log(`API URL: ${API_URL}\n`);

  const testCases = [
    {
      name: '測試 1: 簡單問候',
      message: '你好',
      description: '測試基本功能和 Pipeline 流程'
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
          'Origin': 'https://goldenyearsphoto.pages.dev',
        },
        body: JSON.stringify({
          message: testCase.message,
          source: 'input',
          mode: 'auto',
          pageType: 'home',
        }),
      });

      const responseTime = Date.now() - startTime;

      console.log(`   📡 HTTP 狀態: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ 錯誤回應: ${errorText.substring(0, 200)}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`   ⏱️  響應時間: ${responseTime}ms`);
      console.log(`   💬 Intent: ${data.intent || 'N/A'}`);
      console.log(`   🆔 Conversation ID: ${data.conversationId || 'N/A'}`);
      
      if (data.reply) {
        const replyPreview = data.reply.substring(0, 150);
        console.log(`   📝 AI 回應預覽: ${replyPreview}${data.reply.length > 150 ? '...' : ''}`);
        console.log(`   ✅ 成功獲得 AI 回應！`);
        successCount++;
      } else {
        console.log(`   ❌ 回應中沒有 reply 欄位`);
        console.log(`   📄 完整回應:`, JSON.stringify(data, null, 2));
        failCount++;
      }

      if (data.suggestedQuickReplies && data.suggestedQuickReplies.length > 0) {
        console.log(`   💡 快速回覆建議 (${data.suggestedQuickReplies.length} 個):`);
        data.suggestedQuickReplies.slice(0, 3).forEach((reply, i) => {
          console.log(`      ${i + 1}. ${reply}`);
        });
      }

      // 檢查 Pipeline 日誌（如果有）
      if (data.logs) {
        console.log(`   📊 Pipeline 日誌: ${data.logs.length} 個節點執行記錄`);
      }

    } catch (error) {
      console.log(`   ❌ 測試失敗: ${error.message}`);
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        console.log(`   ⚠️  網路連接失敗`);
      }
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 測試結果: ${successCount}/${testCases.length} 成功`);

  if (successCount === testCases.length) {
    console.log('✅ 測試通過！AI 客服機器人正常工作。');
    console.log('✅ Pipeline 重構成功，API 正常回應。\n');
    process.exit(0);
  } else {
    console.log(`❌ ${failCount} 個測試失敗。\n`);
    process.exit(1);
  }
}

// 執行測試
testChatAPI().catch(error => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});

