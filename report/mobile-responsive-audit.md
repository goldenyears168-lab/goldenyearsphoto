本專案目前的 mobile 問題，並非單一 bug，
而是多數元件仍沿用 desktop 視覺比例與心理距離，
導致在 mobile 上出現：
- 留白過大
- 元件顯得「浮」
- 操作節奏不符合拇指操作

mobile header 永遠不超過 56–64px
分類在 mobile 一律 wrap
section 間距 mobile ≤ desktop × 0.7

# 移動端響應式設計全面健康檢查報告
## Mobile Responsive Design Full Audit Report

**專案名稱**: 好時有影 Golden Years 攝影工作室網站  
**審計日期**: 2025-01-XX  
**審計範圍**: 全站移動端體驗優化  
**審計目標**: 識別並修復移動端不自然、不順暢、不像原生 App 的問題

---

## 執行摘要 (Executive Summary)

### 當前狀態
- ✅ **基礎設定良好**: viewport 正確、box-sizing 已設定
- ⚠️ **斷點策略不足**: 缺少手機專用斷點（360/375/390/414px）
- ⚠️ **Touch Target**: 部分按鈕/連結未達 44×44px 標準
- ⚠️ **Typography**: 部分字體過小（<14px）可能觸發 iOS zoom
- ⚠️ **間距系統**: 缺乏一致的 mobile-first spacing scale
- ⚠️ **互動體驗**: hover-only 行為在 mobile 失效
- ⚠️ **圖片策略**: 未使用 srcset/sizes，可能造成浪費

### 🔴 嚴重問題（需立即修復）
1. **S0 (阻斷性)**: Category Pills 第三顆被切掉（容器 overflow 或 flex-nowrap）
2. **S0 (阻斷性)**: Header 超大膠囊在手機上不自然（桌機元件硬縮到手機）
3. **S0 (阻斷性)**: Hero 圖片被切得很怪（右半臉超大、構圖不自然）
4. **S0 (阻斷性)**: 疑似水平 overflow（手機視覺「歪」「鬆」「不服貼」）

### 優先級建議
1. **S0 (阻斷性)**: Category Pills 被切、Header 不自然、Hero 裁切問題、水平 overflow
2. **S1 (嚴重)**: 斷點策略不一致、Touch target 不足、Hero 標題溢出
3. **S2 (改善)**: Typography 流動化、間距優化

---

## A. 基礎設定檢查 (Foundation Audit)

### ✅ 已正確設定

#### 1. Viewport Meta Tag
**位置**: `src/_includes/base-layout.njk:5`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
```

**狀態**: ✅ 正確  
**建議優化**:
```html
<!-- 建議修改為 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover, user-scalable=yes">
```
- 顯式允許縮放更符合無障礙規範
- `viewport-fit=cover` 已正確處理瀏海機

#### 2. Box-sizing
**位置**: `src/assets/css/main.css:166`

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**狀態**: ✅ 正確

#### 3. Overflow 控制
**位置**: `src/assets/css/main.css:182-198`

```css
body {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}
```

**狀態**: ✅ 基本正確，但需要檢查是否有子元素造成溢出

### ⚠️ 需要修復

#### 4. 100vw 水平捲動風險
**位置**: `src/assets/css/main.css:1748`

```css
width: calc(100vw - 2rem); /* 在固定定位元素中可能造成水平捲動 */
```

**問題**: 在 mobile 上，`100vw` 包含滾動條寬度，可能造成水平溢出  
**修復方案**:
```css
/* 改用 container query 或更安全的方式 */
width: calc(100% - 2rem);
/* 或使用 container */
width: 100%;
max-width: calc(100vw - 2rem);
```

---

## B. 斷點策略與布局系統 (Breakpoint Strategy)

### 當前斷點配置

**Tailwind Config** (`tailwind.config.js:205-209`):
```js
screens: {
  'md': '768px',   // 平板
  'lg': '992px',   // 小桌機
  'xl': '1200px',  // 大桌機
}
```

### ❌ 問題診斷

#### 1. 缺少手機專用斷點
**影響**: 在 360px-414px 區間的設備上，布局可能不自然  
**現狀**: 所有 < 768px 的設備共用一套樣式，造成：
- 360px iPhone SE 和 414px iPhone Plus 使用相同布局
- 無法針對不同螢幕尺寸做細緻優化

**建議斷點策略**:
```js
screens: {
  'xs': '360px',   // 最小手機 (iPhone SE)
  'sm': '375px',   // 標準手機 (iPhone 12/13/14)
  'md': '390px',   // 較大手機 (iPhone 12/13 Pro Max)
  'lg': '414px',   // 最大手機 (iPhone Plus)
  'xl': '768px',   // 平板
  '2xl': '1024px', // 小桌機
  '3xl': '1200px', // 大桌機
}
```

#### 2. 布局系統不統一
**問題位置**: `src/index.njk:77, 84, 218`

**現狀分析**:
- Portfolio Grid: `grid-cols-2 md:grid-cols-4` ✅ 可接受
- About Section: `grid-cols-1 md:grid-cols-2` ✅ 可接受
- Process Section: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` ✅ 良好

**但缺乏統一容器策略**:
```html
<!-- 當前 -->
<section class="py-12 sm:py-16 md:py-24">

<!-- 建議統一 -->
<section class="py-8 px-4 sm:py-12 sm:px-6 md:py-16 md:px-8 lg:py-24">
```

#### 3. 固定寬高問題

**位置**: `src/index.njk:14`
```html
<div class="... w-[80vw] h-[400px] ...">
```

**問題**: 
- `h-[400px]` 固定高度在手機上可能過高
- `w-[80vw]` 在不同螢幕上表現不一致

**修復方案**:
```html
<div class="... w-full max-w-[80vw] aspect-square sm:h-[400px] ...">
```

**位置**: `src/assets/css/main.css:1332-1343`
```css
.price-gallery {
  height: 400px;
}
@media (min-width: 768px) {
  .price-gallery {
    height: 450px;
  }
}
```

**問題**: 固定高度可能導致內容被裁切  
**修復方案**: 使用 `min-height` + `aspect-ratio`

---

## C. Typography & Spacing (字體與間距)

### ⚠️ 字體大小問題

#### 1. iOS Input Zoom 風險
**問題**: 字體 < 16px 的 input 會觸發 iOS 自動縮放

**檢查結果**:
- ✅ 大部分 input 使用 `text-base` (16px)
- ⚠️ 部分標籤文字使用 `text-xs` (12px) 但非 input，可接受
- ✅ 主要按鈕文字 >= 14px

**建議**: 確保所有 `<input>`, `<select>`, `<textarea>` 的字體 >= 16px

```css
/* 在 main.css 中強制 */
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="number"],
select,
textarea {
  font-size: 16px !important; /* 防止 iOS zoom */
}
```

#### 2. 流動字體 (Fluid Typography) 缺失

**當前**: 使用固定斷點字體大小
```html
<h1 class="text-3xl sm:text-4xl md:text-7xl lg:text-8xl">
```

**建議**: 使用 `clamp()` 實現流動字體
```css
.hero-title {
  font-size: clamp(1.875rem, 5vw + 1rem, 4.5rem); /* 30px - 72px */
  line-height: clamp(1.2, 0.8 + 0.4vw, 1.1);
}
```

**對應 Tailwind 配置**:
```js
fontSize: {
  'fluid-hero': 'clamp(1.875rem, 5vw + 1rem, 4.5rem)',
  'fluid-subtitle': 'clamp(1rem, 2vw + 0.5rem, 1.25rem)',
}
```

#### 3. 行高優化

**當前**: 部分標題行高過緊
```html
<h1 class="... leading-[1.1]"> <!-- 1.1 在移動端可能過緊 -->
```

