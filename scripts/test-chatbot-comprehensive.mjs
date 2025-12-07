#!/usr/bin/env node

/**
 * 全面測試 AI 客服機器人 API
 * 測試多個場景直到全部成功
 */

const API_URL = process.env.API_URL || 'https://goldenyearsphoto.pages.dev/api/chat';

async function testChatAPI() {
  console.log('🧪 全面測試 AI 客服機器人 API\n');
  console.log('='.repeat(70));
  console.log(`API URL: ${API_URL}\n`);

  const testCases = [
    {
      name: '測試 1: 簡單問候',
      message: '你好',
      description: '測試基本問候功能'
    },
    {
      name: '測試 2: 價格詢問',
      message: '我想大概了解不同拍攝的價位與計價方式',
      description: '測試價格詢問功能（用戶實際使用的問題）'
    },
    {
      name: '測試 3: 服務詢問',
      message: '我想拍形象照',
      description: '測試服務詢問功能'
    },
    {
      name: '測試 4: 預約詢問',
      message: '如何預約',
      description: '測試預約相關問題'
    },
  ];

  let successCount = 0;
  let failCount = 0;
  const results = [];

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
      
      if (data.reply && data.reply.length > 0) {
        const replyPreview = data.reply.substring(0, 150);
        console.log(`   📝 AI 回應預覽: ${replyPreview}${data.reply.length > 150 ? '...' : ''}`);
        console.log(`   ✅ 成功獲得 AI 回應！`);
        
        // 檢查回應質量
        if (data.reply.length < 10) {
          console.log(`   ⚠️  警告: 回應太短，可能異常`);
        } else {
          console.log(`   ✅ 回應長度正常 (${data.reply.length} 字元)`);
        }
        
        successCount++;
        results.push({
          test: testCase.name,
          status: 'success',
          responseTime,
          replyLength: data.reply.length,
        });
      } else {
        console.log(`   ❌ 回應中沒有 reply 欄位或內容為空`);
        console.log(`   📄 完整回應:`, JSON.stringify(data, null, 2).substring(0, 300));
        failCount++;
        results.push({
          test: testCase.name,
          status: 'fail',
          reason: 'No reply content',
        });
      }

      if (data.suggestedQuickReplies && data.suggestedQuickReplies.length > 0) {
        console.log(`   💡 快速回覆建議 (${data.suggestedQuickReplies.length} 個)`);
      }

      // 等待一下再進行下一個測試
      if (testCase !== testCases[testCases.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.log(`   ❌ 測試失敗: ${error.message}`);
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        console.log(`   ⚠️  網路連接失敗`);
      }
      failCount++;
      results.push({
        test: testCase.name,
        status: 'fail',
        reason: error.message,
      });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 測試結果總結`);
  console.log(`   ✅ 成功: ${successCount}/${testCases.length}`);
  console.log(`   ❌ 失敗: ${failCount}/${testCases.length}`);

  if (results.length > 0) {
    console.log(`\n📈 詳細結果:`);
    results.forEach(r => {
      const icon = r.status === 'success' ? '✅' : '❌';
      const extra = r.responseTime ? ` (${r.responseTime}ms, ${r.replyLength}字元)` : '';
      console.log(`   ${icon} ${r.test}${extra}`);
    });
  }

  if (successCount === testCases.length) {
    console.log('\n🎉 所有測試通過！AI 客服機器人完全正常工作！');
    console.log('✅ Pipeline 重構成功，所有功能正常！\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failCount} 個測試失敗，請檢查錯誤訊息。\n`);
    process.exit(1);
  }
}

// 執行測試
testChatAPI().catch(error => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});

