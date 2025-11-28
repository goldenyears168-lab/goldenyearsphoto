/**
 * LLM 服務封裝
 * 整合 Google Gemini API，實現智能回覆生成
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { knowledgeBase, Service, Persona } from './knowledge.js';
import { getComplaintTemplate, getHandoffTemplate } from './responseTemplates.js';
import { logger } from '../utils/logger.js';

export interface ConversationContext {
  last_intent?: string;
  slots?: {
    service_type?: string;
    use_case?: string;
    persona?: string;
  };
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface GenerateReplyParams {
  message: string;
  intent: string;
  entities: Record<string, any>;
  context: ConversationContext;
  mode: 'auto' | 'decision_recommendation' | 'faq_flow_price';
}

export class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * 生成回覆
   */
  async generateReply(params: GenerateReplyParams): Promise<string> {
    const { message, intent, entities, context, mode } = params;

    // 特殊處理：投訴直接使用模板
    if (intent === 'complaint') {
      return getComplaintTemplate();
    }

    // 特殊處理：轉真人直接使用模板
    if (intent === 'handoff_to_human') {
      return getHandoffTemplate();
    }

    // 構建 System Prompt
    const systemPrompt = this.buildSystemPrompt(mode, intent, entities, context);

    // 構建用戶訊息
    const userMessage = this.buildUserMessage(message, context);

    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userMessage }],
          },
        ],
      });

      const response = result.response;
      const reply = response.text();

      // 驗證回覆（檢查是否包含禁止的內容）
      this.validateReply(reply, intent);

      return reply;
    } catch (error) {
      logger.logError(error as Error, {
        intent,
        mode,
        message: message.substring(0, 100),
      });
      throw new Error(`Failed to generate reply: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 構建 System Prompt
   */
  private buildSystemPrompt(
    mode: string,
    intent: string,
    entities: Record<string, any>,
    context: ConversationContext
  ): string {
    let prompt = `你是「好時有影」攝影工作室的 AI 形象顧問，負責協助客戶選擇拍攝方案、說明流程與價格。

## 品牌定位
- 溫暖、專業、真誠、簡單
- 語氣：朋友 + 顧問的混搭風格
- 不推銷、不承諾無法達成的價格、不給不確定資訊

## 關鍵約束（必須嚴格遵守）
1. **禁止猜測**：若知識庫沒有相關資料，禁止自己猜測或引用外部資訊，請用「目前沒有相關規則，建議你聯絡真人」這類句子。
2. **價格必須出自 JSON**：所有價格數字皆須出自 JSON/FAQ，不得憑空估算。若找不到價格資訊，請說明「實際金額以現場與當季公告為準」，並引導至真人確認。
3. **政策類問題強制從 FAQ 回答**：政策類問題（價格、取消、隱私、授權）必須從 FAQ/JSON 回答，禁止 LLM 獨立生成。若 FAQ 沒找到，請明講「這個問題超出目前機器人範圍，請聯絡真人」。
4. **投訴處理使用模板**：投訴處理（complaint intent）必須使用嚴格模板，不允許自行決定補償方案。所有補償決策都落在真人客服。

## 當前模式
${this.getModeDescription(mode)}

## 當前意圖
${this.getIntentDescription(intent)}

## 已提取的實體
${this.formatEntities(entities)}

## 對話上下文
${this.formatContext(context)}
`;

    // 注入知識庫相關內容
    const knowledgeSnippets = this.getKnowledgeSnippets(intent, entities, context);
    if (knowledgeSnippets) {
      prompt += `\n## 相關知識庫內容\n${knowledgeSnippets}\n`;
    }

    prompt += `\n## 回應要求
- 回覆要溫暖、專業、真誠
- 每次回覆不只回答問題，還要「給一個下一步選項」
- 優先協助釐清目的（用途），再談方案與價格
- 若資訊不足，追問關鍵 1-3 題
- 結尾提供 CTA（預約 / 看方案 / 問下一題）
`;

    return prompt;
  }

  /**
   * 構建用戶訊息
   */
  private buildUserMessage(message: string, context: ConversationContext): string {
    let userMessage = `使用者訊息：${message}`;

    if (context.history && context.history.length > 0) {
      userMessage += '\n\n對話歷史：';
      context.history.slice(-3).forEach(msg => {
        userMessage += `\n${msg.role === 'user' ? '使用者' : 'AI'}：${msg.content}`;
      });
    }

    return userMessage;
  }

  /**
   * 取得模式描述
   */
  private getModeDescription(mode: string): string {
    const descriptions: Record<string, string> = {
      auto: '自動模式：根據使用者訊息自動判斷處理方式',
      decision_recommendation: '方案推薦模式：協助使用者選擇適合的拍攝方案',
      faq_flow_price: 'FAQ 流程與價格模式：回答流程、價格、政策相關問題',
    };
    return descriptions[mode] || mode;
  }

  /**
   * 取得意圖描述
   */
  private getIntentDescription(intent: string): string {
    const descriptions: Record<string, string> = {
      greeting: '打招呼',
      service_inquiry: '服務諮詢',
      price_inquiry: '價格詢問',
      booking_inquiry: '預約相關',
      comparison: '方案比較',
      complaint: '抱怨/投訴',
      handoff_to_human: '轉真人',
      goodbye: '結束對話',
    };
    return descriptions[intent] || intent;
  }

  /**
   * 格式化實體
   */
  private formatEntities(entities: Record<string, any>): string {
    if (Object.keys(entities).length === 0) {
      return '無';
    }
    return JSON.stringify(entities, null, 2);
  }

  /**
   * 格式化上下文
   */
  private formatContext(context: ConversationContext): string {
    const parts: string[] = [];
    if (context.last_intent) {
      parts.push(`上次意圖：${context.last_intent}`);
    }
    if (context.slots && Object.keys(context.slots).length > 0) {
      parts.push(`已收集資訊：${JSON.stringify(context.slots)}`);
    }
    return parts.length > 0 ? parts.join('\n') : '無';
  }

  /**
   * 取得知識庫片段
   */
  private getKnowledgeSnippets(
    intent: string,
    entities: Record<string, any>,
    context: ConversationContext
  ): string | null {
    const snippets: string[] = [];

    // 如果有 service_type，載入服務資訊
    if (entities.service_type || context.slots?.service_type) {
      const serviceId = entities.service_type || context.slots?.service_type;
      const service = knowledgeBase.getService(serviceId);
      if (service) {
        snippets.push(`服務資訊：${service.name}\n${service.one_line}\n價格：${service.price_range}\n拍攝時間：${service.shooting_time}`);
      }
    }

    // 如果有 persona，載入客戶角色資訊
    if (entities.persona || context.slots?.persona) {
      const personaId = entities.persona || context.slots?.persona;
      const persona = knowledgeBase.getPersona(personaId);
      if (persona) {
        snippets.push(`客戶角色：${persona.name}\n推薦服務：${persona.recommended_services.join(', ')}\n推薦理由：${persona.reasoning}`);
      }
    }

    // 價格相關意圖，載入所有服務價格
    if (intent === 'price_inquiry') {
      const services = knowledgeBase.getAllServices();
      const prices = services.map(s => `${s.name}：${s.price_range}`).join('\n');
      snippets.push(`所有服務價格：\n${prices}`);
    }

    return snippets.length > 0 ? snippets.join('\n\n') : null;
  }

  /**
   * 驗證回覆（檢查是否包含禁止的內容）
   */
  private validateReply(reply: string, intent: string): void {
    // 檢查是否包含價格數字但沒有說明來源
    const pricePattern = /NT\$[\d,]+/g;
    const prices = reply.match(pricePattern);
    if (prices && intent === 'price_inquiry') {
      // 如果回覆包含價格，應該也要提到「以現場公告為準」
      if (!reply.includes('現場') && !reply.includes('公告') && !reply.includes('實際金額')) {
        logger.warn('Reply contains price but missing disclaimer', {
          intent,
          prices,
        });
      }
    }
  }
}

