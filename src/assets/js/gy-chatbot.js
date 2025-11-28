/**
 * 好時有影 AI 形象顧問 Widget
 * 前端聊天機器人介面
 */

(function () {
  'use strict';

  const GYChatbot = {
    config: {
      apiEndpoint: '/api/chat',
      pageType: 'home',
      locale: 'zh-TW',
      theme: 'light',
      timeout: 10000, // 10 秒超時
    },

    state: {
      isOpen: false,
      isLoading: false,
      conversationId: null,
      retryCount: 0,
      maxRetries: 2,
    },

    els: {},

    /**
     * 初始化 Widget
     */
    init(userConfig) {
      this.config = { ...this.config, ...userConfig };
      this.createDOM();
      this.bindEvents();
    },

    /**
     * 建立 DOM 結構
     */
    createDOM() {
      const container = document.createElement('div');
      container.id = 'gy-chatbot-widget';
      container.innerHTML = `
        <button id="gy-chatbot-toggle" aria-label="打開 AI 顧問" aria-expanded="false">💬</button>
        <div id="gy-chatbot-window" aria-hidden="true" role="dialog" aria-labelledby="gy-chatbot-title" aria-modal="true">
          <div class="gy-chatbot-header">
            <div>
              <div class="gy-chatbot-title" id="gy-chatbot-title">好時有影 AI 形象顧問</div>
              <div class="gy-chatbot-subtitle">
                ${
                  this.config.pageType === 'home'
                    ? '選方案、解釋流程'
                    : '找不到答案？可以直接問我'
                }
              </div>
            </div>
            <button id="gy-chatbot-close" aria-label="關閉">✕</button>
          </div>
          <div class="gy-chatbot-body">
            <div class="gy-chatbot-message bot">
              ${
                this.config.pageType === 'home'
                  ? `嗨，我是好時有影的 AI 顧問。<br/>
                    可以幫你推薦方案、說明流程、解說價格。<br/>
                    你可以直接跟我說你的狀況，或先用下面的快速選項開始。`
                  : `找不到你要的答案嗎？<br/>
                    你可以直接問我流程、價格或預約相關的問題。<br/>
                    遇到需要真人處理的，我會提醒你。`
              }
            </div>
            <div class="gy-chatbot-quick-actions">
              ${this.renderQuickActions(this.config.pageType)}
            </div>
            <div id="gy-chatbot-messages" role="log" aria-live="polite" aria-label="對話訊息"></div>
          </div>
          <div class="gy-chatbot-input">
            <input
              id="gy-chatbot-input-field"
              type="text"
              placeholder="${
                this.config.pageType === 'home'
                  ? '直接跟我說你的狀況，例如：我是準畢業生，要拍 LinkedIn…'
                  : '你可以問任何拍攝流程、價格或預約相關問題'
              }"
              aria-label="輸入訊息"
            />
            <button id="gy-chatbot-send" aria-label="送出訊息">送出</button>
          </div>
        </div>
      `;
      document.body.appendChild(container);

      this.els.container = container;
      this.els.toggle = container.querySelector('#gy-chatbot-toggle');
      this.els.window = container.querySelector('#gy-chatbot-window');
      this.els.close = container.querySelector('#gy-chatbot-close');
      this.els.messages = container.querySelector('#gy-chatbot-messages');
      this.els.quickActions = container.querySelector('.gy-chatbot-quick-actions');
      this.els.input = container.querySelector('#gy-chatbot-input-field');
      this.els.send = container.querySelector('#gy-chatbot-send');
    },

    /**
     * 渲染快速選項按鈕
     */
    renderQuickActions(pageType) {
      if (pageType === 'home') {
        return `
          <button class="gy-chatbot-quick-action" data-mode="decision_recommendation" data-template="我想請你幫我推薦適合的拍攝方案。">🧭 不知道選哪個方案</button>
          <button class="gy-chatbot-quick-action" data-mode="faq_flow_price" data-template="請跟我說一般拍攝的流程，大概要多久？">📷 想知道拍攝流程</button>
          <button class="gy-chatbot-quick-action" data-mode="faq_flow_price" data-template="我想大概了解不同拍攝的價位與計價方式。">💰 想知道價格</button>
        `;
      } else {
        return `
          <button class="gy-chatbot-quick-action" data-mode="faq_flow_price" data-template="請幫我整理一下從預約到拿到照片的流程。">📋 拍攝流程說明</button>
          <button class="gy-chatbot-quick-action" data-mode="faq_flow_price" data-template="不同拍攝類型大概要多少錢？怎麼計價？">💵 價格與計價方式</button>
          <button class="gy-chatbot-quick-action" data-mode="faq_flow_price" data-template="如果我要改期或取消預約，原則是什麼？">📆 改期 / 取消規則</button>
        `;
      }
    },

    /**
     * 綁定事件
     */
    bindEvents() {
      this.els.toggle.addEventListener('click', () => this.open());
      this.els.close.addEventListener('click', () => this.close());

      this.els.quickActions.addEventListener('click', (e) => {
        if (!e.target.classList.contains('gy-chatbot-quick-action')) return;
        const mode = e.target.getAttribute('data-mode');
        const template = e.target.getAttribute('data-template');
        this.sendMessage(template, mode);
      });

      this.els.send.addEventListener('click', () => {
        const text = this.els.input.value.trim();
        if (!text) return;
        this.sendMessage(text, 'auto');
        this.els.input.value = '';
      });

      // 處理中文輸入法：使用 compositionend 事件檢測輸入完成
      let isComposing = false;
      this.els.input.addEventListener('compositionstart', () => {
        isComposing = true;
      });
      this.els.input.addEventListener('compositionend', () => {
        isComposing = false;
      });

      this.els.input.addEventListener('keydown', (e) => {
        // 如果是 Enter 鍵且不在輸入法組合狀態中，才發送
        if (e.key === 'Enter' && !isComposing) {
          e.preventDefault();
          const text = this.els.input.value.trim();
          if (text) {
            this.els.send.click();
          }
        }
        // Escape 鍵關閉聊天窗
        if (e.key === 'Escape' && this.state.isOpen) {
          this.close();
        }
      });

      // 鍵盤導航支援
      this.els.toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open();
        }
      });
    },

    /**
     * 開啟聊天窗
     */
    open() {
      // 確保元素存在
      if (!this.els.window || !this.els.toggle) {
        console.warn('[GYChatbot] Cannot open: elements not ready');
        return;
      }

      this.state.isOpen = true;
      this.els.window.classList.add('open');
      this.els.window.setAttribute('aria-hidden', 'false');
      this.els.toggle.setAttribute('aria-expanded', 'true');
      
      // 強制觸發重排，確保 CSS 過渡動畫生效
      this.els.window.offsetHeight;
      
      // 焦點移到輸入框
      setTimeout(() => {
        if (this.els.input) {
          this.els.input.focus();
        }
      }, 100);
    },

    /**
     * 關閉聊天窗
     */
    close() {
      this.state.isOpen = false;
      this.els.window.classList.remove('open');
      this.els.window.setAttribute('aria-hidden', 'true');
      this.els.toggle.setAttribute('aria-expanded', 'false');
      // 焦點回到 toggle 按鈕
      this.els.toggle.focus();
    },

    /**
     * 將 Markdown 轉換為 HTML
     * 支援：粗体 (**text**)、链接 ([text](url))、换行、列表
     */
    markdownToHTML(text) {
      if (!text) return '';
      
      let html = String(text);
      
      // 檢查是否已經包含 HTML 標籤（如 <br/>、<br>）
      const hasHTMLTags = /<[^>]+>/.test(html);
      
      // 轉義現有的 HTML 標籤（防止 XSS，但保留我們要處理的格式）
      // 先標記我們要處理的特殊格式，避免被轉義
      const placeholders = {
        boldTriple: [],
        boldDouble: [],
        links: [],
        existingHTML: []
      };
      
      // 如果已經包含 HTML 標籤，先暫時替換它們
      if (hasHTMLTags) {
        html = html.replace(/<br\s*\/?>/gi, (match) => {
          const id = `__HTML_BR_${placeholders.existingHTML.length}__`;
          placeholders.existingHTML.push('<br>');
          return id;
        });
      }
      
      // 暫時替換粗體標記（三顆星）
      html = html.replace(/\*\*\*([^*]+)\*\*\*/g, (match, content) => {
        const id = `__BOLD_TRIPLE_${placeholders.boldTriple.length}__`;
        placeholders.boldTriple.push(content);
        return id;
      });
      
      // 暫時替換粗體標記（兩顆星）
      html = html.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
        const id = `__BOLD_DOUBLE_${placeholders.boldDouble.length}__`;
        placeholders.boldDouble.push(content);
        return id;
      });
      
      // 暫時替換連結
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        const id = `__LINK_${placeholders.links.length}__`;
        placeholders.links.push({ text: linkText, url: url.trim() });
        return id;
      });
      
      // 轉義 HTML（防止 XSS）
      const tempDiv = document.createElement('div');
      tempDiv.textContent = html;
      html = tempDiv.innerHTML;
      
      // 恢復已存在的 HTML 標籤
      placeholders.existingHTML.forEach((tag, index) => {
        html = html.replace(`__HTML_BR_${index}__`, tag);
      });
      
      // 恢復粗體（三顆星）
      placeholders.boldTriple.forEach((content, index) => {
        html = html.replace(`__BOLD_TRIPLE_${index}__`, `<strong>${content}</strong>`);
      });
      
      // 恢復粗體（兩顆星）
      placeholders.boldDouble.forEach((content, index) => {
        html = html.replace(`__BOLD_DOUBLE_${index}__`, `<strong>${content}</strong>`);
      });
      
      // 恢復連結
      placeholders.links.forEach((link, index) => {
        let actualUrl = link.url;
        
        // 處理描述性連結文字（例如："link to 方案頁面"）
        const urlLower = actualUrl.toLowerCase();
        
        // 檢查是否為描述性文字
        if (urlLower.includes('link to') || urlLower.includes('link to ')) {
          // 移除 "link to" 前綴並提取關鍵字
          const cleanUrl = actualUrl.replace(/^link to /i, '').trim();
          const cleanUrlLower = cleanUrl.toLowerCase();
          
          if (cleanUrlLower.includes('方案') || cleanUrlLower.includes('plan') || cleanUrlLower.includes('拍攝') || cleanUrlLower.includes('價格') || cleanUrlLower.includes('price')) {
            actualUrl = '/price-list';
          } else if (cleanUrlLower.includes('預約') || cleanUrlLower.includes('booking')) {
            actualUrl = '/booking/';
          } else if (cleanUrlLower.includes('中山') || cleanUrlLower.includes('zhongshan')) {
            actualUrl = '/booking/zhongshan';
          } else if (cleanUrlLower.includes('公館') || cleanUrlLower.includes('gongguan')) {
            actualUrl = '/booking/gongguan';
          } else {
            actualUrl = '#'; // 預設為空連結
          }
        }
        // 直接包含關鍵字的情況
        else if (urlLower.includes('方案') || urlLower.includes('plan') || urlLower.includes('拍攝方案') || urlLower.includes('價格') || urlLower.includes('price')) {
          actualUrl = '/price-list';
        } else if (urlLower.includes('預約') || urlLower.includes('booking')) {
          actualUrl = '/booking/';
        } else if (urlLower.includes('中山') || urlLower.includes('zhongshan')) {
          actualUrl = '/booking/zhongshan';
        } else if (urlLower.includes('公館') || urlLower.includes('gongguan')) {
          actualUrl = '/booking/gongguan';
        }
        // 如果不是完整 URL 且不是相對路徑
        else if (!actualUrl.startsWith('http://') && !actualUrl.startsWith('https://') && !actualUrl.startsWith('/') && !actualUrl.startsWith('#')) {
          actualUrl = '#'; // 預設為空連結
        }
        
        // 在同一窗口打開連結（不使用 target="_blank"）
        html = html.replace(`__LINK_${index}__`, `<a href="${actualUrl}">${link.text}</a>`);
      });
      
      // 處理換行：\n 轉換為 <br>
      html = html.replace(/\n/g, '<br>');
      
      // 處理列表（按行處理）
      const lines = html.split('<br>');
      const processedLines = [];
      let inOrderedList = false;
      let inUnorderedList = false;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // 有序列表：1. text
        if (/^\d+\.\s+/.test(trimmedLine)) {
          const content = trimmedLine.replace(/^\d+\.\s+/, '');
          if (!inOrderedList) {
            processedLines.push('<ol>');
            inOrderedList = true;
            if (inUnorderedList) {
              processedLines.push('</ul>');
              inUnorderedList = false;
            }
          }
          processedLines.push(`<li>${content}</li>`);
        }
        // 無序列表：- text 或 * text
        else if (/^[-*]\s+/.test(trimmedLine)) {
          const content = trimmedLine.replace(/^[-*]\s+/, '');
          if (!inUnorderedList) {
            processedLines.push('<ul>');
            inUnorderedList = true;
            if (inOrderedList) {
              processedLines.push('</ol>');
              inOrderedList = false;
            }
          }
          processedLines.push(`<li>${content}</li>`);
        }
        // 普通行
        else {
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
          if (inUnorderedList) {
            processedLines.push('</ul>');
            inUnorderedList = false;
          }
          if (trimmedLine) {
            processedLines.push(trimmedLine);
          } else if (index < lines.length - 1) {
            // 空行保留為 <br>
            processedLines.push('<br>');
          }
        }
      });
      
      // 關閉未關閉的列表
      if (inOrderedList) {
        processedLines.push('</ol>');
      }
      if (inUnorderedList) {
        processedLines.push('</ul>');
      }
      
      return processedLines.join('');
    },

    /**
     * 新增訊息到對話區
     */
    appendMessage(text, role) {
      const div = document.createElement('div');
      div.className = `gy-chatbot-message ${role}`;
      
      // Bot 訊息：轉換 Markdown 為 HTML
      if (role === 'bot') {
        div.innerHTML = this.markdownToHTML(text);
      } else {
        // 使用者訊息：純文字（防止 XSS）
        div.textContent = text;
      }
      
      this.els.messages.appendChild(div);
      // 滾動到底部
      this.els.messages.scrollTop = this.els.messages.scrollHeight;
    },

    /**
     * 顯示載入狀態
     */
    showLoading() {
      if (this.state.isLoading) return;
      this.state.isLoading = true;
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'gy-chatbot-message bot gy-chatbot-loading';
      loadingDiv.id = 'gy-chatbot-loading';
      loadingDiv.innerHTML = '<span class="gy-chatbot-loading-dot"></span><span class="gy-chatbot-loading-dot"></span><span class="gy-chatbot-loading-dot"></span>';
      this.els.messages.appendChild(loadingDiv);
      this.els.messages.scrollTop = this.els.messages.scrollHeight;
    },

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
      this.state.isLoading = false;
      const loading = this.els.messages.querySelector('#gy-chatbot-loading');
      if (loading) {
        loading.remove();
      }
    },

    /**
     * 發送訊息
     */
    async sendMessage(message, mode = 'auto') {
      // 顯示使用者訊息
      this.appendMessage(message, 'user');
      this.hideLoading();
      this.showLoading();

      // 隱藏快速選項（第一次發送後）
      if (this.els.quickActions.style.display !== 'none') {
        this.els.quickActions.style.display = 'none';
      }

      // 設定超時
      const timeoutId = setTimeout(() => {
        if (this.state.isLoading) {
          this.hideLoading();
          this.appendMessage('這次回覆花的時間有點久，我怕系統卡住了。你可以重新提問一次，或直接用 Email 或電話找真人協助。', 'bot');
          this.state.retryCount = 0;
        }
      }, this.config.timeout);

      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            mode,
            pageType: this.config.pageType,
            conversationId: this.state.conversationId,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 更新 conversationId
        if (data.conversationId) {
          this.state.conversationId = data.conversationId;
        }

        // 顯示 AI 回覆
        this.hideLoading();
        this.appendMessage(data.reply, 'bot');

        // 顯示快速回覆建議（如果有）
        if (data.suggestedQuickReplies && data.suggestedQuickReplies.length > 0) {
          this.showQuickReplies(data.suggestedQuickReplies);
        }

        // 重置重試計數
        this.state.retryCount = 0;
      } catch (error) {
        clearTimeout(timeoutId);
        this.hideLoading();

        // 重試機制
        if (this.state.retryCount < this.state.maxRetries) {
          this.state.retryCount++;
          this.appendMessage('網路連線似乎有問題，讓我再試一次...', 'bot');
          setTimeout(() => {
            this.sendMessage(message, mode);
          }, 1000);
        } else {
          this.appendMessage('糟糕，後台系統現在有點忙碌，我暫時拿不到正確的資訊 😣 你可以過幾分鐘再試一次，或直接透過 Email 或電話聯絡我們的真人夥伴。', 'bot');
          this.state.retryCount = 0;
        }
      }
    },

    /**
     * 顯示快速回覆建議
     */
    showQuickReplies(replies) {
      const quickRepliesDiv = document.createElement('div');
      quickRepliesDiv.className = 'gy-chatbot-quick-replies';
      replies.forEach((reply) => {
        const button = document.createElement('button');
        button.className = 'gy-chatbot-quick-reply';
        button.textContent = reply;
        button.addEventListener('click', () => {
          this.sendMessage(reply, 'auto');
          quickRepliesDiv.remove();
        });
        quickRepliesDiv.appendChild(button);
      });
      this.els.messages.appendChild(quickRepliesDiv);
      this.els.messages.scrollTop = this.els.messages.scrollHeight;
    },
  };

  // 導出到全域
  window.GYChatbot = GYChatbot;
})();

