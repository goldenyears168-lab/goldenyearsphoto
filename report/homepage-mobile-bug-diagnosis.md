# 首頁 Mobile Bug 診斷與修復報告
## Homepage Mobile Bug Diagnosis & Fix Report

**診斷日期**: 2025-01-XX  
**範圍**: 僅限首頁 (`src/index.njk`) 的 mobile 響應式問題  
**方法**: 差異比對 + 根因定位 + Scoped Patch

---

## 📋 A) 根因列表 (Root Cause Analysis)

### 🔴 問題 1: Category Pills 在 Mobile 顯示不自然 / 被切掉

**元素定位**: 
- 檔案: `src/index.njk:44`
- Selector: `.category-pill-container`
- 父層: `section#portfolio` (line 39)

**原因**:
1. **雙重 Padding 衝突**: 
   - Container 本身有 `px-4` (line 44)
   - CSS 在 mobile 又添加 `padding-left: 1rem; padding-right: 1rem;` (`main.css:1596-1597`)
   - 導致總 padding = `1rem + 1rem = 2rem`，可能壓縮可用寬度

2. **父層 Section Padding 疊加**:
   - `section#portfolio` 有 `px-4 sm:px-6 md:px-8` (line 39)
   - 與 container 的 `px-4` 疊加，在 mobile 上總 padding = `1rem + 1rem = 2rem`
   - 可用寬度在 360px 螢幕 = `360px - 32px - 32px = 296px`，不足

3. **Max-width 限制過緊**:
   - Container 有 `max-w-5xl mx-auto` (line 44)，但實際在 mobile 上可能與 section padding 衝突

**為何只在首頁發生**:
- 其他頁面沒有 `category-pill-container` 這個元件
- 其他頁面的 section 結構不同（例如 `about.njk` 使用不同的 container 結構）

---

### 🔴 問題 2: Hero 人像圖裁切不自然（半臉過大）

**元素定位**:
- 檔案: `src/index.njk:14`
- Selector: Hero Section 的背景漸變圓形
- 實際沒有「人像圖」，只有背景漸變效果

**原因**:
1. **Fixed Viewport Width**:
   - `max-w-[80vw]` 在 mobile 上可能導致元素過寬
   - `aspect-square` 在狹窄螢幕上可能不適合

2. **Positioning 問題**:
   - `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` 居中定位
   - 在 mobile 上，80vw 的寬度可能導致視覺上「半臉放大」的效果

3. **缺少 Mobile 專用尺寸**:
   - Desktop: `sm:max-w-md sm:h-[400px]`
   - Mobile: 只有 `max-w-[80vw] aspect-square`，可能太大或比例不對

**為何只在首頁發生**:
- 只有首頁有這個 Hero Section 結構
- 其他頁面（如 `about.njk`）使用不同的 header 結構

---

### 🔴 問題 3: Section 留白與卡片間距不均衡

**元素定位**:
- 檔案: `src/index.njk:39, 77, 83, 116`
- Selector: 多個 `section` 元素

**原因**:
1. **Main Container Padding 疊加**:
   - `base-layout.njk:99`: `main` 有 `px-4 md:px-8`
   - 首頁 sections 又有自己的 `px-4 sm:px-6 md:px-8`
   - 雙重 padding 導致 mobile 上留白過多

2. **不一致的 Padding 策略**:
   - Portfolio section (line 39): `px-4 sm:px-6 md:px-8`
   - About section (line 83): 沒有 padding
   - Instagram section (line 116): 沒有 padding，但有 `px-2` 在子元素

**為何只在首頁發生**:
- 首頁是唯一有多個 section 且各自設置 padding 的頁面
- 其他頁面通常只有一個主要 content 區域

---

### 🔴 問題 4: 浮動 AI Widget 按鈕可能遮擋內容

**元素定位**:
- 檔案: `src/_includes/base-layout.njk:191-215`
- Selector: AI Chatbot Widget (外部 script 載入)

