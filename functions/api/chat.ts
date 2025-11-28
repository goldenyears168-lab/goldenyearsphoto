/**
 * Cloudflare Pages Function: /api/chat
 * 處理 AI 客服聊天請求
 */

import { LLMService } from './lib/llm.js';
import { KnowledgeBase } from './lib/knowledge.js';
import { ContextManager, ConversationContext } from './lib/contextManager.js';
import { 
  getDontUnderstandFirst, 
  getDontUnderstandSecond, 
  getApiErrorTemplate, 
  getTimeoutTemplate,
  getComplaintTemplate,
  getHandoffTemplate,
  getLineInquiryTemplate,
  setKnowledgeBase
} from './lib/responseTemplates.js';

// 初始化服務（單例模式）
let knowledgeBase: KnowledgeBase | null = null;
let llmService: LLMService | null = null;
let contextManager: ContextManager | null = null;

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

// 初始化 LLM 服務
function initLLMService(env: any) {
  if (!llmService) {
    // 在 Cloudflare Pages Functions 中，环境变量通过 env 参数访问
    const apiKey = env?.GEMINI_API_KEY;
    console.log('[Init LLM] Checking API key...');
    console.log('[Init LLM] env object exists:', !!env);
    console.log('[Init LLM] API Key exists:', !!apiKey);
    console.log('[Init LLM] API Key length:', apiKey?.length || 0);
    if (apiKey) {
      // 显示 API key 的前 8 个字符用于验证（不显示完整 key）
      const keyPreview = apiKey.length >= 8 ? `${apiKey.substring(0, 8)}...` : 'too short';
      console.log('[Init LLM] API Key preview:', keyPreview);
      console.log('[Init LLM] API Key starts with "AIza":', apiKey.startsWith('AIza'));
      try {
        llmService = new LLMService(apiKey);
        console.log('[Init LLM] LLM service initialized successfully');
      } catch (error) {
        console.error('[Init LLM] Failed to initialize LLM service:', error);
        throw error;
      }
    } else {
      console.error('[Init LLM] GEMINI_API_KEY not found in env');
      console.log('[Init LLM] Available env keys:', env ? Object.keys(env) : 'env is null/undefined');
    }
  }
  return llmService;
}

// 初始化 Context Manager
function initContextManager() {
  if (!contextManager) {
    contextManager = new ContextManager();
  }
  return contextManager;
}

// 介面定義
interface ChatRequestBody {
  message: string;
  mode?: 'auto' | 'decision_recommendation' | 'faq_flow_price';
  pageType?: 'home' | 'qa';
  conversationId?: string;
  context?: {
    last_intent?: string;
    slots?: {
      service_type?: string;
      use_case?: string;
      persona?: string;
    };
  };
}

interface ChatResponse {
  reply: string;
  intent: string;
  conversationId?: string;
  updatedContext?: {
    last_intent?: string;
    slots?: {
      service_type?: string;
      use_case?: string;
      persona?: string;
      price_range?: string;
      branch?: string;
      booking_action?: string;
    };
  };
  suggestedQuickReplies?: string[];
}

/**
 * 意圖分類
 */
