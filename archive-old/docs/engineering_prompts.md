# 好時有影 AI 客服機器人 - 工程開發提示詞集

本文檔包含 10 個完整的工程開發提示詞，用於從零開始構建完整的 AI 客服機器人系統。

**前置條件：**
- 已閱讀 `docs/webchatbotknowledge.md`（知識庫）
- 已閱讀 `docs/webchatbotplan.md`（前端規格與後端指南）
- 已取得 Gemini API Key：`AIzaSyBq3ZQtJRnX2uguFn62ya7N6onpI4-ZUmE`

---

## 提示詞 1：後端 API 基礎架構搭建

**任務目標：** 建立 Node.js 後端服務，實現 `/api/chat` 端點，完成基礎的請求/回應流程。

**技術棧：**
- Node.js 18+ / Express.js 或 Fastify
- TypeScript（建議）
- 部署平台：Vercel / Cloudflare Workers / Railway

**實現要求：**

1. **建立專案結構：**
   ```
   backend/
   ├── src/
   │   ├── routes/
   │   │   └── chat.ts          # /api/chat 路由
   │   ├── services/
   │   │   ├── llm.ts           # LLM 服務封裝
   │   │   └── knowledge.ts     # 知識庫載入
   │   ├── utils/
   │   │   └── context.ts       # 對話上下文管理
   │   └── index.ts             # 入口文件
   ├── knowledge/               # 知識庫 JSON 文件
   ├── package.json
   └── tsconfig.json
   ```

2. **實現 `/api/chat` 端點：**
   - 接收 POST 請求，格式：
     ```json
     {
       "message": "使用者輸入的文字",
       "mode": "auto | decision_recommendation | faq_flow_price",
       "pageType": "home | qa",
       "conversationId": "optional-uuid",
       "context": {
         "last_intent": "optional",
         "slots": {
           "service_type": "optional",
           "use_case": "optional",
           "persona": "optional"
         }
       }
     }
     ```
   - 回應格式：
     ```json
     {
       "reply": "AI 回覆文字",
       "intent": "greeting | service_inquiry | ...",
       "updatedContext": { ... },
       "suggestedQuickReplies": ["選項1", "選項2"]
     }
     ```

3. **環境變數設定：**
   - `GEMINI_API_KEY`：從環境變數讀取
   - `NODE_ENV`：開發/生產環境

4. **錯誤處理：**
   - API 錯誤回傳 500，包含友善錯誤訊息
   - 請求驗證失敗回傳 400
   - 所有 4xx/5xx 錯誤記錄到日誌
   - 嚴重錯誤（500、連續 429）觸發告警

5. **Rate Limiting（防濫用）：**
   - 使用 `express-rate-limit` 或 `@upstash/ratelimit`
   - 設定：60 requests / 10 minutes per IP
   - 超過限制回傳 429 狀態碼與友善訊息
   - 記錄所有 rate limit 觸發事件

6. **請求驗證：**
   - 驗證 Origin header（允許官網域名）
   - 驗證請求格式（JSON schema validation）
   - 可選：加入簡單的 API token 驗證

7. **日誌與監控：**
   - 建立統一的錯誤處理中間件
   - 記錄所有 API 請求（IP、時間、狀態碼）
   - 嚴重錯誤發送告警（可整合 Sentry 或自建系統）

**新增檔案：**
- `backend/src/middleware/rateLimit.ts` - Rate limiting 中間件
- `backend/src/middleware/validateRequest.ts` - 請求驗證中間件
- `backend/src/middleware/errorHandler.ts` - 統一錯誤處理
- `backend/src/utils/logger.ts` - 錯誤日誌記錄

**驗收標準：**
- [ ] 可以成功啟動服務
- [ ] `/api/chat` 端點可以接收 POST 請求
- [ ] 回傳格式符合規格
- [ ] 基本錯誤處理已實現
- [ ] Rate limiting 已實現（60 req/10min per IP）
- [ ] 請求驗證已實現（Origin、JSON schema）
- [ ] 錯誤日誌記錄已實現

**參考文檔：** `docs/webchatbotplan.md` 第 6 節「前端 / 後端 API 約定」

---

## 提示詞 2：知識庫結構化轉換

**任務目標：** 將 `webchatbotknowledge.md` 中的結構化資料轉換為 JSON 格式，供後端程式讀取。