**原因**:
1. **Main Container 缺少底部 Padding**:
   - `base-layout.njk:99`: `main` 只有 `pb-20`
   - 如果 AI widget 是 `fixed bottom`，可能遮擋最後的 CTA 按鈕

2. **首頁特有的長內容**:
   - 首頁內容較長（Hero + Portfolio + About + Instagram + Marquee + Process）
   - 在 mobile 上，底部 CTA 可能被 widget 遮擋

**為何只在首頁發生**:
- 首頁內容最長，滾動到底部時 widget 更容易遮擋內容
- 其他頁面內容較短，問題不明顯

---

## 🔧 B) 修復 Patch (Scoped to Homepage Only)

### 步驟 1: 添加首頁識別 Class

**檔案**: `src/_includes/base-layout.njk`

在 `<body>` tag 添加條件 class:

```njk
<body class="text-slate-600 antialiased selection:bg-trust-100 selection:text-trust-900 font-sans flex flex-col min-h-screen bg-[#FDFBF7] {% if pageType == 'home' %}page-home{% endif %}" style="...">
```

---

### 步驟 2: 修復 Category Pills Container

**檔案**: `src/index.njk:39-44`

**修改前**:
```njk
<section id="portfolio" class="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8">
    <div class="mb-10 text-center max-w-[1400px] mx-auto">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-4">找到你的專屬風格</p>
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto px-4 category-pill-container">
```

**修改後**:
```njk
<section id="portfolio" class="py-12 sm:py-16 md:py-24">
    <div class="mb-10 text-center max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">找到你的專屬風格</p>
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto category-pill-container">
```

**變更說明**:
- 移除 section 的 `px-4 sm:px-6 md:px-8`（交給內部容器統一管理）
- 將 padding 移到內部 `div`，避免雙重 padding
- 移除 container 的 `px-4`（CSS 會自動處理）

---

### 步驟 3: 修復 Hero Section 背景漸變

**檔案**: `src/index.njk:13-14`

**修改前**:
```njk
<div class="text-center mb-8 sm:mb-12 md:mb-16 relative pt-16 sm:pt-20 md:pt-24 px-4">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[80vw] aspect-square sm:max-w-md sm:h-[400px] bg-dawn-gradient-strong rounded-full blur-[80px] -z-10 opacity-70 animate-pulse" style="animation-duration: 4s;"></div>
```

**修改後**:
```njk
<div class="text-center mb-8 sm:mb-12 md:mb-16 relative pt-16 sm:pt-20 md:pt-24 px-4">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[60vw] aspect-square sm:max-w-md sm:h-[400px] bg-dawn-gradient-strong rounded-full blur-[80px] -z-10 opacity-70 animate-pulse" style="animation-duration: 4s;"></div>
```

**變更說明**:
- `max-w-[80vw]` → `max-w-[60vw]`：縮小 mobile 上的寬度，避免視覺上「半臉放大」
- 保持 `aspect-square` 和 desktop 的 `sm:max-w-md sm:h-[400px]`

---

### 步驟 4: 統一 Section Padding（首頁專用 CSS）

**檔案**: `src/assets/css/main.css` (在文件末尾添加)

```css
/* ========================================
 * Homepage-Specific Mobile Fixes
 * Scoped to .page-home only
 * ======================================== */

.page-home main {
    /* 移除 main container 的 padding，讓 sections 自己管理 */
    padding-left: 0;
    padding-right: 0;
}

.page-home section {
    /* 統一首頁所有 section 的 padding */
    padding-left: 1rem; /* 16px */
    padding-right: 1rem; /* 16px */
}

@media (min-width: 640px) {
    .page-home section {
        padding-left: 1.5rem; /* 24px */
        padding-right: 1.5rem; /* 24px */
    }
}

@media (min-width: 768px) {
    .page-home section {
        padding-left: 2rem; /* 32px */
        padding-right: 2rem; /* 32px */
    }
}

/* 確保 category-pill-container 在首頁不會有雙重 padding */
.page-home .category-pill-container {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

/* Hero section 例外：保持原有 padding */
.page-home > main > div:first-child {
    padding-left: 1rem;
    padding-right: 1rem;
}

/* 為 AI Widget 預留底部空間（首頁專用） */
.page-home main {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0)); /* 增加底部 padding，避免 widget 遮擋 */
}

@media (min-width: 768px) {
    .page-home main {
        padding-bottom: 5rem; /* Desktop 不需要 safe-area */
    }
}
```

