# Deprecated Token 清理總結

## 📊 執行摘要

**清理日期**: 2025-12-14
**處理檔案**: `src/assets/css/main.css`
**替換次數**: 45 處

## ✅ 已完成的替換

### 品牌顏色 (Brand Colors)
- `var(--color-brand-primary)` → `var(--color-trust-950)` (11 處)
- `var(--color-brand-accent)` → `var(--color-trust-800)` (4 處)
- `var(--color-brand-cta)` → `var(--color-trust-200)` (8 處)
- `var(--color-brand-cta-hover)` → `var(--color-trust-800)` (3 處)

### 強調顏色 (Accent Colors)
- `var(--color-accent)` → `var(--color-trust-800)` (1 處)
- `var(--color-accent-weak)` → `var(--color-trust-600)` (1 處)
- `var(--color-accent-strong)` → `var(--color-trust-950)` (1 處)

### 中性顏色 (Neutral Colors)
- `var(--color-neutral-50)` → `var(--color-sand-50)` (1 處)
- `var(--color-neutral-100)` → `var(--color-sand-100)` (5 處)
- `var(--color-neutral-200)` → `var(--color-sand-200)` (1 處)
- `var(--color-neutral-300)` → `var(--color-sand-200)` (1 處)
- `var(--color-neutral-900)` → `var(--color-trust-900)` (1 處)
- `var(--color-neutral-950)` → `var(--color-trust-950)` (1 處)

### 表面顏色 (Surface Colors)
- `var(--color-surface)` → `var(--color-white)` (6 處)
- `var(--color-surface-alt)` → `var(--color-sand-100)` (2 處)
- `var(--color-surface-2)` → `var(--color-sand-50)` (2 處)
- `var(--color-surface-3)` → `var(--color-trust-950)` (1 處)
- `var(--color-surface-elevated)` → `var(--color-white)` (1 處)

### 文字顏色 (Text Colors)
- `var(--color-text-main)` → `var(--color-trust-900)` (2 處)
- `var(--color-text-subtle)` → `var(--color-neutral-400)` (4 處)
- `var(--color-text-on-dark)` → `var(--color-trust-50)` (1 處)
- `var(--color-text-on-accent)` → `var(--color-white)` (1 處)
- `var(--color-text-link)` → `var(--color-trust-600)` (1 處)
- `var(--color-text-link-hover)` → `var(--color-trust-800)` (1 處)
- `var(--color-text-dark)` → `var(--color-trust-900)` (2 處)
- `var(--color-text-light)` → `var(--color-trust-50)` (1 處)

### 邊框顏色 (Border Colors)
- `var(--color-border)` → `var(--color-sand-200)` (1 處)
- `var(--color-border-strong)` → `var(--color-sand-300)` (2 處)
- `var(--color-border-subtle)` → `var(--color-sand-100)` (1 處)
- `var(--color-border-dark)` → `var(--color-trust-900)` (1 處)

### 其他顏色
- `var(--color-dark)` → `var(--color-trust-950)` (1 處)
- `var(--color-cta)` → `var(--color-trust-200)` (1 處)
- `var(--color-primary-accent)` → `var(--color-trust-800)` (1 處)
- `var(--color-gray-bg)` → `var(--color-sand-200)` (1 處)
- `var(--color-light-bg)` → `var(--color-sand-50)` (1 處)

## 📝 保留的 Deprecated Token

以下 token 在 CSS 變數定義中保留，作為向後兼容的映射：

- `--color-text`: 保留（映射到 `slate-600`，常用）
- `--color-neutral-400`: 保留（映射到 `slate-500`，常用）
- 所有在 `:root` 中定義的 deprecated token 變數定義（用於向後兼容）

## 🎯 下一步建議

1. **監控使用情況**：定期檢查是否還有代碼使用 deprecated token
2. **逐步移除**：當確認沒有代碼使用後，可以從 `tailwind.config.js` 和 `main.css` 中移除 deprecated token 定義
3. **文檔更新**：更新設計系統文檔，明確標記 deprecated token 不應在新代碼中使用

## ✅ 驗證

所有替換已完成，新的 CSS 變數已在 `:root` 中定義：
- `--color-trust-*` 系列
- `--color-sand-*` 系列
- `--color-white`
- `--color-neutral-400` (slate-500)
- `--color-text` (slate-600)

---

**清理完成時間**: 2025-12-14

