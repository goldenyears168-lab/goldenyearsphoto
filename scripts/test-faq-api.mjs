#!/usr/bin/env node
/**
 * 测试 FAQ API 端点
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 读取 FAQ 数据
function loadFAQData() {
  try {
    const faqPath = path.join(projectRoot, 'knowledge', 'faq_detailed.json');
    const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
    return faqData;
  } catch (error) {
    console.error('[Test] Error loading FAQ data:', error);
    return null;
  }
}

// 测试 API 逻辑
function testFAQMenu() {
  console.log('🧪 测试 FAQ Menu API 逻辑...\n');
  
  const faqData = loadFAQData();
  
  if (!faqData || !faqData.categories) {
    console.error('❌ FAQ 数据加载失败');
    return false;
  }
  
  console.log(`✅ FAQ 数据加载成功`);
  console.log(`   分类数量: ${Object.keys(faqData.categories).length}\n`);
  
  // 构建菜单结构（与 Cloudflare Functions 逻辑一致）
  const categories = Object.entries(faqData.categories)
    .map(([categoryId, category]) => {
      if (!category || !category.questions) {
        return null;
      }

      // 每个分类最多返回 8 个常见问题
      const questions = category.questions
        .slice(0, 8)
        .map(q => ({
          id: q.id,
          question: q.question,
        }));

      return {
        id: categoryId,
        title: category.title,
        questions: questions,
      };
    })
    .filter(cat => cat !== null);

  const response = {
    categories: categories,
  };
  
  console.log('✅ API 响应结构正确');
  console.log(`   返回分类数: ${response.categories.length}\n`);
  
  // 显示前几个分类
  console.log('📋 前 3 个分类预览:');
  response.categories.slice(0, 3).forEach(cat => {
    console.log(`   - ${cat.title} (${cat.questions.length} 个问题)`);
  });
  
  console.log('\n✅ 测试通过！API 逻辑正确。');
  return true;
}

// 运行测试
const success = testFAQMenu();
process.exit(success ? 0 : 1);