**建議**:
- 標題: `leading-tight` (1.2) 或 `leading-normal` (1.3) 在 mobile
- 正文: `leading-relaxed` (1.6) ✅ 已正確

#### 4. 間距系統 (Spacing Scale)

**當前**: Tailwind 預設間距 (4/8/12/16/24/32px...)

**問題**: 缺乏 mobile-first 的間距規範

**建議統一間距規範**:
```css
:root {
  --spacing-mobile-xs: 0.5rem;   /* 8px - 緊湊間距 */
  --spacing-mobile-sm: 0.75rem;  /* 12px - 小間距 */
  --spacing-mobile-md: 1rem;     /* 16px - 中等間距 */
  --spacing-mobile-lg: 1.5rem;   /* 24px - 大間距 */
  --spacing-mobile-xl: 2rem;     /* 32px - 超大間距 */
  
  /* Desktop 可更大 */
  --spacing-desktop-md: 1.5rem;
  --spacing-desktop-lg: 2.5rem;
}
```

**應用範例**:
```html
<!-- 當前 -->
<section class="py-12 sm:py-16 md:py-24">

<!-- 建議 -->
<section class="py-6 px-4 sm:py-8 sm:px-6 md:py-12 md:px-8 lg:py-16">
```

---

## D. Touch & Interaction (觸控與互動)

### ❌ 問題清單

#### 1. Touch Target 不足

**WCAG 2.1 標準**: 最小 44×44px

**檢查結果**:

| 元件 | 位置 | 當前尺寸 | 狀態 | 建議 |
|------|------|----------|------|------|
| Category Pill 按鈕 | `index.njk:46-72` | `padding: 0.6rem 1.4rem` ≈ 32×40px | ⚠️ 不足 | 增加 `min-h-[44px]` |
| Mobile Menu 按鈕 | `navigation.njk:125-132` | `min-w-[44px] min-h-[44px]` | ✅ 正確 | - |
| Instagram Follow 連結 | `index.njk:125` | `text-xs` + padding | ⚠️ 可能不足 | 增加 padding |
| Footer 連結 | `base-layout.njk:154-159` | 預設連結大小 | ⚠️ 需確認 | 確保 >= 44px |

**修復方案**:
```css
/* 全局 touch target 確保 */
a, button, [role="button"] {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 特別針對 category pills */
.category-pill {
  min-height: 44px; /* ✅ 已在 CSS 中設定，需確認生效 */
  padding: 0.75rem 1.25rem; /* 確保足夠空間 */
}
```

#### 2. Hover-only 行為在 Mobile 失效

**問題位置**:
- Portfolio 圖片 hover overlay (`index.njk:515`)
- Category pills hover 效果
- Button hover states

**當前代碼**:
```html
<div class="... opacity-0 group-hover:opacity-100 ...">
```

**問題**: 在觸控設備上，`:hover` 可能永久觸發或無法觸發

**修復方案**: 使用 `@media (hover: hover)` 區分
```css
/* 只在有 hover 能力的設備上顯示 */
@media (hover: hover) {
  .portfolio-img-card .overlay {
    opacity: 0;
    transition: opacity 0.3s;
  }
  .portfolio-img-card:hover .overlay {
    opacity: 1;
  }
}

/* Mobile: 使用 touch 反饋 */
@media (hover: none) {
  .portfolio-img-card:active {
    transform: scale(0.98);
  }
}
```

#### 3. iOS Safari 100vh 問題

**問題**: `100vh` 在 iOS Safari 不包含工具列，導致內容被遮擋

**當前使用**: 
- `min-h-screen` (Tailwind) = `min-height: 100vh`
- 固定 header `pt-20` (80px)

**修復方案**: 使用現代 CSS 單位
```css
/* 使用 dvh (dynamic viewport height) 或 JS fallback */
.min-h-screen-safe {
  min-height: 100dvh; /* 支援的瀏覽器 */
  min-height: 100vh;  /* fallback */
}

/* 或在 body 上 */
body {
  min-height: 100dvh;
  min-height: -webkit-fill-available; /* iOS Safari fallback */
}
```

**JS Fallback** (如果需要支援舊瀏覽器):
```js
// 設定 CSS 變數
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setViewportHeight);
setViewportHeight();

// 使用
.min-h-screen-safe {
  min-height: calc(var(--vh, 1vh) * 100);
}
```

#### 4. Safe Area Insets (瀏海機支援)

**當前**: ✅ 已設定 `viewport-fit=cover`

**檢查**: Mobile menu 是否正確使用 safe-area
```css
/* 當前: navigation.njk 中的 mobile menu 可能缺少 */
.mobile-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}
```

**建議**: 確保所有固定定位元素都考慮 safe-area
```css
header.fixed {
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

footer {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}
```

#### 5. 動畫與性能

**當前**: 使用多個動畫
- `animate-pulse`, `animate-float`, `animate-scroll`, `animate-fade-in`

**檢查**: 是否尊重 `prefers-reduced-motion`

**狀態**: ✅ 部分已處理 (main.css:277-289, 1087-1121)

**建議加強**:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## E. 圖片/媒體與內容流 (Images & Media)

### ⚠️ 問題診斷

#### 1. 圖片響應式策略

**當前**: 使用 `max-width: 100%; height: auto;` ✅ 基本正確

**位置**: `src/assets/css/main.css:200-204`
```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

**缺失**: 
- ❌ 未使用 `srcset` / `sizes`
- ❌ 未使用 `<picture>` 元素
- ❌ 未設定 `loading="lazy"` (部分有，需全站檢查)

**建議**:
```html
<!-- 當前 -->
<img src="/image.jpg" alt="...">

<!-- 建議 -->
<img 
  src="/image.jpg"
  srcset="/image-400w.jpg 400w,
          /image-800w.jpg 800w,
          /image-1200w.jpg 1200w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="..."
  loading="lazy"
  decoding="async"
>
```

**Eleventy 圖片插件**: 專案已有 `@11ty/eleventy-img`，建議使用

#### 2. Portfolio 圖片策略

**位置**: `src/index.njk:512-520`

**當前**:
```html
<img src="${item.src}" alt="${item.sub}" loading="lazy">
```

**問題**:
- 圖片從 CDN 載入，但未使用響應式尺寸
- `object-fit: contain` 可能造成空白

**建議**:
```html
<img 
  src="${item.src}"
  srcset="${item.src}?w=400 400w,
          ${item.src}?w=800 800w,
          ${item.src}?w=1200 1200w"
  sizes="(max-width: 640px) 50vw,
         (max-width: 1024px) 25vw,
         20vw"
  alt="${item.sub}"
  loading="lazy"
  class="w-full h-auto object-cover"
>
```

#### 3. Instagram Embed 響應式

**位置**: `src/index.njk:131-144`, `src/assets/css/main.css:1644-1683`

**當前**: 
```css
.instagram-embed-wrapper {
  aspect-ratio: 9 / 16;
  max-width: 360px;
}
```

**問題**: 
- `max-width: 360px` 在小螢幕上可能過窄
- Instagram embed 本身可能有固定寬度限制

**建議**:
```css
.instagram-embed-wrapper {
  width: 100%;
  max-width: 360px;
  aspect-ratio: 9 / 16;
  margin: 0 auto;
}

/* 在小螢幕上稍微縮小 */
@media (max-width: 375px) {
  .instagram-embed-wrapper {
    max-width: calc(100% - 2rem);
  }
}
```

#### 4. 長文字溢出處理

**檢查**: 標題、商品名、地址是否會溢出

**位置**: 
- Hero 標題: `src/index.njk:24-27`
- Footer 地址: `src/_includes/base-layout.njk:116, 126`

**當前**:
```html
<h1 class="text-3xl sm:text-4xl md:text-7xl lg:text-8xl ...">
  Your Ticket to <br class="hidden sm:block">
  <span>the next chapter.</span>
