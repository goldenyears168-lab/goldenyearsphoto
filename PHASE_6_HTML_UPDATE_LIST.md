# Phase 6: 4-pages 重構 - HTML 更新清單

此文件記錄了 Phase 6 重構後，需要在 Phase 7 更新的 HTML 模板清單。

## 重要說明

Phase 6 只修改了 SCSS，所有視覺效果（燻黑玻璃、流金鑲邊）都會自動從 `.card` base 和 tokens 取得。
HTML 模板的更新將在 Phase 7 進行，以確保 HTML 結構與新的 class 命名規範一致。

---

## 價目表頁（price-list.njk）

### 需要更新的 class 名稱：

1. **舊的 class → 新的 class**
   - `price-service-card` → `card card--service price-page__card`
   - `price-service-card__title` → `card__title`
   - `price-service-card__price` → `card__price`
   - `price-service-card__price-unit` → `card__price-unit`
   - `price-service-card__price-tag` → `card__price-tag`（或保留作為 modifier）
   - `price-service-card__details` → `card__body`
   - `price-makeup-card` → `card card--service price-page__card--makeup`
   - `price-makeup-card__title` → `card__title`
   - `price-makeup-card__gallery` → `card__media price-gallery`

2. **已符合新規範的 class（保留）**
   - `card`（已使用）
   - `card--service`（已使用）
   - `card--split`（已使用）
   - `card__body`（已使用）
   - `card__title`（已使用）
   - `card__price`（已使用）
   - `card__media`（已使用）
   - `price-gallery`（page-specific，保留）
   - `price-gallery__item`（page-specific，保留）
   - `price-gallery__caption`（page-specific，保留）
   - `price-section-title`（page-specific，保留）
   - `price-list`（page-specific，保留）
   - `price-list__item`（page-specific，保留）
   - `price-list--includes`（page-specific modifier，保留）
   - `price-list--upgrades`（page-specific modifier，保留）
   - `price-list--makeup`（page-specific modifier，保留）

3. **需要移除的舊 class**
   - `c-card`（舊命名規範）
   - `c-card--price`（舊命名規範）
   - `c-card--makeup`（舊命名規範）
   - `c-card--split`（舊命名規範）
   - `c-card__body`（舊命名規範）
   - `c-card__title`（舊命名規範）
   - `c-card__price`（舊命名規範）
   - `c-card__price-unit`（舊命名規範）
   - `c-card__price-tag`（舊命名規範）
   - `c-card__media`（舊命名規範）

### 範例更新：

**更新前：**
```njk
<div class="c-card c-card--price c-card--split price-service-card price-service-card--portrait">
  <div class="c-card__body price-service-card__details">
    <h3 class="c-card__title price-service-card__title">個人形象照</h3>
    <p class="c-card__price price-service-card__price">
      優惠 $999 <span class="c-card__price-unit price-service-card__price-unit">/張</span>
    </p>
  </div>
</div>
```

**更新後：**
```njk
<div class="card card--service card--split price-page__card">
  <div class="card__body">
    <h3 class="card__title">個人形象照</h3>
    <p class="card__price">
      優惠 $999 <span class="card__price-unit">/張</span>
    </p>
  </div>
</div>
```

---

## 預約中心頁（booking/index.njk）

### 需要更新的 class 名稱：

1. **舊的 class → 新的 class**
   - `store-card` → `card card--booking booking-hub__card`
   - `store-card-image` → `card__image`
   - `store-card-content` → `card__body`
   - `store-card-title` → `card__title`
   - `store-card-desc` → `card__desc`（或 `card__text`）
   - `store-card-footer` → `card__footer`
   - `cta-button-link` → `button button--primary`（使用 components base）

2. **已符合新規範的 class（保留）**
   - `store-selection-grid`（page-specific layout，保留）
   - `page-booking-hub`（page wrapper，保留）

### 範例更新：

**更新前：**
```njk
<a href="/booking/zhongshan/" class="store-card">
  <div class="store-card-image">
    <img src="..." alt="中山店" />
  </div>
  <div class="store-card-content">
    <h3 class="store-card-title">中山店</h3>
    <p class="store-card-desc">...</p>
  </div>
  <div class="store-card-footer">
    <span class="cta-button-link">立即預約</span>
  </div>
</a>
```

**更新後：**
```njk
<a href="/booking/zhongshan/" class="card card--booking booking-hub__card">
  <div class="card__image">
    <img src="..." alt="中山店" />
  </div>
  <div class="card__body">
    <h3 class="card__title">中山店</h3>
    <p class="card__desc">...</p>
  </div>
  <div class="card__footer">
    <span class="button button--primary">立即預約</span>
  </div>
</a>
```

---

## 其他頁面檢查清單