function classifyIntent(
  message: string,
  context?: { last_intent?: string; slots?: Record<string, any> }
): string {
  const lowerMessage = message.toLowerCase();

  // 檢查是否為投訴
  const complaintKeywords = ['不滿意', '生氣', '投訴', '抱怨', '很差', '很糟', '後悔'];
  if (complaintKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'complaint';
  }

  // 檢查是否要轉真人
  const handoffKeywords = ['真人', '人工', '客服', '人員', '員工'];
  const handoffContexts = ['企業', '公司', '團體', '20人', '報價', '合作', '大量'];
  if (
    handoffKeywords.some(keyword => lowerMessage.includes(keyword)) ||
    handoffContexts.some(ctx => lowerMessage.includes(ctx))
  ) {
    return 'handoff_to_human';
  }

  // 檢查是否為價格詢問
  const priceKeywords = ['多少錢', '價格', '費用', '預算', '價位', '收費', '要多少'];
  // 排除政策類問題（例如「AI 客服可以跟我說到多細的價格資訊」）
  const policyPriceKeywords = ['可以跟我說到', '說到多細', '哪些一定要', '再問真人', '報價範圍'];
  if (priceKeywords.some(keyword => lowerMessage.includes(keyword)) && 
      !policyPriceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'price_inquiry';
  }

  // 檢查是否為交件時間詢問
  const deliveryKeywords = ['多久會好', '多久收到', '交件時間', '交件', '何時交件', '什麼時候好', '幾天', '交件速度'];
  if (deliveryKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'delivery_inquiry';
  }

  // 檢查是否為地址/地點詢問
  const locationKeywords = ['地址', '地點', '在哪裡', '在哪', '位置', '怎麼去', '交通', '捷運', '分店', '店址'];
  if (locationKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'location_inquiry';
  }

  // 檢查是否為預約相關
  const bookingKeywords = ['預約', '改期', '取消', '時間', '時段', '什麼時候'];
  if (bookingKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'booking_inquiry';
  }

  // 檢查是否為比較
  const comparisonKeywords = ['差', '比較', '哪個好', '哪個適合', '有什麼不同', '差別'];
  if (comparisonKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'comparison';
  }

  // 檢查是否為結束
  const goodbyeKeywords = ['謝謝', '先這樣', '再見', 'bye', '結束', '好了'];
  if (goodbyeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'goodbye';
  }

  // 檢查是否為打招呼
  const greetingKeywords = ['嗨', '你好', '在嗎', '哈囉', 'hello', 'hi'];
  if (greetingKeywords.some(keyword => lowerMessage.includes(keyword)) || lowerMessage.length < 5) {
    return 'greeting';
  }

  // 檢查是否為服務諮詢
  const serviceKeywords = ['拍', '照', '形象', '證件', '寫真', '全家福', '工作坊'];
  if (serviceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'service_inquiry';
  }

  // 使用上次的意圖
  if (context?.last_intent && lowerMessage.length < 10) {
    return context.last_intent;
  }

  return 'service_inquiry';
}

/**
 * 實體提取
 */
function extractEntities(message: string): Record<string, any> {
  const lowerMessage = message.toLowerCase();
  const entities: Record<string, any> = {};

  // 提取 service_type
  const servicePatterns = [
    { keywords: ['證件照', '證照', '護照照', '簽證照', 'headshot', '韓式'], id: 'headshot_korean' },
    { keywords: ['形象照', 'linkedin照', '履歷照', '職場照', '專業照', 'professional'], id: 'portrait_pro' },
    { keywords: ['寫真', '個人寫真', '畢業寫真', '畢業照', 'artistic'], id: 'portrait_grad_personal' },
    { keywords: ['全家福', '家庭照', '家庭合照', '朋友合照', '團體照', 'group'], id: 'group_family' },
    { keywords: ['一日攝影師', '攝影體驗', '攝影課', '工作坊', 'workshop'], id: 'workshop_challenge' },
  ];

  for (const pattern of servicePatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      entities.service_type = pattern.id;
      break;
    }
  }

  // 提取 use_case
  const useCasePatterns = [
    { keywords: ['履歷', 'linkedin', '求職', '面試', '轉職', 'resume'], id: 'linkedin_resume' },
    { keywords: ['護照', '簽證', '身分證', '駕照', '證照', 'official'], id: 'official_document' },
    { keywords: ['紀念', '生日', '畢業', '紀錄', '里程碑', 'memorial'], id: 'memorial' },
    { keywords: ['ig', '社群', '粉專', '個人品牌', '自媒體', 'social'], id: 'social_media' },
    { keywords: ['全家福', '親子', '情侶', '家人', '小孩', 'family'], id: 'family_couple' },
  ];

  for (const pattern of useCasePatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      entities.use_case = pattern.id;
      break;
    }
  }

  // 提取 persona
  const personaPatterns = [
    { keywords: ['學生', '畢業', '大學', '碩士', 'freshman'], id: 'student_graduating' },
    { keywords: ['轉職', '上班族', '工程師', '顧問', '律師', 'professional'], id: 'pro_switching_job' },
    { keywords: ['家庭', '媽媽', '爸爸', '長輩', '主理人', 'family'], id: 'family_keeper' },
    { keywords: ['企業', '公司', '人資', '福委', '團體', 'corporate'], id: 'hr_corporate' },
  ];

  for (const pattern of personaPatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      entities.persona = pattern.id;
      break;
    }
  }

  // 提取 branch
  if (lowerMessage.includes('中山') || lowerMessage.includes('zhongshan')) {
    entities.branch = 'zhongshan';
  } else if (lowerMessage.includes('公館') || lowerMessage.includes('gongguan') || lowerMessage.includes('台大')) {
    entities.branch = 'gongguan';
  }

  // 提取 booking_action
  if (lowerMessage.includes('預約') || lowerMessage.includes('book')) {
    entities.booking_action = 'book';
  } else if (lowerMessage.includes('改期') || lowerMessage.includes('reschedule')) {
    entities.booking_action = 'reschedule';
  } else if (lowerMessage.includes('取消') || lowerMessage.includes('cancel')) {
    entities.booking_action = 'cancel';
  }

  return entities;
}

