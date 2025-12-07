# 證件照與合照服務介紹頁規格（Services 目錄）

**版本**: 1.0  
**日期**: 2025-01  
**狀態**: Planning  
**參考文件**: `docs/08_portrait_seo_optimization.md`

---

## 目錄 (Table of Contents)

- [核心目標](#核心目標)
- [檔案結構](#檔案結構)
- [服務頁面 1：韓式證件照服務](#服務頁面-1韓式證件照服務)
  - [頁面資訊](#頁面資訊)
  - [SEO 關鍵字策略](#seo-關鍵字策略)
  - [頁面結構（AIDA 框架）](#頁面結構aida-框架)
  - [技術實作細節](#技術實作細節)
- [服務頁面 2：合照服務](#服務頁面-2合照服務)
  - [頁面資訊](#頁面資訊-1)
  - [SEO 關鍵字策略](#seo-關鍵字策略-1)
  - [頁面結構（AIDA 框架）](#頁面結構aida-框架-1)
  - [技術實作細節](#技術實作細節-1)
- [共同設計原則](#共同設計原則)
- [內部連結策略](#內部連結策略)

---

## 核心目標

建立兩個專業服務介紹頁面，放在 `src/services/` 目錄下，作為「服務」導覽項目的核心頁面。這兩個頁面將：

1. **提升 SEO 價值** - 針對「證件照」和「合照」相關關鍵字優化
2. **轉化工具使用者** - 從「免費工具需求」轉化到「專業服務需求」
3. **建立服務權威** - 透過專業內容建立品牌信任
4. **降低決策壓力** - 使用 AIDA 框架和說服性文案，引導用戶預約

---

## 檔案結構

```
src/
├── services/                       # 服務目錄（如不存在需建立）
│   ├── id-photo.njk              # 新：韓式證件照服務頁
│   └── group-photo.njk           # 新：合照服務頁
└── assets/css/4-pages/
    ├── _p-service-id.scss         # 新：證件照服務頁專屬樣式（如需要）
    └── _p-service-group.scss      # 新：合照服務頁專屬樣式（如需要）
```

**注意：** Eleventy 會自動處理 `src/services/` 目錄下的 `.njk` 檔案，無需額外配置。生成的 URL 路徑為 `/services/id-photo/` 和 `/services/group-photo/`。

---

## 服務頁面 1：韓式證件照服務

### 頁面資訊

**檔案：** `src/services/id-photo.njk`  
**路徑：** `/services/id-photo/`  
**Title：** `台北韓式證件照服務 | 專業證件照攝影、履歷照、護照照片 - 好時有影`  
**H1：** `台北韓式證件照服務 | 一張你真正喜歡、自信出發的證件照`

### SEO 關鍵字策略

**核心關鍵字：**
- 韓式證件照、證件照、大頭照、履歷照、護照照片
- 台北證件照、中山區證件照、公館證件照

**長尾關鍵字：**
- 證件照推薦、證件照攝影、證件照工作室
- 求職證件照、履歷證件照、畢業證件照
- 證件照價格、證件照費用、證件照優惠

**職業別長尾：**
- 醫師證件照、律師證件照、學生證件照

### 頁面結構（AIDA 框架）

#### Hero Section（Attention - 注意力）

```njk
<div class="module module-dark page-hero">
    <div class="container">
        <h1>台北韓式證件照服務 | 一張你真正喜歡、自信出發的證件照</h1>
        <p class="hero-subtitle">
            我們都懂那種數位焦慮。當你必須上傳履歷照，卻對著手機相簿裡尷尬的舊照片。
        </p>
        <p class="hero-description">
            你需要的不是一張「合規」的照片，你需要的是一張你真正喜歡、並樂意用它來代表你的數位檔案。
        </p>
        <div class="hero-actions">
            <a href="/booking/" class="button button--primary">立即預約拍攝</a>
            <a href="/price-list/#id-photo" class="button button--secondary">查看價目表</a>
        </div>
    </div>
</div>
```

**文案策略：**
- 情感觸發：從「數位焦慮」和「尷尬的舊照片」開始
- 價值主張：強調「真正喜歡」而非「合規」
- 低門檻 CTA：提供「查看價目表」作為次要選項

---

#### Section 1: 痛點喚醒（Interest - 興趣）

**H2：** `為什麼需要專業證件照？（而非自己用手機拍）`

**文案內容：**
```
您是否曾經：
- 用手機自拍證件照，結果看起來很尷尬？
- 在證件照快拍店拍了照片，但成品完全不像自己？
- 履歷表很完美，但頭像還是那張大學畢業照？

證件照不只是「符合規格」的問題，更是「第一印象」的問題。
履歷表、LinkedIn、求職網站、護照...這些地方需要的是一張能代表「您是誰」的專業證件照。
```

**視覺：**
- 使用 `.layout-split` 組件，圖文並排
- 左側：對比圖（手機自拍 vs 專業證件照）
- 右側：文案內容

---

#### Section 2: 價值主張（Desire - 渴望）

**H2：** `韓式證件照 vs 傳統證件照：差異在哪裡？`

**文案策略：**
- 教育型內容，建立專業權威
- 使用表格對比：風格、修圖方式、適用場景

**對比表格：**

| 項目 | 傳統證件照 | 韓式證件照 |
|------|-----------|-----------|
| 風格 | 正式、嚴肅 | 自然、自信 |
| 修圖 | 過度磨皮、失真 | 自然精修、保留真實感 |
| 適用場景 | 正式證件申請 | 履歷、LinkedIn、求職網站 |
| 價格 | 通常較低 | 優惠 $399/張 |

**視覺：**
- 使用 `.module-gray` 背景突出顯示
- 並排展示作品集（傳統 vs 韓式）

---

#### Section 3: 適合對象（Desire - 深化渴望）

**H2：** `適合對象：誰需要專業證件照？`

**文案策略：** 使用「您是否...」問句，讓用戶自我認同

```
- 您正在求職，履歷表需要一張能加分的照片？
- 您的 LinkedIn 頭像還是大學畢業照？
- 您需要申請護照、簽證，但不想用快拍店的尷尬照片？
- 您是醫師、律師、講師，需要建立專業形象？
- 您即將畢業，需要一張正式的畢業證件照？
```

**視覺：**
- 使用 `.portfolio-wall-grid` 展示不同職業別的作品集
- 分類展示：求職證件照、畢業證件照、醫師證件照等

---

#### Section 4: 服務流程（Reduce Friction - 降低摩擦）

**H2：** `拍攝流程：簡單 4 步驟，無壓力體驗`

**步驟視覺化：**
1. **預約拍攝** - 線上預約，選擇時間和地點（中山/公館）
2. **現場拍攝** - 專業攝影師引導，自然放鬆
3. **精修校稿** - 專業自然精修，可校稿兩次
4. **一週交件** - 高畫質電子檔，立即使用

**文案策略：**
- 強調「簡單」、「無壓力」、「專業引導」
- 強調「不需要自己想姿勢，攝影師會引導您」

**視覺：**
- 使用 `.step-list` 組件（已存在，參考 `src/index.njk`）
- HTML 結構：
```html
<ol class="step-list">
  <li>
    <h3>預約拍攝</h3>
    <p>線上預約，選擇時間和地點（中山/公館）</p>
  </li>
  <li>
    <h3>現場拍攝</h3>
    <p>專業攝影師引導，自然放鬆</p>
  </li>
  <li>
    <h3>精修校稿</h3>
    <p>專業自然精修，可校稿兩次</p>
  </li>
  <li>
    <h3>一週交件</h3>
    <p>高畫質電子檔，立即使用</p>
  </li>
</ol>
```
- 注意：必須使用 `<ol>`（有序列表），每個 `<li>` 內需包含 `<h3>` 標題和 `<p>` 描述

---

#### Section 5: 價格透明（Reduce Friction - 消除疑慮）

**H2：** `價格透明，以張計價，不強迫購買套組`

**價格資訊：**
```
優惠價格：$399 /張
持學生證：可享優惠價格

服務包含：
- 專業自然精修（可校稿兩次）
- 成品為高畫質電子檔
- 預設白色背景
- 於一週內交件

升級選項：
- 急件可於隔日交件 +$100
```

**文案策略：**
- 解決「預算焦慮」和「被推銷」的恐懼
- 強調：「小資族友善」、「可單獨購買」
- 連結到價目表頁面

**視覺：**
- 使用 `.card` 或 `.module-gray` 突出顯示價格
- 使用 `.button--secondary` 連結到價目表

---

#### Section 6: 社會證明（Trust - 建立信任）

**H2：** `超過 1000+ 位客戶的選擇`

**內容：**
- 客戶見證（使用現有 `.card--testimonial` 結構）
- 作品集展示（使用 `.portfolio-wall-grid`）
- 數據證明：「90% 客戶在拍攝後立即更新履歷表頭像」（需確認實際數據來源）

**客戶見證實作方式：**
- 目前採用硬編碼方式，直接在模板中寫入見證內容
- HTML 結構：
```html
<div class="card card--testimonial">
  <div class="card__body">
    <p class="card__content">「護照快到期，想趁機換個美美大頭照。
    原本貪圖省錢結果慘不忍睹⋯看圖應該就知道我多崩潰。
    只好跑去學妹大推的店家。攝影師態度那是真的好，重點是很專業。
    從引導到最後修圖的成品都自然又讚。」</p>
  </div>
  <div class="card__footer">
    <p class="card__author">- 客戶真實回饋</p>
  </div>
</div>
```

**客戶見證範例內容：**
```
「護照快到期，想趁機換個美美大頭照。
原本貪圖省錢結果慘不忍睹⋯看圖應該就知道我多崩潰。
只好跑去學妹大推的店家。攝影師態度那是真的好，重點是很專業。
從引導到最後修圖的成品都自然又讚。」
```

**視覺：**
- 使用 `.module-gray` 背景
- 使用 `.card--testimonial` 展示見證
- 使用 `.portfolio-wall-grid` 展示作品集

---

#### Final CTA Section（Action - 行動）

**H2：** `準備好，讓自己被好好看見了嗎？`

**文案策略：** 情感召喚 + 低門檻行動

```
證件照可以用工具生成，但您的專業形象不能。
履歷表、LinkedIn、求職網站，都需要一張真正能代表「您是誰」的專業證件照。
```

**CTA 按鈕：**
- 主 CTA：`立即預約拍攝` → 連結到 `/booking/`
- 次 CTA：`查看完整作品集` → 連結到首頁 portfolio
- 信任元素：「免費諮詢，無壓力了解方案」

**視覺：**
- 使用 `.module-dark` 背景突出顯示
- 使用 `.button--primary` 和 `.button--secondary`

---

### 技術實作細節

**使用的現有組件：**
- `.module`, `.module-gray`, `.module-dark` - 區塊容器
- `.button`, `.button--primary`, `.button--secondary` - CTA 按鈕（注意：需同時使用 `button` 基礎類別）
- `.layout-split` - 圖文並排佈局（支援 `image-left` 和 `image-right` 修飾符）
- `.portfolio-wall-grid` - 作品集展示（網格佈局）
- `.masonry-layout` - 作品集展示（瀑布流佈局，適合合照）
- `.card`, `.card--testimonial` - 卡片組件
- `.step-list` - 流程步驟組件（已存在，使用 `<ol class="step-list">`）

**圖片資源：**
- **內容圖片**（用於頁面內容展示）：
  - `content/blog/korean-id/korean-id.jpg` - 主圖
  - `content/blog/korean-id/portfolio-wall/korean-id-*.jpg` - 作品集牆（8 張）
- **價格展示圖片**（用於價格區塊）：
  - `content/price-list/ID_Card_Example_1.jpg` - 正式證件/大頭照
  - `content/price-list/ID_Card_Example_2.jpg` - 履歷證件/大頭照
  - `content/price-list/ID_Card_Example_3.jpg` - 畢業證件
  - `content/price-list/ID_Card_Example_4.jpg` - 畢業紀念
- **作品集圖片**（用於首頁作品集，可選）：
  - `portfolio/korean-id/korean-id-*.jpg` - 首頁作品集縮圖
- **圖片使用方式：**
  - 使用 `r2img` filter：`{{ 'content/blog/korean-id/korean-id.jpg' | r2img }}`
  - 路徑說明：`r2img` filter 會自動處理路徑，無需包含 `/assets/images/` 前綴

**內容深度：**
- 至少 2000-2500 字，確保 SEO 價值
- 使用語義化的 H2-H4 結構
- 圖片 alt 文字描述具體且包含關鍵字

---

## 服務頁面 2：合照服務

### 頁面資訊

**檔案：** `src/services/group-photo.njk`  
**路徑：** `/services/group-photo/`  
**Title：** `台北合照服務 | 全家福、情侶寫真、團體照攝影 - 好時有影`  
**H1：** `台北合照服務 | 為一家人停下腳步，把此刻好好記住`

### SEO 關鍵字策略

**核心關鍵字：**
- 合照、全家福、情侶寫真、團體照
- 台北合照、全家福攝影、情侶寫真攝影

**長尾關鍵字：**
- 全家福推薦、全家福攝影、全家福工作室
- 情侶寫真推薦、情侶寫真攝影、紀念日寫真
- 團體照攝影、企業團體照、學生團體照

**場景長尾：**
- 畢業紀念照、親子寫真、閨蜜寫真、朋友合照
- 寵物合照、好孕照、紀念日寫真

### 頁面結構（AIDA 框架）

#### Hero Section（Attention - 注意力）

```njk
<div class="module module-dark page-hero">
    <div class="container">
        <h1>台北合照服務 | 為一家人停下腳步，把此刻好好記住</h1>
        <p class="hero-subtitle">
            家人之間的情感，多半藏在日常裡：孩子的笑容、爸媽交換的眼神、兄弟姊妹鬧脾氣後又和好的方式。
        </p>
        <p class="hero-description">
            這些習以為常的瞬間，也許不常說出口，但它們是家最真實的樣子。
        </p>
        <div class="hero-actions">
            <a href="/booking/" class="button button--primary">立即預約拍攝</a>
            <a href="/price-list/#group-photo" class="button button--secondary">查看價目表</a>
        </div>
    </div>
</div>
```

**文案策略：**
- 情感觸發：從「家人之間的情感」和「日常瞬間」開始
- 價值主張：強調「把此刻好好記住」
- 低門檻 CTA：提供「查看價目表」作為次要選項

---

#### Section 1: 痛點喚醒（Interest - 興趣）

**H2：** `為什麼需要專業合照？（而非用手機隨便拍）`

**文案內容：**
```
您是否曾經：
- 用手機拍全家福，結果有人閉眼、有人表情尷尬？
- 想要拍情侶寫真，但不知道怎麼擺姿勢？
- 想要紀念重要時刻，但不知道怎麼拍才好看？

合照不只是「把大家拍在一起」的問題，更是「捕捉真實情感」的問題。
全家福、情侶寫真、團體照...這些照片會成為多年後您最珍惜的回憶。
```

**視覺：**
- 使用 `.layout-split` 組件，圖文並排
- 左側：對比圖（手機隨拍 vs 專業合照）
- 右側：文案內容

---

#### Section 2: 價值主張（Desire - 渴望）

**H2：** `專注在彼此身上，捕捉最真實的互動`

**文案策略：**
- 情感連結：強調「專注在彼此身上」
- 價值對比：手機隨拍 vs 專業攝影

**文案內容：**
```
拍一組合照，是讓大家在同一刻慢下來，把忙碌擱在旁邊，只專注在彼此身上。

在棚拍的安穩環境中：
- 小孩能更自在，爸媽也能放鬆
- 你們的互動會自然浮現——牽手、相視、擁抱、一起大笑
- 乾淨的背景與柔和的光線，讓所有情緒都顯得更純粹

一張照片，很可能成為多年後你們最珍惜的回憶。
它提醒你們曾在同一個時間點，以最真實的方式相互依靠、一起存在。
```

**視覺：**
- 使用 `.layout-split` 展示圖文
- 使用 `.portfolio-wall-grid` 或 `.masonry-layout` 展示作品集

---

#### Section 3: 適合對象（Desire - 深化渴望）

**H2：** `適合對象：誰需要專業合照？`

**文案策略：** 使用場景化描述，讓用戶自我認同

**場景分類：**

**1. 全家福**
- 想要記錄家庭成長的每個階段
- 想要在重要節日留下美好回憶
- 想要為長輩留下珍貴的家族照片

**2. 情侶寫真**
- 慶祝紀念日、里程碑
- 想要記錄戀愛的美好時光
- 想要為關係創造儀式感

**3. 團體照**
- 畢業紀念照、同學會
- 企業團體照、團隊建設
- 朋友聚會、閨蜜寫真

**視覺：**
- 使用 `.masonry-layout` 展示不同場景的作品集
- 分類展示：全家福、情侶寫真、團體照等

---

#### Section 4: 服務流程（Reduce Friction - 降低摩擦）

**H2：** `拍攝流程：簡單 4 步驟，無壓力體驗`

**步驟視覺化：**
1. **預約拍攝** - 線上預約，選擇時間和地點（中山/公館）
2. **現場拍攝** - 專業攝影師引導，自然互動
3. **精修校稿** - 專業自然精修，可校稿兩次
4. **一週交件** - 高畫質電子檔，立即分享

**文案策略：**
- 強調「簡單」、「無壓力」、「專業引導」
- 強調「不需要自己想姿勢，攝影師會引導您」
- 特別說明：「小孩也能自在，爸媽也能放鬆」

**視覺：**
- 使用 `.step-list` 組件（已存在，參考 `src/index.njk`）
- HTML 結構：
```html
<ol class="step-list">
  <li>
    <h3>預約拍攝</h3>
    <p>線上預約，選擇時間和地點（中山/公館）</p>
  </li>
  <li>
    <h3>現場拍攝</h3>
    <p>專業攝影師引導，自然互動</p>
  </li>
  <li>
    <h3>精修校稿</h3>
    <p>專業自然精修，可校稿兩次</p>
  </li>
  <li>
    <h3>一週交件</h3>
    <p>高畫質電子檔，立即分享</p>
  </li>
</ol>
```
- 注意：必須使用 `<ol>`（有序列表），每個 `<li>` 內需包含 `<h3>` 標題和 `<p>` 描述

---

#### Section 5: 價格透明（Reduce Friction - 消除疑慮）

**H2：** `價格透明，以張計價，不強迫購買套組`

**價格資訊：**
```
優惠價格：$1199 /張（2-6人）
持學生證：可優惠 $1099 /張

服務包含：
- 專業自然精修（可校稿兩次）
- 成品為高畫質電子檔
- 妝髮造型自理

升級選項：
- 超過 6 人，每加一人 +$200
- 急件可於隔日交件 +$100
```

**文案策略：**
- 解決「預算焦慮」和「被推銷」的恐懼
- 強調：「小資族友善」、「可單獨購買」
- 連結到價目表頁面

**視覺：**
- 使用 `.card` 或 `.module-gray` 突出顯示價格
- 使用 `.button--secondary` 連結到價目表

---

#### Section 6: 社會證明（Trust - 建立信任）

**H2：** `超過 500+ 組家庭的選擇`

**內容：**
- 客戶見證（使用現有 `.card--testimonial` 結構）
- 作品集展示（使用 `.masonry-layout`）
- 數據證明：「95% 客戶在拍攝後立即分享到社群媒體」（需確認實際數據來源）

**客戶見證實作方式：**
- 目前採用硬編碼方式，直接在模板中寫入見證內容
- HTML 結構：
```html
<div class="card card--testimonial">
  <div class="card__body">
    <p class="card__content">「拍一組全家福，是讓大家在同一刻慢下來，只專注在彼此身上。
    在棚拍的安穩環境中，小孩能更自在，爸媽也能放鬆。
    而你們的互動會自然浮現——牽手、相視、擁抱、一起大笑。」</p>
  </div>
  <div class="card__footer">
    <p class="card__author">- 客戶真實回饋</p>
  </div>
</div>
```

**客戶見證範例內容：**
```
「拍一組全家福，是讓大家在同一刻慢下來，只專注在彼此身上。
在棚拍的安穩環境中，小孩能更自在，爸媽也能放鬆。
而你們的互動會自然浮現——牽手、相視、擁抱、一起大笑。」
```

**視覺：**
- 使用 `.module-gray` 背景
- 使用 `.card--testimonial` 展示見證
- 使用 `.masonry-layout` 展示作品集

---

#### Final CTA Section（Action - 行動）

**H2：** `預約你們的「現在」`

**文案策略：** 情感召喚 + 低門檻行動

```
為這段無可取代的家庭時光，舉辦一場溫暖的儀式。
我們的「合照」方案 100% 透明，預約流程 100% 簡單。
```

**CTA 按鈕：**
- 主 CTA：`立即預約拍攝` → 連結到 `/booking/`
- 次 CTA：`查看完整作品集` → 連結到首頁 portfolio
- 信任元素：「免費諮詢，無壓力了解方案」

**視覺：**
- 使用 `.module-dark` 背景突出顯示
- 使用 `.button--primary` 和 `.button--secondary`

---

### 技術實作細節

**使用的現有組件：**
- `.module`, `.module-gray`, `.module-dark` - 區塊容器
- `.button`, `.button--primary`, `.button--secondary` - CTA 按鈕（注意：需同時使用 `button` 基礎類別）
- `.layout-split` - 圖文並排佈局（支援 `image-left` 和 `image-right` 修飾符）
- `.masonry-layout` - 作品集展示（瀑布流佈局，適合合照）
- `.portfolio-wall-grid` - 作品集展示（網格佈局，備選）
- `.card`, `.card--testimonial` - 卡片組件
- `.step-list` - 流程步驟組件（已存在，使用 `<ol class="step-list">`）

**圖片資源：**
- **內容圖片**（用於頁面內容展示）：
  - `content/blog/couples/couples_Main.jpg` - 情侶寫真主圖
  - `content/blog/couples/portfolio-wall/couples-*.jpg` - 情侶寫真作品集（49 張）
  - `content/blog/family/family-*.jpg` - 全家福圖片（4 張）
- **價格展示圖片**（用於價格區塊）：
  - `content/price-list/Group_Example_1.jpg` - 情侶寫真
  - `content/price-list/Group_Example_2.jpg` - 畢業紀念
  - `content/price-list/Group_Example_3.jpg` - 親子寫真
  - `content/price-list/Group_Example_4.jpg` - 寵物合照
- **作品集圖片**（用於首頁作品集，可選）：
  - `portfolio/couple/couple-*.jpg` - 情侶寫真作品集
  - `portfolio/family/family-*.jpg` - 全家福作品集
- **圖片使用方式：**
  - 使用 `r2img` filter：`{{ 'content/blog/couples/couples_Main.jpg' | r2img }}`
  - 路徑說明：`r2img` filter 會自動處理路徑，無需包含 `/assets/images/` 前綴

**內容深度：**
- 至少 2000-2500 字，確保 SEO 價值
- 使用語義化的 H2-H4 結構
- 圖片 alt 文字描述具體且包含關鍵字

---

## 共同設計原則

### SEO 最佳實踐

- **頁面 Meta 資訊：**
  - 每個頁面都有唯一的 `title` 和 `seo.description`（在 front matter 中設定）
  - 使用 `seo.keywords` 加入相關關鍵字（可選）
- **內容結構：**
  - H1 只出現一次，使用語義化的 H2-H4 結構
  - 內容深度：至少 2000-2500 字，確保 SEO 價值
- **圖片優化：**
  - 圖片 alt 文字描述具體且包含關鍵字
  - 範例：`台北韓式證件照-求職履歷照-好時有影作品`（而非 `證件照範例 1`）
- **內部連結：**
  - 使用描述性的錨點文字（如「了解專業形象照服務」而非「點這裡」）
- **Canonical URL：**
  - 已在 `base-layout.njk` 中自動實作：`<link rel="canonical" href="{{ metadata.url }}{{ page.url }}">`
  - 無需額外設定，系統會自動生成

### CX 最佳實踐

- 使用 AIDA 框架組織內容（Attention → Interest → Desire → Action）
- 每個 CTA 都有明確的價值主張
- 降低決策壓力（「免費諮詢」、「無壓力了解」）
- 建立信任（社會證明、客戶見證、數據證明）
- 減少摩擦（價格透明、流程簡單、無強迫推銷）

### 設計系統一致性

- **CSS 架構：**
  - 遵循現有的 ITCSS 結構（1-core, 2-layout, 3-components, 4-pages）
  - 頁面專屬樣式放在 `src/assets/css/4-pages/` 目錄
  - 如需建立專屬樣式，檔案命名：`_p-service-id.scss` 和 `_p-service-group.scss`
- **樣式導入方式：**
  - 在頁面 front matter 中使用 `pageStyles`：
  ```yaml
  pageStyles: |
    <link rel="stylesheet" href="/assets/css/4-pages/p-service-id.css">
  ```
  - 注意：SCSS 檔案名以 `_` 開頭（如 `_p-service-id.scss`），編譯後的 CSS 檔案名不含 `_`（如 `p-service-id.css`）
- **設計 Tokens：**
  - 使用設計系統的 tokens（顏色、間距、字體等），定義在 `1-core/_c-00-tokens.scss`
- **視覺風格：**
  - 保持「Warm × Enterprise」的視覺風格
  - 確保 CTA 按鈕有足夠的視覺重量
  - 優化閱讀體驗（行高、段落間距、最大寬度約 900px）

---

## 內部連結策略

### 從其他頁面連結到服務頁

**1. 導覽列「服務」下拉選單**
- 韓式證件照 → `/services/id-photo/`（新頁面，SEO 著陸頁）
- 合照服務 → `/services/group-photo/`（新頁面，SEO 著陸頁）
- **注意：** 與 `/blog/korean-id/` 和 `/blog/couples/` 的區別：
  - `/services/` 目錄：服務介紹頁（SEO 優化、轉化導向、AIDA 框架）
  - `/blog/` 目錄：內容頁（故事、案例、指南、情感連結）

**2. 首頁推薦區塊**
- 在作品集區塊之後，加入服務推薦區塊
- 連結到兩個服務頁面

**3. 工具頁面 CTA**
- 在 `src/guide/crop-tool.njk` 加入 CTA
- 連結到 `/services/id-photo/`

**4. 價目表頁面**
- 在價格卡片下方加入「了解更多」連結
- 連結到對應的服務頁面
- **重要：** 需要在 `src/price-list.njk` 中為價格區塊添加 `id` 屬性：
  - 韓式證件照區塊：`<div class="card card--service" id="id-photo">`
  - 合照區塊：`<div class="c-card c-card--price" id="group-photo">`
  - 這樣錨點連結（如 `/price-list/#id-photo`）才能正確跳轉

**5. 相關文章內部連結**
- 在 `src/blog/korean-id.njk` 加入「延伸閱讀」
- 在 `src/blog/couples.njk` 和 `src/blog/family.njk` 加入「延伸閱讀」
- 連結到對應的服務頁面

### 從服務頁連結到其他頁面

**1. 預約頁面**
- 主 CTA 連結到 `/booking/`

**2. 價目表頁面**
- 次 CTA 連結到 `/price-list/` 或 `/price-list/#id-photo`（證件照頁面）
- 次 CTA 連結到 `/price-list/` 或 `/price-list/#group-photo`（合照頁面）

**3. 作品集**
- 連結到首頁 portfolio 區塊

**4. 相關服務**
- 證件照頁面可連結到形象照頁面（如果存在）
- 合照頁面可連結到個人形象照頁面（如果存在）

---

## 實施優先級

### Phase 1: 核心頁面建立（高優先級）
1. ✅ 建立 `src/services/` 目錄
2. ✅ 建立 `src/services/id-photo.njk`（韓式證件照服務頁）
3. ✅ 建立 `src/services/group-photo.njk`（合照服務頁）

### Phase 2: 內容優化（中優先級）
4. ✅ 優化圖片 Alt 文字
5. ✅ 加入客戶見證和社會證明
6. ✅ 加入內部連結

### Phase 3: 樣式優化（低優先級）
7. ✅ 建立頁面專屬樣式（如需要）
8. ✅ 優化響應式設計

### Phase 4: 價目表錨點設定（中優先級）
9. ✅ 在 `src/price-list.njk` 中為價格區塊添加 `id` 屬性
   - 韓式證件照區塊：`id="id-photo"`
   - 合照區塊：`id="group-photo"`

---

## 成功指標（KPI）

### SEO 指標
- 「證件照」和「合照」相關關鍵字搜尋排名提升
- 服務頁面的 organic traffic 成長
- 從工具頁到服務頁面的轉化率

### 轉化指標
- 從服務頁面到預約頁面的轉化率
- 服務頁面的停留時間與跳出率
- 內部連結的點擊率

### 用戶體驗指標
- 導覽列「服務」選單的使用率
- 服務頁面的滾動深度
- CTA 按鈕的點擊率

---

---

## 技術實作檢查清單

### 前置準備
- [ ] 確認 `src/services/` 目錄存在（如不存在需建立）
- [ ] 確認所有圖片資源路徑正確（`content/blog/`, `content/price-list/`, `portfolio/`）
- [ ] 確認客戶見證內容已準備（文字內容）

### 頁面實作
- [ ] 建立 `src/services/id-photo.njk`（韓式證件照服務頁）
- [ ] 建立 `src/services/group-photo.njk`（合照服務頁）
- [ ] 確認 front matter 設定正確（title, seo, pageStyles）
- [ ] 確認所有按鈕使用正確類別（`button button--primary`）

### 組件使用
- [ ] 確認 `.step-list` 使用正確 HTML 結構（`<ol>` + `<h3>` + `<p>`）
- [ ] 確認 `.card--testimonial` 結構正確
- [ ] 確認圖片使用 `r2img` filter

### 連結設定
- [ ] 在 `src/price-list.njk` 中添加錨點 ID（`id="id-photo"`, `id="group-photo"`）
- [ ] 更新導覽列「服務」選單（`src/_includes/partials/navigation.njk`）
- [ ] 在相關 blog 頁面加入「延伸閱讀」區塊

### SEO 優化
- [ ] 確認每個頁面都有唯一的 title 和 description
- [ ] 確認圖片 alt 文字包含關鍵字
- [ ] 確認 canonical URL 自動生成（已在 base-layout.njk 中實作）

### 樣式（可選）
- [ ] 如需要，建立 `_p-service-id.scss` 和 `_p-service-group.scss`
- [ ] 確認頁面專屬樣式正確導入（使用 `pageStyles` front matter）

---

**最後更新：** 2025-01  
**計劃狀態：** Planning → Ready for Implementation  
**技術審查：** ✅ 已完成

