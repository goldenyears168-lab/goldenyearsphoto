# Nunjucks Macros 元件庫

## 📚 元件列表

### 基礎元件

#### Button (`button.njk`)
標準化的按鈕元件，支持多種 variant 和尺寸。

**參數**:
- `text` (string, required): 按鈕文字
- `href` (string, optional): 連結 URL（如果提供則創建 `<a>`，否則創建 `<button>`）
- `variant` (string, optional): 'primary' | 'secondary' | 'ghost' (預設: 'primary')
- `size` (string, optional): 'sm' | 'md' | 'lg' (預設: 'md')
- `class` (string, optional): 額外的 CSS 類
- `type` (string, optional): 按鈕類型（預設: 'button'）
- `disabled` (boolean, optional): 是否禁用（預設: false）
- `icon` (string, optional): 圖標 HTML
- `iconPosition` (string, optional): 'left' | 'right' (預設: 'left')

**範例**:
```njk
{% from "macros/button.njk" import button %}
{{ button("預約拍攝", "/booking/", "primary", "lg") }}
{{ button("了解更多", "/about/", "secondary") }}
{{ button("取消", "", "ghost", "sm") }}
```

#### Card (`card.njk`)
標準化的卡片元件，支持多種 variant。

**參數**:
- `variant` (string, optional): 'default' | 'sand' | 'elevated' | 'bordered' (預設: 'default')
- `class` (string, optional): 額外的 CSS 類
- `content` (string, required): 卡片內容（HTML 字串）

**範例**:
```njk
{% from "macros/card.njk" import card %}
{{ card("default", "", "<h3>標題</h3><p>內容</p>") }}
{{ card("sand", "mb-6", "<h3>沙色卡片</h3>") }}
```

#### Input (`input.njk`)
標準化的輸入欄位元件。

**參數**:
- `type` (string, optional): 輸入類型（預設: 'text'）
- `name` (string, required): 輸入欄位名稱
- `id` (string, optional): 輸入欄位 ID（預設使用 name）
- `label` (string, optional): 標籤文字
- `placeholder` (string, optional): 佔位符文字
- `value` (string, optional): 輸入值
- `required` (boolean, optional): 是否必填（預設: false）
- `disabled` (boolean, optional): 是否禁用（預設: false）
- `class` (string, optional): 額外的 CSS 類
- `error` (string, optional): 錯誤訊息
- `help` (string, optional): 幫助文字

**範例**:
```njk
{% from "macros/input.njk" import input %}
{{ input("text", "name", "user-name", "姓名", "請輸入您的姓名", "", true) }}
{{ input("email", "email", "", "電子郵件", "", "", true, false, "", "請輸入有效的電子郵件") }}
```

#### Badge (`badge.njk`)
標準化的標籤/徽章元件。

**參數**:
- `text` (string, required): 標籤文字
- `variant` (string, optional): 'default' | 'success' | 'warning' | 'error' | 'info' (預設: 'default')
- `size` (string, optional): 'sm' | 'md' | 'lg' (預設: 'md')
- `class` (string, optional): 額外的 CSS 類

**範例**:
```njk
{% from "macros/badge.njk" import badge %}
{{ badge("新功能", "success", "sm") }}
{{ badge("即將推出", "warning") }}
```

#### Textarea (`textarea.njk`)
標準化的多行文字輸入元件。

**參數**:
- `name` (string, required): 欄位名稱
- `id` (string, optional): 欄位 ID
- `label` (string, optional): 標籤文字
- `placeholder` (string, optional): 佔位符
- `value` (string, optional): 預設值
- `rows` (number, optional): 行數（預設: 4）
- `required` (boolean, optional): 是否必填
- `disabled` (boolean, optional): 是否禁用
- `class` (string, optional): 額外的 CSS 類
- `error` (string, optional): 錯誤訊息
- `help` (string, optional): 幫助文字

**範例**:
```njk
{% from "macros/textarea.njk" import textarea %}
{{ textarea("message", "user-message", "訊息", "請輸入您的訊息", "", 5, true) }}
```

#### Select (`select.njk`)
標準化的下拉選單元件。

**參數**:
- `name` (string, required): 欄位名稱
- `id` (string, optional): 欄位 ID
- `label` (string, optional): 標籤文字
- `options` (array, required): 選項陣列 [{value: '', text: '', selected: false}]
- `required` (boolean, optional): 是否必填
- `disabled` (boolean, optional): 是否禁用
- `class` (string, optional): 額外的 CSS 類
- `error` (string, optional): 錯誤訊息
- `help` (string, optional): 幫助文字

**範例**:
```njk
{% from "macros/select.njk" import select %}
{% set options = [
  {value: '', text: '請選擇', selected: true},
  {value: 'option1', text: '選項 1', selected: false}
] %}
{{ select("service", "service-type", "服務類型", options, true) }}
```