### FAQ 頁（guide/faq.njk）
- ✅ 已使用 `@layer pages`
- ✅ `.faq-*` 類別為 page-specific 元件，符合規範
- ⚠️ 檢查是否使用正確的 tokens（已在 Phase 6 更新）

### 預約頁（booking/gongguan .njk, booking/zhongshan.njk）
- ✅ 已使用 `@layer pages`
- ⚠️ `.notice-box` 可考慮改為 `.card card--notice`
- ⚠️ 檢查是否使用正確的 tokens（已在 Phase 6 更新）

### 妝髮服務頁（guide/makeup-and-hair.njk）
- ✅ 已使用 `@layer pages`
- ⚠️ `.service-package` 是 page-specific 元件，符合規範
- ⚠️ `.module.page-hero` 可考慮改為 `.section section--hero`（在 Phase 7）
- ⚠️ 檢查是否使用正確的 tokens（已在 Phase 6 更新）

### 畢業照頁（blog/graduation.njk）
- ✅ 已使用 `@layer pages`
- ⚠️ `.page-hero` 可考慮改為 `.section section--hero`（在 Phase 7）
- ⚠️ 檢查是否使用正確的 tokens（已在 Phase 6 更新）

### 首頁（index.njk）
- ✅ 已使用 `@layer pages`
- ⚠️ 檢查是否使用 `.section section--hero` 而非 `.module.page-hero`（在 Phase 7）
- ⚠️ 檢查是否使用 `.card` base（在 Phase 7）

### 其他 blog 頁面（blog/*.njk）
- ✅ 已使用 `@layer pages`
- ⚠️ 檢查是否使用 `.card` base（在 Phase 7）

---

## 全局更新項目

### Section 系統更新

以下 class 需要更新為新的 `.section` 系統：

- `.module` → `.section`
- `.module-dark` / `.module--dark` → `.section section--inverse`
- `.module-gray` → `.section`
- `.module.page-hero` → `.section section--hero`
- `.page-hero` → `.section section--hero`（或保留作為 modifier）

### Layout 系統更新

- `.module` → `.section`（已在 `_l-00-structure.scss` 中提供 deprecated alias）
- `.container` → 保持不變（已符合規範）

---

## Phase 7 執行順序建議

1. **更新價目表頁**（priority: high）
   - 影響最大，使用最多的元件
   - 測試燻黑玻璃效果

2. **更新預約中心頁**（priority: high）
   - 測試卡片連結樣式
   - 測試 hover 效果

3. **更新其他頁面**（priority: medium）
   - 逐步更新 layout 系統（`.module` → `.section`）
   - 測試所有頁面的視覺效果

4. **視覺測試**（priority: high）
   - 確認所有卡片顯示燻黑玻璃效果（或 fallback）
   - 確認所有顏色使用 Dark Luxury Mode 色系
   - 確認響應式正常

---

## 注意事項

1. **向後兼容性**
   - Phase 6 已經建立了 deprecated alias（`.module` → `.section`）
   - 舊的 class 名稱仍然可以工作，但建議更新為新規範

2. **視覺效果**
   - 燻黑玻璃效果會自動從 `.card` base 取得
   - 流金鑲邊會自動從 `.card` base 取得
   - 暖調金棕光陰影會自動從 tokens 取得

3. **Fallback 支援**
   - 已提供 `@supports` fallback（對於不支援 `backdrop-filter` 的瀏覽器）
   - 會自動使用 `.color-surface-card` 作為背景

4. **測試重點**
   - 卡片顯示正常（燻黑玻璃或 fallback）
   - 邊框顯示正常（流金鑲邊）
   - 陰影顯示正常（暖調金棕光）
   - Hover 效果正常（金色微光增強）
   - 響應式正常

---

## 完成檢查清單

### Phase 6 完成項目
- [x] `_p-price-list.scss` 已重構（移除元件 base 定義）
- [x] `_p-booking-hub.scss` 已重構（移除元件 base 定義）
- [x] 所有 4-pages 檔案都使用 `@layer pages`
- [x] 沒有定義新的元件 base（button/card）
- [x] 只保留 page-specific 的 layout 調整
- [x] 所有顏色使用 tokens（沒有裸色碼，除了 print media）
- [x] 沒有語法錯誤
- [x] 構建成功

### Phase 7 待完成項目
- [ ] 更新 `price-list.njk` HTML
- [ ] 更新 `booking/index.njk` HTML
- [ ] 更新其他頁面的 `.module` → `.section`
- [ ] 視覺測試所有頁面
- [ ] 確認所有卡片顯示正常（燻黑玻璃 + 流金鑲邊）
- [ ] 確認所有顏色使用 Dark Luxury Mode 色系
- [ ] 確認響應式正常

---

*此文件由 Phase 6 重構過程自動生成，將在 Phase 7 更新 HTML 時參考使用。*

