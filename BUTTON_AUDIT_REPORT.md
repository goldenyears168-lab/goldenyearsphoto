# 按鈕系統一致性審計報告
## 職人鈕扣系統 (The Artisan Button System) 改善計畫

**審計日期**: 2025-01-XX  
**審計範圍**: 全站按鈕元件與互動元素  
**審計目標**: 建立統一的按鈕系統，提升使用者體驗與視覺一致性

---

## 一、現況分析

### 1.1 現有按鈕樣式盤點

#### ✅ 已有定義的類別
- `.button`, `.btn` (基礎類別)
- `.button-primary`, `.btn--primary` (主按鈕)
- `.button-secondary`, `.btn--secondary` (次按鈕)
- `.btn--lg` (大尺寸)
- `.category-pill` (作品分類篩選按鈕)
- `.filter-btn-base`, `.filter-btn-bg` (篩選按鈕)

#### ⚠️ 發現的問題

**問題 1: 類別命名不一致**
- 混用 `btn-primary` 與 `btn--primary` (BEM 格式)
- 混用 `button-primary` 與 `btn-primary`
- 影響：開發者無法快速判斷應使用哪個類別

**問題 2: 內聯樣式過多**
```84:87:src/price-list.njk
                    <a href="/booking/" class="w-full md:w-auto py-3 px-6 bg-trust-950 text-white rounded-lg text-sm font-bold hover:bg-trust-800 transition-all shadow-sm flex items-center justify-center gap-2">
                        <span>預約時段</span>
                        <span class="text-slate-400">→</span>
                    </a>
```
- `price-list.njk` 使用 Tailwind 內聯樣式而非類別
- 圓角使用 `rounded-lg` 而非 `rounded-full` (pill shape)
- 與設計系統的 "全圓角" 理念不符

**問題 3: 未定義但已使用的類別**
```29:29:src/guide/identity-test.njk
      <button id="start-btn" class="btn-primary" type="button">{{ data.hero.cta }}</button>
```
```172:172:src/guide/identity-test.njk
      <button id="restart-btn" class="btn-text">重新開始測驗</button>
```
- `btn-text` 在 `identity-test.njk` 中使用，但 CSS 中未定義
- 可能導致樣式失效或不一致

**問題 4: 缺少變體**
- 缺少 Ghost/Link 按鈕（純文字樣式，適合低干擾導航）
- 缺少 Tag/Badge 按鈕（標籤/過濾器樣式）
- 缺少統一的尺寸系統（sm, md, lg）

**問題 5: 導航按鈕樣式不統一**
```126:128:src/_includes/partials/navigation.njk
        <a href="/booking/" class="bg-trust-950 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-trust-800 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 transition-colors shrink-0 shadow-md shadow-trust-950/20">
            線上預約
        </a>
```
- 導航欄 CTA 使用內聯樣式
- 應統一使用按鈕類別

**問題 6: 預約頁面缺少明確的按鈕**
```48:74:src/booking/index.njk
        <a href="/booking/zhongshan/" class="bento-card block p-0 bg-white group cursor-pointer">
            <div class="aspect-[4/3] overflow-hidden relative">
                <img 
                    src="{{ 'content/booking/location-1.jpg' | r2img }}" 
                    alt="好時有影 中山店" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy" 
                    decoding="async" 
                />
                <!-- Overlay Badge -->
                <div class="absolute top-4 left-4">
                    <span class="bg-white/90 backdrop-blur text-trust-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        中山區
                    </span>
                </div>
            </div>
            <div class="p-8">
                <h3 class="text-2xl md:text-3xl font-bold text-trust-950 mb-3 group-hover:text-trust-800 transition-colors">中山店</h3>
                <p class="text-base text-slate-500 mb-6 leading-relaxed">
                    鄰近中山捷運站，交通便利。擁有寬敞的更衣空間與專業化妝台，適合上班族拍攝專業形象照。
                </p>
                <div class="flex items-center gap-2 text-trust-900 font-bold group-hover:gap-3 transition-all">
                    <span>預約中山店</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>
        </a>
```
- 使用卡片連結，但缺少明確的按鈕樣式
- 可以考慮在卡片內添加明確的按鈕元素

---

## 二、職人鈕扣系統設計規範

### 2.1 設計哲學

1. **層級分明**: 讓使用者一眼就知道「哪裡該點」，哪裡是「次要選項」
2. **觸感回饋**: 模仿實體按鈕或高級紙張的微互動，懸停時會有細微的上浮或光影變化
3. **統一語彙**: 全面採用 **全圓角 (Pill Shape)**，呼應「圓滿」、「光圈」的攝影意象

### 2.2 類別命名規範

採用簡潔的 BEM-like 命名（但去掉 BEM 的複雜性）：
- 基礎類別: `.btn`
- 修飾符使用單破折號（非雙破折號）: `.btn-primary`, `.btn-secondary`
- 尺寸修飾符: `.btn-sm`, `.btn-md`, `.btn-lg`

### 2.3 按鈕變體定義

