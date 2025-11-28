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
  knowledgeBase?: any; // KnowledgeBase 实例，用于获取价格等信息
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
    // 使用 gemini-2.0-flash（已验证可用，性能更好）
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * 生成回覆
   */
  async generateReply(params: GenerateReplyParams): Promise<string> {
    const { message, intent, entities, context, mode, knowledgeBase } = params;

    // 構建 System Prompt
    const systemPrompt = this.buildSystemPrompt(mode, intent, entities, context, knowledgeBase);

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
    context: ConversationContext,
    knowledgeBase?: any
  ): string {
    let prompt = `你是「好時有影」攝影工作室的 AI 形象顧問，負責協助客戶選擇拍攝方案、說明流程與價格。

## 品牌定位
- 溫暖、專業、真誠、簡單
- 語氣：朋友 + 顧問的混搭風格
- 不推銷、不承諾無法達成的價格、不給不確定資訊

## 關鍵約束（必須嚴格遵守）
1. **禁止編造服務**：**嚴禁編造任何不存在的服務或服務項目**。只能使用知識庫中實際存在的服務。若知識庫沒有相關資料，禁止自己猜測或引用外部資訊。**只有在知識庫真的沒有相關資料時，才建議聯絡真人**。
2. **價格必須出自 JSON**：所有價格數字皆須出自 JSON/FAQ，不得憑空估算。若找不到價格資訊，請說明「實際金額以現場與當季公告為準」，並提供預約連結讓客戶自行查詢。
3. **政策類問題強制從 FAQ 回答**：政策類問題（價格、取消、隱私、授權）必須從 FAQ/JSON 回答，禁止 LLM 獨立生成。若 FAQ 沒找到，才建議聯絡真人。
4. **投訴處理使用模板**：投訴處理（complaint intent）必須使用嚴格模板，不允許自行決定補償方案。所有補償決策都落在真人客服。
5. **減少轉真人選項**：盡量用知識庫回答問題，不要輕易建議轉真人。只有在以下情況才建議轉真人：
   - 知識庫真的沒有相關資料
   - 客戶明確要求找真人
   - 企業/團體報價等需要客製化的服務
6. **服務項目限制**：只能推薦知識庫中實際存在的服務。若客戶詢問不存在的服務（例如：寶寶寫真、抓周、孕婦寫真等），必須明確說明「我們目前沒有提供這個服務」，並引導客戶選擇現有的服務項目。

## 當前模式
${this.getModeDescription(mode)}

## 當前意圖
${this.getIntentDescription(intent)}

## 已提取的實體
${this.formatEntities(entities)}

## 對話上下文
${this.formatContext(context)}
`;

    // 加入實際存在的服務列表（防止編造不存在的服務）
    if (knowledgeBase) {
      try {
        const services = knowledgeBase.getAllServices();
        if (services && services.length > 0) {
          prompt += `\n## 實際存在的服務項目（只能推薦以下服務，嚴禁編造其他服務）
`;
          services.forEach(service => {
            prompt += `- ${service.name}（${service.id}）：${service.one_line}\n`;
          });
          prompt += `\n**重要**：若客戶詢問上述列表以外的服務（例如：寶寶寫真、抓周、孕婦寫真等），必須明確說明「我們目前沒有提供這個服務」，並引導客戶選擇上述實際存在的服務項目。\n`;
        }
      } catch (error) {
        console.error('[LLM] Failed to get services from knowledge base:', error);
      }
    }

    // 如果是價格詢問，加入價格資訊
    if (intent === 'price_inquiry' && knowledgeBase) {
      try {
        const services = knowledgeBase.getAllServices();
        if (services && services.length > 0) {
          prompt += `\n## 價格資訊（必須使用以下資料）
`;
          services.forEach(service => {
            prompt += `- ${service.name}：${service.price_range}（${service.pricing_model}）\n`;
          });
        }
      } catch (error) {
        console.error('[LLM] Failed to get services from knowledge base:', error);
      }
    }

    // 取得聯絡資訊（地址、電話等）- 所有意圖都需要
    let bookingLink = '/booking/';
    let contactInfo: any = null;
    if (knowledgeBase) {
      try {
        contactInfo = knowledgeBase.getContactInfo();
        if (contactInfo && contactInfo.contact_channels.booking_link) {
          bookingLink = contactInfo.contact_channels.booking_link;
        }
      } catch (error) {
        console.error('[LLM] Failed to get contact info from knowledge base:', error);
      }
    }

    // 如果是地址/地點詢問，加入詳細地址資訊
    if (intent === 'location_inquiry' && contactInfo) {
      prompt += `\n## 分店地址資訊（必須使用以下資料，嚴禁編造）
`;
      contactInfo.branches.forEach((branch: any) => {
        prompt += `- ${branch.name}：
  - 地址：${branch.address}（${branch.address_note}）
  - 電話：${branch.phone}
  - 營業時間：${branch.hours.weekday}（${branch.hours.note}）
  - 停車資訊：${branch.parking.available ? branch.parking.locations.join('、') : '無停車場'}。${branch.parking.recommendation || ''}
`;
      });
      prompt += `\n**重要**：必須使用上述地址資訊回答，嚴禁編造任何地址。若客戶詢問特定分店，請提供該分店的完整資訊。\n`;
    } else if (contactInfo) {
      // 其他意圖也加入基本聯絡資訊，防止編造
      prompt += `\n## 聯絡資訊（僅供參考，回答地址相關問題時必須使用）
`;
      contactInfo.branches.forEach((branch: any) => {
        prompt += `- ${branch.name}：${branch.address}（${branch.address_note}），電話：${branch.phone}\n`;
      });
      prompt += `\n**重要**：若客戶詢問地址、地點、分店等問題，必須使用上述地址資訊，嚴禁編造。\n`;
    }

    // 如果是預約詢問，加入預約連結資訊
    if (intent === 'booking_inquiry') {
      prompt += `\n## 預約連結資訊
預約頁面連結：${bookingLink}
`;
    }

    // 根據意圖調整回應要求
    if (intent === 'location_inquiry') {
      prompt += `\n## 回應要求（地址/地點詢問）
- **直接回答地址資訊，使用上面提供的分店地址資料**
- 如果客戶沒有指定分店，可以列出所有分店資訊
- 如果客戶指定了分店（中山或公館），只回答該分店的資訊
- 可以補充交通資訊（捷運站、停車場等）
- 結尾可提供「想知道價格」或「如何預約」的選項
- **嚴禁編造地址**，只能使用上面提供的地址資訊
- **連結文字規範**：
  - 預約連結請使用「線上預約」：[線上預約](${bookingLink})
  - 方案/價格連結請使用「方案與價目表」：[方案與價目表](/price-list)
`;
    } else if (intent === 'price_inquiry') {
      prompt += `\n## 回應要求（價格詢問）
- **直接回答價格資訊，不要繞彎或先問用途**
- 使用上面提供的價格資訊回答
- 明確說明計價方式（按張計費、低消等）
- 若上下文已有 service_type，直接給該服務的價格
- 若沒有明確服務類型，列出主要服務的價格範圍
- 結尾可提供「想了解更多」或「如何預約」的選項
- **連結文字規範**：
  - 預約連結請使用「線上預約」：[線上預約](${bookingLink})
  - 方案/價格連結請使用「方案與價目表」：[方案與價目表](/price-list)
`;
    } else if (intent === 'booking_inquiry') {
      prompt += `\n## 回應要求（預約詢問）- 嚴格遵守
**第一優先級：必須在第一句話就提供預約連結**

1. **回答結構（必須遵守）**：
   - 第一句話：直接提供預約連結，格式：「你可以透過我們的[線上預約](${bookingLink})選擇拍攝項目和時段。」
   - 第二句話（可選）：簡短的鼓勵或說明，例如：「預約完成後會收到確認信，裡面有詳細資訊。」
   - **嚴禁**在第一句話之前講任何政策、流程、改期、取消等內容
   - **嚴禁**在提供預約連結之前講任何其他內容

2. **預約連結格式（必須使用）**：
   - 連結文字必須是「線上預約」
   - 連結地址：${bookingLink}
   - 格式：[線上預約](${bookingLink})

3. **禁止行為**：
   - ❌ 禁止先講改期、取消政策
   - ❌ 禁止先講預約流程細節
   - ❌ 禁止先講遲到、費用等政策
   - ❌ 禁止長篇大論
   - ✅ 只有在客戶明確問到「改期」或「取消」時，才詳細說明相關政策

4. **標準回答範例**：
   「你可以透過我們的[線上預約](${bookingLink})選擇拍攝項目和時段。預約完成後會收到確認信，裡面有詳細資訊。如果有任何問題，隨時告訴我 😊」

5. **結尾選項**：
   - 可提供「想知道價格」或「拍攝流程」的選項
   - 不要提供「如何預約」選項（因為已經在回答預約了）

**重要**：如果客戶問「如何預約」，回答的第一句話必須是預約連結，不能有任何其他內容在前面。
`;
    } else {
      prompt += `\n## 回應要求
- 回覆要溫暖、專業、真誠
- 每次回覆不只回答問題，還要「給一個下一步選項」
- 優先協助釐清目的（用途），再談方案與價格
- 若資訊不足，追問關鍵 1-3 題
- 結尾提供 CTA（預約 / 看方案 / 問下一題）
- **不要輕易建議轉真人**，盡量用知識庫回答。只有在知識庫真的沒有資料時才建議轉真人
- **連結文字規範**：
  - 預約連結請使用「線上預約」：[線上預約](${bookingLink})
  - 方案/價格連結請使用「方案與價目表」：[方案與價目表](/price-list)
`;
    }

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
      location_inquiry: '地址/地點詢問',
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