**技術棧：**
- Node.js 腳本（一次性轉換）
- JSON Schema 驗證（可選）

**實現要求：**

1. **建立知識庫 JSON 文件：**

   **`knowledge/services.json`** - 從 services 表轉換：
   ```json
   [
     {
       "id": "headshot_korean",
       "name": "韓式證件照",
       "name_en": "Korean Headshot",
       "one_line": "自然柔光、精緻修容，打造「The Same but Better」的韓系證件照",
       "target_audience": ["學生", "社會新鮮人"],
       "use_cases": ["護照", "身分證", "簽證"],
       "price_range": "約 NT$399 / 張",
       "shooting_time": "約 15 分鐘",
       "includes_makeup": false,
       "retouching_count": "依選購張數計算",
       "add_ons": ["妝髮服務", "急件處理"],
       "pros": ["高效率", "高合規", "修圖自然", "價格親民"],
       "not_suitable": ["無法接受嚴格儀容規範", "期待當天立刻拿到成品"]
     }
   ]
   ```

   **`knowledge/personas.json`** - 從 personas 表轉換：
   ```json
   [
     {
       "id": "student_graduating",
       "name": "準畢業生（大學／碩士）",
       "goals": ["做履歷／LinkedIn 頭像", "畢業／青春紀念"],
       "concerns": ["怕太貴", "怕拍出來太僵"],
       "budget_level": "中低",
       "recommended_services": ["headshot_korean", "portrait_grad_personal"],
       "reasoning": "韓式證件照能以學生友善價格處理各種正式證件需求..."
     }
   ]
   ```

   **`knowledge/faq.json`** - 從 faq_flow_price 表轉換：
   ```json
   [
     {
       "id": "flow_indoor_single",
       "category": "流程",
       "question": "一般個人棚內拍攝，從走進門到離開，大致流程是什麼？",
       "target_audience": "個人拍攝（證件照、形象照、寫真）",
       "answer": "1. 【接待與核對】進門後由店務助理接待...",
       "keywords": ["流程", "拍攝", "步驟", "當天"]
     }
   ]
   ```

   **`knowledge/contact_info.json`** - 聯絡方式：
   ```json
   {
     "email": "goldenyears166@gmail.com",
     "phone": {
       "zhongshan": "02-2709-2224",
       "gongguan": "02-2936-5460"
     },
     "ig": "@goldenyears_studio",
     "booking_link": "https://www.goldenyearsphoto.com/booking/",
     "branches": {
       "zhongshan": {
         "address": "台北市中山區南京東路1段10號4樓",
         "mrt": "近捷運中山站 2號出口",
         "hours": "週一～週日 10:00-12:30；14:00-18:30（不定期休）"
       },
       "gongguan": {
         "address": "台北市中正區汀州路三段160巷4號6樓",
         "mrt": "近捷運公館站 1號出口",
         "hours": "週一～週日 12:00~16:30；18:00-20:30（不定期休）"
       }
     }
   }
   ```

2. **建立知識庫載入服務：**
   - 實作 `services/knowledge.ts`，提供：
     - `getService(id: string)` - 取得服務資訊
     - `getPersona(id: string)` - 取得客戶角色
     - `searchFAQ(query: string)` - 搜尋 FAQ（先用關鍵字匹配）
     - `getContactInfo()` - 取得聯絡方式

2. **執行知識庫驗證：**
   - 使用 `npm run validate-knowledge` 驗證所有 JSON 檔案
   - 確保所有 ID 引用都在 `knowledge/schema_ids.md` 中定義
   - 檢查 referential integrity（推薦服務 ID、FAQ 分類等）

3. **JSON Schema 驗證（可選但建議）：**
   - 為每個 JSON 檔案定義 schema
   - 使用 `ajv` 或類似工具驗證結構
   - 確保必填欄位（version, last_updated）存在

**驗收標準：**
- [ ] 所有 JSON 文件格式正確
- [ ] 知識庫載入服務可以成功讀取所有資料
- [ ] 資料完整性驗證通過（無遺漏欄位）
- [ ] `npm run validate-knowledge` 通過（無錯誤）
- [ ] 所有 ID 引用都在 `schema_ids.md` 中定義
- [ ] 所有 JSON 檔案包含 `version` 和 `last_updated` 欄位

