# Identity Test 頁面相關文件清單

## 📋 核心文件

### 1. 頁面模板
- **`src/guide/identity-test.njk`**
  - 頁面模板文件
  - Permalink: `/guide/identity-test/`
  - 使用 `base-layout.njk` 作為佈局
  - 引用 `identityTest.json` 數據
  - 引用 `identity-test.js` JavaScript

### 2. JavaScript 文件
- **`src/assets/js/identity-test.js`** (971 行)
  - 測驗系統的核心邏輯
  - 狀態管理
  - 問題渲染
  - 答案處理
  - 結果計算和顯示
  - Supabase 數據保存

### 3. 數據文件
- **`src/_data/identityTest.json`**
  - 測驗數據（問題、選項、類型定義）
  - RIASEC 六種人格類型的完整定義
  - 包含：hero 信息、types (R/I/A/S/E/C)、questions

- **`src/_data/metadata.json`**
  - 包含 Supabase 配置（用於保存測驗結果）
  - `supabaseUrl` 和 `supabaseAnonKey`

## 🔗 引用文件

### 4. 導航引用
- **`src/_includes/partials/navigation.njk`**
  - 第 68 行：導航菜單中的連結
  - `<a href="/guide/identity-test/">身份原型測驗</a>`

### 5. 佈局文件
- **`src/_includes/base-layout.njk`**
  - 所有頁面的基礎佈局
  - identity-test.njk 使用此佈局

### 6. Eleventy 配置
- **`.eleventy.js`**
  - 第 181-196 行：`readJSON` filter 定義
  - 用於讀取 `identityTest.json` 數據

## 🎨 樣式相關

### 7. CSS 樣式
- **`src/assets/css/main.css`**
  - 包含 `.identity-test` 相關樣式
  - 測驗頁面的所有樣式定義

## 📊 文件依賴關係

```
identity-test.njk (頁面模板)
├── base-layout.njk (佈局)
├── identityTest.json (數據)
├── metadata.json (Supabase 配置)
├── identity-test.js (JavaScript 邏輯)
├── main.css (樣式)
└── navigation.njk (導航連結)
```

## 🔍 文件詳細說明

### src/guide/identity-test.njk
- **類型**: Nunjucks 模板
- **功能**: 身份原型測驗頁面的 HTML 結構
- **關鍵元素**:
  - Hero section（介紹）
  - Quiz section（測驗問題）
  - Result section（結果顯示）
  - 用戶信息收集表單

### src/assets/js/identity-test.js
- **類型**: JavaScript
- **大小**: 971 行
- **功能**:
  - 測驗初始化 (`initQuiz`)
  - 問題渲染 (`renderQuestion`)
  - 答案選擇 (`selectOption`)
  - 分數計算 (`calculateScores`)
  - 結果查找 (`findWinnerType`)
  - 結果顯示 (`renderResult`)
  - 數據保存到 Supabase (`saveResult`)

### src/_data/identityTest.json
- **類型**: JSON 數據文件
- **結構**:
  - `hero`: 頁面標題和描述
  - `types`: 六種人格類型 (R/I/A/S/E/C)
  - `questions`: 測驗問題和選項

### src/_data/metadata.json
- **類型**: JSON 配置文件
- **內容**: Supabase 連接配置
  - `supabaseUrl`
  - `supabaseAnonKey`

## 🔧 配置和依賴

### Eleventy 配置
- `.eleventy.js` 中的 `readJSON` filter 用於讀取 JSON 數據
- 支持從 `_data` 目錄讀取數據文件

### 外部依賴
- **Supabase**: 用於保存測驗結果
  - API URL 和 Anon Key 從 `metadata.json` 讀取
  - 保存到 `identity_test_results` 表

## 📝 使用流程

1. 用戶訪問 `/guide/identity-test/`
2. Eleventy 渲染 `identity-test.njk` 模板
3. 模板讀取 `identityTest.json` 數據
4. 頁面加載 `identity-test.js` JavaScript
5. JavaScript 初始化測驗系統
6. 用戶完成測驗後，結果保存到 Supabase

## 🎯 相關功能

- **導航**: 在導航菜單的 "指南" 部分
- **數據來源**: `_data/identityTest.json`
- **結果保存**: Supabase 數據庫
- **樣式**: 使用 Tailwind CSS 和自定義 CSS

## 📌 注意事項

1. **數據文件**: `identityTest.json` 必須存在且格式正確
2. **Supabase 配置**: `metadata.json` 必須包含有效的 Supabase 配置
3. **JavaScript 依賴**: 需要 Supabase 客戶端（在 JavaScript 中動態加載）
4. **樣式依賴**: 依賴 `main.css` 中的 `.identity-test` 相關樣式

---

**生成時間**: 2024-12-14
