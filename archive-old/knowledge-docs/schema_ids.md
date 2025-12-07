# 知識庫 ID 一覽表

本文檔定義所有在知識庫系統中使用的合法 ID。所有 JSON 檔案中的 ID 引用都必須在此文件中定義。

**最後更新：** 2025-01-01

---

## Service Types（服務類型）

- `headshot_korean`: 韓式證件照
- `portrait_pro`: 專業形象照
- `portrait_grad_personal`: 個人寫真／畢業寫真
- `group_family`: 多人合照／全家福
- `workshop_challenge`: 挑戰「一日攝影師」體驗工作坊

---

## Personas（客戶角色）

- `student_graduating`: 準畢業生（大學／碩士）
- `pro_switching_job`: 轉職菁英（工程師／顧問／律師等）
- `family_keeper`: 家庭主理人（爸爸／媽媽／長輩）
- `hr_corporate`: 企業福委／人資窗口

---

## Use Cases（用途）

- `linkedin_resume`: 履歷/LinkedIn/求職
- `official_document`: 證件/官方用途（護照、簽證、身分證）
- `memorial`: 紀念/生日/畢業
- `social_media`: 社群/個人品牌/自媒體
- `family_couple`: 家庭/情侶/親子

---

## Branches（分店）

- `zhongshan`: 中山店
- `gongguan`: 公館店

---

## Booking Actions（預約行為）

- `book`: 預約
- `reschedule`: 改期
- `cancel`: 取消

---

## FAQ Categories（FAQ 分類）

- `flow`: 流程
- `price`: 價格
- `policy`: 政策
- `general_info`: 基本資訊
- `booking`: 預約（簡化分類）
- `booking_scheduling`: 預約與改期
- `pricing`: 價格、費用、付款
- `payment`: 付款方式
- `shooting_experience`: 拍攝流程與體驗
- `makeup_styling`: 造型、妝髮、服裝
- `retouching`: 修圖與後製
- `delivery`: 作品交件與檔案
- `privacy`: 隱私（簡化分類）
- `privacy_rights`: 授權與隱私
- `refund`: 退費
- `special_services`: 特殊拍攝服務
- `corporate_b2b`: 企業與商業合作
- `emotion_layer`: 情緒安撫與信任建立
- `positioning`: 比較與差異化
- `error_recovery`: 例外狀況與補救

---

## Intent Types（意圖類型）

- `greeting`: 打招呼
- `service_inquiry`: 服務諮詢
- `price_inquiry`: 價格詢問
- `booking_inquiry`: 預約相關
- `comparison`: 方案比較
- `complaint`: 抱怨/投訴
- `handoff_to_human`: 轉真人
- `goodbye`: 結束對話

---

## 使用規則

1. **所有 ID 必須小寫，使用底線分隔**
2. **新增 ID 時必須更新此文件**
3. **所有 JSON 檔案中的 ID 引用必須通過 referential integrity check**
4. **ID 一旦定義，不應隨意變更，以保持向後相容性**

---

## 驗證

執行 `npm run validate-knowledge` 會自動檢查所有 JSON 檔案中的 ID 是否在此文件中定義。