#### Checkbox (`checkbox.njk`)
標準化的複選框元件。

**參數**:
- `name` (string, required): 欄位名稱
- `id` (string, optional): 欄位 ID
- `label` (string, optional): 標籤文字
- `value` (string, optional): 選項值
- `checked` (boolean, optional): 是否選中
- `required` (boolean, optional): 是否必填
- `disabled` (boolean, optional): 是否禁用
- `class` (string, optional): 額外的 CSS 類
- `error` (string, optional): 錯誤訊息
- `help` (string, optional): 幫助文字

**範例**:
```njk
{% from "macros/checkbox.njk" import checkbox %}
{{ checkbox("agree", "agree-terms", "我同意條款", "yes", false, true) }}
```

#### Container (`container.njk`)
標準化的容器元件，提供統一的 max-width 和 padding。

**參數**:
- `size` (string, optional): 'sm' | 'md' | 'lg' | 'xl' | 'full' (預設: 'lg')
- `class` (string, optional): 額外的 CSS 類
- `content` (string, required): 容器內容（HTML 字串）

**範例**:
```njk
{% from "macros/container.njk" import container %}
{{ container("lg", "py-16", "<h1>標題</h1><p>內容</p>") }}
```

#### Heading (`heading.njk`)
標準化的標題元件。

**參數**:
- `level` (number, optional): 標題層級 1-6（預設: 1）
- `text` (string, required): 標題文字
- `size` (string, optional): 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'（可選，會根據 level 自動設定）
- `class` (string, optional): 額外的 CSS 類
- `id` (string, optional): 標題 ID

**範例**:
```njk
{% from "macros/heading.njk" import heading %}
{{ heading(1, "主標題", "4xl", "mb-6") }}
{{ heading(2, "副標題", "", "mb-4", "section-title") }}
```

#### Alert (`alert.njk`)
標準化的提示/通知元件。

**參數**:
- `variant` (string, optional): 'info' | 'success' | 'warning' | 'error' (預設: 'info')
- `title` (string, optional): 提示標題
- `message` (string, required): 提示訊息
- `dismissible` (boolean, optional): 是否可關閉（預設: false）
- `class` (string, optional): 額外的 CSS 類

**範例**:
```njk
{% from "macros/alert.njk" import alert %}
{{ alert("success", "成功", "操作已成功完成", false, "mb-4") }}
{{ alert("error", "錯誤", "請檢查您的輸入", true) }}
```

#### Radio (`radio.njk`)
標準化的單選按鈕元件。

**參數**:
- `name` (string, required): 欄位名稱（同一組的選項使用相同 name）
- `id` (string, required): 欄位 ID（每個選項必須唯一）
- `label` (string, optional): 標籤文字
- `value` (string, required): 選項值
- `checked` (boolean, optional): 是否選中
- `required` (boolean, optional): 是否必填
- `disabled` (boolean, optional): 是否禁用
- `class` (string, optional): 額外的 CSS 類
- `error` (string, optional): 錯誤訊息
- `help` (string, optional): 幫助文字

**範例**:
```njk
{% from "macros/radio.njk" import radio %}
{{ radio("payment", "payment-card", "信用卡", "card", false, true) }}
{{ radio("payment", "payment-cash", "現金", "cash", false, true) }}
```

#### Form Group (`form-group.njk`)
標準化的表單群組容器，用於組織相關的表單欄位。

**參數**:
- `label` (string, optional): 群組標籤
- `required` (boolean, optional): 是否必填
- `error` (string, optional): 群組錯誤訊息
- `help` (string, optional): 群組幫助文字
- `class` (string, optional): 額外的 CSS 類
- `content` (string, required): 表單欄位內容（HTML 字串）

**範例**:
```njk
{% from "macros/form-group.njk" import formGroup %}
{% from "macros/input.njk" import input %}
<fieldset>
  {{ formGroup("個人資訊", false, "", "", "", input("name", "user-name", "姓名", "請輸入姓名", "", true) | safe) }}
</fieldset>
```

#### Grid (`grid.njk`)
標準化的網格布局元件。

**參數**:
- `cols` (string, optional): 欄數 '1' | '2' | '3' | '4' | 'auto' (預設: '1')
- `gap` (string, optional): 間距大小 '0' | '2' | '4' | '6' | '8' (預設: '4')
- `responsive` (string, optional): 響應式斷點類（如 'md:grid-cols-2 lg:grid-cols-3'）
- `class` (string, optional): 額外的 CSS 類
- `content` (string, required): 網格項目內容（HTML 字串）