</h1>
```

**問題**: 在 360px 螢幕上，`text-3xl` (30px) 可能仍然過大

**修復方案**:
```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-7xl xl:text-8xl ...">
```

**地址文字**:
```html
<p class="... font-mono text-xs break-words">台北市中山區南京東路1段10號4樓</p>
```

✅ 已使用 `break-words`，可接受

**建議加強**:
```css
/* 全局長文字處理 */
p, span, div {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto; /* 支援連字符的語言 */
}
```

#### 5. 表格響應式 (如果有的話)

**檢查**: 專案中是否有表格需要處理

**結果**: 未發現表格，跳過

---

## E-1. 關鍵問題詳細診斷（Critical Issues Deep Dive）

### 🔴 問題 1: Category Pills 被切掉（第三顆只剩一半）

#### 問題描述
**位置**: `src/index.njk:44-74`  
**嚴重度**: **S0 (阻斷性)**  
**影響**: 用戶無法看到完整的分類選項，影響導航體驗

#### 根因分析

檢查當前代碼 (`src/index.njk:44`):
```html
<div class="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl mx-auto px-4 category-pill-container">
```

**可能的根因**:
1. **Parent 容器有 `overflow: hidden` 或固定寬度**
   - 檢查: `category-pill-container` 的父元素
   - 位置: `src/index.njk:42-74`
   
2. **Flex 容器未正確設置 `flex-wrap`**
   - ✅ 當前已有 `flex-wrap`，但需確認是否有 CSS override
   
3. **固定寬度限制**
   - `max-w-5xl` (1024px) 在手機上可能過大
   - 但這不應該造成切掉，除非有其他限制

4. **CSS 衝突檢查**
   - 位置: `src/assets/css/main.css:1543-1570`
   - 檢查是否有 `overflow: hidden` 或 `width` 限制

**實際根因（最可能）**:
```css
/* main.css:1543-1556 */
.category-pill-container {
    width: 100%;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    /* ... */
}
```

如果父容器或某個祖先元素有 `overflow: hidden` 且寬度不足，會造成切掉。

#### 修復方案（兩選一）

##### 方案 A: 允許換行（推薦，最自然）

**修改位置**: `src/index.njk:44`

```html
<!-- 修復前 -->
<div class="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl mx-auto px-4 category-pill-container">

<!-- 修復後 -->
<div class="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto px-4 category-pill-container">
    <!-- 確保沒有任何 overflow: hidden 或固定寬度 -->
</div>
```

**CSS 確保** (`src/assets/css/main.css:1543-1570`):
```css
.category-pill-container {
    width: 100%;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-wrap: wrap; /* 明確設定 */
    justify-content: center;
    align-items: center;
    gap: 0.5rem; /* 移動端使用更小的間距 */
    /* 移除任何可能造成切掉的屬性 */
    overflow: visible; /* 確保可見 */
}

/* 確保按鈕不會被切 */
.category-pill-container > * {
    flex-shrink: 0;
    flex-grow: 0;
}
```

##### 方案 B: 保持單列但可水平滑動（像 App 的 tab row）

**適用場景**: 設計要求保持單行顯示

**修改位置**: `src/index.njk:44`

```html
<!-- 方案 B: 水平滑動 -->
<div class="-mx-4 px-4 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
    <button class="category-pill active snap-start" onclick="filterPortfolio('passport-korea', this)">
        韓式證件照
    </button>
    <button class="category-pill snap-start" onclick="filterPortfolio('linkedin-portrait', this)">
        專業形象照
    </button>
    <!-- ... 其他按鈕 ... -->
</div>
```

**添加 Utilities** (`src/assets/css/main.css` 或在 utilities layer):
```css
/* ==================================================
 * Scrollbar Utilities (no-scrollbar)
 * ================================================== */
@layer utilities {
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    
    /* 滑動時的視覺提示 */
    .snap-x {
        scroll-snap-type: x mandatory;
    }
    
    .snap-start {
        scroll-snap-align: start;
    }
}
```

**建議**: 優先使用**方案 A**（換行），因為更符合移動端使用習慣，除非設計明確要求單行。

---

### 🔴 問題 2: Header 超大膠囊（看起來像桌機元件硬縮到手機）

#### 問題描述
**位置**: `src/_includes/partials/navigation.njk:2-3`  
**嚴重度**: **S0 (阻斷性)**  
**影響**: Header 在手機上占用過多空間，視覺不自然，不像原生 App

#### 根因分析

**當前代碼** (`navigation.njk:2-3`):
```html
<header class="fixed top-8 left-0 right-0 z-50 flex justify-center px-4">
    <nav class="bg-white/90 backdrop-blur-md border border-sand-200 rounded-full px-6 py-3 shadow-lg shadow-slate-200/40 flex items-center justify-between gap-4 md:gap-8 max-w-[1200px] w-full transition-all hover:shadow-xl">
```

**問題點**:
1. ❌ `top-8` (32px) 在手機上浪費空間
2. ❌ `rounded-full` + `px-6 py-3` 在手機上看起來過大
3. ❌ `max-w-[1200px]` 在手機上造成兩側空白
4. ❌ `gap-4 md:gap-8` 間距在手機上可能過大
5. ❌ 高度未針對手機優化

#### 修復方案

**改成「滿寬、內縮、合理高度」的移動端友好設計**:

**修改位置**: `src/_includes/partials/navigation.njk:2-159`

```html
<!-- 修復後 -->
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-200 sm:border-0 sm:bg-transparent">
    <div class="mx-auto max-w-screen-xl px-4 pt-3 pb-2 sm:pt-8">
        <div class="flex items-center justify-between rounded-full border border-sand-200 bg-white/90 backdrop-blur-md shadow-sm sm:shadow-lg px-4 h-14 sm:h-auto sm:py-3">
            <!-- Logo -->
            <a href="/" class="flex items-center shrink-0 gap-2 sm:gap-3 group">
                <img
                    src="{{ 'ui/logo.jpg' | r2img }}"
                    alt="好時有影 Golden Years Logo"
                    width="120"
                    height="100"
                    class="h-8 w-auto sm:h-12 object-contain"
                    onerror="this.onerror=null; this.src='/assets/images/ui/logo.jpg';"
                />
                <!-- 手機端可選擇顯示文字 -->
                <span class="text-sm font-semibold text-slate-900 sm:hidden">好時有影</span>
            </a>
            
            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                <!-- ... existing desktop nav ... -->
            </div>

            <!-- Mobile & CTA -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- 線上預約按钮 - 仅在桌面端显示 -->
                <a href="/booking/" class="hidden lg:inline-flex bg-trust-950 text-white !important text-xs font-bold px-6 py-2.5 rounded-full hover:bg-trust-800 transition-all no-underline shadow-md shadow-trust-900/20 shrink-0 transform hover:-translate-y-0.5 items-center justify-center" style="color: white !important;">
                    線上預約
                </a>

                <!-- Mobile Menu Button -->
                <button 
                    class="lg:hidden p-2.5 text-slate-500 hover:text-trust-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-50" 
                    onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"
                    aria-label="開啟選單"
                    aria-expanded="false"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    
    <!-- Mobile Menu (保持不變) -->
    <!-- ... existing mobile menu ... -->
