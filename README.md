# 好時有影 - 專業攝影工作室網站

台北專業形象照攝影工作室的官方網站，提供韓式證件照、專業形象照、畢業照等服務。

> 📌 **架構說明**: 本專案為純靜態前端網站，AI 客服功能已遷移至獨立微服務 [chatbot-service](https://github.com/yourusername/chatbot-service)

---

## 📁 專案結構

```
goldenyearsphoto/
├── src/                      # 源代碼目錄
│   ├── _data/                # Eleventy 資料檔案
│   ├── _includes/            # 模板和組件
│   │   ├── base-layout.njk   # 基礎佈局（含 Widget 引用）
│   │   ├── macros/           # Nunjucks 巨集
│   │   └── partials/         # 部分模板
│   ├── assets/              # 靜態資源
│   │   ├── css/             # SCSS 樣式（ITCSS 架構）
│   │   ├── images/          # 壓縮後的圖片（供網站使用）
│   │   ├── images-original/ # 原始圖片（備份）
│   │   └── js/              # JavaScript 檔案
│   ├── blog/                # 作品集分類頁面
│   ├── booking/             # 預約頁面
│   ├── guide/               # 指南頁面（FAQ、妝髮指南等）
│   ├── services/            # 服務頁面
│   ├── scripts/             # 建置腳本
│   │   ├── compress-images.mjs        # 圖片壓縮
│   │   └── upload-portfolio-to-r2.mjs # R2 上傳
│   └── *.njk                # 主要頁面模板
├── archive-old/             # 歷史文檔存檔
├── _site/                   # 建置輸出（自動生成）
├── .eleventy.js             # Eleventy 配置
└── package.json             # 專案依賴和腳本
```

---

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm start
# 或
npm run dev  # 同時執行圖片上傳監聽和開發伺服器
```

網站將在 `http://localhost:8080` 啟動。

### 建置生產版本

```bash
npm run build
```

建置流程：
1. 壓縮原始圖片（`images-original/` → `images/`）
2. 上傳圖片到 Cloudflare R2
3. 生成靜態網站（輸出到 `_site/`）

---

## 📝 可用腳本

| 腳本 | 說明 |
|------|------|
| `npm start` | 啟動開發伺服器 |
| `npm run dev` | 開發模式（含圖片監聽） |
| `npm run build` | 建置生產版本 |
| `npm run compress-images` | 壓縮原始圖片 |
| `npm run upload-portfolio` | 上傳圖片到 R2 |
| `npm run lint` | 檢查程式碼品質 |
| `npm run lint:js` | 檢查 JavaScript |
| `npm run lint:css` | 檢查 CSS/SCSS |

---

## 🛠️ 技術棧

### 前端網站
- **靜態網站生成器**: [Eleventy (11ty)](https://www.11ty.dev/) v2.0
- **模板引擎**: [Nunjucks](https://mozilla.github.io/nunjucks/)
- **樣式**: SCSS (ITCSS 架構)
- **JavaScript**: Vanilla JS (無框架)
- **圖片處理**: [Sharp](https://sharp.pixelplumbing.com/)
- **圖片儲存**: [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- **部署**: Cloudflare Pages

### AI 客服 Widget
- **架構**: 獨立微服務（遠端載入）
- **後端**: Cloudflare Pages Functions
- **AI 模型**: Google Gemini
- **專案**: [chatbot-service](https://github.com/yourusername/chatbot-service) (獨立部署)

---

## 💬 AI 客服功能

本網站整合了 AI 客服 Widget，通過遠端腳本載入：

```html
<!-- 在 base-layout.njk 中引用 -->
<script 
  src="https://chatbot-service-multi-tenant.pages.dev/widget/loader.js"
  data-api-endpoint="https://chatbot-service-multi-tenant.pages.dev/api/goldenyears/chat"
  data-api-base-url="https://chatbot-service-multi-tenant.pages.dev"
  data-company="goldenyears"
  data-page-type="{{ pageType }}"
  defer
></script>
```

**特點**:
- ✅ 完全獨立部署，不影響前端網站
- ✅ 自動識別頁面類型（首頁、FAQ、預約等）
- ✅ 首頁自動彈出歡迎訊息
- ✅ 支援 FAQ 菜單和智能對話

**詳細資訊**: 請參考 [chatbot-service 專案](https://github.com/yourusername/chatbot-service)

---

## 🖼️ 圖片處理流程

### 工作流程

```
原始圖片 (images-original/)
    ↓
npm run compress-images
    ↓
壓縮圖片 (images/) ← 網站使用這些圖片
    ↓
npm run upload-portfolio
    ↓
上傳到 R2 CDN (優化後)
```

### 圖片優化設定

- **壓縮腳本** (`compress-images.mjs`):
  - 最大寬度: 1600px
  - JPEG 品質: 70%
  - 支援格式: JPG, PNG, WebP

- **上傳腳本** (`upload-portfolio-to-r2.mjs`):
  - 最大寬度: 1200px
  - JPEG 品質: 80%
  - 自動移除 EXIF 資料

---

## 🔧 環境變數

建立 `.env` 檔案（不提交到 Git）：

```env
# Cloudflare R2 設定
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_BASE_URL=https://your-r2-domain.com
```

---

## 📂 目錄說明

### `/src/assets/css/` - SCSS 架構 (ITCSS)

```
1-core/          # 核心層（變數、基礎樣式）
2-layout/        # 佈局層（結構、Header、Footer）
3-components/    # 組件層（可重用元件）
4-pages/         # 頁面層（頁面特定樣式）
main.scss        # 主樣式檔案（匯入所有層級）
```

### `/src/assets/js/` - JavaScript

- `main.js` - 主要互動邏輯（導覽選單、篩選器等）
- `scroll-animations.js` - 滾動動畫（可選）

### `/src/blog/` - 作品集分類頁面

每個 `.njk` 檔案對應一個作品分類頁面。

### `/src/booking/` - 預約頁面

- `index.njk` - 分店選擇頁面
- `zhongshan.njk` - 中山店預約頁面
- `gongguan.njk` - 公館店預約頁面

---

## 🎨 設計系統

### 色彩系統

使用 CSS 自訂屬性（定義在 `1-core/_c-00-tokens.scss`）：

- `--color-primary` - 主要品牌色
- `--color-accent-warm` - 暖色調強調色
- `--color-bg` - 頁面背景色
- `--color-surface` - 卡片/表面背景色
- `--color-text-main` - 主要文字色
- `--color-text-muted` - 次要文字色

### 設計原則

- **視覺風格**: 溫暖、人性化、專業（Warm × Enterprise）
- **產品品質**: 企業級結構和一致性
- **技術約束**: 靜態友好（HTML + SCSS + Vanilla JS）

---

## 🐛 問題排查

### 圖片無法載入

1. 檢查 R2 環境變數是否正確設定
2. 確認圖片已上傳到 R2（執行 `npm run upload-portfolio`）
3. 檢查 `r2img` filter 是否正常運作

### 建置失敗

1. 檢查 Node.js 版本（建議 v18+）
2. 確認所有依賴已安裝（`npm install`）
3. 檢查 `.eleventy.js` 配置是否正確

### 樣式未套用

1. 確認 SCSS 已正確編譯（檢查 `_site/assets/css/`）
2. 檢查 `inlineCSS` filter 是否正常運作
3. 確認瀏覽器快取已清除

---

## 📄 授權

ISC License

---

## 👥 維護者

開發團隊

---

## 🔗 相關連結

- [Eleventy 官方文檔](https://www.11ty.dev/docs/)
- [Nunjucks 模板語法](https://mozilla.github.io/nunjucks/templating.html)
- [ITCSS 架構說明](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)

---

## 📚 相關專案

- **[chatbot-service](https://github.com/yourusername/chatbot-service)** - AI 客服微服務（獨立部署）

---

**最後更新**: 2025-01-28

