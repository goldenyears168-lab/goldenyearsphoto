# API Spec (Data Formats & Contracts)
## 好時有影 - 專業攝影工作室網站

**版本**: 1.0  
**日期**: 2024-11  
**說明**: 本文檔描述網站使用的資料結構、API 和資料格式

---

## 6.1 Endpoint List

### Internal Data Sources

#### 1. Site Metadata
- **名稱**: Site Metadata
- **目的**: 儲存網站基本資訊（URL、標題等）
- **檔案路徑**: `src/_data/metadata.json`
- **格式**: JSON

---

#### 2. Page Front Matter
- **名稱**: Page Front Matter
- **目的**: 每個頁面的 metadata（title、description、layout 等）
- **檔案路徑**: 每個 `.njk` 檔案的 YAML front matter
- **格式**: YAML

---

### External APIs / Services

#### 3. Cloudflare R2 CDN
- **名稱**: Cloudflare R2 (Image CDN)
- **目的**: 圖片儲存和分發
- **URL 格式**: `{R2_PUBLIC_BASE_URL}/{image_path}`
- **環境變數**: `R2_PUBLIC_BASE_URL`
- **Fallback**: 如果未設定，使用本地 `assets/images/` 路徑

---

#### 4. External Booking System
- **名稱**: External Booking Service
- **目的**: 處理預約流程
- **類型**: 可能是 Calendly、Acuity、或其他預約系統
- **整合方式**: iframe 嵌入或直接連結
- **URL**: 每個分店有獨立的預約 URL（在分店頁面中定義）

---

## 6.2 Input Fields

### Site Metadata (`metadata.json`)

```json
{
  "url": "string (required)"
}
```

**欄位說明**:
- `url`: 網站完整 URL（例如："https://goldenyearsphoto.com"）
  - 類型: string
  - 必填: 是
  - 格式: 完整的 HTTP/HTTPS URL

---

### Page Front Matter (YAML)

```yaml
---
layout: "string (required)"
title: "string (required)"
pageStyles: "string (optional)"
seo:
  description: "string (optional)"
  keywords: "string (optional)"
permalink: "string (optional)"
---
```

**欄位說明**:
- `layout`: 使用的佈局模板名稱
  - 類型: string
  - 必填: 是
  - 範例: "base-layout.njk"
- `title`: 頁面標題（用於 `<title>` 標籤）
  - 類型: string
  - 必填: 是
  - 格式: 通常包含頁面名稱和品牌名稱
- `pageStyles`: 頁面特定的 CSS 連結（HTML 字串）
  - 類型: string (HTML)
  - 必填: 否
  - 範例: `<link rel="stylesheet" href="/assets/css/4-pages/p-home.css">`
- `seo.description`: Meta description
  - 類型: string
  - 必填: 否
  - 長度: 建議 120-160 字元
- `seo.keywords`: Meta keywords（已過時，但保留以備不時之需）
  - 類型: string
  - 必填: 否
- `permalink`: 自訂 URL 路徑
  - 類型: string
  - 必填: 否
  - 範例: "/booking/"（覆蓋預設的檔案路徑）

---

### R2 Image Filter Input

**Filter 名稱**: `r2img`

**輸入格式**:
```nunjucks
{{ 'portfolio/korean-id/korean-id-1.jpg' | r2img }}
{{ '/portfolio/korean-id/korean-id-1.jpg' | r2img }}
{{ '/assets/images/portfolio/korean-id/korean-id-1.jpg' | r2img }}
```

**參數說明**:
- 輸入: 圖片相對路徑（string）
- 允許格式:
  - `"portfolio/xxx.jpg"`（無前導斜線）
  - `"/portfolio/xxx.jpg"`（有前導斜線）
  - `"/assets/images/portfolio/xxx.jpg"`（完整路徑，會自動移除 `/assets/images/` 前綴）

**處理邏輯**:
1. 移除 `/assets/images/` 前綴（如存在）
2. 移除多餘的前導斜線
3. 如果 `R2_PUBLIC_BASE_URL` 已設定，返回 `{R2_PUBLIC_BASE_URL}/{clean_path}`
4. 如果未設定，返回 `/assets/images/{clean_path}`

---

## 6.3 Output Fields

### R2 Image Filter Output

**成功輸出**:
```
https://your-r2-domain.com/portfolio/korean-id/korean-id-1.jpg
```
或（fallback）:
```
/assets/images/portfolio/korean-id/korean-id-1.jpg
```

**輸出格式**:
- 類型: string (URL)
- 格式: 完整的 HTTP/HTTPS URL 或相對路徑

---

### Eleventy Generated HTML

**輸出結構**:
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page.title}</title>
  <meta name="description" content="{page.seo.description}">
  {page.pageStyles | safe}
</head>
<body>
  {page content}
</body>
</html>
```

---

### Sitemap Output (`sitemap.xml`)

**格式**: XML

**結構**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://goldenyearsphoto.com/</loc>
    <lastmod>2024-11-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- 更多 URL -->
</urlset>
```

**欄位說明**:
- `loc`: 頁面完整 URL
- `lastmod`: 最後修改日期（ISO 8601 格式：YYYY-MM-DD）
- `changefreq`: 更新頻率（weekly, monthly 等）
- `priority`: 優先級（0.0 - 1.0）

---

## 6.4 Error Codes

### R2 Image Filter Errors

