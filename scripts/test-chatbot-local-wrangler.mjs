#!/usr/bin/env node

/**
 * 使用 wrangler pages dev 測試 AI 客服機器人 API
 * 這需要先啟動 wrangler pages dev 服務器
 */

console.log('📋 本地測試說明\n');
console.log('='.repeat(70));
console.log('\n⚠️  要測試 Cloudflare Pages Functions，需要使用 wrangler pages dev\n');
console.log('請執行以下命令啟動本地開發服務器：\n');
console.log('  1. 先構建項目:');
console.log('     npm run build\n');
console.log('  2. 啟動 wrangler pages dev:');
console.log('     wrangler pages dev _site --project-name=goldenyearsphoto\n');
console.log('  3. 然後在另一個終端運行測試:');
console.log('     API_URL=http://localhost:8788/api/chat node scripts/test-chatbot-api.mjs\n');
console.log('='.repeat(70));
console.log('\n或者，您可以：\n');
console.log('  ✅ 直接部署到 Cloudflare Pages');
console.log('  ✅ 然後測試生產環境 API\n');

process.exit(0);

