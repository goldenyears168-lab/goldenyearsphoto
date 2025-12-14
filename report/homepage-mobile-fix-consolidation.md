# 首頁 Mobile 修復整理報告
## Homepage Mobile Fix Consolidation Report

**修復日期**: 2025-01-XX  
**範圍**: 僅限首頁 mobile，scoped to `.page-home`  
**目標**: 合併分散的規則，移除冗餘和衝突

---

## 🔍 問題診斷

### 發現的問題

1. **`.page-home main` 被定義多次，分散在不同位置**
   - Line 2143-2147: 設置 `padding-left: 0; padding-right: 0;`
   - Line 2208-2210: 設置 `padding-bottom: calc(...)`
   - Line 2213-2215: Desktop 覆寫 `padding-bottom`
   - **問題**: 這些規則分散，容易互相覆蓋或遺漏

2. **Hero 使用脆弱的 selector**
   - `.page-home > main > div:first-child` 依賴 DOM 結構
   - **問題**: 如果 index.njk 結構改變，selector 會失效

3. **Category pills 使用 `!important` 和 `flex-start`**
   - `justify-content: flex-start !important` 強制左對齊
   - **問題**: 造成視覺上的「偏移感」，不符合設計預期

4. **Category pills container 使用 `!important` 移除 padding**
   - `padding-left: 0 !important; padding-right: 0 !important;`
   - **問題**: 不需要 `!important`，可以用更精準的 selector

---

## ✅ 修復內容

### 1. 合併 `.page-home main` 規則

**修改前** (分散在多處):
```css
.page-home main {
    padding-left: 0;
    padding-right: 0;
}

/* ... 其他規則 ... */

.page-home main {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0));
}

@media (min-width: 768px) {
    .page-home main {
        padding-bottom: 5rem;
    }
}
```

**修改後** (合併到一處):
```css
.page-home main {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0));
}

@media (min-width: 768px) {
    .page-home main {
        padding-bottom: 5rem;
    }
}
```

**效果**: 
- 所有 main 相關規則集中管理
- 避免規則分散造成的遺漏或衝突

---

### 2. Hero 使用明確 class

**修改前**:
- HTML: `<div class="text-center ...">` (無明確 class)
- CSS: `.page-home > main > div:first-child` (brittle selector)

**修改後**:
- HTML: `<div class="home-hero text-center ...">` (明確 class)
- CSS: `.page-home .home-hero` (穩定 selector)

**檔案**:
- `src/index.njk:13` - 添加 `home-hero` class
- `src/assets/css/main.css:2168-2184` - 使用 `.home-hero` selector

**效果**:
- 不依賴 DOM 結構
- 即使 HTML 結構改變，CSS 仍然有效
- Hero padding 與 section 保持一致

---

### 3. Category Pills 移除 `!important` 和 `flex-start`

**修改前**:
```css
.page-home .category-pill-container {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

@media (max-width: 767px) {
    .page-home .category-pill-container {
        justify-content: flex-start !important; /* 造成偏移感 */
    }
}
```

**修改後**:
```css
.page-home .category-pill-container {
    padding-left: 0;
    padding-right: 0;
}

/* 移除 justify-content 強制覆寫，讓 HTML 的 justify-center 生效 */
```

**效果**:
- Pills 保持居中對齊（符合設計）
- 移除 `!important`，減少特異性衝突
- 移除 `flex-start`，避免視覺偏移感

---

### 4. Hero 動畫優化（移除不必要的 `!important`）

**修改前**:
```css
.page-home .hero-bg-blur {
    animation: none !important;
    transform: translate(-50%, -50%) !important;
    opacity: 0.6 !important;
}
```

**修改後**:
```css
.page-home .hero-bg-blur {
    animation: none;
    transform: translate(-50%, -50%);
    opacity: 0.6;
}
```

**效果**:
- 移除 `!important`（不需要，因為已經有 `.page-home` scope）
- 保持動畫簡化的效果

---

## 📋 刪除的冗餘規則