</header>
```

**關鍵改動**:
1. ✅ `sticky top-0` 替代 `fixed top-8`（手機端貼頂）
2. ✅ `h-14` (56px) 固定高度（手機端），`sm:h-auto`（桌機端）
3. ✅ `px-4 pt-3 pb-2` 內縮 padding（手機端），`sm:pt-8`（桌機端恢復）
4. ✅ `border-b`（手機端底部邊框），`sm:border-0`（桌機端無邊框，使用 rounded-full）
5. ✅ Logo 尺寸 `h-8` (32px) 手機端，`sm:h-12` (48px) 桌機端
6. ✅ 手機端可選擇顯示文字標籤

---

### 🔴 問題 3: Hero 圖片被切得很怪（右半臉超大、構圖不像原生）

#### 問題描述
**位置**: `src/index.njk:13-36` (Hero Section)  
**嚴重度**: **S0 (阻斷性)**  
**影響**: Hero 圖片裁切不自然，影響視覺效果和專業感

#### 根因分析

**當前代碼檢查**:
- Hero Section 使用背景漸層 (`bg-dawn-gradient-strong`)，未發現明顯的 Hero 圖片
- 檢查是否有其他地方使用 Hero 圖片

**可能的問題位置**:
1. Portfolio 圖片 (`portfolio-img-card`)
2. 其他頁面的 Hero 圖片

**但基於描述「右半臉超大」**，推測問題可能在：
- 圖片容器使用固定高度
- `object-fit: cover` 配合錯誤的 `object-position`
- 容器 `aspect-ratio` 與圖片實際比例不匹配

#### 修復方案（通用 Hero 圖片最佳實踐）

**假設有 Hero 圖片的情況**:

```html
<!-- 修復後：使用固定比例容器 + object-cover -->
<section class="mx-auto max-w-screen-lg px-4 mt-6 sm:mt-8">
    <div class="rounded-3xl bg-white shadow-sm border border-slate-100 p-4 sm:p-6">
        <div class="overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
            <img
                src="/hero.jpg"
                alt="好時有影專業攝影服務"
                class="h-full w-full object-cover object-center"
                loading="eager"
                decoding="async"
            />
        </div>
    </div>
</section>
```

**如果確實需要「半臉」效果**（明確指定 object-position）:

```html
<div class="overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/9]">
    <img
        src="/hero.jpg"
        alt=""
        class="h-full w-full object-cover object-[60%_50%]"
        <!-- object-[60%_50%] 表示：水平 60%（偏右），垂直 50%（居中） -->
    />
</div>
```

**Portfolio 圖片修復**（如果問題在此）:

```css
/* 修復 src/assets/css/main.css:1618-1641 */
.portfolio-img-card {
    overflow: hidden;
    border-radius: 1rem;
    position: relative;
    /* 使用固定比例 */
    aspect-ratio: 3 / 4; /* 人像比例，手機端 */
}

@media (min-width: 768px) {
    .portfolio-img-card {
        aspect-ratio: 4 / 5; /* 桌機端可調整 */
    }
}

.portfolio-img-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center; /* 明確指定居中，避免切到臉 */
    display: block;
}
```

**關鍵要點**:
1. ✅ 使用 `aspect-ratio` 而非固定高度
2. ✅ `object-fit: cover` 確保填滿
3. ✅ `object-position: center center` 明確指定裁切位置（除非設計要求特定位置）
4. ✅ Mobile 使用 `aspect-[4/5]`（人像），Desktop 使用 `aspect-[16/9]`（橫向）

---

### 🔴 問題 4: 疑似水平 Overflow（手機視覺「歪」「鬆」「不服貼」）

#### 問題描述
**嚴重度**: **S0 (阻斷性)**  
**影響**: 造成水平捲動，視覺不自然，破壞移動端體驗

#### 根因分析

**常見兇手**:
1. `w-screen` 或 `100vw`（包含滾動條寬度）
2. 某個元素 `translateX` 超出邊界
3. 容器 `padding` + `100vw` 疊加
4. Fixed/absolute 定位元素超出 viewport
5. 負 margin (`-mx-*`) 未配合父容器處理

#### 快速診斷方法

**1. 添加全局止血**（快速確認）:

```css
/* 在 src/assets/css/main.css 的 base layer */
@layer base {
    body {
        overflow-x: hidden; /* ✅ 已存在，但需確認是否生效 */
        width: 100%;
        max-width: 100vw;
    }
    
    html {
        overflow-x: hidden;
        width: 100%;
        max-width: 100vw;
    }
}
```

**2. 使用 DevTools 找出問題元素**:

```js
// 在瀏覽器 Console 執行
function findOverflowElements() {
    const all = document.querySelectorAll('*');
    const offenders = [];
    
    all.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth || rect.left < 0) {
            offenders.push({
                element: el,
                tag: el.tagName,
                class: el.className,
                styles: window.getComputedStyle(el),
                rect: rect
            });
        }
    });
    
    console.table(offenders);
    return offenders;
}

findOverflowElements();
```

**3. 檢查特定 Tailwind 類別**:

使用 grep 搜尋專案中的問題類別:
```bash
# 搜尋可能的問題來源
grep -r "w-screen\|100vw\|translate-x-\|absolute\|fixed" src/
```

#### 修復方案

**步驟 1: 全局止血**（已存在，確認生效）:

```css
/* src/assets/css/main.css:182-198 */
body {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
}

html {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
}
```

**步驟 2: 修復特定問題來源**

根據掃描結果，常見問題位置：

| 位置 | 問題 | 修復 |
|------|------|------|
| `main.css:1748` | `width: calc(100vw - 2rem)` | 改用 `100%` |
| `navigation.njk` | Fixed header 可能超出 | 確認 `left: 0; right: 0;` |
| 負 margin 容器 | `-mx-4` 未配合處理 | 使用 `overflow-x: hidden` 父容器 |

**步驟 3: 容器最佳實踐**

```css
/* 所有主要容器應使用此模式 */
.container-safe {
    width: 100%;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
}

/* 避免使用 */
.container-unsafe {
    width: 100vw; /* ❌ 不要用 */
    padding: 0 1rem; /* 可能造成溢出 */
}

/* 正確方式 */
.container-safe {
    width: 100%;
    padding: 0 1rem;
}
```

**步驟 4: 負 Margin 處理**

```html
<!-- 如果需要負 margin（如全寬背景） -->
<div class="overflow-x-hidden"> <!-- 父容器防止溢出 -->
    <div class="-mx-4 px-4">
        <!-- 內容 -->
    </div>
</div>
```

---

## F. 常見 Bug 掃描 (Common Bugs)

### 🔍 全站掃描結果

#### 1. 水平捲動 (Overflow-x)

**檢查方法**: 使用 DevTools 檢查是否有 `overflow-x: scroll`

**發現問題**:

| 位置 | 問題 | 嚴重度 | 修復方案 |
|------|------|--------|----------|
| `main.css:1748` | `width: calc(100vw - 2rem)` | **S0** | 改用 `100%` |
| `category-pill-container` | Pills 被切掉可能造成視覺上的「溢出感」 | **S0** | 見 E-1.問題1 修復方案 |
| Fixed header | 可能超出 viewport | **S0** | 見 D. Navigation 修復 |
| Instagram embed | 可能造成溢出 | S2 | 已在 wrapper 中處理，需確認 |
| 負 margin 容器 | `-mx-4` 未配合處理 | **S0** | 使用 `overflow-x: hidden` 父容器 |

**驗證方法**:
```js
// 在 console 中執行
document.body.scrollWidth > document.body.clientWidth
// 如果為 true，表示有水平溢出

