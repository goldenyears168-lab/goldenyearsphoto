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

  // 從 data attribute 讀取 pageType，如果沒有設置則默認為 'other'（不會自動打開）
  const pageType = widgetContainer.getAttribute('data-page-type') || 'other';

  // 檢查 URL 參數或 hash，判斷是否需要自動打開
  function shouldAutoOpen() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const isMobile = window.innerWidth <= 480;
    const isHomePage = pageType === 'home';
    
    // 調試日誌（生產環境可移除）
    console.log('[GYChatbot] shouldAutoOpen check:', {
      pageType: pageType,
      isMobile: isMobile,
      windowWidth: window.innerWidth,
      isHomePage: isHomePage,
      url: window.location.pathname
    });
    
    // 手機版（寬度 <= 480px）：預設關閉，不自動打開
    if (isMobile) {
      console.log('[GYChatbot] Mobile detected, auto-open disabled');
      return false;
    }
    
    // 電腦版邏輯
    // 如果 URL 參數明確要求關閉，則不自動打開
    if (urlParams.get('chat') === 'close' || urlParams.get('chatbot') === 'close') {
      console.log('[GYChatbot] URL parameter requests close, auto-open disabled');
      return false;
    }
    
    // 電腦版預設行為：
    // - 只有首頁（pageType === 'home'）：預設自動開啟
    // - 其他頁面：預設關閉（不自動打開）
    // 注意：即使有 URL 參數要求打開，如果不是首頁也不會自動打開
    // （用戶可以手動點擊按鈕打開）
    const shouldOpen = isHomePage;
    console.log('[GYChatbot] Auto-open decision:', shouldOpen ? 'OPEN' : 'CLOSE');
    return shouldOpen;
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

  // 初始化函數（現在是 async）
  async function initializeChatbot() {
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
      // init 現在是 async 方法，需要 await
      await window.GYChatbot.init({
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