1. ✅ **刪除**: `.page-home > main > div:first-child` (brittle selector)
   - **取代**: `.page-home .home-hero` (明確 class)

2. ✅ **刪除**: `justify-content: flex-start !important` (造成偏移感)
   - **取代**: 保持 HTML 的 `justify-center`

3. ✅ **刪除**: `padding-left: 0 !important; padding-right: 0 !important;`
   - **取代**: `padding-left: 0; padding-right: 0;` (不需要 `!important`)

4. ✅ **刪除**: 分散的 `.page-home main` 定義
   - **取代**: 合併到單一區塊

5. ✅ **刪除**: Desktop 的 `justify-content: center` 覆寫（不必要）
   - **取代**: HTML 已有 `justify-center`，CSS 不需要覆寫

---

## 🎯 驗收標準

### 測試設備
- ✅ 360×800 (Galaxy S20, iPhone SE)
- ✅ 375×812 (iPhone X/11/12/13)
- ✅ 390×844 (iPhone 14 Pro)
- ✅ 414×896 (iPhone 11 Pro Max)

### 驗收項目

#### 1. 無水平溢出
```javascript
// 在 Console 執行
const scrollWidth = document.body.scrollWidth;
const clientWidth = document.body.clientWidth;
console.log(`Scroll Width: ${scrollWidth}, Client Width: ${clientWidth}`);
console.log(`Overflow: ${scrollWidth > clientWidth ? 'YES ❌' : 'NO ✅'}`);
```
**預期**: `Overflow: NO ✅`

#### 2. Hero、Pills、第一屏卡片的左右 padding 一致
- [ ] Hero padding 與 section padding 一致（1rem / 1.5rem / 2rem）
- [ ] Pills container 左右 padding 正確（不重複）
- [ ] 第一屏卡片 padding 與 section 一致
- [ ] 視覺上置中自然，沒有偏移感

#### 3. Pills 可換行、不擠、不偏、不被裁切
- [ ] Pills 保持居中對齊（`justify-center`）
- [ ] Pills 可以正常換行（`flex-wrap`）
- [ ] 沒有被裁切或擠壓
- [ ] 排列整齊，沒有視覺偏移

#### 4. AI Widget 不遮擋任何重要內容
- [ ] 底部有足夠的 padding（`calc(5rem + env(safe-area-inset-bottom, 0))`）
- [ ] 最後一個 CTA/連結完全可見
- [ ] 包含 safe-area 的處理

#### 5. 其他頁面不受影響
- [ ] About 頁面正常（抽查）
- [ ] 流程頁面正常（抽查）
- [ ] 其他頁面的 main padding 不受影響

---

## 📝 修改摘要

### 修改的檔案

1. **`src/index.njk`**
   - Line 13: 添加 `home-hero` class 到 Hero section

2. **`src/assets/css/main.css`**
   - Line 2138-2221: 重寫 `.page-home` 相關規則
   - 合併所有 `.page-home main` 規則
   - 移除 `!important`
   - 移除 `flex-start` 對齊
   - 移除 brittle selector

### 新增的規則

- `.page-home .home-hero` - Hero section 明確 class

### 刪除的規則

- `.page-home > main > div:first-child` - Brittle selector
- `justify-content: flex-start !important` - 造成偏移感
- `padding-left: 0 !important; padding-right: 0 !important;` - 不需要 `!important`
- Desktop 的 `justify-content: center` 覆寫 - 不必要

---

## ✅ 驗證方法

### 1. Console 檢查水平溢出
```javascript
// 在首頁執行
document.body.scrollWidth === document.body.clientWidth
// 預期: true
```

### 2. 視覺檢查
- 開啟 DevTools，模擬 375×812
- 檢查 Hero、Pills、第一屏卡片的 padding 是否一致
- 檢查 Pills 是否居中，沒有偏移感
- 滾動到底部，檢查 AI Widget 是否遮擋內容

### 3. 其他頁面抽查
- 訪問 `/about/` 頁面
- 確認 main padding 正常（不受 `.page-home` 規則影響）

---

**修復完成時間**: 2025-01-XX
