# 頁首統一設計規劃文件

## 📋 專案概述

本文件規劃將「帶有溫度的手寫字體」、「鋼印/郵戳效果」與「精緻襯線體」三大核心設計元素，統一應用到首頁之外的所有頁面，建立一致的品牌視覺語言。

---

## 🎨 核心設計元素

### 1. 手寫字體（La Belle Aurore）
- **用途**：頁碼編號、簽名、裝飾性文字
- **效果**：模擬攝影師在底片上親手寫下編號的溫度感
- **應用位置**：
  - Wayfinding Tag 中的編號（如 "01", "02"）
  - 簽名區塊（如 "Golden Years Studio"）
  - 裝飾性手寫註記（如 "Our Story..."）

### 2. 鋼印/郵戳效果（Embossed Stamp）
- **設計**：極簡圓形或方形印章
- **內容**：包含 "EST. 2026" 或 "TAIPEI"
- **樣式**：
  - 圓形邊框（1px solid #94A3B8）
  - 內部虛線圓圈（dashed border）
  - 輕微旋轉（-15deg）
  - 低透明度（opacity: 0.6）
  - 混合模式（mix-blend-mode: multiply）
- **位置**：header 右上角（桌面版顯示，行動版隱藏）

### 3. 精緻襯線體（Playfair Display）
- **用途**：導航標籤、Wayfinding Tag、副標題
- **效果**：博物館展品標籤質感
- **特點**：
  - 寬字距（letter-spacing）
  - 斜體變體用於強調
  - 搭配手寫字體形成層次

### 4. Journey Divider（旅程分隔線）
- **設計**：虛線分隔線，兩端有圓形缺口
- **隱喻**：登機證/票根的分隔線
- **樣式**：
  - 重複虛線圖案（repeating-linear-gradient）
  - 兩端圓形缺口（journey-notch）

---

## 📐 三種 Header 類型

### TYPE A: Standard Center Header（標準置中標題）
**適用頁面**：
- ✅ `price-list.njk` - 服務價目表
- ✅ `guide/faq.njk` - 常見問題
- ✅ `guide/crop-tool.njk` - 裁切工具（如適用）
- ✅ `guide/identity-test.njk` - 形象測試（如適用）
- ✅ `services/*.njk` - 服務介紹頁（形象照、證件照、團體照）

**設計特點**：
- 置中對齊
- Wayfinding Tag（Section No. + 手寫編號）
- 主標題（大號粗體）
- 副標題描述
- 右上角鋼印裝飾
- Journey Divider 分隔線

**範例結構**：
```html
<header class="relative pt-32 pb-16 overflow-hidden">
  <!-- Background Glow -->
  <!-- Decorative Stamp -->
  <!-- Center Content: Wayfinding Tag + Title + Description -->
  <!-- Journey Divider -->
</header>
```

---

### TYPE B: Story Header（故事型標題）
**適用頁面**：
- ✅ `about.njk` - 關於我們/團隊介紹
- ✅ `blog/index.njk` - 部落格首頁（如適用）
- ✅ `blog/*.njk` - 各類作品集頁面（可選，視內容決定）

**設計特點**：
- 左右分欄（文字 + 視覺）
- 手寫裝飾註記（如 "Our Story..."）
- 左側文字區：Wayfinding Tag + 主標題 + 描述 + 簽名
- 右側視覺區：圖片 + 照片角貼紙效果
- 背景漸層裝飾

**範例結構**：
```html
<header class="relative pt-32 pb-16 overflow-hidden">
  <!-- Background Gradient -->
  <!-- Grid Layout: Text Side + Visual Side -->
  <!-- Handwritten Note -->
  <!-- Journey Divider -->
</header>
```

---

### TYPE C: Action Header（行動呼籲型標題）
**適用頁面**：
- ✅ `booking/index.njk` - 選擇分店
- ✅ `booking/zhongshan.njk` - 中山店預約
- ✅ `booking/gongguan.njk` - 公館店預約
- ✅ `guide/makeup-and-hair.njk` - 妝髮服務（帶 CTA 按鈕）

**設計特點**：
- 置中對齊
- 位置標籤（Select Location / 帶動態指示器）
- 主標題
- 副標題描述
- CTA 按鈕組（如適用）
- 手寫箭頭裝飾（->）

**範例結構**：
```html
<header class="relative pt-32 pb-12 overflow-hidden">
  <!-- Wayfinding Tag: Location Badge -->
  <!-- Center Content: Title + Description -->
  <!-- CTA Buttons (if applicable) -->
</header>
```

---

## 📝 頁面分類清單

### TYPE A: Standard Center Header
| 頁面路徑 | 頁面名稱 | 狀態 |
|---------|---------|------|
| `src/price-list.njk` | 服務價目表 | ✅ 需更新 |
| `src/guide/faq.njk` | 常見問題 | ✅ 需更新 |
| `src/guide/crop-tool.njk` | 裁切工具 | ⚠️ 需確認 |
| `src/guide/identity-test.njk` | 形象測試 | ⚠️ 需確認 |
| `src/services/portrait.njk` | 專業形象照 | ✅ 需更新 |
| `src/services/id-photo.njk` | 韓式證件照 | ✅ 需更新 |
| `src/services/group-photo.njk` | 團體照 | ✅ 需更新 |

