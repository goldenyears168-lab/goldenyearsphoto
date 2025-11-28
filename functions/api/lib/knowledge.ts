/**
 * 知識庫載入服務（Cloudflare Pages Functions 版本）
 * 使用動態載入 JSON 檔案
 */

// 注意：在 Cloudflare Pages Functions 中，JSON 文件需要通過 fetch 或動態 import 載入
// 這裡使用動態 import，確保在運行時載入

// 類型定義
export interface Service {
  id: string;
  name: string;
  name_en: string;
  one_line: string;
  target_audience: string[];
  use_cases: string[];
  price_range: string;
  price_min?: number;
  price_max?: number;
  price_unit: string;
  pricing_model: string;
  shooting_time: string;
  includes_makeup: boolean;
  retouching_count: string;
  add_ons: string[];
  pros: string[];
  not_suitable: string[];
}

export interface Persona {
  id: string;
  name: string;
  goals: string[];
  concerns: string[];
  budget_level: string;
  recommended_services: string[];
  reasoning: string;
}

export interface Policy {
  id: string;
  category: string;
  critical: boolean;
  question: string;
  answer: string;
  keywords: string[];
}

export interface ContactInfo {
  branches: Array<{
    id: string;
    name: string;
    address: string;
    address_note: string;
    phone: string;
    hours: {
      weekday: string;
      note: string;
    };
    parking: {
      available: boolean;
      locations: string[];
      recommendation: string;
    };
  }>;
  contact_channels: {
    email: string;
    ig: string;
    line: {
      available: boolean;
      message: string;
    };
    booking_link: string;
  };
  ai_response_rules: {
    line_inquiry: string;
    handoff_to_human: {
      email: string;
      phone: {
        zhongshan: string;
        gongguan: string;
      };
      ig: string;
      booking_link: string;
    };
  };
}

export interface ResponseTemplate {
  main_answer: string;
  supplementary_info: string;
  next_best_actions: string[];
}

export interface ServiceSummary {
  core_purpose: string;
  price_pricing: string;
  shooting_time_selection: string;
  delivery_speed: string;
  add_ons_limitations: string;
}

export interface EmotionTemplate {
  emotion: string;
  keywords: string[];
  warm_comfort: string;
  assistance_explanation: string;
  next_best_actions: string[];
}

export interface FAQQuestion {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  critical_note?: string;
  handling_guideline?: string;
}

export interface FAQCategory {
  title: string;
  phone_handling?: {
    title: string;
    guidelines: Array<{
      situation: string;
      steps?: string[];
      response?: string;
    }>;
  };
  questions: FAQQuestion[];
  internal_operations?: {
    title: string;
    items: Array<{
      id: string;
      topic: string;
      instructions: string;
      link?: string;
      sample_responses?: string[];
    }>;
  };
}

export interface FAQDetailed {
  version: string;
  last_updated: string;
  data_source: string;
  categories: {
    booking?: FAQCategory;
    delivery?: FAQCategory;
    shooting?: FAQCategory;
    other?: FAQCategory;
  };
}

export class KnowledgeBase {
  private services: Service[] = [];
  private personas: Persona[] = [];
  private policies: Policy[] = [];
  private contactInfo: ContactInfo | null = null;
  private responseTemplates: Record<string, ResponseTemplate> = {};
  private serviceSummaries: Record<string, ServiceSummary> = {};
  private emotionTemplates: Record<string, EmotionTemplate> = {};
  private intentNBAMapping: Record<string, string[]> = {};
  private faqDetailed: FAQDetailed | null = null;
  private loaded = false;