// 進階：找出所有溢出的元素
function findOverflowElements() {
    const all = document.querySelectorAll('*');
    const offenders = [];
    all.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth || rect.left < 0) {
            offenders.push({
                element: el.tagName,
                class: el.className,
                right: rect.right,
                width: window.innerWidth
            });
        }
    });
    console.table(offenders);
    return offenders;
}
findOverflowElements();
```

#### 2. 內容被切掉

**檢查項目**:
- Category Pills（**🔴 嚴重問題**）
- Modal/Drawer
- Dropdown menu
- Fixed header 遮擋內容
- Hero 圖片裁切

**發現**:

| 元件 | 狀態 | 問題 | 嚴重度 | 修復位置 |
|------|------|------|--------|----------|
| **Category Pills** | ❌ | 第三顆被切掉一半 | **S0** | 見 E-1.問題1 |
| Mobile Menu | ✅ | 已設定 `max-h-[80vh] overflow-y-auto` | - | - |
| Dropdown (Desktop) | ⚠️ | 需確認在小螢幕上的行為 | S2 | - |
| Fixed Header | ⚠️ | 在手機上占用過多空間 | **S0** | 見 D. Navigation 修復 |
| Hero 圖片 | ❌ | 裁切不自然（右半臉超大） | **S0** | 見 E-1.問題3 |

**Category Pills 詳細診斷**:

檢查點:
1. ✅ `flex-wrap` 是否設定？
2. ❌ 父容器是否有 `overflow: hidden`？
3. ❌ 是否有固定寬度限制？
4. ❌ CSS 是否有衝突覆蓋？

**修復方案**: 見 E-1.問題1 的詳細修復步驟

**修復**:
```css
/* 確保 fixed header 不會遮擋 */
main {
  padding-top: calc(var(--height-header) + 1rem);
}

/* 或使用 CSS variable */
:root {
  --header-height: 74px;
  --header-height-mobile: 80px; /* 包含 padding */
}
```

#### 3. 文字超出容器

**已檢查**: Hero 標題、Footer 地址  
**狀態**: ⚠️ Hero 標題在極小螢幕可能溢出  
**修復**: 見 C.3 流動字體建議

#### 4. 固定高度造成擠壓

**發現**:
- `.price-gallery { height: 400px; }` (main.css:1332)
- Hero 背景 `h-[400px]` (index.njk:14)

**修復**: 改用 `min-height` + `aspect-ratio`

#### 5. Z-index 疊層問題

**當前 z-index 設定** (main.css:146-150):
```css
--z-index-header: 1000;
--z-index-header-nav: 1001;
--z-index-dropdown: 1002;
--z-index-modal: 2000;
--z-index-tooltip: 3000;
```

**狀態**: ✅ 層級清晰，無衝突

#### 6. iOS Input Zoom

**已檢查**: 見 C.1  
**狀態**: ⚠️ 需強制所有 input >= 16px

#### 7. Safe Area (底部 Home Bar)

**已檢查**: 見 D.4  
**狀態**: ⚠️ 需加強 safe-area 支援

---

## G. 測試矩陣與驗收規範 (Testing Matrix)

### 測試裝置尺寸清單

| 裝置類型 | 寬度×高度 | 優先級 | 測試重點 |
|----------|-----------|--------|----------|
| iPhone SE (2020) | 375×667 | P0 | 最小螢幕體驗 |
| iPhone 12/13/14 | 390×844 | P0 | 標準現代手機 |
| iPhone 14 Pro Max | 430×932 | P1 | 大螢幕手機 |
| iPhone Plus (舊) | 414×736 | P1 | 較大舊機 |
| Samsung Galaxy S21 | 360×800 | P0 | Android 小螢幕 |
| iPad Mini | 768×1024 | P2 | 平板 |
| iPad Pro | 1024×1366 | P2 | 大平板/小桌機 |

### 測試頁面/流程清單

| 頁面/功能 | 測試重點 | 驗收標準 |
|-----------|----------|----------|
| **首頁** | Hero 標題、Portfolio 網格、Category pills | 無水平捲動、按鈕可點、圖片載入正常 |
| **導航** | Mobile menu、Dropdown | 不遮擋內容、觸控友好、動畫順暢 |
| **作品集** | 圖片網格、分類篩選 | 響應式布局、觸控反饋、載入性能 |
| **價目表** | 價格卡片、表格 | 文字可讀、無溢出、觸控目標足夠 |
| **預約頁** | 表單輸入、日曆選擇 | 無 iOS zoom、鍵盤不遮擋、提交順暢 |
| **關於我們** | 內容排版、圖片展示 | 閱讀體驗、圖片適配 |
| **Footer** | 連結、地址、社交媒體 | 觸控目標、文字可讀 |

### Lighthouse / Web Vitals 目標

| 指標 | 當前目標 | 優秀標準 | 測量方法 |
|------|----------|----------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 1.8s | Lighthouse |
| **FID** / **INP** (Interaction to Next Paint) | < 100ms | < 50ms | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.05 | Lighthouse |
| **FCP** (First Contentful Paint) | < 1.8s | < 1.2s | Lighthouse |
| **TTI** (Time to Interactive) | < 3.8s | < 2.5s | Lighthouse |

**Mobile 特定檢查**:
- ✅ 觸控目標 >= 44×44px
- ✅ 文字大小 >= 16px (input)
- ✅ Viewport 正確設定
- ✅ 內容寬度適配

### 視覺驗收標準

#### 對齊 (Alignment)
- [ ] 所有文字左對齊（除非明確居中）
- [ ] 按鈕/卡片在網格中對齊
- [ ] Footer 內容對齊一致

#### 留白 (Spacing)
- [ ] Section 間距 >= 48px (mobile) / >= 64px (desktop)
- [ ] 元素間距使用 4px 倍數 (4/8/12/16/24/32px)
- [ ] 文字行距 >= 1.4 (mobile) / >= 1.5 (desktop)

#### 可讀性 (Readability)
- [ ] 對比度 >= 4.5:1 (正文) / >= 3:1 (大字)
- [ ] 字體大小 >= 14px (正文) / >= 16px (input)
- [ ] 行長 <= 75 字元 (mobile) / <= 100 字元 (desktop)

#### 點擊性 (Tappability)
- [ ] 所有可點元素 >= 44×44px
- [ ] 元素間距 >= 8px (避免誤觸)
- [ ] 點擊反饋明顯（active state）

#### 無水平捲動
- [ ] 在 360px 寬度下無水平捲動
- [ ] 在 375px 寬度下無水平捲動
- [ ] 在 414px 寬度下無水平捲動

#### 鍵盤不遮擋
- [ ] Input focus 時，輸入框可見
- [ ] 提交按鈕可見
- [ ] 使用 `scroll-margin-top` 或 JS 滾動

---

## H. 直接改造輸出 (Implementation)

### 1. 全域 Mobile 友善 CSS/Token

**新建檔案**: `src/assets/css/mobile-utilities.css`

```css
/* ==================================================
 * Mobile-First Utilities & Tokens
 * ================================================== */

:root {
  /* Mobile-First Spacing Scale */
  --spacing-xs: 0.5rem;    /* 8px */
  --spacing-sm: 0.75rem;   /* 12px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  
  /* Touch Target */
  --touch-target-min: 44px;
  
  /* Safe Area */
  --safe-area-top: env(safe-area-inset-top, 0);
  --safe-area-right: env(safe-area-inset-right, 0);
  --safe-area-bottom: env(safe-area-inset-bottom, 0);
  --safe-area-left: env(safe-area-inset-left, 0);
  
  /* Viewport Height (for iOS Safari) */
  --vh: 1vh;
}

/* ==================================================
 * Global Touch Target Enforcement
 * ================================================== */
a[href],
button:not([disabled]),
[role="button"],
input[type="submit"],
input[type="button"] {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 例外: 純文字連結可以使用 padding 擴展點擊區域 */
a:not([class*="btn"]):not([class*="button"]) {
  min-height: auto;
  min-width: auto;
  padding: 0.5rem 0.25rem; /* 擴展點擊區域 */
  margin: -0.5rem -0.25rem; /* 視覺上不影響布局 */
}

/* ==================================================
 * iOS Input Zoom Prevention
 * ================================================== */
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="number"],
input[type="password"],
input[type="search"],
input[type="url"],
select,
textarea {
  font-size: 16px !important; /* 防止 iOS 自動縮放 */
}

/* ==================================================
 * Fluid Typography
 * ================================================== */
.fluid-hero {
  font-size: clamp(1.875rem, 5vw + 1rem, 4.5rem); /* 30px - 72px */
  line-height: clamp(1.2, 0.8 + 0.4vw, 1.1);
}