### TYPE B: Story Header
| 頁面路徑 | 頁面名稱 | 狀態 |
|---------|---------|------|
| `src/about.njk` | 關於我們 | ✅ 需更新 |
| `src/blog/index.njk` | 部落格首頁 | ⚠️ 需確認 |

### TYPE C: Action Header
| 頁面路徑 | 頁面名稱 | 狀態 |
|---------|---------|------|
| `src/booking/index.njk` | 選擇分店 | ✅ 需更新 |
| `src/booking/zhongshan.njk` | 中山店預約 | ✅ 需更新 |
| `src/booking/gongguan.njk` | 公館店預約 | ✅ 需更新 |
| `src/guide/makeup-and-hair.njk` | 妝髮服務 | ✅ 需更新 |

### 待確認頁面
| 頁面路徑 | 頁面名稱 | 建議類型 | 備註 |
|---------|---------|---------|------|
| `src/blog/couples.njk` | 情侶寫真 | TYPE A 或 TYPE B | 視內容決定 |
| `src/blog/family.njk` | 全家福 | TYPE A 或 TYPE B | 視內容決定 |
| `src/blog/graduation.njk` | 畢業照 | TYPE A 或 TYPE B | 視內容決定 |
| `src/blog/korean-id.njk` | 韓式證件照作品 | TYPE A | 作品展示頁 |
| `src/blog/medical.njk` | 醫療照 | TYPE A | 作品展示頁 |
| `src/blog/pet.njk` | 寵物照 | TYPE A | 作品展示頁 |
| `src/blog/profile.njk` | 形象照作品 | TYPE A | 作品展示頁 |
| `src/blog/workshop.njk` | 工作坊 | TYPE A 或 TYPE C | 視內容決定 |

---

## 🛠️ 實施步驟

### Phase 1: 基礎設施準備

#### 1.1 更新 Google Fonts 引入
**檔案**：`src/_includes/base-layout.njk`

**變更**：
- 確認已引入 `La Belle Aurore`（手寫字體）
- 新增 `Playfair Display`（襯線體）
- 更新字體連結

**預期結果**：
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=La+Belle+Aurore&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

#### 1.2 新增 CSS 樣式類別
**檔案**：`src/assets/css/main.css`

**需新增的樣式**：
1. `.artisan-stamp` - 鋼印效果
2. `.journey-divider` - 旅程分隔線
3. `.journey-notch` - 分隔線缺口
4. `.font-hand` - 手寫字體類別（如未存在）
5. `.font-serif` - 襯線體類別（如未存在）

**樣式範例**：
```css
/* The Artisan Stamp */
.artisan-stamp {
  border: 1px solid #94A3B8;
  color: #94A3B8;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transform: rotate(-15deg);
  opacity: 0.6;
  mix-blend-mode: multiply;
  position: absolute;
}
.artisan-stamp::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px dashed #94A3B8;
  border-radius: 50%;
}

/* The Journey Divider */
.journey-divider {
  position: relative;
  height: 1px;
  width: 100%;
  background-image: repeating-linear-gradient(to right, #E2DCD3 0, #E2DCD3 8px, transparent 8px, transparent 16px);
}
.journey-notch {
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: #FDFBF7;
  border: 1px solid #E2DCD3;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}
.journey-notch.left { left: -12px; }
.journey-notch.right { right: -12px; }
```

#### 1.3 建立 Header Macros（可選）
**檔案**：`src/_includes/macros/header-standard.njk`（TYPE A）
**檔案**：`src/_includes/macros/header-story.njk`（TYPE B）
**檔案**：`src/_includes/macros/header-action.njk`（TYPE C）

**優點**：
- 統一管理 header 結構
- 減少重複程式碼
- 易於維護與更新

**缺點**：
- 需要重構現有頁面
- 可能影響現有樣式

**建議**：先直接在各頁面實作，確認設計無誤後再考慮抽取為 macro。

---

### Phase 2: 頁面更新（依優先順序）

#### 2.1 高優先級頁面（核心功能頁）

**2.1.1 `price-list.njk` - TYPE A**
- 移除現有 hero section
- 套用 TYPE A header
- 設定 Wayfinding Tag: "Section No. 01"
- 更新主標題與描述
- 加入鋼印裝飾
- 加入 Journey Divider

**2.1.2 `booking/index.njk` - TYPE C**
- 移除現有 hero section
- 套用 TYPE C header
- 更新位置標籤樣式
- 保留 CTA 按鈕（可優化樣式）

**2.1.3 `about.njk` - TYPE B**
- 移除現有 hero section
- 套用 TYPE B header
- 加入手寫裝飾註記
- 右側視覺區（團隊照片或品牌視覺）
- 加入簽名區塊