/**
 * 取得建議的快速回覆
 * 優先使用 intent_nba_mapping.json 的定義，如果找不到才使用 fallback 邏輯
 */
function getSuggestedQuickReplies(
  intent: string,
  entities: Record<string, any>,
  state?: string,
  knowledgeBase?: any
): string[] {
  // 優先使用知識庫中的 intent_nba_mapping
  if (knowledgeBase) {
    try {
      const nbaActions = knowledgeBase.getNextBestActions(intent);
      if (nbaActions && nbaActions.length > 0) {
        return nbaActions;
      }
    } catch (error) {
      console.error('[Chat] Failed to get next best actions from knowledge base:', error);
    }

    // 如果 intent_nba_mapping 沒有，嘗試從 response_template 取得
    try {
      const responseTemplate = knowledgeBase.getResponseTemplate(intent);
      if (responseTemplate && responseTemplate.next_best_actions && responseTemplate.next_best_actions.length > 0) {
        return responseTemplate.next_best_actions;
      }
    } catch (error) {
      console.error('[Chat] Failed to get response template from knowledge base:', error);
    }
  }

  // Fallback 邏輯（如果知識庫沒有對應的定義）
  if (state === 'COLLECTING_INFO') {
    if (entities.service_type) {
      return ['想知道價格', '如何預約', '拍攝流程'];
    } else {
      return ['我想拍形象照', '我想拍證件照', '我想拍全家福'];
    }
  } else if (state === 'RECOMMENDING') {
    return ['我想了解更多', '如何預約', '拍攝流程'];
  } else if (intent === 'service_inquiry') {
    return ['想知道價格', '如何預約', '拍攝流程'];
  } else if (intent === 'price_inquiry') {
    return ['我想了解更多', '如何預約', '拍攝流程'];
  } else if (intent === 'location_inquiry') {
    return ['想知道價格', '如何預約', '拍攝流程'];
  } else if (intent === 'greeting') {
    return ['我想拍形象照', '想知道價格', '如何預約'];
  }
  return ['我想了解更多', '如何預約', '拍攝流程'];
}

/**
 * Cloudflare Pages Function Handler
 */
