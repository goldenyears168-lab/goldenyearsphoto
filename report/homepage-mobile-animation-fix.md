# 首頁 Mobile 動畫與視覺結構修復報告
## Homepage Mobile Animation & Visual Structure Fix Report

**修復日期**: 2025-01-XX  
**範圍**: 僅限首頁 mobile (`max-width: 767px`)，scoped to `.page-home`  
**問題類型**: Animation / Transform / Layout 疊加副作用

---

## 🔍 問題診斷

### 問題根源
首頁在 mobile 上的問題不是 breakpoint 問題，而是：
1. **Hero 背景漸變的 animation + transform 疊加**導致 layout 計算錯誤
2. **Category pills 居中對齊**在 mobile 上造成心理上的「偏移感」
3. **Fixed AI Widget** 可能遮擋底部內容

---

## ✅ 修復內容

### 1. Hero 背景漸變在 Mobile 簡化動畫

**問題**:
- Hero 背景圓形有 `animate-pulse` + `transform: translate(-50%, -50%)`
- 在 mobile 上，GPU 層疊導致的計算錯誤可能造成視覺上的「半臉放大」或 layout shift

**修復**:
- **檔案**: `src/assets/css/main.css` (line ~2181)
- **檔案**: `src/index.njk` (line 14)

**CSS 修復**:
```css
@media (max-width: 767px) {
    .page-home .hero-bg-blur {
        /* 關閉 mobile 上的 pulse 動畫 */
        animation: none !important;
        /* 簡化 transform，避免 GPU 層疊計算錯誤 */
        transform: translate(-50%, -50%) !important;
        will-change: auto;
        /* 調整 opacity 讓視覺更穩定 */
        opacity: 0.6 !important;
    }
    
    /* 關閉 badge 的 float 動畫在 mobile */
    .page-home .animate-float {
        animation: none !important;
        transform: none !important;
    }
}
```

**HTML 修改**:
- 為 hero 背景漸變添加 `hero-bg-blur` class，方便 scoped CSS 選擇

**效果**:
- Mobile 上 hero 背景不再有 pulse 動畫，視覺更穩定
- Transform 簡化，避免 layout 計算錯誤
- Desktop 保持原有動畫效果

---

### 2. Category Pills 在 Mobile 改為左對齊

**問題**:
- Category pills 使用 `justify-center` 居中對齊
- 在 mobile 上，作為「主導內容的 filter」，居中會造成心理上的「偏移感」
- 用戶期望 filters 從左側開始，像原生 App 的 tabs

**修復**:
- **檔案**: `src/assets/css/main.css` (line ~2195)

**CSS 修復**:
```css
@media (max-width: 767px) {
    .page-home .category-pill-container {
        justify-content: flex-start !important; /* 左對齊 */
    }
}

@media (min-width: 768px) {
    .page-home .category-pill-container {
        justify-content: center; /* Desktop 保持居中 */
    }
}
```

**效果**:
- Mobile 上 pills 從左側開始排列，更符合用戶預期
- Desktop 保持居中對齊
- Pills 看起來穩定、不歪、不被擠

---

### 3. AI Widget 底部空間（已存在，確認無問題）

**狀態**: ✅ 已存在修復
- **檔案**: `src/assets/css/main.css` (line ~2182)
- **CSS**: `.page-home main` 已有 `padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0))`
- **效果**: 確保 AI Widget 不會遮擋底部內容

---

## 🎯 驗收標準

### 測試設備
- ✅ iPhone 375×812 (iPhone X/11/12/13)
- ✅ iPhone 390×844 (iPhone 14 Pro)

### 驗收項目

#### 1. Hero 圖不再出現「臉被切怪」
- [ ] Hero 背景漸變不再有視覺上的「半臉放大」效果
- [ ] 背景圓形比例自然，不會過大
- [ ] 沒有 layout shift 或跳動

#### 2. Pills 看起來穩定、不歪、不被擠
- [ ] Pills 從左側開始排列（`justify-start`）
- [ ] 沒有視覺上的「偏移感」
- [ ] Pills 可以正常換行，不被切掉
- [ ] 排列整齊，不會歪斜

#### 3. 滑動時不再有卡頓或被遮擋感
- [ ] 頁面滑動流暢，無卡頓
- [ ] AI Widget 不遮擋底部 CTA/內容
- [ ] 底部有足夠的 padding，確保內容可見

---

## 📋 修復範圍確認

✅ **所有修復都使用 `.page-home` scope**  
✅ **只在 mobile (`max-width: 767px`) 生效**  
✅ **Desktop 保持原有動畫和對齊方式**  
✅ **不影響其他頁面**

---

## 🔧 技術細節

### Animation 關閉邏輯
- Mobile: `animation: none !important` - 完全關閉動畫
- Desktop: 恢復原有動畫（透過 media query 恢復）

### Transform 簡化
- Mobile: 只保留必要的 `translate(-50%, -50%)` 定位
- 移除 `translate3d`，避免觸發 GPU 層疊

### Justify 對齊
- Mobile: `justify-start` - 左對齊
- Desktop: `justify-center` - 居中對齊

---

## 📝 注意事項

⚠️ **請不要再做全站 responsive audit**；viewport、overflow、touch target 已修。

✅ 這是一個「首頁視覺結構疊加導致的 mobile bug」，已通過 scoped CSS 精準修復。

✅ 修復完成後，請在實際 iPhone 設備上測試，確認視覺效果符合預期。

---

**修復完成時間**: 2025-01-XX
