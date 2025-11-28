/**
 * /api/chat 路由
 * 處理 AI 客服聊天請求
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { createError } from '../middleware/errorHandler.js';
import { LLMService } from '../services/llm.js';
import { knowledgeBase } from '../services/knowledge.js';
import { contextManager, ConversationContext } from '../services/contextManager.js';
import { getDontUnderstandFirst, getDontUnderstandSecond, getApiErrorTemplate, getTimeoutTemplate } from '../services/responseTemplates.js';

const router = Router();

// 初始化 LLM 服務
let llmService: LLMService | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    llmService = new LLMService(apiKey);
  } else {
    logger.warn('GEMINI_API_KEY not set, LLM service will not be available');
  }
} catch (error) {
  logger.logError(error as Error, { context: 'LLM service initialization' });
}

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
 * 意圖分類（關鍵字匹配 + 上下文感知）
 * TODO: 未來可改用 LLM 進行更精確的分類
 */
function classifyIntent(
  message: string,
  context?: { last_intent?: string; slots?: Record<string, any> }
): string {
  const lowerMessage = message.toLowerCase();

  // 檢查是否為投訴（優先級最高）
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
  if (priceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'price_inquiry';
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

  // 使用上次的意圖（如果有上下文且訊息很短）
  if (context?.last_intent && lowerMessage.length < 10) {
    return context.last_intent;
  }

  // 預設為服務諮詢
  return 'service_inquiry';
}

/**
 * 實體提取（關鍵字匹配，支援多種表達方式）
 * TODO: 未來可改用 LLM 進行更精確的提取
 */
function extractEntities(message: string): Record<string, any> {
  const lowerMessage = message.toLowerCase();
  const entities: Record<string, any> = {};

  // 提取 service_type（按優先級）
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
      break; // 找到第一個匹配就停止
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
 * POST /api/chat
 * 處理聊天請求
 */
router.post('/', async (req: Request, res: Response, next) => {
  const startTime = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const TIMEOUT_MS = 10000; // 10 秒超時

  // 設定超時
  const timeoutId = setTimeout(() => {
    logger.warn('Request timeout', {
      ip,
      path: req.path,
      elapsed: Date.now() - startTime,
    });
  }, TIMEOUT_MS);

  try {
    const body = req.body as ChatRequestBody;
    const mode = body.mode || 'auto';

    // 取得或建立上下文
    let context: ConversationContext;
    if (body.conversationId) {
      const existingContext = contextManager.getContext(body.conversationId);
      if (existingContext) {
        context = existingContext;
      } else {
        // 上下文已過期，建立新的
        context = contextManager.createContext(body.conversationId);
      }
    } else {
      // 沒有提供 conversationId，建立新的
      context = contextManager.createContext();
    }

    // 意圖分類（考慮上下文）
    const intent = classifyIntent(body.message, {
      last_intent: context.last_intent,
      slots: context.slots,
    });

    // 實體提取
    const entities = extractEntities(body.message);

    // 合併上下文中的實體（上下文優先）
    const mergedEntities = {
      ...context.slots,
      ...entities, // 新提取的實體覆蓋舊的
    };

    // 決定下一個狀態
    const hasRequiredSlots = contextManager.hasRequiredSlotsForRecommendation({
      ...context,
      slots: mergedEntities,
    });
    const nextState = contextManager.determineNextState(
      context.state,
      intent,
      hasRequiredSlots
    );

    // 檢查 Critical FAQ（政策類問題）
    if (intent === 'price_inquiry' || intent === 'booking_inquiry') {
      const faqResults = knowledgeBase.searchFAQ(body.message);
      const criticalFAQ = faqResults.find(faq => faq.critical);
      if (criticalFAQ) {
        // 直接使用 FAQ 答案，不經過 LLM
        const reply = criticalFAQ.answer;
        
        // 更新上下文
        contextManager.updateContext(context.conversationId, {
          last_intent: intent,
          slots: mergedEntities,
          userMessage: body.message,
          assistantMessage: reply,
          state: nextState,
        });

        const response: ChatResponse = {
          reply,
          intent,
          conversationId: context.conversationId,
          updatedContext: {
            last_intent: intent,
            slots: mergedEntities,
          },
          suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, nextState),
        };
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        logger.logRequest('POST', '/api/chat', ip, 200, responseTime);
        return res.json(response);
      }
    }

    // 使用 LLM 生成回覆
    if (!llmService) {
      clearTimeout(timeoutId);
      const response: ChatResponse = {
        reply: getApiErrorTemplate(),
        intent: 'handoff_to_human',
        updatedContext: {
          last_intent: 'handoff_to_human',
          slots: mergedEntities,
        },
      };
      const responseTime = Date.now() - startTime;
      logger.logRequest('POST', '/api/chat', ip, 503, responseTime);
      return res.status(503).json(response);
    }

    // 構建 LLM 上下文（包含對話歷史）
    const llmContext: ConversationContext = {
      ...context,
      slots: mergedEntities,
      last_intent: intent,
    };

    // 轉換歷史記錄格式（從 contextManager 格式轉為 LLM 格式）
    const history = context.history.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.text,
    }));

    const reply = await llmService.generateReply({
      message: body.message,
      intent,
      entities: mergedEntities,
      context: {
        last_intent: context.last_intent,
        slots: mergedEntities,
        history,
      },
      mode,
    });

    clearTimeout(timeoutId);

    // 更新上下文
    contextManager.updateContext(context.conversationId, {
      last_intent: intent,
      slots: mergedEntities,
      userMessage: body.message,
      assistantMessage: reply,
      state: nextState,
    });

    const response: ChatResponse = {
      reply,
      intent,
      conversationId: context.conversationId,
      updatedContext: {
        last_intent: intent,
        slots: mergedEntities,
      },
      suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, nextState),
    };

    const responseTime = Date.now() - startTime;
    logger.logRequest('POST', '/api/chat', ip, 200, responseTime);

    res.json(response);
  } catch (error) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    logger.logRequest('POST', '/api/chat', ip, 500, responseTime);
    logger.logError(error as Error, {
      path: req.path,
      body: req.body,
    });
    next(error);
  }
});

/**
 * 取得建議的快速回覆
 */
function getSuggestedQuickReplies(
  intent: string,
  entities: Record<string, any>,
  state?: string
): string[] {
  // 根據狀態和意圖提供不同的建議
  if (state === 'COLLECTING_INFO') {
    if (entities.service_type) {
      return ['想知道價格', '如何預約', '拍攝流程'];
    } else {
      return ['我想拍形象照', '我想拍證件照', '我想拍全家福'];
    }
  } else if (state === 'RECOMMENDING') {
    return ['我想了解更多', '如何預約', '聯絡真人'];
  } else if (intent === 'service_inquiry') {
    return ['想知道價格', '如何預約', '拍攝流程'];
  } else if (intent === 'price_inquiry') {
    return ['我想了解更多', '如何預約', '聯絡真人'];
  } else if (intent === 'greeting') {
    return ['我想拍形象照', '想知道價格', '如何預約'];
  }
  return ['我想了解更多', '如何預約', '聯絡真人'];
}

export default router;