**參考文檔：** 
- `docs/客服知識庫 gemini.md` 第 1-3 節
- `knowledge/schema_ids.md` - ID 一覽表
- `scripts/validate-knowledge.mjs` - 驗證腳本

---

## 提示詞 3：意圖分類與實體提取系統

**任務目標：** 實現意圖分類（Intent Classification）和實體提取（Entity Extraction）功能。

**技術棧：**
- Gemini 1.5 Flash API（用於意圖分類）
- 規則引擎（關鍵字匹配作為輔助）

**實現要求：**

1. **建立實體詞典：**
   **`backend/entity_dictionary.json`**：
   ```json
   {
     "service_type": {
       "headshot_korean": ["證件照", "證照", "護照照", "簽證照", "headshot", "韓式"],
       "portrait_pro": ["形象照", "linkedin照", "履歷照", "職場照", "專業照"],
       "portrait_grad_personal": ["寫真", "個人寫真", "畢業寫真", "畢業照"],
       "group_family": ["全家福", "家庭照", "家庭合照", "朋友合照", "團體照"],
       "workshop_challenge": ["一日攝影師", "攝影體驗", "攝影課", "工作坊"]
     },
     "branch": {
       "zhongshan": ["中山店", "中山", "捷運中山", "赤峰"],
       "gongguan": ["公館店", "公館", "台大", "羅斯福路"]
     },
     "use_case": {
       "resume_linkedin": ["履歷", "LinkedIn", "求職", "面試", "轉職"],
       "official_document": ["護照", "簽證", "身分證", "駕照", "證照"],
       "memorial": ["紀念", "生日", "畢業", "紀錄", "里程碑"],
       "social_media": ["IG", "社群", "粉專", "個人品牌", "自媒體"],
       "family": ["全家福", "親子", "情侶", "家人", "小孩"]
     }
   }
   ```

2. **實現意圖分類函數：**
   **`services/intent_classifier.ts`**：
   - 使用 Gemini API 進行意圖分類
   - System Prompt 包含：
     - 意圖定義（greeting, service_inquiry, price_inquiry, booking_inquiry, comparison, complaint, handoff_to_human, goodbye）
     - Few-shot 範例
     - 輸出格式要求（JSON）
   - 回傳：`{ intent: string, confidence: number, entities: {...} }`

3. **實現實體提取函數：**
   **`services/entity_extractor.ts`**：
   - 先用規則引擎（關鍵字匹配）快速提取
   - 再用 LLM 進行上下文理解
   - 回傳提取的實體：`{ service_type?, use_case?, persona?, branch?, ... }`

4. **整合到 `/api/chat`：**
   - 在處理使用者訊息前，先執行意圖分類和實體提取
   - 將結果傳入後續的 LLM 生成流程

**驗收標準：**
- [ ] 可以正確識別 8 種意圖類型
- [ ] 實體提取準確率 > 80%
- [ ] 處理時間 < 2 秒

**參考文檔：** `docs/webchatbotknowledge.md` 第 4 節「意圖與實體映射」

---

## 提示詞 4：LLM 整合與回覆生成

**任務目標：** 整合 Gemini API，實現智能回覆生成功能。

**技術棧：**
- Google Generative AI SDK (`@google/generative-ai`)
- Gemini 1.5 Flash 模型

**實現要求：**

1. **建立 LLM 服務：**
   **`services/llm.ts`**：
   ```typescript
   import { GoogleGenerativeAI } from "@google/generative-ai";

   export class LLMService {
     private genAI: GoogleGenerativeAI;
     private model: GenerativeModel;

     constructor(apiKey: string) {
       this.genAI = new GoogleGenerativeAI(apiKey);
       this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
     }

     async generateReply(params: {
       message: string;
       intent: string;
       entities: Record<string, any>;
       context: ConversationContext;
       knowledge: KnowledgeBase;
       mode: string;
     }): Promise<string> {
       // 實現回覆生成邏輯
     }
   }
   ```