export async function onRequestPost(context: {
  request: Request;
  env: any;
  waitUntil: (promise: Promise<any>) => void;
}): Promise<Response> {
  const { request, env } = context;
  const startTime = Date.now();
  const TIMEOUT_MS = 10000; // 10 秒超時

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 處理 OPTIONS 請求
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 驗證 Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Content-Type', message: '請求必須使用 application/json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解析請求體
    const body: ChatRequestBody = await request.json();

    // 驗證必要欄位
    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', message: 'message 欄位為必填且不能為空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 驗證 message 長度
    if (body.message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', message: 'message 長度不能超過 1000 字元' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 載入知識庫
    console.log('[Chat] Loading knowledge base...');
    let kb;
    try {
      kb = await loadKnowledgeBase(request);
      console.log('[Chat] Knowledge base loaded successfully');
    } catch (error) {
      console.error('[Chat] Failed to load knowledge base:', error);
      throw error;
    }
    
    // 設置 responseTemplates 的 knowledgeBase 實例
    setKnowledgeBase(kb);

    // 初始化服務
    console.log('[Chat] Initializing services...');
    const llm = initLLMService(env);
    const cm = initContextManager();
    console.log('[Chat] Services initialized. LLM available:', !!llm);

    const mode = body.mode || 'auto';

    // 取得或建立上下文
    let context_obj: ConversationContext;
    if (body.conversationId) {
      const existingContext = cm.getContext(body.conversationId);
      if (existingContext) {
        context_obj = existingContext;
      } else {
        context_obj = cm.createContext(body.conversationId);
      }
    } else {
      context_obj = cm.createContext();
    }

    // 意圖分類
    const intent = classifyIntent(body.message, {
      last_intent: context_obj.last_intent,
      slots: context_obj.slots,
    });

    // 實體提取
    const entities = extractEntities(body.message);

    // 合併上下文中的實體
    const mergedEntities = {
      ...context_obj.slots,
      ...entities,
    };

    // 檢查 Line 官方帳號詢問
    if (body.message.includes('line') || body.message.includes('Line') || body.message.includes('LINE')) {
      const reply = getLineInquiryTemplate();
      cm.updateContext(context_obj.conversationId, {
        last_intent: intent,
        slots: mergedEntities,
        userMessage: body.message,
        assistantMessage: reply,
      });

      const response: ChatResponse = {
        reply,
        intent,
        conversationId: context_obj.conversationId,
        updatedContext: {
          last_intent: intent,
          slots: mergedEntities,
        },
        suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 處理投訴
    if (intent === 'complaint') {
      const reply = getComplaintTemplate();
      cm.updateContext(context_obj.conversationId, {
        last_intent: intent,
        slots: mergedEntities,
        userMessage: body.message,
        assistantMessage: reply,
      });

      const response: ChatResponse = {
        reply,
        intent,
        conversationId: context_obj.conversationId,
        updatedContext: {
          last_intent: intent,
          slots: mergedEntities,
        },
        suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 處理轉真人
    if (intent === 'handoff_to_human') {
      const reply = getHandoffTemplate();
      cm.updateContext(context_obj.conversationId, {
        last_intent: intent,
        slots: mergedEntities,
        userMessage: body.message,
        assistantMessage: reply,
      });

      const response: ChatResponse = {
        reply,
        intent,
        conversationId: context_obj.conversationId,
        updatedContext: {
          last_intent: intent,
          slots: mergedEntities,
        },
        suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 檢查 Critical FAQ
    // 注意：對於「如何預約」這類問題，不直接使用 FAQ，而是讓 LLM 處理以確保提供預約連結
    // 對於「價格詢問」，只有明確問政策時才用 FAQ，一般「多少錢」直接回答價格
    if (intent === 'location_inquiry') {
      const faqResults = kb.searchFAQ(body.message);
      const criticalFAQ = faqResults.find(faq => faq.critical);
      if (criticalFAQ) {
        const reply = criticalFAQ.answer;
        cm.updateContext(context_obj.conversationId, {
          last_intent: intent,
          slots: mergedEntities,
          userMessage: body.message,
          assistantMessage: reply,
        });

        const response: ChatResponse = {
          reply,
          intent,
          conversationId: context_obj.conversationId,
          updatedContext: {
            last_intent: intent,
            slots: mergedEntities,
          },
          suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
        };

        return new Response(
          JSON.stringify(response),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 對於價格詢問，只有明確問「AI 可以說到多細」這類政策問題才用 FAQ
    if (intent === 'price_inquiry') {
      const lowerMessage = body.message.toLowerCase();
      const isPolicyQuestion = lowerMessage.includes('可以跟我說到') || 
                               lowerMessage.includes('說到多細') || 
                               lowerMessage.includes('哪些一定要') ||
                               lowerMessage.includes('再問真人') ||
                               lowerMessage.includes('報價範圍');
      
      if (isPolicyQuestion) {
        const faqResults = kb.searchFAQ(body.message);
        const criticalFAQ = faqResults.find(faq => faq.critical && faq.id === 'policy_price_scope');
        if (criticalFAQ) {
          const reply = criticalFAQ.answer;
          cm.updateContext(context_obj.conversationId, {
            last_intent: intent,
            slots: mergedEntities,
            userMessage: body.message,
            assistantMessage: reply,
          });

          const response: ChatResponse = {
            reply,
            intent,
            conversationId: context_obj.conversationId,
            updatedContext: {
              last_intent: intent,
              slots: mergedEntities,
            },
            suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
          };

          return new Response(
            JSON.stringify(response),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      // 一般價格詢問（「多少錢」）直接交給 LLM 處理，使用 response_template
    }

    // 對於 booking_inquiry，只有在明確問到「改期」或「取消」時才使用 FAQ
    // 「如何預約」這類問題必須經過 LLM 處理，確保第一句話就提供預約連結
    if (intent === 'booking_inquiry') {
      const lowerMessage = body.message.toLowerCase();
      const isRescheduleCancel = lowerMessage.includes('改期') || 
                                  lowerMessage.includes('取消') || 
                                  lowerMessage.includes('reschedule') || 
                                  lowerMessage.includes('cancel');
      
      // 只有明確問改期/取消時，才檢查 FAQ
      if (isRescheduleCancel) {
        const faqResults = kb.searchFAQ(body.message);
        const criticalFAQ = faqResults.find(faq => faq.critical && 
          (faq.id === 'policy_reschedule_cancel' || faq.keywords.some((k: string) => 
            lowerMessage.includes(k.toLowerCase())
          ))
        );
        if (criticalFAQ) {
          const reply = criticalFAQ.answer;
          cm.updateContext(context_obj.conversationId, {
            last_intent: intent,
            slots: mergedEntities,
            userMessage: body.message,
            assistantMessage: reply,
          });

          const response: ChatResponse = {
            reply,
            intent,
            conversationId: context_obj.conversationId,
            updatedContext: {
              last_intent: intent,
              slots: mergedEntities,
            },
            suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
          };

          return new Response(
            JSON.stringify(response),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      // 如果是「如何預約」這類問題，繼續執行到 LLM 處理，確保提供預約連結
    }

    // 使用 LLM 生成回覆
    if (!llm) {
      const reply = getApiErrorTemplate();
      const response: ChatResponse = {
        reply,
        intent: 'handoff_to_human',
        conversationId: context_obj.conversationId,
        updatedContext: {
          last_intent: 'handoff_to_human',
          slots: mergedEntities,
        },
      };

      return new Response(
        JSON.stringify(response),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 構建 LLM 上下文
    const history = context_obj.history.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.text,
    }));

    // 使用 Promise.race 實現超時
    const replyPromise = llm.generateReply({
      message: body.message,
      intent,
      entities: mergedEntities,
      context: {
        last_intent: context_obj.last_intent,
        slots: mergedEntities,
        history,
      },
      mode,
      knowledgeBase: kb, // 傳入知識庫實例，用於獲取價格資訊
    });

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS);
    });

    let reply: string;
    try {
      reply = await Promise.race([replyPromise, timeoutPromise]) as string;
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        reply = getTimeoutTemplate();
      } else {
        throw error;
      }
    }

    // 更新上下文
    cm.updateContext(context_obj.conversationId, {
      last_intent: intent,
      slots: mergedEntities,
      userMessage: body.message,
      assistantMessage: reply,
    });

    const response: ChatResponse = {
      reply,
      intent,
      conversationId: context_obj.conversationId,
      updatedContext: {
        last_intent: intent,
        slots: mergedEntities,
      },
      suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, undefined, kb),
    };

    const responseTime = Date.now() - startTime;
    console.log(`[Chat] ${intent} - ${responseTime}ms`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Chat Error]', error);
    console.error('[Chat Error] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Chat Error] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Chat Error] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const response: ChatResponse = {
      reply: getApiErrorTemplate(),
      intent: 'handoff_to_human',
      updatedContext: {
        last_intent: 'handoff_to_human',
        slots: {},
      },
    };

    return new Response(
      JSON.stringify(response),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