#### Error 1: R2 CDN 無法連接
- **觸發條件**: `R2_PUBLIC_BASE_URL` 已設定，但 CDN 無法連接
- **HTTP 狀態碼**: 404, 500, 或網路錯誤
- **系統回應**: 
  - Filter 自動回退到本地 `assets/images/` 路徑
  - 不顯示錯誤訊息（靜默 fallback）
  - 在開發環境記錄警告到控制台

---

#### Error 2: 圖片路徑不存在
- **觸發條件**: 本地圖片檔案不存在
- **系統回應**:
  - 在開發環境顯示警告訊息
  - 在生產環境不顯示該圖片（或顯示預設佔位圖）
  - 不影響其他圖片的顯示

---

### Eleventy Build Errors

#### Error 3: 模板檔案語法錯誤
- **觸發條件**: Nunjucks 模板語法錯誤
- **系統回應**:
  - 建置失敗，顯示錯誤訊息和行號
  - 不生成 HTML 檔案

---

#### Error 4: SCSS 編譯錯誤
- **觸發條件**: SCSS 語法錯誤或檔案缺失
- **系統回應**:
  - 建置失敗，顯示 SCSS 錯誤訊息
  - 不生成 CSS 檔案

---

#### Error 5: 資料檔案格式錯誤
- **觸發條件**: `metadata.json` 格式錯誤或無法解析
- **系統回應**:
  - 建置失敗，顯示 JSON 解析錯誤
  - 或使用預設值（如適用）

---

### External Booking System Errors

#### Error 6: 外部預約系統無法載入
- **觸發條件**: iframe 載入失敗或超時（> 10 秒）
- **HTTP 狀態碼**: 404, 500, 或網路錯誤
- **系統回應**:
  - 顯示錯誤訊息：「預約系統暫時無法使用，請稍後再試或聯繫我們」
  - 提供替代聯繫方式（電話、Email、Facebook Messenger）
  - 記錄錯誤到錯誤追蹤系統（如適用）

---

## 6.5 Field Formats

### Date Formats

#### Last Modified Date (Sitemap)
- **格式**: `YYYY-MM-DD`
- **範例**: `2024-11-22`
- **時區**: 不包含時區資訊（僅日期）

---

### URL Formats

#### Internal URLs
- **格式**: 相對路徑或絕對路徑
- **範例**: 
  - `/booking/`（相對路徑）
  - `https://goldenyearsphoto.com/booking/`（絕對路徑）
- **規則**: 
  - 使用小寫字母
  - 使用連字號分隔單詞（kebab-case）
  - 結尾斜線可選（但建議統一）

---

#### Image URLs
- **R2 CDN 格式**: `{R2_PUBLIC_BASE_URL}/{image_path}`
  - 範例: `https://your-r2-domain.com/portfolio/korean-id/korean-id-1.jpg`
- **本地格式**: `/assets/images/{image_path}`
  - 範例: `/assets/images/portfolio/korean-id/korean-id-1.jpg`
- **規則**:
  - 使用小寫字母和連字號
  - 檔案副檔名: `.jpg`, `.jpeg`, `.png`, `.webp`

---

### Currency Formats

#### Price Display
- **格式**: `優惠 $[價格] /[單位]`
- **範例**: 
  - `優惠 $399 /張`
  - `優惠 $1500 /組`
- **規則**:
  - 價格為整數（不顯示小數點）
  - 貨幣符號: `$`（新台幣）
  - 單位: `/張`, `/組`, `/人` 等

---

### Text Formats

#### Page Titles
- **格式**: `[頁面標題]｜好時有影 - [簡短描述]`
- **範例**: 
  - `服務價目表｜好時有影 - 韓式證件照、形象照`
  - `關於我們 - 團隊介紹｜好時有影`
- **規則**:
  - 長度: 建議 50-60 字元
  - 包含品牌名稱「好時有影」
  - 使用全形標點符號（如適用）

---

#### Meta Descriptions
- **格式**: 純文字，120-160 字元
- **範例**: `查詢好時有影「韓式證件照」、「專業形象照」、「合照」及「妝髮服務」的完整價格。我們 100% 堅持價格透明，提供 Z 世代最安心的預約體驗。`
- **規則**:
  - 包含關鍵字
  - 包含行動呼籲（如適用）
  - 不使用 HTML 標籤

---

### Image Alt Text Formats

#### Portfolio Images
- **格式**: `[服務類型]範例 [編號]`
- **範例**: 
  - `韓式證件照範例 1`
  - `專業形象照範例 2`
- **規則**:
  - 簡潔描述性
  - 包含服務類型和編號
  - 不使用「圖片」、「照片」等冗餘詞彙

---

## 6.6 Data Validation Rules

### Metadata Validation

1. **URL 格式驗證**:
   - 必須是有效的 HTTP/HTTPS URL
   - 必須包含協議（http:// 或 https://）
   - 不應該以斜線結尾

---

### Front Matter Validation

1. **Layout 驗證**:
   - 必須對應 `_includes/` 目錄中存在的檔案
   - 必須包含 `.njk` 副檔名（在 Eleventy 配置中）

2. **Title 驗證**:
   - 不能為空
   - 建議長度: 50-60 字元

3. **SEO Description 驗證**:
   - 如果提供，長度應該在 120-160 字元
   - 不應該包含 HTML 標籤

---

### Image Path Validation

1. **路徑格式**:
   - 不應該包含 `..`（相對路徑跳轉）
   - 應該相對於 `assets/images/` 或 `portfolio/` 目錄

2. **檔案存在性**:
   - 在建置時檢查檔案是否存在（開發環境）
   - 生產環境使用 fallback 機制

---

**文件維護者**: 開發團隊  
**最後更新**: 2024-11

