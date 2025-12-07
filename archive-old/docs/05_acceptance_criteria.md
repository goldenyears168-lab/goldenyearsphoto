# Acceptance Criteria (Gherkin Format)
## 好時有影 - 專業攝影工作室網站

**版本**: 1.0  
**日期**: 2024-11  
**格式**: Gherkin (Given/When/Then)

---

## 5.1 Critical Flows

### Scenario 1: 訪客瀏覽首頁並查看作品集

```gherkin
Scenario: 訪客進入首頁並瀏覽作品集
  Given 訪客在瀏覽器中開啟首頁 (https://goldenyearsphoto.com/)
  When 頁面完全載入
  Then 應該顯示 Header，包含 Logo 和導覽選單
  And 應該顯示 Hero section，包含主標題 "好時有影"
  And 應該顯示兩個 CTA 按鈕："立即預約" 和 "查看價目"
  And 應該顯示作品集篩選器，預設選中 "韓式證件照"
  And 應該只顯示 "韓式證件照" 分類的作品（其他分類隱藏）
  And 作品圖片應該使用 lazy loading（除了 Hero 圖片）
  And 所有圖片應該有 alt 文字

  When 訪客點擊 "專業形象照" 篩選按鈕
  Then "專業形象照" 按鈕應該變為 active 狀態
  And "韓式證件照" 按鈕應該變為 inactive 狀態
  And 應該只顯示 "專業形象照" 分類的作品
  And URL hash 應該更新為 "#filter=linkedin-portrait"
  And 其他分類的作品應該隱藏（hidden 屬性）

  When 訪客點擊 "立即預約" 按鈕
  Then 應該導航到預約選擇頁面 (/booking/)
  And URL 應該正確更新
```

---

### Scenario 2: 訪客查看價目表並預約

```gherkin
Scenario: 訪客查看價目表並開始預約流程
  Given 訪客在價目表頁面 (/price-list/)
  When 頁面完全載入
  Then 應該顯示頁面標題 "服務項目與價目表"
  And 應該顯示至少一個服務卡片（例如：韓式證件照）
  And 每個服務卡片應該包含：
    | 服務名稱 |
    | 價格（數字和單位） |
    | 服務包含項目列表 |
    | 升級選項列表（如適用） |
    | 範例圖片（至少一張） |
  And 價格應該以新台幣顯示（例如："優惠 $399 /張"）

  When 訪客點擊頁面上的 "立即預約" 按鈕（如存在）
  Then 應該導航到預約選擇頁面 (/booking/)
  And URL 應該正確更新

  When 訪客點擊導覽選單中的 "預約" 連結
  Then 應該導航到預約選擇頁面 (/booking/)
```

---

### Scenario 3: 訪客選擇分店並完成預約

```gherkin
Scenario: 訪客選擇分店並進入預約系統
  Given 訪客在預約選擇頁面 (/booking/)
  When 頁面完全載入
  Then 應該顯示頁面標題 "選擇分店"
  And 應該顯示兩個分店卡片：
    | 中山店 |
    | 公館店 |
  And 每個分店卡片應該包含：
    | 分店圖片 |
    | 分店名稱（標題） |
    | 分店描述文字 |
    | 預約按鈕或整個卡片可點擊 |
  And 每個分店卡片應該有明確的視覺區分

  When 訪客點擊 "中山店" 卡片
  Then 應該導航到中山店預約頁面 (/booking/zhongshan/)
  And URL 應該正確更新

  When 訪客在中山店預約頁面
  Then 應該顯示頁面標題包含 "中山店"
  And 應該顯示分店地址和交通資訊（如適用）
  And 應該顯示外部預約系統（iframe 或直接連結）
  And 如果使用 iframe，應該有載入狀態提示
  And 如果 iframe 載入失敗，應該顯示錯誤訊息和替代聯繫方式
```

---

### Scenario 4: 訪客瀏覽作品集分類頁面

```gherkin
Scenario: 訪客瀏覽特定分類的作品集頁面
  Given 訪客在作品集分類頁面（例如：/blog/graduation/）
  When 頁面完全載入
  Then 應該顯示頁面標題（例如："畢業照"）
  And 應該顯示該分類的作品網格
  And 每個作品項目應該包含：
    | 圖片（lazy loading） |
    | Alt 文字 |
  And 作品圖片應該使用 R2 CDN（如果已設定）或本地 fallback
  And 如果圖片載入失敗，應該顯示預設佔位圖或錯誤訊息

  When 訪客點擊頁面上的 "立即預約" 按鈕（如存在）
  Then 應該導航到預約選擇頁面 (/booking/)
```

