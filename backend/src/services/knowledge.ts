/**
 * 知識庫載入服務
 * 從 JSON 檔案載入服務、客戶角色、FAQ、聯絡資訊等資料
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KNOWLEDGE_DIR = join(__dirname, '../../knowledge');

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

export interface Branch {
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
}

export interface ContactInfo {
  branches: Branch[];
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

interface ServicesData {
  version: string;
  last_updated: string;
  data_source: string;
  services: Service[];
}

interface PersonasData {
  version: string;
  last_updated: string;
  data_source: string;
  personas: Persona[];
}

interface PoliciesData {
  version: string;
  last_updated: string;
  data_source: string;
  critical: boolean;
  policies: Policy[];
}

interface ContactInfoData {
  version: string;
  last_updated: string;
  data_source: string;
  branches: Branch[];
  contact_channels: ContactInfo['contact_channels'];
  ai_response_rules: ContactInfo['ai_response_rules'];
}

class KnowledgeBase {
  private services: Service[] = [];
  private personas: Persona[] = [];
  private policies: Policy[] = [];
  private contactInfo: ContactInfo | null = null;
  private loaded = false;

  /**
   * 載入所有知識庫資料
   */
  load(): void {
    try {
      // 載入服務資料
      const servicesData = JSON.parse(
        readFileSync(join(KNOWLEDGE_DIR, 'services.json'), 'utf-8')
      ) as ServicesData;
      this.services = servicesData.services;

      // 載入客戶角色資料
      const personasData = JSON.parse(
        readFileSync(join(KNOWLEDGE_DIR, 'personas.json'), 'utf-8')
      ) as PersonasData;
      this.personas = personasData.personas;

      // 載入政策資料
      const policiesData = JSON.parse(
        readFileSync(join(KNOWLEDGE_DIR, 'policies.json'), 'utf-8')
      ) as PoliciesData;
      this.policies = policiesData.policies;

      // 載入聯絡資訊
      const contactInfoData = JSON.parse(
        readFileSync(join(KNOWLEDGE_DIR, 'contact_info.json'), 'utf-8')
      ) as ContactInfoData;
      this.contactInfo = {
        branches: contactInfoData.branches,
        contact_channels: contactInfoData.contact_channels,
        ai_response_rules: contactInfoData.ai_response_rules,
      };

      this.loaded = true;
    } catch (error) {
      throw new Error(`Failed to load knowledge base: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 取得服務資訊
   */
  getService(id: string): Service | null {
    if (!this.loaded) this.load();
    return this.services.find(s => s.id === id) || null;
  }

  /**
   * 取得所有服務
   */
  getAllServices(): Service[] {
    if (!this.loaded) this.load();
    return this.services;
  }

  /**
   * 根據關鍵字搜尋服務
   */
  searchServices(keyword: string): Service[] {
    if (!this.loaded) this.load();
    const lowerKeyword = keyword.toLowerCase();
    return this.services.filter(service => {
      return (
        service.name.toLowerCase().includes(lowerKeyword) ||
        service.name_en.toLowerCase().includes(lowerKeyword) ||
        service.one_line.toLowerCase().includes(lowerKeyword) ||
        service.use_cases.some(uc => uc.toLowerCase().includes(lowerKeyword))
      );
    });
  }

  /**
   * 取得客戶角色
   */
  getPersona(id: string): Persona | null {
    if (!this.loaded) this.load();
    return this.personas.find(p => p.id === id) || null;
  }

  /**
   * 取得所有客戶角色
   */
  getAllPersonas(): Persona[] {
    if (!this.loaded) this.load();
    return this.personas;
  }

  /**
   * 搜尋 FAQ（關鍵字匹配）
   */
  searchFAQ(query: string): Policy[] {
    if (!this.loaded) this.load();
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
   * 取得 Critical FAQ（政策類）
   */
  getCriticalFAQ(category?: string): Policy[] {
    if (!this.loaded) this.load();
    let criticalPolicies = this.policies.filter(p => p.critical);
    if (category) {
      criticalPolicies = criticalPolicies.filter(p => p.category === category);
    }
    return criticalPolicies;
  }

  /**
   * 取得聯絡資訊
   */
  getContactInfo(): ContactInfo | null {
    if (!this.loaded) this.load();
    return this.contactInfo;
  }

  /**
   * 取得分店資訊
   */
  getBranch(id: string): Branch | null {
    if (!this.loaded) this.load();
    return this.contactInfo?.branches.find(b => b.id === id) || null;
  }

  /**
   * 檢查是否已載入
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

// 單例模式
export const knowledgeBase = new KnowledgeBase();

