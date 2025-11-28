/**
 * LLM 服務封裝（Cloudflare Pages Functions 版本）
 * 整合 Google Gemini API
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { KnowledgeBase, Service, Persona } from './knowledge.js';

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
      return response.text();
    } catch (error) {
      console.error('[LLM Error]', error);
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
    // 動態載入知識庫（需要傳入實例）
    // 這裡簡化處理，實際使用時需要傳入 knowledgeBase 實例
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

  private getModeDescription(mode: string): string {
    const descriptions: Record<string, string> = {
      auto: '自動模式：根據使用者訊息自動判斷處理方式',
      decision_recommendation: '方案推薦模式：協助使用者選擇適合的拍攝方案',
      faq_flow_price: 'FAQ 流程與價格模式：回答流程、價格、政策相關問題',
    };
    return descriptions[mode] || mode;
  }

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

  private formatEntities(entities: Record<string, any>): string {
    if (Object.keys(entities).length === 0) {
      return '無';
    }
    return JSON.stringify(entities, null, 2);
  }

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
}