  /**
   * 載入所有知識庫資料
   * 使用動態 import 載入 JSON 文件
   * @param baseUrl 可選的基礎 URL，用於構建完整的文件路徑
   */
  async load(baseUrl?: string): Promise<void> {
    try {
      // 動態載入 JSON 文件
      // 在 Cloudflare Pages Functions 中，需要確保這些文件在構建輸出中
      
      // 嘗試使用動態 import（如果支持）
      try {
        console.log('[Knowledge] Attempting dynamic import...');
        const servicesModule = await import('../../../knowledge/services.json');
        const personasModule = await import('../../../knowledge/personas.json');
        const policiesModule = await import('../../../knowledge/policies.json');
        const contactInfoModule = await import('../../../knowledge/contact_info.json');
        const responseTemplatesModule = await import('../../../knowledge/response_templates.json');
        const serviceSummariesModule = await import('../../../knowledge/service_summaries.json');
        const emotionTemplatesModule = await import('../../../knowledge/emotion_templates.json');
        const intentNBAMappingModule = await import('../../../knowledge/intent_nba_mapping.json');
        const faqDetailedModule = await import('../../../knowledge/faq_detailed.json');

        this.services = (servicesModule.default || servicesModule).services || [];
        this.personas = (personasModule.default || personasModule).personas || [];
        this.policies = (policiesModule.default || policiesModule).policies || [];
        
        const contactData = (contactInfoModule.default || contactInfoModule);
        this.contactInfo = {
          branches: contactData.branches || [],
          contact_channels: contactData.contact_channels || {
            email: '',
            ig: '',
            line: { available: false, message: '' },
            booking_link: '',
          },
          ai_response_rules: contactData.ai_response_rules || {
            line_inquiry: '',
            handoff_to_human: {
              email: '',
              phone: { zhongshan: '', gongguan: '' },
              ig: '',
              booking_link: '',
            },
          },
        };

        // 載入新的資料結構
        const responseTemplatesData = (responseTemplatesModule.default || responseTemplatesModule);
        this.responseTemplates = responseTemplatesData.templates || {};

        const serviceSummariesData = (serviceSummariesModule.default || serviceSummariesModule);
        this.serviceSummaries = serviceSummariesData.summaries || {};

        const emotionTemplatesData = (emotionTemplatesModule.default || emotionTemplatesModule);
        this.emotionTemplates = emotionTemplatesData.templates || {};

        const intentNBAMappingData = (intentNBAMappingModule.default || intentNBAMappingModule);
        this.intentNBAMapping = intentNBAMappingData.mappings || {};

        const faqDetailedData = (faqDetailedModule.default || faqDetailedModule);
        this.faqDetailed = faqDetailedData || null;

        console.log('[Knowledge] Dynamic import successful');
      } catch (importError) {
        // 如果動態 import 失敗，嘗試使用 fetch（適用於生產環境）
        console.warn('[Knowledge] Dynamic import failed, trying fetch:', importError);
        
        // 構建基礎 URL
        // 如果提供了 baseUrl，使用它；否則嘗試從環境變數或使用默認路徑
        let fetchBaseUrl = baseUrl;
        if (!fetchBaseUrl) {
          // 嘗試從環境變數獲取
          if (typeof globalThis !== 'undefined' && (globalThis as any).CF_PAGES_URL) {
            fetchBaseUrl = (globalThis as any).CF_PAGES_URL;
          } else {
            // 使用相對路徑（在 Cloudflare Pages 中應該能工作）
            fetchBaseUrl = '';
          }
        }
        
        // 確保 baseUrl 以 / 結尾（如果有的話）
        if (fetchBaseUrl && !fetchBaseUrl.endsWith('/')) {
          fetchBaseUrl += '/';
        }
        
        const knowledgePaths = [
          'knowledge/services.json',
          'knowledge/personas.json',
          'knowledge/policies.json',
          'knowledge/contact_info.json',
          'knowledge/response_templates.json',
          'knowledge/service_summaries.json',
          'knowledge/emotion_templates.json',
          'knowledge/intent_nba_mapping.json',
          'knowledge/faq_detailed.json'
        ];
        
        console.log('[Knowledge] Fetching knowledge files from:', fetchBaseUrl || 'relative path');
        
        const [servicesRes, personasRes, policiesRes, contactInfoRes, responseTemplatesRes, serviceSummariesRes, emotionTemplatesRes, intentNBAMappingRes, faqDetailedRes] = await Promise.all([
          fetch(`${fetchBaseUrl}knowledge/services.json`),
          fetch(`${fetchBaseUrl}knowledge/personas.json`),
          fetch(`${fetchBaseUrl}knowledge/policies.json`),
          fetch(`${fetchBaseUrl}knowledge/contact_info.json`),
          fetch(`${fetchBaseUrl}knowledge/response_templates.json`),
          fetch(`${fetchBaseUrl}knowledge/service_summaries.json`),
          fetch(`${fetchBaseUrl}knowledge/emotion_templates.json`),
          fetch(`${fetchBaseUrl}knowledge/intent_nba_mapping.json`),
          fetch(`${fetchBaseUrl}knowledge/faq_detailed.json`)
        ]);

        // 檢查響應狀態（新檔案如果載入失敗，使用空物件，不中斷流程）
        if (!servicesRes.ok) {
          throw new Error(`Failed to fetch services.json: ${servicesRes.status} ${servicesRes.statusText}`);
        }
        if (!personasRes.ok) {
          throw new Error(`Failed to fetch personas.json: ${personasRes.status} ${personasRes.statusText}`);
        }
        if (!policiesRes.ok) {
          throw new Error(`Failed to fetch policies.json: ${policiesRes.status} ${policiesRes.statusText}`);
        }
        if (!contactInfoRes.ok) {
          throw new Error(`Failed to fetch contact_info.json: ${contactInfoRes.status} ${contactInfoRes.statusText}`);
        }

        const [servicesData, personasData, policiesData, contactInfoData, responseTemplatesData, serviceSummariesData, emotionTemplatesData, intentNBAMappingData, faqDetailedData] = await Promise.all([
          servicesRes.json(),
          personasRes.json(),
          policiesRes.json(),
          contactInfoRes.json(),
          responseTemplatesRes.ok ? responseTemplatesRes.json() : Promise.resolve({ templates: {} }),
          serviceSummariesRes.ok ? serviceSummariesRes.json() : Promise.resolve({ summaries: {} }),
          emotionTemplatesRes.ok ? emotionTemplatesRes.json() : Promise.resolve({ templates: {} }),
          intentNBAMappingRes.ok ? intentNBAMappingRes.json() : Promise.resolve({ mappings: {} }),
          faqDetailedRes.ok ? faqDetailedRes.json() : Promise.resolve(null)
        ]);

        this.services = servicesData.services || [];
        this.personas = personasData.personas || [];
        this.policies = policiesData.policies || [];
        
        this.contactInfo = {
          branches: contactInfoData.branches || [],
          contact_channels: contactInfoData.contact_channels || {
            email: '',
            ig: '',
            line: { available: false, message: '' },
            booking_link: '',
          },
          ai_response_rules: contactInfoData.ai_response_rules || {
            line_inquiry: '',
            handoff_to_human: {
              email: '',
              phone: { zhongshan: '', gongguan: '' },
              ig: '',
              booking_link: '',
            },
          },
        };

        // 載入新的資料結構
        this.responseTemplates = responseTemplatesData.templates || {};
        this.serviceSummaries = serviceSummariesData.summaries || {};
        this.emotionTemplates = emotionTemplatesData.templates || {};
        this.intentNBAMapping = intentNBAMappingData.mappings || {};
        this.faqDetailed = faqDetailedData || null;

        console.log('[Knowledge] Fetch successful');
      }

      this.loaded = true;
      console.log('[Knowledge] Knowledge base loaded successfully');
    } catch (error) {
      console.error('[Knowledge] Failed to load knowledge base:', error);
      console.error('[Knowledge] Error details:', error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error));
      throw new Error(`Failed to load knowledge base: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 取得服務資訊
   */
  getService(id: string): Service | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.services.find(s => s.id === id) || null;
  }

  /**
   * 取得所有服務
   */
  getAllServices(): Service[] {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.services;
  }

  /**
   * 取得客戶角色
   */
  getPersona(id: string): Persona | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.personas.find(p => p.id === id) || null;
  }

  /**
   * 搜尋 FAQ（關鍵字匹配）
   */
  searchFAQ(query: string): Policy[] {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    const lowerQuery = query.toLowerCase();
    const results: Array<{ policy: Policy; score: number }> = [];

    for (const policy of this.policies) {
      let score = 0;

      // 關鍵字匹配
      for (const keyword of policy.keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      // 問題內容匹配
      if (policy.question.toLowerCase().includes(lowerQuery)) {
        score += 2;
      }

      // 答案內容匹配
      if (policy.answer.toLowerCase().includes(lowerQuery)) {
        score += 1;
      }

      if (score > 0) {
        results.push({ policy, score });
      }
    }

    // 按分數排序，回傳前 3 個
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.policy);
  }

  /**
   * 取得聯絡資訊
   */
  getContactInfo(): ContactInfo | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.contactInfo;
  }

  /**
   * 檢查是否已載入
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 取得回覆模板
   */
  getResponseTemplate(intent: string): ResponseTemplate | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.responseTemplates[intent] || null;
  }

  /**
   * 取得服務摘要
   */
  getServiceSummary(serviceId: string): ServiceSummary | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.serviceSummaries[serviceId] || null;
  }

  /**
   * 取得情緒模板
   */
  getEmotionTemplate(emotion: string): EmotionTemplate | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.emotionTemplates[emotion] || null;
  }

  /**
   * 根據關鍵字搜尋情緒模板
   */
  findEmotionTemplateByKeywords(message: string): EmotionTemplate | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    const lowerMessage = message.toLowerCase();
    
    for (const template of Object.values(this.emotionTemplates)) {
      if (template.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
        return template;
      }
    }
    return null;
  }

  /**
   * 取得意圖對應的 Next Best Actions
   */
  getNextBestActions(intent: string): string[] {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.intentNBAMapping[intent] || [];
  }

  /**
   * 取得詳細FAQ資料
   */
  getFAQDetailed(): FAQDetailed | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.faqDetailed;
  }

  /**
   * 根據類別取得FAQ問題
   */
  getFAQByCategory(category: 'booking' | 'delivery' | 'shooting' | 'other'): FAQCategory | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    return this.faqDetailed?.categories[category] || null;
  }

  /**
   * 根據關鍵字搜尋FAQ問題
   */
  searchFAQDetailed(query: string): FAQQuestion[] {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    if (!this.faqDetailed) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results: Array<{ question: FAQQuestion; score: number }> = [];

    // 遍歷所有類別
    for (const category of Object.values(this.faqDetailed.categories)) {
      if (!category || !category.questions) continue;

      for (const question of category.questions) {
        let score = 0;

        // 關鍵字匹配
        for (const keyword of question.keywords) {
          if (lowerQuery.includes(keyword.toLowerCase())) {
            score += 2;
          }
        }

        // 問題內容匹配
        if (question.question.toLowerCase().includes(lowerQuery)) {
          score += 3;
        }

        // 答案內容匹配
        if (question.answer.toLowerCase().includes(lowerQuery)) {
          score += 1;
        }

        if (score > 0) {
          results.push({ question, score });
        }
      }
    }

    // 按分數排序，回傳前 5 個
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.question);
  }

  /**
   * 根據ID取得FAQ問題
   */
  getFAQQuestionById(id: string): FAQQuestion | null {
    if (!this.loaded) {
      throw new Error('Knowledge base not loaded. Call load() first.');
    }
    if (!this.faqDetailed) {
      return null;
    }

    for (const category of Object.values(this.faqDetailed.categories)) {
      if (!category || !category.questions) continue;
      const question = category.questions.find(q => q.id === id);
      if (question) {
        return question;
      }
    }

    return null;
  }
}

