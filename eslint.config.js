const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
  // 啟用 ESLint 推薦的基礎規則
  js.configs.recommended,

  {
    // 針對全域環境進行設定
    languageOptions: {
      ecmaVersion: 'latest', // 使用最新的 JS 語法
      sourceType: 'script',  // 您的 main.js 是標準腳本
      globals: {
        ...globals.browser // 啟用所有瀏覽器 (window, document 等) 全域變數
      }
    },
    // 您的自訂規則
    rules: {
      'no-unused-vars': 'warn', // 未使用的變數僅提出警告
      'no-console': 'warn',     // console.log() 提出警告
      'semi': ['error', 'always'], // 結尾必須加分號
      'quotes': ['error', 'single'] // 必須使用單引號
    }
  }
];