#### 變體 1: Primary (黑曜石實心)
- **用途**: 最重要的轉換行動（預約、購買、提交）
- **樣式**: 
  - 背景: `trust-950` (#020617)
  - 文字: 白色
  - Hover: `trust-800` (#1E3A8A) + 上浮效果

#### 變體 2: Secondary (框線風格)
- **用途**: 次要選項（查看更多、雙按鈕的第二個）
- **樣式**:
  - 背景: 透明
  - 邊框: `sand-300` (#D6CCC2)
  - Hover: 邊框變 `trust-950` + 背景變白色

#### 變體 3: Ghost/Link (純文字)
- **用途**: 低干擾的導航、取消、跳過
- **樣式**:
  - 背景: 透明
  - 文字: `slate-500` (#64748B)
  - Hover: 文字變 `trust-950` + 微背景

#### 變體 4: Tag/Badge (標籤)
- **用途**: 過濾器、標籤（不可點擊或狀態指示）
- **樣式**:
  - 背景: 白色
  - 邊框: `sand-200` (#E2DCD3)
  - Active: 背景 `trust-950` + 白色文字

### 2.4 尺寸系統

- **`.btn-sm`**: 導航、次要功能
  - Padding: `0.5rem 1rem` (8px 16px)
  - Font-size: `0.75rem` (12px)
  
- **`.btn-md`**: 一般操作（預設）
  - Padding: `0.75rem 1.5rem` (12px 24px)
  - Font-size: `0.875rem` (14px)
  
- **`.btn-lg`**: Hero Call-to-Action
  - Padding: `1rem 2.5rem` (16px 40px)
  - Font-size: `1rem` (16px)

### 2.5 互動效果

- **Hover**: 
  - Primary: `translateY(-2px)` + 陰影增強
  - Secondary: `translateY(-1px)` + 邊框變色
  - Ghost: 文字顏色變化 + 微背景
- **Active**: `translateY(0)` (按下時恢復)
- **Transition**: `cubic-bezier(0.4, 0, 0.2, 1)` (平滑的緩動)

---

## 三、改善計畫

### 階段一：CSS 系統建立（優先級：高）

#### 任務 1.1: 統一並擴充按鈕 CSS
**檔案**: `src/assets/css/main.css`

**動作**:
1. 保留現有的 `.button`, `.btn` 基礎類別
2. 統一命名為 `.btn-primary`, `.btn-secondary`（移除 `.button-primary`, `.btn--primary` 等變體）
3. 新增 `.btn-ghost` (Ghost/Link 樣式)
4. 新增 `.btn-tag` (Tag/Badge 樣式)
5. 統一尺寸系統: `.btn-sm`, `.btn-md`, `.btn-lg`
6. 確保所有按鈕使用 `border-radius: 9999px` (全圓角)

**預期成果**:
- 完整的按鈕系統定義
- 符合職人鈕扣系統設計規範
- 向後相容（保留舊類別但標記為 deprecated）

#### 任務 1.2: 定義 `btn-text` 類別
**檔案**: `src/assets/css/main.css`

**動作**:
- 將 `btn-text` 映射到 `.btn-ghost`，或定義為 `.btn-text` 的別名
- 確保 `identity-test.njk` 中的使用正常運作

### 階段二：頁面按鈕標準化（優先級：高）

#### 任務 2.1: 價目表頁面 (`price-list.njk`)
**檔案**: `src/price-list.njk`

**目前問題**:
- 使用內聯 Tailwind 樣式
- 圓角使用 `rounded-lg` 而非 `rounded-full`

**改善動作**:
```diff
- <a href="/booking/" class="w-full md:w-auto py-3 px-6 bg-trust-950 text-white rounded-lg text-sm font-bold hover:bg-trust-800 transition-all shadow-sm flex items-center justify-center gap-2">
+ <a href="/booking/" class="btn btn-primary btn-md w-full md:w-auto flex items-center gap-2">
```

#### 任務 2.2: 導航欄 (`navigation.njk`)
**檔案**: `src/_includes/partials/navigation.njk`

**目前問題**:
- CTA 按鈕使用內聯樣式

**改善動作**:
```diff
- <a href="/booking/" class="bg-trust-950 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-trust-800 ...">
+ <a href="/booking/" class="btn btn-primary btn-sm">
```

#### 任務 2.3: 身份測驗頁面 (`identity-test.njk`)
**檔案**: `src/guide/identity-test.njk`

**目前問題**:
- `btn-text` 未定義

**改善動作**:
- 確認 `btn-text` 已定義（或替換為 `btn-ghost`）

### 階段三：增強與優化（優先級：中）

#### 任務 3.1: 預約頁面按鈕優化
**檔案**: `src/booking/index.njk`

**建議**:
- 考慮在分店卡片內添加明確的按鈕元素（使用 `.btn-secondary`）
- 保持卡片連結功能，但視覺上更明確

#### 任務 3.2: 作品分類篩選按鈕
**檔案**: `src/index.njk`

**目前狀況**:
- 使用 `.category-pill` 類別，樣式已定義
- 建議: 考慮遷移到 `.btn-tag` 以統一系統

**評估**:
- `.category-pill` 功能完整，可保留
- 或將 `.category-pill` 作為 `.btn-tag` 的別名

#### 任務 3.3: 關於我們頁面
**檔案**: `src/about.njk`

**目前狀況**:
- 沒有明確的 CTA 按鈕
- 建議: 可考慮添加「預約拍攝」或「查看作品」按鈕

### 階段四：文檔與規範（優先級：低）

#### 任務 4.1: 建立按鈕使用指南
**檔案**: `BUTTON_SYSTEM_GUIDE.md`（新建，可選）

**內容**:
- 按鈕變體的選擇指南
- 尺寸選擇建議
- 互動狀態說明
- 可訪問性最佳實踐

---

## 四、實作建議

### 4.1 CSS 實作範例

```css
/* 基礎按鈕設定 */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-bold);
    border-radius: 9999px; /* Pill Shape */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    letter-spacing: 0.02em;
    text-decoration: none;
    border: none;
    outline: none;
}

/* 尺寸變體 */
.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
}

.btn-md {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
}

.btn-lg {
    padding: 1rem 2.5rem;
    font-size: 1rem;
}

/* Primary - 黑曜石實心 */
.btn-primary {
    background-color: var(--color-trust-950);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(2, 6, 23, 0.1), 0 2px 4px -1px rgba(2, 6, 23, 0.06);
}

.btn-primary:hover {
    background-color: var(--color-trust-800);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(2, 6, 23, 0.2);
}

.btn-primary:active {
    transform: translateY(0);
}

/* Secondary - 框線風格 */
.btn-secondary {
    background-color: transparent;
    border: 1px solid var(--color-sand-300);
    color: var(--color-trust-900);
}

.btn-secondary:hover {
    border-color: var(--color-trust-950);
    background-color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Ghost/Link - 純文字 */
.btn-ghost,
.btn-text { /* 向後相容 */
    background-color: transparent;
    color: var(--color-neutral-400); /* slate-500 */
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.btn-ghost:hover,
.btn-text:hover {
    color: var(--color-trust-950);
    background-color: rgba(0, 0, 0, 0.02);
}

/* Tag/Badge - 標籤 */
.btn-tag {
    background-color: white;
    border: 1px solid var(--color-sand-200);
    color: var(--color-neutral-400);
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.btn-tag.active {
    background-color: var(--color-trust-950);
    color: white;
    border-color: var(--color-trust-950);
}

/* Focus 狀態 (可訪問性) */
.btn:focus-visible {
    outline: 3px solid var(--color-trust-500);
    outline-offset: 3px;
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
    .btn {
        transition: box-shadow 160ms ease-out, border-color 160ms ease-out;
    }
    .btn:hover {
        transform: none;
    }
}
```

### 4.2 遷移檢查清單

- [ ] 更新 `main.css` 按鈕系統
- [ ] 替換 `price-list.njk` 內聯樣式
- [ ] 替換 `navigation.njk` 導航按鈕
- [ ] 確認 `identity-test.njk` 的 `btn-text` 正常運作
- [ ] 檢查所有頁面的按鈕使用情況
- [ ] 測試所有互動狀態（hover, active, focus）
- [ ] 確認可訪問性（鍵盤導航、螢幕閱讀器）
- [ ] 跨瀏覽器測試

---

## 五、其他審計發現與建議

### 5.1 一致性建議

1. **圓角統一**: 全站按鈕應使用 `border-radius: 9999px` (pill shape)
2. **陰影系統**: 統一使用設計系統的陰影變數
3. **顏色系統**: 統一使用 CSS 變數（如 `var(--color-trust-950)`）

### 5.2 可訪問性建議

1. **Focus 狀態**: 所有按鈕都應有清晰的 focus 指示器
2. **ARIA 標籤**: 圖示按鈕應包含 `aria-label`
3. **鍵盤導航**: 確保所有按鈕可透過鍵盤操作

### 5.3 性能建議

1. **CSS 優化**: 使用 `transform` 而非 `top/left` 實現動畫（GPU 加速）
2. **減少重繪**: 使用 `will-change` 屬性優化動畫性能
3. **漸進增強**: 支援 `prefers-reduced-motion` 媒體查詢

---

## 六、預期效益

1. **視覺一致性**: 全站按鈕樣式統一，提升品牌識別度
2. **開發效率**: 統一的類別系統減少重複開發
3. **維護性**: 集中管理樣式，易於更新與維護
4. **使用者體驗**: 清晰的視覺層級與互動回饋
5. **可訪問性**: 符合 WCAG 標準，支援所有使用者

---

## 附錄：參考資料

- 設計系統顏色變數: `src/assets/css/main.css` (lines 6-72)
- 現有按鈕樣式: `src/assets/css/main.css` (lines 604-803)
- 職人鈕扣系統範例: 用戶提供的 HTML 範例

