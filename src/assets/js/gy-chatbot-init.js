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

  document.addEventListener('DOMContentLoaded', function() {
    if (window.GYChatbot) {
      try {
        window.GYChatbot.init({
          apiEndpoint: '/api/chat',
          pageType: pageType,
          locale: 'zh-TW',
          theme: 'light',
        });
        console.log('[GYChatbot] Initialized with pageType:', pageType);
      } catch (error) {
        console.error('[GYChatbot] Initialization error:', error);
      }
    } else {
      console.error('[GYChatbot] GYChatbot not found. Make sure gy-chatbot.js is loaded.');
    }
  });
})();