---

### Scenario 5: 訪客使用行動裝置瀏覽

```gherkin
Scenario: 訪客在行動裝置上使用導覽選單
  Given 訪客在行動裝置上（螢幕寬度 < 992px）
  And 訪客在任何頁面
  When 頁面完全載入
  Then 應該顯示漢堡選單按鈕（而非完整導覽選單）
  And 導覽選單應該隱藏（hidden 屬性）

  When 訪客點擊漢堡選單按鈕
  Then 導覽選單應該展開（從側邊滑入或從上方展開）
  And 漢堡選單按鈕的 aria-expanded 應該變為 "true"
  And 導覽選單的 hidden 屬性應該移除
  And 背景可能變暗（overlay，如適用）

  When 訪客點擊導覽選單中的連結
  Then 應該導航到目標頁面
  And 導覽選單應該自動關閉
  And 導覽選單的 hidden 屬性應該恢復

  When 訪客點擊導覽選單外部區域
  Then 導覽選單應該關閉
  And 導覽選單的 hidden 屬性應該恢復

  When 訪客按下 Esc 鍵
  Then 導覽選單應該關閉
  And 導覽選單的 hidden 屬性應該恢復
```

---

### Scenario 6: 訪客閱讀 FAQ

```gherkin
Scenario: 訪客閱讀常見問題
  Given 訪客在 FAQ 頁面 (/guide/faq/)
  When 頁面完全載入
  Then 應該顯示頁面標題 "常見問題"
  And 應該顯示至少一個 FAQ 項目
  And 每個 FAQ 項目應該包含：
    | 問題按鈕（可點擊） |
    | 答案內容（預設收合） |

  When 訪客點擊第一個問題按鈕
  Then 該問題的答案應該展開（滑動動畫）
  And 問題按鈕的圖示應該改變（例如：+ 變為 -）
  And 問題按鈕的 aria-expanded 應該變為 "true"

  When 訪客再次點擊同一個問題按鈕
  Then 答案應該收合
  And 問題按鈕的 aria-expanded 應該變為 "false"

  When 訪客使用 Tab 鍵導覽到問題按鈕
  And 按下 Enter 或 Space 鍵
  Then 答案應該展開或收合（根據當前狀態）
```

---

### Scenario 7: 圖片載入和錯誤處理

```gherkin
Scenario: 圖片載入成功和失敗處理
  Given 訪客在任何包含圖片的頁面
  When 頁面開始載入
  Then Hero 圖片應該使用 loading="eager"（優先載入）
  And 其他圖片應該使用 loading="lazy"（延遲載入）

  When 圖片進入視窗（lazy loading 觸發）
  Then 圖片應該開始載入
  And 圖片來源應該是 R2 CDN URL（如果 R2_PUBLIC_BASE_URL 已設定）
  Or 圖片來源應該是本地 assets/images 路徑（如果 R2 未設定）

  When 圖片載入成功
  Then 圖片應該正常顯示
  And 不應該顯示錯誤訊息

  When 圖片載入失敗（404、網路錯誤等）
  Then 應該顯示預設佔位圖或錯誤訊息
  And 不應該影響其他圖片的顯示
  And 不應該導致頁面功能失效
```

---

### Scenario 8: 鍵盤無障礙導覽

```gherkin
Scenario: 訪客使用鍵盤導覽網站
  Given 訪客在任何頁面
  When 訪客使用 Tab 鍵導覽
  Then 所有可互動元素應該有清晰的焦點指示（focus outline）
  And Tab 順序應該符合邏輯順序（從上到下，從左到右）

  When 訪客在篩選按鈕上按下 Enter 或 Space 鍵
  Then 篩選應該觸發（如同點擊）
  And 作品集應該更新顯示

  When 訪客在導覽選單開啟時按下 Esc 鍵
  Then 導覽選單應該關閉
  And 焦點應該返回到漢堡選單按鈕

  When 訪客在 FAQ 問題按鈕上按下 Enter 或 Space 鍵
  Then 答案應該展開或收合
```

