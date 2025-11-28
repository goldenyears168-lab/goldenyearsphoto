/**
 * 對話上下文管理器
 * 管理多輪對話的狀態、歷史和實體信息
 */

import { logger } from '../utils/logger.js';

export interface ConversationContext {
  conversationId: string;
  last_intent?: string;
  slots: {
    service_type?: string;
    use_case?: string;
    persona?: string;
    price_range?: string;
    branch?: string;
    booking_action?: string;
  };
  history: Array<{
    role: 'user' | 'assistant';
    text: string;
    timestamp: number;
  }>;
  state: 'INIT' | 'COLLECTING_INFO' | 'RECOMMENDING' | 'FOLLOW_UP' | 'COMPLETE';
  createdAt: number;
  lastActivityAt: number;
}

class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly CONTEXT_TTL = 30 * 60 * 1000; // 30 分鐘
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 每 5 分鐘清理一次過期上下文
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredContexts();
    }, 5 * 60 * 1000);
  }

  /**
   * 取得上下文
   */
  getContext(conversationId: string): ConversationContext | null {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return null;
    }

    // 檢查是否過期
    if (Date.now() - context.lastActivityAt > this.CONTEXT_TTL) {
      this.contexts.delete(conversationId);
      logger.debug('Context expired', { conversationId });
      return null;
    }

    return context;
  }

  /**
   * 建立新上下文
   */
  createContext(conversationId?: string): ConversationContext {
    const id = conversationId || this.generateConversationId();
    const now = Date.now();

    const context: ConversationContext = {
      conversationId: id,
      slots: {},
      history: [],
      state: 'INIT',
      createdAt: now,
      lastActivityAt: now,
    };

    this.contexts.set(id, context);
    logger.debug('Context created', { conversationId: id });
    return context;
  }

  /**
   * 更新上下文
   */
  updateContext(
    conversationId: string,
    updates: {
      last_intent?: string;
      slots?: Partial<ConversationContext['slots']>;
      userMessage?: string;
      assistantMessage?: string;
      state?: ConversationContext['state'];
    }
  ): ConversationContext | null {
    const context = this.getContext(conversationId);
    if (!context) {
      logger.warn('Context not found for update', { conversationId });
      return null;
    }

    // 更新意圖
    if (updates.last_intent) {
      context.last_intent = updates.last_intent;
    }

    // 更新 slots（合併而非覆蓋）
    if (updates.slots) {
      context.slots = {
        ...context.slots,
        ...updates.slots,
      };
    }

    // 更新歷史記錄
    if (updates.userMessage) {
      context.history.push({
        role: 'user',
        text: updates.userMessage,
        timestamp: Date.now(),
      });
    }

    if (updates.assistantMessage) {
      context.history.push({
        role: 'assistant',
        text: updates.assistantMessage,
        timestamp: Date.now(),
      });
    }

    // 限制歷史記錄長度（保留最近 10 輪對話）
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }

    // 更新狀態
    if (updates.state) {
      context.state = updates.state;
    }

    // 更新活動時間
    context.lastActivityAt = Date.now();

    this.contexts.set(conversationId, context);
    logger.debug('Context updated', {
      conversationId,
      state: context.state,
      slotsCount: Object.keys(context.slots).length,
    });

    return context;
  }

  /**
   * 根據意圖和當前狀態決定下一個狀態
   */
  determineNextState(
    currentState: ConversationContext['state'],
    intent: string,
    hasRequiredSlots: boolean
  ): ConversationContext['state'] {
    // 狀態轉換邏輯
    if (currentState === 'INIT') {
      if (intent === 'greeting') {
        return 'INIT';
      } else if (intent === 'service_inquiry' || intent === 'price_inquiry') {
        return 'COLLECTING_INFO';
      } else if (intent === 'handoff_to_human' || intent === 'complaint') {
        return 'COMPLETE';
      }
    } else if (currentState === 'COLLECTING_INFO') {
      if (hasRequiredSlots) {
        return 'RECOMMENDING';
      } else if (intent === 'handoff_to_human' || intent === 'complaint') {
        return 'COMPLETE';
      }
    } else if (currentState === 'RECOMMENDING') {
      if (intent === 'goodbye' || intent === 'handoff_to_human') {
        return 'COMPLETE';
      } else if (intent === 'service_inquiry' || intent === 'comparison') {
        return 'FOLLOW_UP';
      }
    } else if (currentState === 'FOLLOW_UP') {
      if (intent === 'goodbye' || intent === 'handoff_to_human') {
        return 'COMPLETE';
      }
    }

    // 預設保持當前狀態
    return currentState;
  }

  /**
   * 檢查是否有足夠的資訊進行推薦
   */
  hasRequiredSlotsForRecommendation(context: ConversationContext): boolean {
    // 至少需要 service_type 或 use_case
    return !!(context.slots.service_type || context.slots.use_case);
  }

  /**
   * 清理過期上下文
   */
  cleanupExpiredContexts(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, context] of this.contexts.entries()) {
      if (now - context.lastActivityAt > this.CONTEXT_TTL) {
        this.contexts.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up expired contexts', { count: cleanedCount });
    }
  }

  /**
   * 生成對話 ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 取得統計資訊
   */
  getStats(): {
    activeContexts: number;
    totalContexts: number;
  } {
    const now = Date.now();
    let activeCount = 0;

    for (const context of this.contexts.values()) {
      if (now - context.lastActivityAt <= this.CONTEXT_TTL) {
        activeCount++;
      }
    }

    return {
      activeContexts: activeCount,
      totalContexts: this.contexts.size,
    };
  }

  /**
   * 清理所有上下文（用於測試）
   */
  clearAll(): void {
    this.contexts.clear();
    logger.info('All contexts cleared');
  }

  /**
   * 停止清理定時器
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// 單例模式
export const contextManager = new ContextManager();