.fluid-subtitle {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem); /* 16px - 20px */
  line-height: 1.5;
}

.fluid-body {
  font-size: clamp(0.875rem, 1vw + 0.5rem, 1rem); /* 14px - 16px */
  line-height: 1.6;
}

/* ==================================================
 * Safe Area Support
 * ================================================== */
.safe-area-top {
  padding-top: calc(var(--spacing-lg) + var(--safe-area-top));
}

.safe-area-bottom {
  padding-bottom: calc(var(--spacing-lg) + var(--safe-area-bottom));
}

.safe-area-left {
  padding-left: calc(var(--spacing-md) + var(--safe-area-left));
}

.safe-area-right {
  padding-right: calc(var(--spacing-md) + var(--safe-area-right));
}

/* ==================================================
 * Viewport Height Fix (iOS Safari)
 * ================================================== */
.min-h-screen-safe {
  min-height: 100dvh; /* Modern browsers */
  min-height: -webkit-fill-available; /* iOS Safari */
  min-height: 100vh; /* Fallback */
}

/* ==================================================
 * Hover-only Behavior Fix
 * ================================================== */
@media (hover: hover) {
  /* Desktop: 使用 hover */
  .hover-only {
    opacity: 0;
    transition: opacity 0.3s;
  }
  .hover-only:hover {
    opacity: 1;
  }
}