2. **建立 System Prompt（重要：必須包含以下約束）：**
   - 品牌定位：溫暖、專業、真誠、簡單
   - 語氣規則：朋友 + 顧問的混搭風格
   - 禁止事項：不推銷、不承諾無法達成的價格、不給不確定資訊
   - **關鍵約束（必須加入）：**
     - 「若知識庫沒有相關資料，禁止自己猜測或引用外部資訊，請用『目前沒有相關規則，建議你聯絡真人』這類句子。」
     - 「所有價格數字皆須出自 JSON/FAQ，不得憑空估算。若找不到價格資訊，請說明『實際金額以現場與當季公告為準』，並引導至真人確認。」
     - 「政策類問題（價格、取消、隱私、授權）必須從 FAQ/JSON 回答，禁止 LLM 獨立生成。若 FAQ 沒找到，請明講『這個問題超出目前機器人範圍，請聯絡真人』。」
     - 「投訴處理（complaint intent）必須使用嚴格模板，不允許自行決定補償方案。所有補償決策都落在真人客服。」
   - 參考 `docs/客服知識庫 gemini.md` 中的品牌規範與政策說明

3. **實現回覆生成邏輯：**
   - 根據 `mode` 選擇不同的 prompt 模板：
     - `decision_recommendation`：方案推薦流程
     - `faq_flow_price`：FAQ 回答流程
     - `auto`：自動判斷
   - 將知識庫相關內容注入 prompt
   - 使用上下文資訊（conversation history）

4. **實現快速回覆建議：**
   - 根據意圖和上下文，生成 2-3 個建議回覆選項
   - 例如：「我來說一下我的身份和用途」、「想知道流程細節」

**驗收標準：**
- [ ] 回覆符合品牌語氣
- [ ] 回覆內容準確（基於知識庫）
- [ ] 回應時間 < 5 秒
- [ ] 可以處理多輪對話上下文

**參考文檔：** `docs/webchatbotknowledge.md` 第 0 節「品牌定位」、`docs/webchatbotplan.md` 第 5 節「AI 模型集成規格」

---

## 提示詞 5：對話上下文管理系統

**任務目標：** 實現多輪對話的上下文管理，記住使用者的意圖和已收集的資訊。

**技術棧：**
- 記憶體儲存（MVP 階段，可用 Map 或簡單的 JSON 檔案）
- 未來可擴展為 Redis / 資料庫

**實現要求：**

1. **定義上下文結構：**
   **`types/context.ts`**：
   ```typescript
   export interface ConversationContext {
     conversationId: string;
     last_intent?: string;
     slots: {
       service_type?: string;
       use_case?: string;
       persona?: string;
       price_range?: string;
       branch?: string;
       booking_action?: string;
     };
     history: Array<{
       role: "user" | "assistant";
       text: string;
       timestamp: number;
     }>;
     state: "INIT" | "COLLECTING_INFO" | "RECOMMENDING" | "FOLLOW_UP" | "COMPLETE";
     createdAt: number;
     lastActivityAt: number;
   }
   ```

2. **實現上下文管理器：**
   **`services/context_manager.ts`**：
   - `getContext(conversationId: string)` - 取得上下文
   - `updateContext(conversationId: string, updates: Partial<ConversationContext>)` - 更新上下文
   - `createContext(conversationId?: string)` - 建立新上下文
   - `cleanupExpiredContexts()` - 清理過期上下文（30 分鐘無活動）

3. **整合到 `/api/chat`：**
   - 請求時帶入 `conversationId`，若無則建立新的
   - 更新上下文：記錄新的訊息、更新 slots、更新 state
   - 將上下文傳入 LLM 生成流程

4. **實現狀態機邏輯：**
   - 根據意圖和當前狀態，決定下一個狀態
   - 例如：`INIT` + `service_inquiry` → `COLLECTING_INFO`

**驗收標準：**
- [ ] 可以記住使用者在同一對話中的前後文
- [ ] 上下文更新正確
- [ ] 過期上下文會被清理
- [ ] 狀態轉換邏輯正確

**參考文檔：** `docs/webchatbotknowledge.md` 第 5 節「對話流程設計」、`docs/webchatbotplan.md` 第 4 節「多輪對話上下文管理」

---

## 提示詞 6：前端 Widget 開發

**任務目標：** 實現前端聊天 Widget，包含 UI 和與後端 API 的整合。

**技術棧：**
- 純 JavaScript（Vanilla JS，無框架依賴）
- CSS（符合 ITCSS 架構）
- Eleventy 整合

