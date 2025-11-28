/**
 * 對話上下文管理器（Cloudflare Pages Functions 版本）
 * 使用內存存儲（後續可升級為 KV）
 */

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
  userMessage?: string;
  assistantMessage?: string;
}

// 全局上下文存儲（在 Cloudflare Workers 中，每個請求是獨立的，但可以通過全局變量共享）
// 注意：這在 Cloudflare Pages Functions 中可能不會持久化，建議後續使用 KV
const contexts: Map<string, ConversationContext> = new Map();
const CONTEXT_TTL = 30 * 60 * 1000; // 30 分鐘

export class ContextManager {
  /**
   * 取得上下文
   */
  getContext(conversationId: string): ConversationContext | null {
    const context = contexts.get(conversationId);
    if (!context) {
      return null;
    }

    // 檢查是否過期
    if (Date.now() - context.lastActivityAt > CONTEXT_TTL) {
      contexts.delete(conversationId);
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

    contexts.set(id, context);
    return context;
  }

  /**
   * 更新上下文
   */
  updateContext(
    conversationId: string,
    updates: {
      last_intent?: string;
      slots?: Record<string, any>;
      userMessage?: string;
      assistantMessage?: string;
      state?: ConversationContext['state'];
    }
  ): void {
    const context = contexts.get(conversationId);
    if (!context) {
      return;
    }

    // 更新欄位
    if (updates.last_intent !== undefined) {
      context.last_intent = updates.last_intent;
    }

    if (updates.slots) {
      context.slots = { ...context.slots, ...updates.slots };
    }

    if (updates.state) {
      context.state = updates.state;
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

    // 限制歷史記錄長度（保留最近 20 條）
    if (context.history.length > 20) {
      context.history = context.history.slice(-20);
    }

    context.lastActivityAt = Date.now();
    contexts.set(conversationId, context);
  }

  /**
   * 生成對話 ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 清理過期上下文（可選，在 Cloudflare 中可能不需要）
   */
  cleanupExpiredContexts(): void {
    const now = Date.now();
    for (const [id, context] of contexts.entries()) {
      if (now - context.lastActivityAt > CONTEXT_TTL) {
        contexts.delete(id);
      }
    }
  }
}

