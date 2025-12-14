# 元件 Variant 系統實施計劃

## 📊 當前狀態

### 按鈕 Variant
- ✅ `.btn` 基礎類已定義
- ✅ `.btn-primary` 已定義
- ✅ `.btn-secondary` 已定義
- ✅ `.btn-ghost` 已定義
- ✅ `.btn-sm`, `.btn-md`, `.btn-lg` 尺寸類已添加

### 卡片 Variant
- ✅ `.bento-card` 基礎類已定義
- ⚠️ 需要定義標準化的 variant 類

## 🎯 實施步驟

### 1. 按鈕標準化

**需要替換的模式**：
- `px-8 py-4 rounded-full` → `.btn .btn-secondary .btn-lg` 或 `.btn .btn-primary .btn-lg`
- `px-4 py-2 rounded-full` → `.btn .btn-secondary .btn-sm` 或 `.btn .btn-primary .btn-sm`
- `hover:bg-sand-50 px-8 py-4 rounded-full` → `.btn .btn-secondary .btn-lg`
- `bg-white text-slate-900 px-8 py-4 rounded-full` → `.btn .btn-secondary .btn-lg`

**判斷邏輯**：
- 如果包含 `bg-trust-950` 或 `bg-slate-900` → `.btn-primary`
- 如果包含 `bg-white` 或 `bg-transparent` → `.btn-secondary`
- 如果包含 `px-8 py-4` → `.btn-lg`
- 如果包含 `px-4 py-2` → `.btn-sm`
- 默認 → `.btn-md`

### 2. 卡片 Variant 定義

**建議的 Variant**：
- `.bento-card-default` - 標準卡片（白色背景，sand-200 邊框）
- `.bento-card-elevated` - 提升卡片（陰影更明顯）
- `.bento-card-bordered` - 強調邊框（trust-900 邊框）
- `.bento-card-sand` - 沙色背景（sand-50 背景）

**需要替換的模式**：
- `bento-card bg-white border-sand-200 rounded-2xl shadow-sm` → `.bento-card .bento-card-default`
- `bento-card bg-sand-50 rounded-2xl` → `.bento-card .bento-card-sand`
- `bento-card bg-white border-slate-200 rounded-2xl shadow-sm` → `.bento-card .bento-card-default`

## 📝 實施建議

1. **逐步遷移**：先處理最常見的組合，然後處理邊緣情況
2. **保持向後兼容**：保留舊的類名組合，但標記為 deprecated
3. **文檔化**：更新設計系統文檔，說明如何使用 variant 系統

## ✅ 驗證清單

- [ ] 所有按鈕使用 `.btn` 基礎類
- [ ] 所有按鈕使用 variant 類（`.btn-primary`, `.btn-secondary`, `.btn-ghost`）
- [ ] 所有按鈕使用尺寸類（`.btn-sm`, `.btn-md`, `.btn-lg`）
- [ ] 所有卡片使用 `.bento-card` 基礎類
- [ ] 所有卡片使用 variant 類（如果適用）
- [ ] 移除重複的樣式定義

---

**創建日期**: 2025-12-14