**實現要求：**

1. **建立 Widget 檔案：**
   **`public/js/gy-chatbot.js`**：
   - 實現 `GYChatbot` 全域物件
   - 主要方法：
     - `init(config)` - 初始化
     - `open()` / `close()` - 開關視窗
     - `send(message, mode)` - 發送訊息
   - DOM 操作：建立浮動按鈕、聊天視窗、訊息列表

2. **建立樣式檔案：**
   **`public/css/gy-chatbot.css`**：
   - 符合「Warm × Enterprise」設計風格
   - 響應式設計（桌機 + 手機）
   - 動畫效果（開啟/關閉、訊息出現）
   - 使用 CSS 變數（符合 ITCSS 架構）

3. **實現 UI 元件：**
   - 浮動按鈕（右下角，52px 圓形）
   - 聊天視窗（桌機 360-400px 寬，手機全寬）
   - 訊息氣泡（使用者右側深色，AI 左側淺色）
   - 快速選項按鈕（Quick Actions）
   - 輸入框和送出按鈕
   - Loading 狀態（思考中動畫）

4. **實現 API 整合：**
   - 發送 POST 請求到 `/api/chat`
   - 處理回應：顯示回覆、更新快速選項
   - 錯誤處理：網路錯誤、API 錯誤

5. **Eleventy 整合：**
   - 在 `_includes/layouts/base.njk` 中加入：
     ```html
     <link rel="stylesheet" href="/css/gy-chatbot.css" />
     <script src="/js/gy-chatbot.js" defer></script>
     <script>
       document.addEventListener("DOMContentLoaded", () => {
         GYChatbot.init({
           apiEndpoint: "/api/chat",
           pageType: "home", // 在 QA 頁改成 "qa"
           locale: "zh-TW"
         });
       });
     </script>
     ```

**驗收標準：**
- [ ] Widget 可以正常顯示和操作
- [ ] 可以成功發送訊息並顯示回覆
- [ ] 響應式設計在手機和桌機都正常
- [ ] 符合品牌視覺風格

**參考文檔：** `docs/webchatbotplan.md` 第 3-7 節

---

## 提示詞 7：錯誤處理與 Fallback 機制

**任務目標：** 實現完整的錯誤處理和 fallback 機制，確保系統穩定運行。

**技術棧：**
- 後端錯誤處理中間件
- 前端錯誤提示 UI

**實現要求：**

1. **建立 Fallback 訊息配置：**
   **`backend/fallback_messages.json`**：
   ```json
   {
     "dont_understand_first": "抱歉，我沒有完全理解你的問題 🥺 方便再多跟我說一點嗎？你可以這樣描述，例如：我是學生，想拍履歷照；或是我們家想拍全家福。",
     "dont_understand_second": "我還是沒有很確定你的需求，怕誤會了反而幫不上忙。比較重要或緊急的狀況，會建議你直接聯絡真人夥伴：Email（goldenyears166@gmail.com）或電話（中山店 02-2709-2224 / 公館店 02-2936-5460）。",
     "api_error": "糟糕，後台系統現在有點忙碌，我暫時拿不到正確的資訊 😣 你可以過幾分鐘再試一次，或直接透過 Email 或電話聯絡我們的真人夥伴。",
     "timeout": "這次回覆花的時間有點久，我怕系統卡住了。你可以重新提問一次，或直接用 Email 或電話找真人協助。",
     "handoff": "這類問題比較適合由真人夥伴來協助，會比較精準、也更貼近你的狀況 🙏 建議你可以透過以下方式聯絡我們：\n- Email：goldenyears166@gmail.com\n- 電話：中山店 02-2709-2224 / 公館店 02-2936-5460\n- IG：@goldenyears_studio"
   }
   ```

2. **實現錯誤處理邏輯：**
   **`services/error_handler.ts`**：
   - 無法理解（連續 2 次）→ 觸發 fallback
   - API 錯誤 / Timeout → 回傳友善錯誤訊息
   - 轉人工觸發條件：
     - 關鍵字：企業、公司、20人以上、報價、合作
     - 情緒：不滿意、生氣、投訴
     - 連續 3 次無法理解
     - 使用者明確要求轉真人