---

### 步驟 5: 修復 Portfolio Grid 的 Padding

**檔案**: `src/index.njk:77`

**修改前**:
```njk
<div id="portfolio-grid" class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-[1400px] mx-auto">
```

**修改後**:
```njk
<div id="portfolio-grid" class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
```

**變更說明**:
- 添加 `px-4 sm:px-6 md:px-8` 確保 grid 有適當的 padding
- 這樣與 section 的 padding 一致

---

### 步驟 6: 修復 JavaScript 中的 Grid Class

**檔案**: `src/index.njk:505-508`

**修改前**:
```javascript
if (data.layout === 'horizontal') {
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-[1400px] mx-auto";
} else {
    grid.className = "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-[1400px] mx-auto";
}
```

**修改後**:
```javascript
if (data.layout === 'horizontal') {
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8";
} else {
    grid.className = "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8";
}
```

---

## ✅ C) 驗收標準 (Acceptance Criteria)

### 測試尺寸:
- ✅ 360×800 (Galaxy S20, iPhone SE)
- ✅ 375×812 (iPhone X/11/12/13)
- ✅ 390×844 (iPhone 14 Pro)

### 驗收項目:

#### 1. 無水平捲動
- [ ] 在所有測試尺寸上，`document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- [ ] 沒有元素超出 viewport
- [ ] 檢查方法：在 DevTools Console 執行：
  ```javascript
  const width = document.documentElement.scrollWidth;
  const clientWidth = document.documentElement.clientWidth;
  console.log(`Scroll Width: ${width}, Client Width: ${clientWidth}, Overflow: ${width > clientWidth}`);
  ```

#### 2. Category Pills 排列自然
- [ ] Pills 可以正常換行（`flex-wrap` 生效）
- [ ] 沒有被切掉（第三顆 pill 完整顯示）
- [ ] 左右 padding 適中（不會過緊或過鬆）
- [ ] 在 360px 寬度上至少能顯示 2 個完整的 pills

#### 3. Hero 背景漸變自然
- [ ] 在 mobile 上，漸變圓形不會過大（`max-w-[60vw]` 生效）
- [ ] 視覺上不會有「半臉放大」的感覺
- [ ] 漸變不會超出 viewport

#### 4. Section 留白均衡
- [ ] 所有 sections 的左右 padding 一致
- [ ] 卡片間距適中（`gap-3 sm:gap-4 md:gap-6` 生效）
- [ ] 沒有某個 section 特別緊或特別鬆

#### 5. AI Widget 不遮擋內容
- [ ] 底部 CTA/按鈕可以完整顯示
- [ ] 滾動到底部時，內容不被 widget 遮擋
- [ ] 有足夠的 `padding-bottom` 預留空間

---

## 🎯 修復優先級

1. **P0 (Critical)**: Category Pills + 水平 Overflow 檢查
2. **P1 (High)**: Hero 背景漸變尺寸
3. **P2 (Medium)**: Section Padding 統一
4. **P3 (Low)**: AI Widget 底部空間（如果 widget 確實會遮擋）

---

## 📝 注意事項

⚠️ **請不要再跑全站 responsive audit**；我已經有審計報告（含 viewport、touch target、safe-area、100vh 等），目前只有首頁壞，請用「差異比對 + 定位 overflow 元兇 + scoped patch」方式解決。

✅ 所有修復都使用 `.page-home` scope，不會影響其他頁面。

✅ 修復完成後，請在實際手機設備上測試（不僅僅是 DevTools），確保視覺效果符合預期。

---

**報告完成時間**: 2025-01-XX
