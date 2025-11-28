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

export class KnowledgeBase {
  private services: Service[] = [];
  private personas: Persona[] = [];
  private policies: Policy[] = [];
  private contactInfo: ContactInfo | null = null;
  private loaded = false;

  /**
   * 載入所有知識庫資料
   * 使用動態 import 載入 JSON 文件
   */
  async load(): Promise<void> {
    try {
      // 動態載入 JSON 文件
      // 在 Cloudflare Pages Functions 中，需要確保這些文件在構建輸出中
      
      // 嘗試使用動態 import（如果支持）
      try {
        const servicesModule = await import('../../../knowledge/services.json');
        const personasModule = await import('../../../knowledge/personas.json');
        const policiesModule = await import('../../../knowledge/policies.json');
        const contactInfoModule = await import('../../../knowledge/contact_info.json');

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
      } catch (importError) {
        // 如果動態 import 失敗，嘗試使用 fetch（適用於生產環境）
        console.warn('Dynamic import failed, trying fetch:', importError);
        
        // 在 Cloudflare Pages 中，knowledge 文件在 _site/knowledge/ 目錄下
        // 使用相對路徑 fetch，Cloudflare Pages 會自動解析到正確的位置
        const servicesRes = await fetch('/knowledge/services.json');
        const personasRes = await fetch('/knowledge/personas.json');
        const policiesRes = await fetch('/knowledge/policies.json');
        const contactInfoRes = await fetch('/knowledge/contact_info.json');

        const servicesData = await servicesRes.json();
        const personasData = await personasRes.json();
        const policiesData = await policiesRes.json();
        const contactInfoData = await contactInfoRes.json();

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
      }

      this.loaded = true;
    } catch (error) {
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
}