3. **投訴處理嚴格模板（重要）：**
   **`backend/src/services/responseTemplates.ts`**：
   - 針對 `complaint` intent，強制使用嚴格模板
   - 模板內容：
     ```
     「非常抱歉讓你遇到這樣的情況，我完全理解你的感受。為了能更準確地協助你，我建議你直接聯絡我們的真人夥伴，他們會立即處理並提供最適合的解決方案。
     
     聯絡方式：
     - Email：goldenyears166@gmail.com
     - 電話：中山店 02-2709-2224 / 公館店 02-2936-5460
     - IG：@goldenyears_studio
     
     我們會盡快回覆並協助你解決問題。」
     ```
   - **禁止 LLM 自由生成補償方案**：所有補償決策都落在真人客服
   - 模板中明確說明「補償決策由真人客服處理」

4. **實現重試機制：**
   - API 呼叫失敗時，自動重試 1 次
   - 超過 8-10 秒無回應 → 觸發 timeout fallback

5. **前端錯誤處理：**
   - 網路錯誤顯示友善提示
   - Loading 狀態超時處理
   - 錯誤訊息符合品牌語氣

**新增檔案：**
- `backend/src/services/responseTemplates.ts` - 回應模板（含投訴處理模板）

**驗收標準：**
- [ ] 所有錯誤情況都有對應的 fallback
- [ ] 錯誤訊息友善且符合品牌
- [ ] 轉人工機制正確觸發
- [ ] 系統不會因為錯誤而崩潰
- [ ] 投訴處理使用嚴格模板，不允許 LLM 自由生成補償方案
- [ ] 所有補償決策都引導至真人客服

**參考文檔：** `docs/webchatbotknowledge.md` 第 6 節「邊界情況處理」、`docs/webchatbotplan.md` 第 3 節「邊界情況處理」

---

## 提示詞 8：FAQ 匹配與搜尋優化

**任務目標：** 實現智能 FAQ 匹配系統，快速找到最相關的答案。

**技術棧：**
- 關鍵字匹配（MVP）
- 未來可擴展為向量搜尋（embedding）

**實現要求：**

1. **實現關鍵字匹配搜尋：**
   **`services/faq_matcher.ts`**：
   - 從使用者訊息中提取關鍵字
   - 與 FAQ 的 `keywords` 欄位比對
   - 計算匹配分數（關鍵字出現次數、位置等）
   - 回傳最相關的 1-3 個 FAQ

2. **實現模糊匹配：**
   - 支援同義詞匹配（例如：「多少錢」=「價格」=「費用」）
   - 支援部分匹配（例如：「證件照」匹配「韓式證件照」）

3. **整合到回覆生成：**
   - 若找到高度相關的 FAQ（分數 > 0.7），直接使用 FAQ 答案
   - 若匹配度中等（0.4-0.7），將 FAQ 答案作為參考注入 prompt
   - 若匹配度低（< 0.4），完全依賴 LLM 生成
   - **Critical FAQ 強制檢查（重要）：**
     - 檢查 FAQ 的 `critical: true` 欄位（見 `knowledge/policies.json`）
     - 所有 `policy_*` 類 FAQ 標記為 critical
     - **Critical FAQ 必須從 JSON 回答，不允許 LLM 生成**
     - 若 critical FAQ 未匹配到，回傳「這個問題超出目前機器人範圍，請聯絡真人：goldenyears166@gmail.com 或 02-2709-2224（中山店）/ 02-2936-5460（公館店）」

4. **優化搜尋結果：**
   - 根據 `category` 和 `target_audience` 過濾
   - 根據上下文（conversation context）調整搜尋優先級
   - 優先匹配 critical FAQ（價格、政策、隱私等）

**驗收標準：**
- [ ] FAQ 匹配準確率 > 70%
- [ ] 搜尋回應時間 < 100ms
- [ ] 可以處理多種問法（同義詞）
- [ ] Critical FAQ 強制從 JSON 回答，不會 LLM 生成
- [ ] 所有 policy_* 類 FAQ 標記為 critical
- [ ] Critical FAQ 未匹配時正確 fallback 至真人

**參考文檔：** 
- `docs/客服知識庫 gemini.md` 第 2 節「客戶服務 FAQ」
- `knowledge/policies.json` - 政策類 FAQ（含 critical 標記）

---

## 提示詞 9：測試場景實現與驗收