**2.1.4 `guide/faq.njk` - TYPE A**
- 移除現有 hero section
- 套用 TYPE A header
- 設定 Wayfinding Tag: "Section No. 02"（或適當編號）

#### 2.2 中優先級頁面

**2.2.1 `booking/zhongshan.njk` - TYPE C**
- 套用 TYPE C header
- 調整為單一分店預約頁樣式

**2.2.2 `booking/gongguan.njk` - TYPE C**
- 套用 TYPE C header
- 調整為單一分店預約頁樣式

**2.2.3 `guide/makeup-and-hair.njk` - TYPE C**
- 套用 TYPE C header
- 保留 CTA 按鈕組

**2.2.4 `services/*.njk` - TYPE A**
- 各服務頁面統一套用 TYPE A
- 依服務類型設定不同編號

#### 2.3 低優先級頁面（待確認）

**2.3.1 Blog 系列頁面**
- 依內容性質決定 TYPE A 或 TYPE B
- 作品展示頁建議使用 TYPE A
- 故事性內容建議使用 TYPE B

---

### Phase 3: 細節優化

#### 3.1 響應式設計
- 確認行動版鋼印隱藏（`hidden md:flex`）
- 確認手寫註記在行動版隱藏或調整位置
- 測試 Journey Divider 在窄螢幕的顯示

#### 3.2 動畫與互動
- 鋼印可考慮加入輕微 hover 效果（可選）
- CTA 按鈕的手寫箭頭動畫（`group-hover:opacity-100`）

#### 3.3 無障礙設計
- 確認所有文字有足夠對比度
- 鋼印裝飾使用 `aria-hidden="true"`（純裝飾）
- 手寫字體需確保可讀性

---

## 🎯 設計規範

### 顏色系統
- **背景漸層**：`bg-dawn-gradient`（radial-gradient，中心淡藍到透明）
- **鋼印顏色**：`#94A3B8`（slate-400）
- **分隔線顏色**：`#E2DCD3`（sand-200）
- **文字主色**：`#020617`（trust-950）
- **文字副色**：`#64748B`（slate-500）

### 字體系統
- **主標題**：Plus Jakarta Sans / Noto Sans TC（粗體）
- **Wayfinding Tag**：Playfair Display（襯線體，斜體）
- **手寫編號**：La Belle Aurore
- **描述文字**：Plus Jakarta Sans / Noto Sans TC（正常）

### 間距系統
- **Header Padding Top**：`pt-32`（128px）
- **Header Padding Bottom**：`pb-16`（TYPE A/B）或 `pb-12`（TYPE C）
- **內容最大寬度**：`max-w-4xl`（TYPE A/C）或 `max-w-6xl`（TYPE B）

---

## ✅ 檢查清單

### 設計一致性
- [ ] 所有頁面使用相同的字體系統
- [ ] 鋼印樣式統一（大小、位置、旋轉角度）
- [ ] Journey Divider 樣式統一
- [ ] Wayfinding Tag 格式統一

### 功能完整性
- [ ] 所有連結正常運作
- [ ] CTA 按鈕功能正常
- [ ] 響應式設計在各裝置正常顯示
- [ ] 無 JavaScript 錯誤

### 效能優化
- [ ] 字體載入優化（preconnect、display=swap）
- [ ] CSS 樣式已內聯或優化載入
- [ ] 圖片使用適當的 loading 屬性

### 無障礙性
- [ ] 文字對比度符合 WCAG AA 標準
- [ ] 裝飾性元素使用 `aria-hidden`
- [ ] 語義化 HTML 結構

---

## 📌 注意事項

1. **首頁不變**：本規劃僅適用於首頁（`index.njk`）之外的頁面，首頁保持現有設計。

2. **向後兼容**：更新時需確保不破壞現有功能與樣式，建議先在小範圍頁面測試。

3. **內容優先**：設計應服務於內容，若某些頁面內容不適合特定 header 類型，可彈性調整。

4. **漸進式實施**：建議分階段實施，先完成高優先級頁面，確認無誤後再擴展至其他頁面。

5. **測試環境**：每次更新後需在開發環境完整測試，確認無視覺或功能問題。

---

## 🔄 後續優化建議

1. **Macro 化**：確認設計穩定後，可考慮將三種 header 類型抽取為 Nunjucks macros，提升維護性。

2. **動態編號**：Wayfinding Tag 的編號可考慮透過 front matter 或 data 檔案管理，避免手動維護。

3. **A/B 測試**：可針對不同 header 類型進行使用者測試，收集回饋後優化。

4. **設計系統文件**：建立完整的設計系統文件，記錄所有設計決策與使用規範。

---

## 📚 參考資源

- [Google Fonts - La Belle Aurore](https://fonts.google.com/specimen/La+Belle+Aurore)
- [Google Fonts - Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- 設計範例 HTML（用戶提供的參考檔案）

---

**文件版本**：v1.0  
**建立日期**：2025-01-XX  
**最後更新**：2025-01-XX