---

### Scenario 9: 外部預約系統整合

```gherkin
Scenario: 外部預約系統載入和錯誤處理
  Given 訪客在分店預約頁面（例如：/booking/zhongshan/）
  When 頁面完全載入
  Then 應該顯示外部預約系統（iframe 或直接連結）
  And 如果使用 iframe，應該有載入狀態提示（如適用）

  When iframe 開始載入
  Then 應該顯示載入中狀態（spinner 或文字提示）

  When iframe 載入成功
  Then 載入狀態應該消失
  And 預約系統應該正常顯示和運作

  When iframe 載入失敗（超時 > 10 秒或 HTTP 錯誤）
  Then 應該顯示錯誤訊息："預約系統暫時無法使用，請稍後再試或聯繫我們"
  And 應該提供替代聯繫方式：
    | 電話號碼（如適用） |
    | Email 地址 |
    | Facebook Messenger 連結（如適用） |
  And 錯誤訊息應該清晰可見，不應該被隱藏
```

---

### Scenario 10: 響應式設計

```gherkin
Scenario: 網站在不同裝置上正確顯示
  Given 訪客使用桌面裝置（螢幕寬度 >= 992px）
  When 訪客瀏覽任何頁面
  Then 導覽選單應該水平排列，所有連結可見
  And 不應該顯示漢堡選單按鈕
  And 內容應該使用多欄佈局（如適用）
  And 圖片和文字應該有適當的間距和對齊

  Given 訪客使用平板裝置（螢幕寬度 768px - 991px）
  When 訪客瀏覽任何頁面
  Then 導覽選單應該顯示漢堡選單按鈕
  And 內容應該使用 2 欄佈局（如適用）
  And 所有內容應該可讀取，不應該被截斷

  Given 訪客使用行動裝置（螢幕寬度 < 768px）
  When 訪客瀏覽任何頁面
  Then 導覽選單應該顯示漢堡選單按鈕
  And 內容應該使用單欄佈局
  And 所有按鈕和連結應該有足夠的點擊區域（至少 44x44px）
  And 文字應該可讀取，不需要縮放
  And 圖片應該響應式縮放，不應該溢出容器
```

---

## 5.2 Performance Criteria

### Scenario 11: 頁面載入效能

```gherkin
Scenario: 首頁載入效能符合目標
  Given 訪客在 4G 網路環境下
  When 訪客開啟首頁
  Then First Contentful Paint (FCP) 應該 < 1.8 秒
  And Largest Contentful Paint (LCP) 應該 < 2.5 秒
  And Time to First Meaningful Content (FMC) 應該 < 1.5 秒
  And 總頁面大小應該 < 2 MB（未壓縮）
  And 圖片總大小應該 < 1.5 MB（壓縮後）

  When 訪客在 3G 網路環境下
  Then FCP 應該 < 3 秒
  And LCP 應該 < 4 秒
```

---

### Scenario 12: 圖片優化

```gherkin
Scenario: 圖片正確優化和載入
  Given 訪客在任何包含圖片的頁面
  When 頁面載入
  Then 所有圖片應該使用適當的格式（JPEG、WebP 等）
  And 圖片應該經過壓縮（品質 70-80%）
  And 圖片寬度應該不超過 1200px（R2 上傳時）
  And 圖片應該有適當的 sizes 屬性（響應式圖片）
  And 非首屏圖片應該使用 lazy loading
```

---

## 5.3 SEO Criteria

### Scenario 13: SEO 基礎設定

```gherkin
Scenario: 頁面包含正確的 SEO 元素
  Given 訪客在任何頁面
  When 頁面完全載入
  Then <title> 標籤應該存在且包含頁面標題和品牌名稱
  And <meta name="description"> 應該存在且長度在 120-160 字元
  And 應該有至少一個 <h1> 標籤
  And 所有圖片應該有 alt 文字
  And 應該有語義化 HTML 結構（<header>, <main>, <footer> 等）

  Given 訪客在首頁
  Then sitemap.xml 應該可訪問 (/sitemap.xml)
  And robots.txt 應該可訪問 (/robots.txt)
```

---

**文件維護者**: 開發團隊  
**最後更新**: 2024-11