**任務目標：** 建立完整的測試場景，確保系統符合需求。

**技術棧：**
- Jest / Vitest（單元測試）
- Postman / curl（API 測試）
- 手動測試腳本

**實現要求：**

1. **建立測試場景文件：**
   **`tests/scenarios.md`**：
   - 場景 1：新客戶完整諮詢（準畢業生）
   - 場景 2：價格敏感客戶
   - 場景 3：企業客戶諮詢
   - 場景 4：投訴處理
   - 場景 5：方案比較諮詢
   - 每個場景包含：對話腳本、驗收重點

2. **實現單元測試：**
   **`tests/unit/`**：
   - 意圖分類測試
   - 實體提取測試
   - FAQ 匹配測試
   - 上下文管理測試

3. **實現整合測試：**
   **`tests/integration/`**：
   - API 端點測試
   - 完整對話流程測試
   - 錯誤處理測試

4. **建立驗收檢查清單：**
   - [ ] NLU 成功率 > 80%
   - [ ] 多輪對話上下文正確率 > 80%
   - [ ] 使用者滿意度測試 > 4/5 分
   - [ ] 所有錯誤情況都有處理
   - [ ] 回應時間 < 5 秒

**驗收標準：**
- [ ] 所有測試場景通過
- [ ] 單元測試覆蓋率 > 70%
- [ ] 整合測試通過
- [ ] 符合驗收檢查清單

**參考文檔：** `docs/webchatbotknowledge.md` 第 8 節「測試場景」

---

## 提示詞 10：部署與生產環境配置

**任務目標：** 將系統部署到生產環境，完成上線準備。

**技術棧：**
- Vercel / Cloudflare Workers / Railway（後端）
- GitHub Actions（CI/CD，可選）

**實現要求：**

1. **環境變數配置：**
   - `GEMINI_API_KEY`：Gemini API 金鑰
   - `NODE_ENV`：production
   - `API_BASE_URL`：後端 API 網址（前端用）

2. **部署後端：**
   - 建立 `vercel.json` 或對應的部署配置
   - 設定 API 路由
   - 確保環境變數正確設定

3. **前端整合：**
   - 確認 Widget 的 `apiEndpoint` 指向正確的後端網址
   - 測試跨域（CORS）設定
   - 確認靜態資源正確載入

4. **監控與日誌：**
   - 實作基本日誌記錄（不記錄個資）
   - 錯誤追蹤（可選：Sentry）
   - API 使用量監控

5. **安全性檢查：**
   - API Key 不在前端暴露
   - 請求驗證（防止濫用）
   - Rate limiting（可選）

6. **效能優化：**
   - 知識庫 JSON 檔案快取
   - LLM 回應快取（可選，針對常見問題）
   - 前端資源壓縮

**驗收標準：**
- [ ] 後端成功部署並可訪問
- [ ] 前端 Widget 可以正常運作
- [ ] 所有環境變數正確設定
- [ ] 基本監控已建立
- [ ] 安全性檢查通過

**參考文檔：** `docs/webchatbotplan.md` 第 7 節「部署」、`docs/webchatbotknowledge.md` 第 7 節「系統集成規格」

---

## 開發順序建議

建議按照以下順序執行：

1. **提示詞 1** → 建立基礎架構
2. **提示詞 2** → 準備知識庫資料
3. **提示詞 3** → 實現意圖分類（可以先簡單版本）
4. **提示詞 4** → 整合 LLM，實現基本回覆
5. **提示詞 5** → 加入上下文管理
6. **提示詞 6** → 開發前端 Widget
7. **提示詞 7** → 完善錯誤處理
8. **提示詞 8** → 優化 FAQ 匹配
9. **提示詞 9** → 測試與驗收
10. **提示詞 10** → 部署上線

---

## 注意事項

1. **API Key 安全：** 永遠不要將 API Key 提交到 Git，使用環境變數
2. **個資保護：** 不在日誌中記錄完整個資（電話、Email），可 hash 或部分遮蔽
3. **成本控制：** 監控 Gemini API 使用量，避免超支
4. **漸進式開發：** 先實現 MVP 功能，再逐步優化
5. **文檔同步：** 開發過程中如有變更，同步更新相關文檔

---

**最後更新：** 2025-01-XX  
**版本：** 1.0.0

