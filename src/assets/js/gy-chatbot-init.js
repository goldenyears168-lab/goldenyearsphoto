/**
 * 好時有影 AI 形象顧問 Widget 初始化腳本
 * 從頁面 front matter 讀取 pageType 並初始化 Widget
 */

(function() {
  'use strict';

  // 從 data attribute 讀取 pageType（由 Nunjucks 模板注入）
  const widgetContainer = document.querySelector('[data-chatbot-config]');
  if (!widgetContainer) {
    console.warn('[GYChatbot] Widget container not found.');
    return;
  }

  const pageType = widgetContainer.getAttribute('data-page-type') || 'home';

  // 檢查 URL 參數或 hash，判斷是否需要自動打開
  function shouldAutoOpen() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    // FAQ 頁面（pageType === 'qa'）預設自動開啟
    if (pageType === 'qa') {
      return true;
    }
    
    return (
      urlParams.get('chat') === 'open' || 
      urlParams.get('chatbot') === 'open' ||
      hash === '#chat' ||
      hash === '#chatbot'
    );
  }

  // 自動打開 chatbot 的函數（帶重試機制）
  let retryCount = 0;
  const maxRetries = 10; // 最多重試 10 次（約 2 秒）

  function autoOpenChatbot() {
    if (!window.GYChatbot) {
      console.warn('[GYChatbot] GYChatbot not available for auto-open');
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          autoOpenChatbot();
        }, 200);
      }
      return;
    }

    // 檢查元素是否存在
    const windowEl = document.querySelector('#gy-chatbot-window');
    const toggleEl = document.querySelector('#gy-chatbot-toggle');
    
    if (!windowEl || !toggleEl) {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          autoOpenChatbot();
        }, 200);
        return;
      }
      console.warn('[GYChatbot] Widget elements not found after retries');
      return;
    }

    // 檢查 aria-hidden 屬性，確認元素已準備好
    if (windowEl.getAttribute('aria-hidden') === null) {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          autoOpenChatbot();
        }, 200);
        return;
      }
    }

    try {
      if (typeof window.GYChatbot.open === 'function') {
        window.GYChatbot.open();
        console.log('[GYChatbot] Auto-opened via URL parameter');
        retryCount = 0; // 重置計數器
      } else {
        console.warn('[GYChatbot] open() method not available');
      }
    } catch (error) {
      console.error('[GYChatbot] Error opening chatbot:', error);
    }
  }

  // 初始化函數
  function initializeChatbot() {
    if (!window.GYChatbot) {
      console.error('[GYChatbot] GYChatbot not found. Make sure gy-chatbot.js is loaded.');
      return;
    }

    // 檢查是否已經初始化過（避免重複初始化）
    if (document.querySelector('#gy-chatbot-widget')) {
      console.log('[GYChatbot] Already initialized, skipping...');
      // 即使已經初始化，如果 URL 參數要求打開，也要執行
      if (shouldAutoOpen()) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            autoOpenChatbot();
          }, 300);
        });
      }
      return;
    }

    try {
      window.GYChatbot.init({
        apiEndpoint: '/api/chat',
        pageType: pageType,
        locale: 'zh-TW',
        theme: 'light',
      });
      console.log('[GYChatbot] Initialized with pageType:', pageType);

      // 如果需要自動打開，等待 DOM 和 CSS 完全準備好
      if (shouldAutoOpen()) {
        // 使用 requestAnimationFrame 確保渲染完成
        requestAnimationFrame(() => {
          // 再等待一小段時間確保 CSS 已加載和 DOM 完全渲染
          setTimeout(() => {
            autoOpenChatbot();
          }, 100);
        });
      }
    } catch (error) {
      console.error('[GYChatbot] Initialization error:', error);
    }
  }

  // 根據 DOM 狀態決定何時初始化
  if (document.readyState === 'loading') {
    // DOM 還在加載中，等待 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeChatbot);
  } else {
    // DOM 已經準備好，立即初始化
    // 使用 setTimeout 確保其他腳本已執行
    setTimeout(initializeChatbot, 0);
  }
})();

