/**
 * Cloudflare Pages Function: /api/faq-menu
 * 返回 FAQ 菜单结构供前端使用
 */

import { KnowledgeBase } from './lib/knowledge.js';

// 初始化知識庫（單例模式）
let knowledgeBase: KnowledgeBase | null = null;

// 載入知識庫（延遲載入）
async function loadKnowledgeBase(request?: Request) {
  if (!knowledgeBase) {
    knowledgeBase = new KnowledgeBase();
    // 從 request URL 構建基礎 URL
    let baseUrl: string | undefined;
    if (request) {
      const url = new URL(request.url);
      baseUrl = `${url.protocol}//${url.host}`;
    }
    await knowledgeBase.load(baseUrl);
  }
  return knowledgeBase;
}

/**
 * Cloudflare Pages Function Handler
 */
export async function onRequestGet(context: {
  request: Request;
  env: any;
}): Promise<Response> {
  const { request } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 處理 OPTIONS 請求
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 載入知識庫
    console.log('[FAQ Menu] Loading knowledge base...');
    const kb = await loadKnowledgeBase(request);
    console.log('[FAQ Menu] Knowledge base loaded successfully');

    // 取得 FAQ 詳細資料
    const faqDetailed = kb.getFAQDetailed();
    if (!faqDetailed) {
      return new Response(
        JSON.stringify({ error: 'FAQ data not available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 構建菜單結構
    const categories = Object.entries(faqDetailed.categories)
      .map(([categoryId, category]) => {
        if (!category || !category.questions) {
          return null;
        }

        // 每個分類最多返回 8 個常見問題
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
      .filter(cat => cat !== null); // 過濾掉 null 值

    const response = {
      categories: categories,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FAQ Menu Error]', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to load FAQ menu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

