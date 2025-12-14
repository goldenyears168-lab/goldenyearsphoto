# 職人鈕扣系統使用指南
## The Artisan Button System - Usage Guide

**版本**: 1.0  
**最後更新**: 2025-01-XX  
**適用範圍**: 好時有影 (Golden Years Studio) 網站

---

## 目錄

1. [設計哲學](#設計哲學)
2. [快速開始](#快速開始)
3. [按鈕變體](#按鈕變體)
4. [尺寸系統](#尺寸系統)
5. [互動狀態](#互動狀態)
6. [使用範例](#使用範例)
7. [可訪問性最佳實踐](#可訪問性最佳實踐)
8. [常見問題](#常見問題)

---

## 設計哲學

職人鈕扣系統建立在三個核心原則之上：

### 1. 層級分明
讓使用者一眼就知道「哪裡該點」，哪裡是「次要選項」。透過視覺重量和樣式的差異，建立清晰的資訊架構。

### 2. 觸感回饋
模仿實體按鈕或高級紙張的微互動，懸停時會有細微的上浮或光影變化。這種觸感回饋增強使用者的操作信心。

### 3. 統一語彙
全面採用 **全圓角 (Pill Shape)**，呼應「圓滿」、「光圈」的攝影意象。所有按鈕都使用 `border-radius: 9999px`，創造一致的視覺語言。

---

## 快速開始

### 基礎語法

```html
<!-- 最簡單的按鈕 -->
<button class="btn btn-primary">點擊我</button>
<a href="#" class="btn btn-primary">連結按鈕</a>
```

### 完整結構

```html
<!-- 推薦：使用基礎類別 + 變體類別 -->
<button class="btn btn-primary btn-md">立即預約</button>

<!-- 向後相容：僅使用變體類別（也支援） -->
<button class="btn-primary">立即預約</button>
```

---

## 按鈕變體

職人鈕扣系統提供四種變體，每種都有明確的使用場景。

### Primary（黑曜石實心）

**用途**: 最重要的轉換行動  
**適用場景**: 
- 預約按鈕
- 提交表單
- 購買/結帳
- 主要 Call-to-Action

**樣式特徵**:
- 背景色：`trust-950` (#020617) - 黑曜石色
- Hover 時：變為 `trust-800` (#1E3A8A) - 皇家藍
- 上浮效果：`-2px`
- 陰影增強

**使用範例**:
```html
<a href="/booking/" class="btn btn-primary btn-md">立即預約</a>
<button type="submit" class="btn btn-primary btn-lg">提交表單</button>
```

---

### Secondary（框線風格）

**用途**: 次要選項  
**適用場景**:
- 雙按鈕組合中的第二個
- 查看更多
- 取消操作
- 次要操作

**樣式特徵**:
- 背景：透明
- 邊框：`sand-300` (#D6CCC2)
- Hover 時：邊框變 `trust-950`，背景變白色
- 上浮效果：`-1px`

**使用範例**:
```html
<div class="flex gap-4">
    <a href="/booking/" class="btn btn-primary btn-md">立即預約</a>
    <a href="/about/" class="btn btn-secondary btn-md">了解更多</a>
</div>
```

---

### Ghost/Link（純文字）

**用途**: 低干擾的導航  
**適用場景**:
- 取消操作
- 跳過選項
- 外部連結（如 Instagram）
- 輔助性操作

**樣式特徵**:
- 背景：透明
- 文字顏色：`slate-500` (#64748B)
- Hover 時：文字變 `trust-950` + 微背景
- 支援箭頭動畫

**使用範例**:
```html
<!-- 純文字按鈕 -->
<button class="btn btn-ghost btn-sm">跳過</button>

<!-- 帶箭頭的連結 -->
<a href="https://instagram.com/goldenyears_studio" 
   target="_blank" 
   class="btn btn-ghost btn-md">
    查看 Instagram 
    <span class="arrow">→</span>
</a>
```

**注意**: `.btn-text` 是 `.btn-ghost` 的別名，兩者功能相同，可互換使用。

---

### Tag/Badge（標籤）

**用途**: 過濾器、標籤、狀態指示  
**適用場景**:
- 作品分類篩選
- 標籤顯示
- 狀態標記
- 過濾選項

**樣式特徵**:
- 背景：白色
- 邊框：`sand-200` (#E2DCD3)
- 字體：uppercase，較小尺寸
- Active 狀態：背景變 `trust-950`，文字變白色

**使用範例**:
```html
<!-- 篩選按鈕 -->
<button class="btn btn-tag">全部</button>
<button class="btn btn-tag active">韓式證件照</button>

<!-- 狀態標籤 -->
<span class="btn btn-tag">NEW</span>
<span class="btn btn-tag active">BEST SELLER</span>
```

---

## 尺寸系統

系統提供三種尺寸，對應不同的使用場景。

### Small (`.btn-sm`)

**尺寸**: 8px 16px padding, 12px 字體  
**適用場景**:
- 導航欄按鈕
- 表格中的操作按鈕
- 標籤旁邊的小按鈕
- 空間受限的情況

**使用範例**:
```html
<nav>
    <a href="/booking/" class="btn btn-primary btn-sm">預約</a>
</nav>
```

---

### Medium (`.btn-md`)

**尺寸**: 12px 24px padding, 14px 字體  
**適用場景**:
- 一般操作按鈕（預設尺寸）
- 表單提交按鈕
- 卡片中的 CTA
- 大部分使用場景

**使用範例**:
```html
<!-- 如果不指定尺寸，預設為 btn-md -->
<button class="btn btn-primary">預設尺寸</button>
<button class="btn btn-primary btn-md">明確指定</button>
```

---

### Large (`.btn-lg`)

**尺寸**: 16px 40px padding, 16px 字體  
**適用場景**:
- Hero section 的主要 CTA
- 重要的轉換行動
- 需要強調的按鈕
- 行動優先的設計

**使用範例**:
```html
<section class="hero">
    <a href="/booking/" class="btn btn-primary btn-lg">立即開始</a>
</section>
```

---

## 互動狀態

### 正常狀態 (Normal)

按鈕在未互動時的預設樣式。確保顏色對比符合 WCAG AA 標準。

### 懸停狀態 (Hover)

**Primary**:
- 背景色變化：`trust-950` → `trust-800`
- 上浮：`translateY(-2px)`
- 陰影增強

**Secondary**:
- 邊框顏色變化：`sand-300` → `trust-950`
- 背景變白色
- 上浮：`translateY(-1px)`

**Ghost**:
- 文字顏色變化：`slate-500` → `trust-950`
- 微背景出現
- 箭頭向右移動（如果有 `.arrow` 元素）

**Tag**:
- 邊框顏色加深
- 背景變淺灰色

### 按下狀態 (Active)

所有按鈕按下時會恢復到原始位置（`translateY(0)`），提供觸覺回饋。

```html
<!-- Active 狀態由 CSS 自動處理 -->
<button class="btn btn-primary">按下我</button>
```

### 禁用狀態 (Disabled)

使用 HTML 的 `disabled` 屬性：

```html
<button class="btn btn-primary" disabled>已禁用</button>
<a href="#" class="btn btn-primary" aria-disabled="true">禁用連結</a>
```

**視覺效果**:
- Opacity: 0.5
- Cursor: not-allowed
- 無 hover 效果

### Focus 狀態 (可訪問性)

所有按鈕都有清晰的 focus 指示器（3px 藍色 outline），確保鍵盤導航的可見性。

**自訂 focus 樣式**（不推薦，除非有特殊需求）:
```css
.btn-primary:focus-visible {
    outline: 3px solid var(--color-trust-500);
    outline-offset: 3px;
}
```

---

## 使用範例

### 範例 1: Hero Section CTA

```html
<section class="hero">
    <h1>歡迎來到好時有影</h1>
    <p>為您定格職涯最自信的瞬間</p>
    <div class="flex gap-4 justify-center mt-8">
        <a href="/booking/" class="btn btn-primary btn-lg">
            立即預約
        </a>
        <a href="/about/" class="btn btn-secondary btn-lg">
            了解更多
        </a>
    </div>
</section>
```

### 範例 2: 表單提交

```html
<form>
    <input type="text" placeholder="姓名" />
    <input type="email" placeholder="Email" />
    <div class="flex gap-4 mt-6">
        <button type="submit" class="btn btn-primary btn-md">
            提交
        </button>
        <button type="button" class="btn btn-ghost btn-md">
            取消
        </button>
    </div>
</form>
```

### 範例 3: 卡片中的操作

```html
<div class="card">
    <h3>韓式證件照</h3>
    <p>專業修圖與現場校稿</p>
    <a href="/booking/" class="btn btn-primary btn-md w-full md:w-auto">
        預約時段
        <span class="arrow">→</span>
    </a>
</div>
```

### 範例 4: 篩選器

```html
<div class="filter-group">
    <button class="btn btn-tag active">全部</button>
    <button class="btn btn-tag">韓式證件照</button>
    <button class="btn btn-tag">專業形象照</button>
    <button class="btn btn-tag">畢業照</button>
</div>
```

### 範例 5: 導航欄 CTA

```html
<nav>
    <a href="/">首頁</a>
    <a href="/services/">服務</a>
    <a href="/booking/" class="btn btn-primary btn-sm">
        線上預約
    </a>
</nav>
```

### 範例 6: 外部連結組

```html
<div class="flex gap-4">
    <a href="/booking/" class="btn btn-secondary btn-md">
        預約拍攝
    </a>
    <a href="https://instagram.com/goldenyears_studio" 
       target="_blank" 
       rel="noopener noreferrer"
       class="btn btn-ghost btn-md">
        查看 Instagram
        <span class="arrow">→</span>
    </a>
</div>
```

---

## 可訪問性最佳實踐

### 1. 語義化 HTML

**✅ 正確**:
```html
<button type="button" class="btn btn-primary">點擊我</button>
<a href="/booking/" class="btn btn-primary">預約</a>
```

**❌ 錯誤**:
```html
<div class="btn btn-primary" onclick="...">點擊我</div>
<span class="btn btn-primary">預約</span>
```

### 2. 提供清晰的標籤

按鈕文字應該清晰描述操作結果，避免使用「點擊這裡」等模糊文字。

**✅ 正確**:
```html
<button class="btn btn-primary">立即預約拍攝</button>
```

**❌ 錯誤**:
```html
<button class="btn btn-primary">點擊這裡</button>
```

### 3. 鍵盤導航支援

所有按鈕都應該可以透過鍵盤（Tab 鍵）訪問，並有清晰的 focus 指示器。

```html
<!-- 系統已內建 focus 樣式，無需額外處理 -->
<button class="btn btn-primary">可鍵盤導航</button>
```

### 4. 禁用狀態的處理

對於連結按鈕，使用 `aria-disabled` 屬性：

```html
<a href="#" 
   class="btn btn-primary" 
   aria-disabled="true"
   onclick="return false;">
    禁用連結
</a>
```

### 5. 圖示按鈕的標籤

如果按鈕只有圖示沒有文字，必須提供 `aria-label`：

```html
<button class="btn btn-ghost btn-sm" aria-label="關閉">
    <svg>...</svg>
</button>
```

### 6. 載入狀態

對於異步操作，提供載入狀態的反饋：

```html
<button class="btn btn-primary" disabled>
    <span class="spinner"></span>
    提交中...
</button>
```

### 7. 減少動畫偏好

系統已內建 `prefers-reduced-motion` 支援，當使用者偏好減少動畫時，會自動移除 transform 動畫。

```css
/* 已內建，無需額外處理 */
@media (prefers-reduced-motion: reduce) {
    .btn {
        transition: /* 僅保留必要的過渡 */
    }
    .btn:hover {
        transform: none; /* 移除上浮效果 */
    }
}
```

---

## 常見問題

### Q1: 應該使用 `.btn` 基礎類別嗎？

**A**: 推薦使用，但非必需。系統已支援僅使用變體類別（如 `.btn-primary`）以保持向後相容性。

```html
<!-- 推薦 -->
<button class="btn btn-primary btn-md">推薦寫法</button>

<!-- 也可用（向後相容） -->
<button class="btn-primary">也可用</button>
```

### Q2: 如何自訂按鈕顏色？

**A**: 不建議直接修改按鈕顏色，應該使用設計系統中定義的變體。如果確有特殊需求，建議：

1. 使用設計系統的顏色變數
2. 創建新的變體類別（而非修改現有變體）
3. 與設計團隊討論是否應納入設計系統

### Q3: 按鈕可以包含圖示嗎？

**A**: 可以。使用 flexbox 布局，圖示和文字會自動對齊：

```html
<a href="/booking/" class="btn btn-primary btn-md">
    <svg class="w-5 h-5">...</svg>
    <span>預約</span>
</a>
```

### Q4: 如何處理響應式設計？

**A**: 按鈕系統支援響應式，可以結合 Tailwind 的工具類別：

```html
<!-- 全寬在小螢幕，自動寬度在大螢幕 -->
<a href="/booking/" class="btn btn-primary btn-md w-full md:w-auto">
    預約
</a>
```

### Q5: 可以組合多個變體嗎？

**A**: 不可以。每個按鈕應該只使用一個變體類別（primary、secondary、ghost 或 tag）。

```html
<!-- ❌ 錯誤 -->
<button class="btn btn-primary btn-secondary">不要這樣做</button>

<!-- ✅ 正確 -->
<button class="btn btn-primary">正確</button>
```

### Q6: 連結按鈕和按鈕元素有什麼區別？

**A**: 
- `<button>`: 用於表單提交和 JavaScript 操作
- `<a>`: 用於導航到其他頁面

```html
<!-- 導航使用 <a> -->
<a href="/booking/" class="btn btn-primary">預約</a>

<!-- 表單提交使用 <button> -->
<button type="submit" class="btn btn-primary">提交</button>

<!-- JavaScript 操作使用 <button> -->
<button type="button" class="btn btn-primary" onclick="...">點擊</button>
```

### Q7: Tag 按鈕的 active 狀態如何控制？

**A**: 使用 JavaScript 動態添加 `.active` 類別：

```javascript
// 移除所有 active
document.querySelectorAll('.btn-tag').forEach(btn => {
    btn.classList.remove('active');
});

// 添加 active 到當前按鈕
button.classList.add('active');
```

---

## 設計系統整合

職人鈕扣系統與整體設計系統緊密整合：

### 顏色系統
- Primary: `trust-950` / `trust-800`
- Secondary: `sand-300` / `trust-950`
- Ghost: `slate-500` / `trust-950`
- Tag: `sand-200` / `trust-950`

### 字體系統
- 字體家族: `var(--font-family-base)`
- 字重: `var(--font-weight-bold)`
- 字體大小: 根據尺寸變體

### 間距系統
- 使用 CSS 變數定義的 spacing 值
- Padding 根據尺寸變體調整

### 陰影系統
- 使用設計系統定義的 shadow 變數
- Hover 時陰影增強

---

## 更新日誌

### v1.0 (2025-01-XX)
- 初始版本發布
- 四個變體（Primary, Secondary, Ghost, Tag）
- 三個尺寸（Small, Medium, Large）
- 完整的可訪問性支援
- 向後相容性保證

---

## 相關資源

- [設計系統文檔](./DESIGN_SYSTEM.md)（如果存在）
- [按鈕審計報告](./BUTTON_AUDIT_REPORT.md)
- [代碼倉庫](https://github.com/your-repo/goldenyearsphoto)

---

## 回饋與貢獻

如果您發現使用指南中的問題或有改進建議，請：

1. 建立 Issue
2. 提交 Pull Request
3. 聯繫設計團隊

---

**最後更新**: 2025-01-XX  
**維護者**: 好時有影開發團隊