**範例**:
```njk
{% from "macros/grid.njk" import grid %}
{{ grid("3", "6", "md:grid-cols-2 lg:grid-cols-3", "", "<div>項目 1</div><div>項目 2</div>") }}
```

#### Stack (`stack.njk`)
標準化的垂直堆疊布局元件。

**參數**:
- `gap` (string, optional): 間距大小 '0' | '2' | '4' | '6' | '8' (預設: '4')
- `align` (string, optional): 對齊方式 'start' | 'center' | 'end' | 'stretch' (預設: 'stretch')
- `class` (string, optional): 額外的 CSS 類
- `content` (string, required): 堆疊項目內容（HTML 字串）

**範例**:
```njk
{% from "macros/stack.njk" import stack %}
{{ stack("6", "stretch", "", "<div>項目 1</div><div>項目 2</div>") }}
```

#### Flex (`flex.njk`)
標準化的彈性布局元件。

**參數**:
- `direction` (string, optional): 方向 'row' | 'col' | 'row-reverse' | 'col-reverse' (預設: 'row')
- `gap` (string, optional): 間距大小 '0' | '2' | '4' | '6' | '8' (預設: '4')
- `justify` (string, optional): 主軸對齊 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' (預設: 'start')
- `align` (string, optional): 交叉軸對齊 'start' | 'center' | 'end' | 'stretch' | 'baseline' (預設: 'center')
- `wrap` (boolean, optional): 是否換行（預設: false）
- `class` (string, optional): 額外的 CSS 類
- `content` (string, required): 彈性項目內容（HTML 字串）

**範例**:
```njk
{% from "macros/flex.njk" import flex %}
{{ flex("row", "4", "between", "center", false, "", "<div>項目 1</div><div>項目 2</div>") }}
```

### 現有元件

以下元件已存在，建議逐步遷移到新的標準化格式：

- `service-card.njk` - 服務卡片
- `testimonial-card.njk` - 推薦卡片
- `price-card.njk` - 價格卡片
- `hero-section.njk` - Hero 區塊
- `portfolio.njk` - 作品集
- `comparison-table.njk` - 比較表格
- `feature-list.njk` - 功能列表
- `layout-split.njk` - 分割佈局

## 🎯 使用指南

### 1. 導入 Macro

在模板文件頂部導入需要的 macro：

```njk
{% from "macros/button.njk" import button %}
{% from "macros/card.njk" import card %}
```

### 2. 使用 Macro

在模板中使用：

```njk
{{ button("點擊我", "/link/", "primary", "lg") }}
{{ card("default", "mb-6", "<h3>標題</h3><p>內容</p>") }}
```

### 3. 組合使用

可以組合多個 macro 創建複雜的 UI：

```njk
{% from "macros/card.njk" import card %}
{% from "macros/button.njk" import button %}

{{ card("default", "", "
  <h3>服務標題</h3>
  <p>服務描述</p>
  " + button("了解更多", "/service/", "primary", "md") | safe) }}
```

## 📝 最佳實踐

1. **使用標準 Variant**: 優先使用預定義的 variant，避免自定義樣式
2. **保持一致性**: 在整個專案中使用相同的 macro 和 variant
3. **語義化**: 使用有意義的 variant 名稱（如 'primary' 而非 'blue'）
4. **可訪問性**: 確保所有元件都包含適當的 ARIA 屬性
5. **文檔化**: 為自定義的 macro 添加清晰的註釋

## 🔄 遷移計劃

### Phase 1: 基礎元件（已完成 ✅）
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Badge

### Phase 2: 表單元件（已完成 ✅）
- ✅ Textarea
- ✅ Select
- ✅ Checkbox
- ✅ Radio
- ✅ Form Group

### Phase 3: 布局元件（已完成 ✅）
- ✅ Container
- ✅ Grid
- ✅ Stack
- ✅ Flex

### Phase 4: 內容元件（部分完成 🔄）
- ✅ Heading
- ✅ Alert
- [ ] Text
- [ ] List
- [ ] Table

---

## 🎨 元件展示頁面

訪問 `/components-showcase/` 查看所有元件的實際展示和互動效果。

## 📚 遷移指南

### 開始遷移

1. **查看遷移建議**: 閱讀 `MIGRATION_SUGGESTIONS.md` 了解需要遷移的代碼
2. **參考範例**: 查看 `MIGRATION_EXAMPLE.md` 了解遷移範例
3. **查看示範**: 訪問 `/migration-demo/` 查看遷移前後對比

### 遷移工具

使用 `scripts/migrate-to-components.py` 自動掃描遷移機會：

```bash
python3 scripts/migrate-to-components.py
```

---

**最後更新**: 2025-12-14
**總元件數**: 23 個（15 個標準化元件 + 8 個現有元件）

