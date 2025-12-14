# 代碼遷移範例

## 📋 遷移指南

本文檔提供將現有 HTML 代碼遷移到使用標準化元件的範例。

---

## 🔘 按鈕遷移範例

### 之前（硬編碼樣式）

```html
<a href="/booking/" class="bg-white text-slate-900 px-8 py-4 rounded-full font-bold border-2 border-trust-950 hover:bg-sand-50 transition-colors shadow-lg">
  預約拍攝
</a>
```

### 之後（使用 Button Macro）

```njk
{% from "macros/button.njk" import button %}
{{ button("預約拍攝", "/booking/", "secondary", "lg") }}
```

**優勢**:
- ✅ 代碼更簡潔（從 1 行 HTML 到 1 行 macro）
- ✅ 統一樣式，符合設計系統
- ✅ 易於維護和更新

---

## 🃏 卡片遷移範例

### 之前（硬編碼樣式）

```html
<div class="bento-card bg-sand-50 rounded-2xl mb-16">
  <h3 class="text-2xl font-bold mb-4">標題</h3>
  <p class="text-slate-600">內容</p>
</div>
```

### 之後（使用 Card Macro）

```njk
{% from "macros/card.njk" import card %}
{{ card("sand", "mb-16", "<h3 class=\"text-2xl font-bold mb-4\">標題</h3><p class=\"text-slate-600\">內容</p>") }}
```

**優勢**:
- ✅ 統一的卡片樣式
- ✅ 易於切換 variant（default, sand, elevated, bordered）
- ✅ 減少重複的類名

---

## 📝 表單遷移範例

### 之前（硬編碼表單）

```html
<form>
  <div class="mb-4">
    <label for="name" class="block text-sm font-medium mb-2">姓名</label>
    <input type="text" id="name" name="name" class="w-full px-4 py-3 border border-sand-200 rounded-lg" required>
  </div>
  
  <div class="mb-4">
    <label for="email" class="block text-sm font-medium mb-2">電子郵件</label>
    <input type="email" id="email" name="email" class="w-full px-4 py-3 border border-sand-200 rounded-lg" required>
  </div>
  
  <button type="submit" class="bg-trust-950 text-white px-8 py-4 rounded-full font-bold">
    提交
  </button>
</form>
```

### 之後（使用表單 Macros）

```njk
{% from "macros/input.njk" import input %}
{% from "macros/button.njk" import button %}
{% from "macros/form-group.njk" import formGroup %}

<form>
  {% set nameInput = input("name", "user-name", "姓名", "請輸入您的姓名", "", true) %}
  {% set emailInput = input("email", "user-email", "電子郵件", "example@email.com", "", true) %}
  {{ formGroup("個人資訊", false, "", "", "", nameInput | safe + emailInput | safe) }}
  
  {{ button("提交", "", "primary", "lg", "", "submit") }}
</form>
```

**優勢**:
- ✅ 統一的表單樣式
- ✅ 內建驗證和錯誤處理
- ✅ 更好的可訪問性支持

---

## 🎯 遷移步驟

### 1. 識別遷移目標

使用遷移建議報告 (`MIGRATION_SUGGESTIONS.md`) 識別需要遷移的代碼。

### 2. 導入需要的 Macros

在文件頂部導入需要的 macro：

```njk
{% from "macros/button.njk" import button %}
{% from "macros/card.njk" import card %}
```

### 3. 逐步替換

一次替換一個元件，確保：
- 功能正常
- 樣式一致
- 沒有破壞性變更

### 4. 測試驗證

- 檢查頁面顯示
- 測試互動功能
- 驗證響應式設計

### 5. 提交更改

提交前確保：
- 所有測試通過
- 代碼符合規範
- 文檔已更新

---

## 📝 遷移檢查清單

- [ ] 已導入需要的 macros
- [ ] 已替換所有目標元件
- [ ] 功能測試通過
- [ ] 樣式檢查通過
- [ ] 響應式設計正常
- [ ] 可訪問性檢查通過
- [ ] 代碼審查完成

---

**創建日期**: 2025-12-14

