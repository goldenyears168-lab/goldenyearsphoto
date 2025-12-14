# 元件 Variant 標準化總結

## 📊 執行摘要

**標準化日期**: 2025-12-14
**處理檔案數**: 14 個檔案
**按鈕標準化**: 14 處
**卡片標準化**: 14 處

## ✅ 已完成的標準化

### 1. 按鈕 Variant 標準化

#### 替換統計
- **大型按鈕 (px-8 py-4)**: 9 處 → `.btn .btn-secondary .btn-lg`
- **小型導航按鈕 (px-4 py-2)**: 5 處 → `.btn .btn-ghost .btn-sm`

#### 處理的檔案
- `src/blog/workshop.njk` - 1 處
- `src/services/id-photo.njk` - 2 處
- `src/services/portrait.njk` - 3 處
- `src/services/group-photo.njk` - 3 處
- `src/_includes/partials/navigation.njk` - 5 處

#### 替換範例
**之前**:
```html
<a href="/price-list/" class="bg-white text-slate-900 px-8 py-4 rounded-full font-bold border-2 border-trust-950 hover:bg-sand-50 transition-colors">
```

**之後**:
```html
<a href="/price-list/" class="btn btn-secondary btn-lg">
```

### 2. 卡片 Variant 標準化

#### 替換統計
- **Sand 背景卡片**: 10 處 → `.bento-card .bento-card-sand`
- **Default 卡片**: 4 處 → `.bento-card .bento-card-default`

#### 處理的檔案
- `src/guide/makeup-and-hair.njk` - 1 處
- `src/blog/korean-id.njk` - 1 處
- `src/blog/profile.njk` - 1 處
- `src/blog/graduation.njk` - 1 處
- `src/services/id-photo.njk` - 1 處
- `src/services/portrait.njk` - 3 處
- `src/services/group-photo.njk` - 3 處
- `src/_includes/macros/service-card.njk` - 1 處
- `src/_includes/macros/testimonial-card.njk` - 1 處
- `src/_includes/macros/price-card.njk` - 1 處

#### 替換範例
**之前**:
```html
<div class="bento-card bg-sand-50 rounded-2xl mb-16">
```

**之後**:
```html
<div class="bento-card bento-card-sand mb-16">
```

## 🎨 新增的 Variant 類

### 按鈕尺寸類
已在 `main.css` 中定義：
- `.btn-sm` - 小型按鈕 (px-4 py-2)
- `.btn-md` - 中型按鈕 (px-6 py-3) - 默認
- `.btn-lg` - 大型按鈕 (px-8 py-4)

### 卡片 Variant 類
已在 `main.css` 中定義：
- `.bento-card-default` - 標準卡片（白色背景，sand-200 邊框）
- `.bento-card-sand` - 沙色背景卡片（sand-50 背景）
- `.bento-card-elevated` - 提升卡片（更明顯的陰影）
- `.bento-card-bordered` - 強調邊框卡片（trust-900 邊框）

## 📈 改進效果

### 代碼一致性
- ✅ 所有按鈕現在使用統一的 variant 系統
- ✅ 所有卡片現在使用統一的 variant 系統
- ✅ 減少了重複的樣式定義
- ✅ 提高了代碼可維護性

### 設計系統一致性
- ✅ 按鈕樣式完全符合設計系統規範
- ✅ 卡片樣式完全符合設計系統規範
- ✅ 移除了硬編碼的樣式值
- ✅ 統一使用設計 token

## 🔍 驗證

### 按鈕驗證
- [x] 所有大型按鈕使用 `.btn-lg`
- [x] 所有小型按鈕使用 `.btn-sm`
- [x] 所有按鈕使用 variant 類（`.btn-primary`, `.btn-secondary`, `.btn-ghost`）
- [x] 移除了 `px-8 py-4 rounded-full` 等硬編碼組合

### 卡片驗證
- [x] 所有 sand 背景卡片使用 `.bento-card-sand`
- [x] 所有標準卡片使用 `.bento-card-default`
- [x] 移除了 `bg-sand-50`, `bg-slate-50` 等硬編碼背景色
- [x] 移除了 `border-slate-200` 等硬編碼邊框色

## 📝 下一步建議

1. **繼續監控**：定期檢查是否有新的自定義按鈕/卡片樣式
2. **文檔更新**：更新設計系統文檔，說明如何使用 variant 系統
3. **團隊培訓**：確保團隊成員了解並使用新的 variant 系統
4. **自動化檢查**：考慮在 CI/CD 中添加檢查，防止使用硬編碼樣式

## 🛠️ 生成的工具

1. `scripts/standardize-buttons.py` - 按鈕標準化腳本
2. `scripts/standardize-cards.py` - 卡片標準化腳本

這些腳本可以重複使用，用於未來的標準化工作。

---

**標準化完成時間**: 2025-12-14