@media (hover: none) {
  /* Mobile: 使用 touch feedback */
  .hover-only:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

/* ==================================================
 * Reduced Motion Support
 * ================================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ==================================================
 * Container Padding (Mobile-First)
 * ================================================== */
.container-mobile {
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 768px) {
  .container-mobile {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .container-mobile {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}
```

### 2. Tailwind Config 更新

**修改**: `tailwind.config.js`

```js
module.exports = {
  // ... existing config
  theme: {
    extend: {
      // ... existing extends
      
      // 新增斷點
      screens: {
        'xs': '360px',   // 最小手機
        'sm': '375px',   // 標準手機
        'md': '390px',   // 較大手機
        'lg': '414px',   // 最大手機
        'xl': '768px',   // 平板
        '2xl': '1024px', // 小桌機
        '3xl': '1200px', // 大桌機
      },
      
      // 流動字體
      fontSize: {
        // ... existing
        'fluid-hero': 'clamp(1.875rem, 5vw + 1rem, 4.5rem)',
        'fluid-subtitle': 'clamp(1rem, 2vw + 0.5rem, 1.25rem)',
        'fluid-body': 'clamp(0.875rem, 1vw + 0.5rem, 1rem)',
      },
      
      // Touch target
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
}
```

### 3. 關鍵元件修復 Patch

#### A. Hero Section 修復（包含圖片裁切問題）

**檔案**: `src/index.njk:13-36`

**問題 1: Hero 標題溢出**
**問題 2: 背景漸層固定高度**
**問題 3: 如果有 Hero 圖片，裁切不自然**

**完整修復**:

```html
<!-- 修復後 -->
<div class="text-center mb-8 sm:mb-12 md:mb-16 relative pt-16 sm:pt-20 md:pt-24 px-4">
    <!-- 使用 aspect-ratio 替代固定高度 -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[80vw] aspect-square sm:max-w-md sm:h-[400px] bg-dawn-gradient-strong rounded-full blur-[80px] -z-10 opacity-70 animate-pulse" style="animation-duration: 4s;"></div>
    
    <!-- 使用流動字體 -->
    <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-7xl xl:text-8xl font-bold text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6 px-2 sm:px-4">
        Your Ticket to <br class="hidden sm:block">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 font-serif italic font-normal px-2 block sm:inline">the next chapter.</span>
    </h1>
    
    <!-- 確保文字大小適配 -->
    <p class="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4 px-2 sm:px-4">
        讓每一個「好時」，都有你我的「身影」
    </p>
    
    <p class="text-xs sm:text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
        台北專業履歷・形象照攝影｜專為頂尖學府與百大企業打造的專業形象
    </p>
</div>
```

**如果有 Hero 圖片（修復裁切問題）**:

```html
<!-- Hero 圖片區塊（如果需要） -->
<section class="mx-auto max-w-screen-lg px-4 mt-6 sm:mt-8">
    <div class="rounded-3xl bg-white shadow-sm border border-slate-100 p-4 sm:p-6">
        <!-- 使用固定比例容器 + object-cover -->
        <div class="overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
            <img
                src="/hero.jpg"
                alt="好時有影專業攝影服務"
                class="h-full w-full object-cover object-center"
                <!-- object-center 確保居中裁切，避免切到臉 -->
                loading="eager"
                decoding="async"
            />
        </div>
    </div>
</section>
```

**如果需要特定裁切位置（如「半臉」效果）**:

```html
<div class="overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/9]">
    <img
        src="/hero.jpg"
        alt=""
        class="h-full w-full object-cover object-[60%_50%]"
        <!-- object-[60%_50%]: 水平 60%（偏右），垂直 50%（居中） -->
    />
</div>
```

#### B. Category Pills 修復（解決被切掉問題）

**檔案**: `src/index.njk:44-74`, `src/assets/css/main.css:1498-1616`

**問題**: 第三顆 pill 被切掉一半

**方案 A（推薦）: 允許換行**

**HTML 修復** (`src/index.njk:44`):
```html
<!-- 修復前 -->
<div class="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl mx-auto px-4 category-pill-container">

<!-- 修復後 -->
<div class="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto px-4 category-pill-container">
    <!-- 確保 flex-wrap 生效，按鈕可以換行 -->
    <button class="category-pill active" onclick="filterPortfolio('passport-korea', this)">
        韓式證件照
    </button>
    <!-- ... 其他按鈕 ... -->
</div>
```

**CSS 修復** (`src/assets/css/main.css:1543-1570`):
```css
.category-pill-container {
    width: 100%;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-wrap: wrap; /* 明確設定，允許換行 */
    justify-content: center;
    align-items: center;
    gap: 0.5rem; /* 移動端使用更小的間距 */
    /* 確保沒有 overflow 限制 */
    overflow: visible !important; /* 確保可見 */
}

/* 確保按鈕不會被切 */
.category-pill-container > * {
    flex-shrink: 0;
    flex-grow: 0;
}

.category-pill {
    /* 確保 touch target */
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1.25rem; /* 增加 padding */
    font-size: 0.875rem; /* 14px - 確保可讀性 */
    white-space: nowrap; /* 文字不換行 */
    
    /* Mobile 優化 */
    @media (max-width: 767px) {
        padding: 0.625rem 1rem;
        font-size: 0.8125rem; /* 13px - 稍微縮小但不影響可讀性 */
        min-height: 44px; /* 確保 */
    }
}
```

**方案 B（備選）: 水平滑動**

如果設計要求保持單行，使用此方案：

**HTML**:
```html
<div class="-mx-4 px-4 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
    <button class="category-pill active snap-start flex-shrink-0" onclick="filterPortfolio('passport-korea', this)">
        韓式證件照
    </button>
    <button class="category-pill snap-start flex-shrink-0" onclick="filterPortfolio('linkedin-portrait', this)">
        專業形象照
    </button>
    <!-- ... 其他按鈕，每個都加上 flex-shrink-0 和 snap-start ... -->
</div>
```

**添加 Utilities** (`src/assets/css/main.css` 在 `@layer utilities`):
```css
@layer utilities {
    /* Scrollbar 隱藏 */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    
    /* 滑動對齊 */
    .snap-x {
        scroll-snap-type: x mandatory;
    }
    
    .snap-start {
        scroll-snap-align: start;
    }
}
```

#### C. Portfolio Grid 修復

**檔案**: `src/index.njk:77-79`

```html
<!-- 修復前 -->
<div id="portfolio-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

<!-- 修復後 -->
<div id="portfolio-grid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-4 sm:px-0">
```

**CSS 優化** (`main.css:1618-1641`):
```css
.portfolio-img-card {
    overflow: hidden;
    border-radius: 1rem;
    position: relative;
    transition: all 0.4s ease;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F7F4EF;
    /* 確保圖片適配 */
    aspect-ratio: 3 / 4; /* 根據實際圖片比例調整 */
}

.portfolio-img-card img {
    transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    width: 100%;
    height: 100%;
    object-fit: cover; /* 改為 cover，確保填滿 */
    object-position: center center;
    display: block;
}

/* Mobile touch feedback */
@media (hover: none) {
    .portfolio-img-card:active {
        transform: scale(0.98);
    }
}

/* Desktop hover */
@media (hover: hover) {
    .portfolio-img-card:hover img {
        transform: scale(1.05);
    }
}
```

#### D. Navigation 修復（解決超大膠囊問題）

**檔案**: `src/_includes/partials/navigation.njk`

**問題**: Header 在手機上看起來像桌機元件硬縮，不自然

**完整修復方案**:

```html
<!-- 修復後：移動端友好的 header -->
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-200 sm:border-0 sm:bg-transparent">
    <div class="mx-auto max-w-screen-xl px-4 pt-3 pb-2 sm:pt-8">
        <div class="flex items-center justify-between rounded-full border border-sand-200 bg-white/90 backdrop-blur-md shadow-sm sm:shadow-lg px-4 h-14 sm:h-auto sm:py-3">
            
            <!-- Logo -->
            <a href="/" class="flex items-center shrink-0 gap-2 sm:gap-3 group">
                <img
                    src="{{ 'ui/logo.jpg' | r2img }}"
                    alt="好時有影 Golden Years Logo"
                    width="120"
                    height="100"
                    class="h-8 w-auto sm:h-12 object-contain"
                    onerror="this.onerror=null; this.src='/assets/images/ui/logo.jpg';"
                />
                <!-- 手機端顯示文字標籤（可選） -->
                <span class="text-sm font-semibold text-slate-900 sm:hidden">好時有影</span>
            </a>
            
            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                <!-- ... existing desktop nav code ... -->
            </div>

            <!-- Mobile & CTA -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- 線上預約按钮 - 仅在桌面端显示 -->
                <a href="/booking/" class="hidden lg:inline-flex bg-trust-950 text-white !important text-xs font-bold px-6 py-2.5 rounded-full hover:bg-trust-800 transition-all no-underline shadow-md shadow-trust-900/20 shrink-0 transform hover:-translate-y-0.5 items-center justify-center" style="color: white !important;">
                    線上預約
                </a>

                <!-- Mobile Menu Button -->
                <button 
                    class="lg:hidden p-2.5 text-slate-500 hover:text-trust-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-50" 
                    onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"
                    aria-label="開啟選單"
                    aria-expanded="false"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    
    <!-- Mobile Menu (保持不變) -->
    <div id="mobile-menu" class="hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-sand-200 p-6 flex-col gap-4 origin-top animate-fade-in-down z-40 max-h-[80vh] overflow-y-auto">
        <!-- ... existing mobile menu code ... -->
    </div>
</header>
```

**關鍵改動**:
1. ✅ `sticky top-0` 替代 `fixed top-8`（手機端貼頂）
2. ✅ `h-14` (56px) 固定高度（手機端），`sm:h-auto`（桌機端）
3. ✅ `px-4 pt-3 pb-2` 內縮 padding（手機端），`sm:pt-8`（桌機端恢復）
4. ✅ `border-b`（手機端底部邊框），`sm:border-0`（桌機端使用 rounded-full）
5. ✅ Logo 尺寸 `h-8` (32px) 手機端，`sm:h-12` (48px) 桌機端
6. ✅ Safe area 支援（如果需要）

**CSS 修復** (`src/assets/css/main.css:1703-1711`):
```css
header.fixed,
header.sticky {
    position: sticky; /* 改用 sticky，更自然 */
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    will-change: transform;
    transform: translateZ(0);
    /* Safe area support */
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
}

/* Mobile: 全寬 header，無 rounded */
@media (max-width: 767px) {
    header.sticky {
        top: 0;
    }
    header.sticky > div > div {
        border-radius: 0.75rem; /* 稍微圓角即可 */
    }
}

/* Desktop: 保持原有設計 */
@media (min-width: 768px) {
    header.sticky {
        top: 2rem; /* 恢復 top-8 效果 */
    }
    header.sticky > div > div {
        border-radius: 9999px; /* rounded-full */
    }
}
```

**CSS 修復** (`main.css:1703-1711`):
```css
header.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    will-change: transform;
    transform: translateZ(0);
    /* Safe area support */
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
}

/* Mobile: 全寬 header */
@media (max-width: 767px) {
    header.fixed {
        top: 0;
        border-radius: 0;
    }
    header.fixed nav {
        border-radius: 0;
        border-left: none;
        border-right: none;
    }
}
```

#### E. Form 修復 (如果有的話)

**通用修復**:
```css
/* 確保所有表單元素符合 mobile 標準 */
input[type="text"],
input[type="email"],
input[type="tel"],
textarea {
    font-size: 16px; /* 防止 iOS zoom */
    min-height: 44px; /* Touch target */
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid var(--color-border);
    width: 100%;
}

input:focus,
textarea:focus {
    outline: none;
    border-color: var(--color-trust-800);
    box-shadow: 0 0 0 3px rgba(38, 60, 109, 0.1);
}

/* 確保按鈕足夠大 */
button[type="submit"],
input[type="submit"] {
    min-height: 44px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
}
```

### 4. 驗收 Checklist

#### 修復後驗收步驟

1. **視覺檢查**
   - [ ] 在 360px 寬度下無水平捲動
   - [ ] 所有按鈕/連結 >= 44×44px
   - [ ] Hero 標題在各種尺寸下可讀
   - [ ] 圖片不會溢出容器

2. **功能測試**
   - [ ] 所有按鈕可點擊（觸控）
   - [ ] Mobile menu 開啟/關閉正常
   - [ ] Portfolio 篩選功能正常
   - [ ] 表單輸入無 iOS zoom
   - [ ] 鍵盤彈出時輸入框可見

3. **性能測試**
   - [ ] Lighthouse Mobile Score >= 90
   - [ ] LCP < 2.5s
   - [ ] CLS < 0.1
   - [ ] INP < 100ms

4. **跨瀏覽器測試**
   - [ ] iOS Safari (iPhone)
   - [ ] Chrome Android
   - [ ] Samsung Internet

5. **無障礙測試**
   - [ ] 觸控目標 >= 44×44px
   - [ ] 對比度符合 WCAG AA
   - [ ] 鍵盤導航正常

---

## 優先級修復路線圖 (Priority Roadmap)

### Phase 1: 緊急修復 (S0) - 1-2 天

1. **Category Pills 被切掉修復** 🔴 **最高優先級**
   - 檔案: `src/index.njk:44`, `src/assets/css/main.css:1543-1570`
   - 動作: 
     - 確保 `flex-wrap` 生效
     - 移除可能造成 `overflow: hidden` 的 CSS
     - 確認容器無固定寬度限制
   - 風險: 低
   - **驗收**: 在 360px 寬度下，所有 pills 完整顯示（可換行）

2. **Header 超大膠囊修復** 🔴 **最高優先級**
   - 檔案: `src/_includes/partials/navigation.njk:2-159`
   - 動作: 
     - 改用 `sticky top-0` 替代 `fixed top-8`
     - 手機端固定高度 `h-14` (56px)
     - 調整 padding 和 border
   - 風險: 中（需測試移動端 menu）
   - **驗收**: 在手機上 Header 占用空間減少，視覺自然

3. **Hero 圖片裁切修復** 🔴 **最高優先級**（如果有 Hero 圖片）
   - 檔案: `src/index.njk` 或相關模板
   - 動作: 
     - 使用 `aspect-ratio` 替代固定高度
     - `object-fit: cover` + `object-position: center center`
     - Mobile 使用 `aspect-[4/5]`，Desktop 使用 `aspect-[16/9]`
   - 風險: 低
   - **驗收**: 圖片裁切自然，不會切到重要內容（如臉部）

4. **水平 Overflow 修復** 🔴 **最高優先級**
   - 檔案: 全站掃描
   - 動作: 
     - 確認 `body { overflow-x: hidden }` 生效
     - 找出所有 `100vw` / `w-screen` 並修復
     - 檢查 fixed/absolute 元素是否超出
   - 風險: 低
   - **驗收**: 在 360px/375px/390px 下無水平捲動

5. **Hero 標題溢出修復**
   - 檔案: `src/index.njk:24-27`
   - 動作: 改用流動字體或更小初始字體（`text-2xl` 起）
   - 風險: 低

6. **Touch Target 確保**
   - 檔案: `src/assets/css/main.css` (全域)
   - 動作: 添加 `min-height: 44px` 到所有可點元素
   - 風險: 低（可能影響部分布局，需測試）

### Phase 2: 重要優化 (S1) - 3-5 天

4. **斷點策略更新**
   - 檔案: `tailwind.config.js`
   - 動作: 添加 xs/sm/md/lg 斷點（360/375/390/414px）
   - 風險: 中（需全站測試）

5. **iOS Input Zoom 預防**
   - 檔案: `src/assets/css/main.css`
   - 動作: 強制所有 input >= 16px
   - 風險: 低

6. **Safe Area 支援加強**
   - 檔案: `navigation.njk`, `base-layout.njk`
   - 動作: 添加 safe-area-inset 到固定定位元素
   - 風險: 低

7. **Hover-only 行為修復**
   - 檔案: `src/assets/css/main.css`
   - 動作: 使用 `@media (hover: hover)` 區分
   - 風險: 低

### Phase 3: 體驗優化 (S2) - 1-2 週

8. **流動字體系統**
   - 檔案: `tailwind.config.js`, `main.css`
   - 動作: 實現 `clamp()` 流動字體
   - 風險: 中（需視覺調整）

9. **間距系統統一**
   - 檔案: 全站
   - 動作: 建立 mobile-first spacing scale
   - 風險: 中（影響範圍大）

10. **圖片響應式優化**
    - 檔案: `src/index.njk` (portfolio)
    - 動作: 使用 `srcset` / `sizes`
    - 風險: 低（需 CDN 支援）

11. **動畫性能優化**
    - 檔案: `src/assets/css/main.css`
    - 動作: 加強 `prefers-reduced-motion` 支援
    - 風險: 低

---

## 附錄: 工具與資源

### 推薦測試工具

1. **Chrome DevTools**
   - Device Mode (F12 > Toggle device toolbar)
   - Lighthouse (F12 > Lighthouse > Mobile)

2. **線上工具**
   - [Responsive Design Checker](https://responsivedesignchecker.com/)
   - [BrowserStack](https://www.browserstack.com/) (真實設備測試)

3. **本地工具**
   - [ngrok](https://ngrok.com/) (將本地網站暴露到網路，方便手機測試)

### 參考文檔

- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [CSS Tricks: Fluid Typography](https://css-tricks.com/snippets/css/fluid-typography/)
- [Web.dev: Viewport Units](https://web.dev/viewport-units/)

### Cursor AI 提示詞（給工程師的快速審計指令）

**用途**: 直接貼到 Cursor 進行專案級別的移動端響應式健康檢查

```
你是資深前端工程師與 UI/UX 顧問。此專案為 Eleventy (11ty) + TailwindCSS。請對「移動端響應式」做全面健康檢查並直接提交可落地的修復 patch（具體到檔案/元件/代碼片段）。

目標

手機介面目前不自然（像桌機硬縮）、有元素被切掉（tabs pills 第三顆顯示不完整）、Hero 圖片裁切不合理、疑似水平 overflow。請以「像原生 App」為驗收標準。

你要做的事（按順序）

定位模板來源

找出 header / nav / tabs / hero 主要是在哪些 11ty 檔案：_includes/, _layouts/, index.*, *.njk, *.liquid, *.11ty.*

列出對應檔案路徑與元件區塊（用註解標示）

全站 Mobile Audit（必做清單）

檢查 <meta name="viewport"> 是否正確

全站掃描造成水平 overflow 的來源：w-screen, 100vw, translate-x, absolute 元素超界、fixed width (w-[...])

找出 pills/tabs 列表為何被切：是否 flex-nowrap、是否 parent overflow-hidden、是否固定寬度

檢查 header 是否使用桌機尺寸（h 太高、padding 太大、固定寬度）

檢查 hero 圖片：是否固定高度、是否 object-fit/object-position 不正確

檢查 touch target：button/link 至少 44x44，小於者要修

提出修復方案並直接給 patch

Tabs pills：提供兩種方案
A) flex-wrap 多行（預設採用）
B) 單行 + overflow-x-auto + no-scrollbar（若設計想保持單行）

Header：改成 mobile 友善 top bar（sticky + 合理高度 + 內縮）

Hero：改成 aspect-ratio 容器 + object-cover，並給一個 mobile 比例（例如 aspect-[4/5]）與桌機比例（例如 sm:aspect-[16/9]）

全站：加入 overflow-x-hidden 的止血方案，但同時必須找出真正 overflow 來源並修掉

交付格式

(a) 問題清單：每項標註 S0/S1/S2、位置（檔案+行數）、原因、修法

(b) 修復 patch：直接貼出修改後的 code blocks

(c) 驗收 checklist：以 iPhone 375x812、390x844、360x800 三種尺寸為主，驗證「無水平捲動、tabs 不被切、header 不占太多高度、hero 裁切自然、可點區域符合 44x44」

Tailwind 建議（請落地到 config）

若專案目前沒有：請補 container 設定（center + padding）

建議加入 screens（至少 sm/md/lg）並確保 mobile-first

建議加入一組 spacing/typography tokens（fontSize/lineHeight/spacing）

限制：不要只講概念；請直接修改與提供可貼上的代碼。
```

**使用方式**:
1. 在 Cursor 中開啟專案
2. 貼上上述提示詞
3. Cursor 會自動掃描並提供修復建議
4. 對照本報告進行驗證

---

## 結語

本報告涵蓋了移動端響應式設計的全面檢查。建議按照優先級路線圖逐步修復，並在每個階段完成後進行測試驗收。

**關鍵要點**:
1. **緊急修復（S0）**: Category Pills 被切、Header 不自然、Hero 裁切、水平 overflow
2. 基礎設定已正確，但需優化細節
3. 斷點策略需要更細緻的 mobile 斷點
4. Touch target 和 typography 是提升「原生感」的關鍵
5. 圖片和動畫優化可提升性能和體驗

**預期效果**:
- ✅ 消除水平捲動
- ✅ Category Pills 完整顯示（可換行或滑動）
- ✅ Header 在手機上自然、緊湊（像原生 App）
- ✅ Hero 圖片裁切自然、構圖合理
- ✅ 提升觸控體驗（更像原生 App）
- ✅ 改善文字可讀性
- ✅ 優化載入性能
- ✅ 支援各種螢幕尺寸

**修復優先順序**:
1. **Phase 1（立即）**: 修復 Category Pills、Header、Hero 裁切、水平 overflow
2. **Phase 2（本週）**: 斷點策略、Touch target、iOS Input Zoom
3. **Phase 3（優化）**: 流動字體、間距系統、圖片響應式

---

**報告生成時間**: 2025-01-XX  
**下次審計建議**: 修復完成後 1 個月，或重大功能更新時
