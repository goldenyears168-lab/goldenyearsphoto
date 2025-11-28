# 好時有影 AI 形象顧問 Widget 實作規格

## 專案簡介

**名稱：** 好時有影 AI 形象顧問 Widget

**形態：** 前端獨立小工具（一支 JS + 一支 CSS + 一個初始化呼叫）

**出現位置：**
- 首頁（Home）
- QA / FAQ 頁（Answers / 常見問題頁）

**主要功能：**
- 個人化方案推薦
- 拍攝流程與價格解說

---

## 目錄

1. [使用情境與目標](#1-使用情境與目標)
2. [Widget 功能總覽](#2-widget-功能總覽)
3. [前端整體架構](#3-前端整體架構)
4. [UI / UX 詳細規格](#4-ui--ux-詳細規格)
5. [前端行為與狀態設計](#5-前端行為與狀態設計)
6. [前端 / 後端 API 約定](#6-前端--後端-api-約定)
7. [前端實作草圖](#7-前端實作草圖)
8. [後端 API 實現規格](#一後端-api-實現規格critical)
9. [知識庫結構化](#二知識庫結構化high-priority)
10. [邊界情況處理](#三邊界情況處理high-priority)
11. [多輪對話上下文管理](#四多輪對話上下文管理medium)
12. [AI 模型集成規格](#五ai-模型集成規格critical)
13. [工程實作路線圖](#最後工程實作路線圖你現在可以怎麼做)

---

## 1. 使用情境與目標
### 1.1 使用情境

使用者是第一次來到網站，不確定要選什麼方案。

使用者在 QA 頁滑到一半，懶得找答案，想直接問。

使用者對流程、時間、預算有焦慮，希望有人一步步跟他說。

### 1.2 目標

降低「看完網站卻還是猶豫」的比例。

讓使用者能自由描述自己的狀況 → AI 幫忙整理與推薦。

減少你重複回答「流程／價格／改期」的時間。

## 2. Widget 功能總覽

### 2.1 基本功能

右下角浮動入口（全站共用）

可展開的聊天視窗

預設快速入口（按鈕）

自由輸入問題（打字）

發送問題到後端 /api/chat，顯示回覆。

### 2.2 模式（mode）

Widget 只是前端小工具，mode 交給後端決定行為，前端只負責帶參數：

decision_recommendation → 個人化方案推薦

faq_flow_price → 拍攝流程與價格相關問題

auto → 讓後端自行判斷（自然語言分類）

首頁與 QA 頁的差別，用 pageType 來控制預設按鈕與初始文案。

## 3. 前端整體架構

### 3.1 檔案結構建議
/public
  /js
    gy-chatbot.js      # Widget 邏輯 & DOM
  /css
    gy-chatbot.css     # Widget 樣式


在 Eleventy 的 layout 加：

<link rel="stylesheet" href="/css/gy-chatbot.css" />
<script src="/js/gy-chatbot.js" defer></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    GYChatbot.init({
      apiEndpoint: "/api/chat",
      pageType: "home",     // 在 QA 頁改成 "qa"
      locale: "zh-TW",
      theme: "light",       // 之後可以擴充
    });
  });
</script>


QA 頁只要在該 layout 裡改：

GYChatbot.init({
  apiEndpoint: "/api/chat",
  pageType: "qa",
  locale: "zh-TW",
});

## 4. UI / UX 詳細規格

### 4.1 入口（Floating Button）

位置：右下角（桌機：bottom: 24px; right: 24px;，手機略小）

外觀：

圓形按鈕（直徑 52px）

Icon：💬 或自訂 SVG（建議之後換工作室風格圖標）

陰影：柔和（視覺上像浮在畫面上）

Hover / Focus 提示：

Tooltip 顯示：「AI 形象顧問」

行為：

點擊 → 打開聊天視窗

視窗開啟時，按鈕仍存在，可改成最小化 / 高亮狀態（可選）

### 4.2 聊天視窗（Widget Window）
尺寸

桌機：

寬：360–400px

高：520–600px

手機：

佔據下方 70vh，全寬，圓角上方（類似手機底部抽屜）

結構

Header 區

標題：好時有影 AI 形象顧問

副標：

首頁：幫你選方案、解釋流程、抓預算

QA 頁：找不到答案？可以直接問我

右上角：關閉按鈕 ✕（關閉視窗，不銷毀狀態）

Body 區

初次進來時會看到：

歡迎訊息

快速開始按鈕區（Quick Actions）

歷史訊息區（Messages）

- 使用 `role="log"` 和 `aria-live="polite"` 讓屏幕閱讀器自動讀出新訊息
- 使用 `aria-label="對話訊息"` 標示訊息區用途

Input 區

一個文字輸入框

- 使用 `aria-label="輸入訊息"` 標示輸入框用途
- 支援 Enter 鍵發送訊息
- 支援 Escape 鍵關閉聊天窗
- 開啟聊天窗後自動將焦點移到輸入框

一個「送出」按鈕

Placeholder 依頁面不同：

Home：直接跟我說你的狀況，例如：我是準畢業生，要拍 LinkedIn…

QA：你可以問任何拍攝流程或預約相關問題

### 4.3 初次歡迎訊息（首頁 vs QA 頁）
首頁（pageType = "home"）

嗨，我是好時有影的 AI 形象顧問。
可以幫你：
・推薦適合你的拍攝方案
・說明拍攝流程
・抓一個大約的預算範圍

你可以直接跟我說你的狀況，
或先用下面的快速選項開始。

QA 頁（pageType = "qa"）

找不到你要的答案嗎？
你可以直接問我流程、價格或預約相關的問題。
我會先用標準規則回答，
遇到需要真人處理的，我會提示你透過 Email、電話或 IG 聯絡。

### 4.4 快速開始按鈕（Quick Actions）
首頁預設

按鈕 1：🧭 不知道選哪個方案

mode = "decision_recommendation"

template = 我想請你幫我推薦適合的拍攝方案。

按鈕 2：📷 想知道拍攝流程

mode = "faq_flow_price"

template = 請跟我說一般拍攝的流程，大概要多久？

按鈕 3：💰 想知道大約預算

mode = "faq_flow_price"

template = 我想大概了解不同拍攝的價位與計價方式。

QA 頁預設

按鈕 1：📋 拍攝流程說明

mode = "faq_flow_price"

template = 請幫我整理一下從預約到拿到照片的流程。

按鈕 2：💵 價格與計價方式

mode = "faq_flow_price"

template = 不同拍攝類型大概要多少錢？怎麼計價？

按鈕 3：📆 改期 / 取消規則

mode = "faq_flow_price"

template = 如果我要改期或取消預約，原則是什麼？

### 4.5 訊息氣泡（Message Bubbles）

左側：AI（bot）訊息

背景：白色 / 淺灰

文字：深灰

右側：使用者（user）訊息

背景：深色（例如 #111827）

文字：白色

內容支援：

換行

簡單條列（•、1. 2. 3.）

最底部附上分隔空間以避免被輸入框遮住

### 4.6 輸入區

輸入框：文字長度上限（前端可限制 300–500 字）

Enter = 送出（手機上直接按送出按鈕）

送出後：

顯示 user 氣泡

顯示 bot「思考中」loading 狀態（例如 3 個點動畫）

等待 API 回覆 → 顯示 bot 回覆

## 5. 前端行為與狀態設計

### 5.1 Widget 狀態
type ChatbotState = {
  isOpen: boolean;
  messages: Array<{ role: "user" | "bot"; text: string }>;
  isLoading: boolean;
  pageType: "home" | "qa";
  currentMode: "decision_recommendation" | "faq_flow_price" | "auto";
};

### 5.2 主要事件

open() / close()

send(message: string, mode?: string)

receive(reply: string, suggestedQuickReplies?: string[])

## 6. 前端 / 後端 API 約定

### 6.1 前端送到後端的 Request
{
  "message": "使用者輸入的文字",
  "mode": "decision_recommendation",
  "pageType": "home",
  "conversationId": "optional-uuid"
}


mode：

若從快速按鈕來 → 前端直接帶指定 mode

若使用者純輸入 → 帶 "auto"，讓後端判斷

pageType：

"home" or "qa"，方便後端稍微調整語氣 or 給不同 CTA

### 6.2 後端回傳的 Response
{
  "reply": "AI 要顯示的完整文字內容",
  "mode": "decision_recommendation",
  "suggestedQuickReplies": [
    "我來說一下我的身份和用途",
    "想知道流程細節"
  ]
}


reply：已可直接顯示給使用者

suggestedQuickReplies（選填）：前端可以顯示在訊息下方的小按鈕，點了直接填入並送出。

## 7. 前端實作草圖（簡化版）

這是一個能表達結構的 JS 範本，不是最終版，但可以直接讓工程師照這個精神寫乾淨一點的版本。

// gy-chatbot.js
window.GYChatbot = (function () {
  let config = {
    apiEndpoint: "/api/chat",
    pageType: "home",
    locale: "zh-TW",
  };

  let state = {
    isOpen: false,
    isLoading: false,
  };

  let els = {};

  function init(userConfig) {
    config = { ...config, ...userConfig };
    createDOM();
    bindEvents();
  }

  function createDOM() {
    const container = document.createElement("div");
    container.id = "gy-chatbot-widget";
    container.innerHTML = `
      <button id="gy-chatbot-toggle" aria-label="打開 AI 顧問" aria-expanded="false">💬</button>
      <div id="gy-chatbot-window" aria-hidden="true" role="dialog" aria-labelledby="gy-chatbot-title" aria-modal="true">
        <div class="gy-chatbot-header">
          <div>
            <div class="gy-chatbot-title">好時有影 AI 形象顧問</div>
            <div class="gy-chatbot-subtitle">
              ${
                config.pageType === "home"
                  ? "選方案、解釋流程"
                  : "找不到答案？可以直接問我"
              }
            </div>
          </div>
          <button id="gy-chatbot-close">✕</button>
        </div>
        <div class="gy-chatbot-body">
          <div class="gy-chatbot-message bot">
            ${
              config.pageType === "home"
                ? `嗨，我是好時有影的 AI 顧問。<br/>
                 可以幫你推薦方案、說明流程、抓一個大約的預算。<br/>
                 你可以直接跟我說你的狀況，或先用下面的快速選項開始。`
                : `找不到你要的答案嗎？<br/>
                 你可以直接問我流程、價格或預約相關的問題。<br/>
                 遇到需要真人處理的，我會提醒你。`
            }
          </div>
          <div class="gy-chatbot-quick-actions">
            ${renderQuickActions(config.pageType)}
          </div>
          <div id="gy-chatbot-messages" role="log" aria-live="polite" aria-label="對話訊息"></div>
        </div>
        <div class="gy-chatbot-input">
          <input
            id="gy-chatbot-input-field"
            type="text"
            placeholder="${
              config.pageType === "home"
                ? "直接跟我說你的狀況，例如：我是準畢業生，要拍 LinkedIn…"
                : "你可以問任何拍攝流程、價格或預約相關問題"
            }"
            aria-label="輸入訊息"
          />
          <button id="gy-chatbot-send" aria-label="送出訊息">送出</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    els.container = container;
    els.toggle = container.querySelector("#gy-chatbot-toggle");
    els.window = container.querySelector("#gy-chatbot-window");
    els.close = container.querySelector("#gy-chatbot-close");
    els.messages = container.querySelector("#gy-chatbot-messages");
    els.quickActions = container.querySelector(".gy-chatbot-quick-actions");
    els.input = container.querySelector("#gy-chatbot-input-field");
    els.send = container.querySelector("#gy-chatbot-send");
  }

  function renderQuickActions(pageType) {
    if (pageType === "home") {
      return `
        <button data-mode="decision_recommendation" data-template="我想請你幫我推薦適合的拍攝方案。">🧭 不知道選哪個方案</button>
        <button data-mode="faq_flow_price" data-template="請跟我說一般拍攝的流程，大概要多久？">📷 想知道拍攝流程</button>
        <button data-mode="faq_flow_price" data-template="我想大概了解不同拍攝的價位與計價方式。">💰 想知道大約預算</button>
      `;
    } else {
      return `
        <button data-mode="faq_flow_price" data-template="請幫我整理一下從預約到拿到照片的流程。">📋 拍攝流程說明</button>
        <button data-mode="faq_flow_price" data-template="不同拍攝類型大概要多少錢？怎麼計價？">💵 價格與計價方式</button>
        <button data-mode="faq_flow_price" data-template="如果我要改期或取消預約，原則是什麼？">📆 改期 / 取消規則</button>
      `;
    }
  }

  function bindEvents() {
    els.toggle.addEventListener("click", open);
    els.close.addEventListener("click", close);

    els.quickActions.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      const mode = e.target.getAttribute("data-mode");
      const template = e.target.getAttribute("data-template");
      sendMessage(template, mode);
    });

    els.send.addEventListener("click", () => {
      const text = els.input.value.trim();
      if (!text) return;
      sendMessage(text, "auto");
      els.input.value = "";
    });

    els.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        els.send.click();
      }
      // Escape 鍵關閉聊天窗
      if (e.key === "Escape" && state.isOpen) {
        close();
      }
    });
    
    // 鍵盤導航支援
    els.toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  }

  function open() {
    state.isOpen = true;
    els.window.classList.add("open");
    els.window.setAttribute("aria-hidden", "false");
    els.toggle.setAttribute("aria-expanded", "true");
    // 焦點移到輸入框
    setTimeout(() => {
      els.input.focus();
    }, 100);
  }

  function close() {
    state.isOpen = false;
    els.window.classList.remove("open");
    els.window.setAttribute("aria-hidden", "true");
    els.toggle.setAttribute("aria-expanded", "false");
    // 焦點回到 toggle 按鈕
    els.toggle.focus();
  }

  function appendMessage(text, role) {
    const div = document.createElement("div");
    div.className = "gy-chatbot-message " + role;
    div.innerText = text;
    els.messages.appendChild(div);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  async function sendMessage(text, mode) {
    appendMessage(text, "user");

    state.isLoading = true;
    appendMessage("正在想答案中…", "bot-loading");

    const payload = {
      message: text,
      mode: mode || "auto",
      pageType: config.pageType,
    };

    try {
      const res = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      // 移除 loading
      const loading = els.messages.querySelector(".bot-loading");
      if (loading) loading.remove();

      appendMessage(data.reply || "目前系統忙碌，稍後再試看看。", "bot");
      state.isLoading = false;
    } catch (err) {
      const loading = els.messages.querySelector(".bot-loading");
      if (loading) loading.remove();

      appendMessage("糟糕，連線好像出了點問題，可以等等再試一次。", "bot");
      state.isLoading = false;
    }
  }

  return { init };
})();


CSS 獨立在 gy-chatbot.css，基本上承接上次給你的樣式即可。

## 8. QA 頁與首頁的差異總結（方便你跟工程師溝通）

同一支 Widget，兩種 pageType：

home：偏重「方案推薦入口」

qa：偏重「流程 / 政策 / 價格說明入口」

差異項目：

Header 副標文字

初次歡迎訊息

Quick Actions 按鈕組合

Input placeholder

其他（位置、外觀、發送機制）全部一致。



---

## 一、後端 API 實現規格（Critical）

目標：讓 /api/chat 可以「穩定判斷 mode、抓 service、給對的回答」。

1.1 意圖分類（Intent / mode 判斷）

🔧 要補成的東西：一個「意圖規則表 + few-shot 示例」

建議做一個檔案：backend/intent_rules.json + backend/intent_examples.md

A. 意圖分類規則表（給程式吃的）

{
  "modes": {
    "decision_recommendation": {
      "keywords_any": ["推薦方案", "選哪個", "不知道選什麼", "幫我推薦", "適合我", "選擇困難"],
      "intents": ["service_inquiry", "comparison"]
    },
    "faq_flow_price": {
      "keywords_any": ["多少錢", "價錢", "價格", "費用", "預算", "流程", "拍攝流程", "改期", "取消", "幾天", "多久"],
      "intents": ["price_inquiry", "booking_inquiry", "flow_inquiry"]
    },
    "auto": {
      "fallback": true
    }
  }
}


B. 意圖識別示例對話（給 LLM 的 prompt few-shot）

放在 intent_examples.md：

「我是學生，要拍證件照」→ intent: service_inquiry, mode: decision_recommendation, service_type: headshot_korean

「多少錢？」（有 context：上一句是形象照）→ intent: price_inquiry, mode: faq_flow_price

「流程是什麼？」→ intent: flow_inquiry, mode: faq_flow_price

✅ 這部份之後在 classifyIntentAndEntities() 裡會直接塞進 system / tools prompt。

1.2 實體提取（Entity Extraction）

🔧 要補成的東西：一個「實體詞典 JSON + 規則」

做一個檔案：backend/entity_dictionary.json

{
  "service_type": {
    "headshot_korean": ["證件照", "證照", "護照照", "簽證照", "headshot", "韓式", "護照相片"],
    "portrait_pro": ["形象照", "linkedin照", "履歷照", "職場照", "專業照", "portrait", "商務照"],
    "portrait_personal": ["寫真", "個人寫真", "畢業寫真", "畢業照", "artistic photo", "個人照"],
    "group_family": ["全家福", "家庭照", "家庭合照", "朋友合照", "團體照", "班級照"],
    "workshop_challenge": ["一日攝影師", "攝影體驗", "攝影課", "工作坊"]
  },
  "branch": {
    "中山店": ["中山店", "中山", "赤峰"],
    "公館店": ["公館店", "公館", "台大", "羅斯福路"]
  },
  "time_keywords": {
    "soon": ["最近", "這幾天", "本週", "這週", "最快"],
    "deadline": ["交件", "什麼時候拿到", "幾天能拿到", "出圖"]
  },
  "price_words": {
    "low": ["便宜", "預算有限", "一千以內", "500 以內"],
    "mid": ["一千多", "一兩千", "1500 左右"],
    "high": ["預算沒關係", "價格不是重點", "兩千以上"]
  }
}


✅ 後端只要寫一個簡單 util：掃字串 → 找到對應 key，就能給 LLM 一個「預先猜到的實體」。

1.3 對話流程設計

🔧 要補成的東西：一份「流程規格 md + state 設計」

做一個檔案：backend/flows_decision.md，內容就是你 checklist 裡講的 3 輪：

decision_recommendation：

收集身份 / 目的

確認用途 / 預算

給推薦 + 理由 + 下一步 CTA

faq_flow_price：

優先用 FAQ 匹配（keyword / similarity）

匹配不到 → 請對方描述更明確 + fallback reply

上下文記憶機制：放在 backend/context_schema.json，你已經有草案，我幫你收斂成這樣就夠用：

{
  "last_intent": null,
  "slots": {
    "service_type": null,
    "use_case": null,
    "persona": null,
    "budget": null,
    "branch": null
  }
}

---

## 二、知識庫結構化（High Priority）

目標：從「文字筆記」→ 變成「程式可查詢的 JSON」。

2.1 FAQ 結構化

🔧 要補成的東西：knowledge/faq.json

格式就照你寫的例子：

[
  {
    "id": "price_headshot",
    "category": "價格",
    "questions": ["韓式證件照多少錢", "證件照價格", "證件照要多少"],
    "answer": "韓式證件照採按張計費，單張約 NT$399，以現場與官網公告為準。",
    "mode": "faq_flow_price",
    "keywords": ["證件照", "價格", "多少錢"]
  },
  {
    "id": "flow_indoor_single",
    "category": "流程",
    "questions": ["拍照流程", "當天會怎麼進行", "一般拍攝流程"],
    "answer": "從進門到離開，大致流程是：1. 接待與核對…（略）",
    "mode": "faq_flow_price",
    "keywords": ["流程", "拍攝", "步驟"]
  }
]


後端 FAQ 匹配可以先用：

keyword hit（keywords），

之後有餘力再加 embedding 相似度。

2.2 方案推薦決策樹

🔧 要補成的東西：knowledge/recommendation_rules.json

[
  {
    "persona": "student_graduating",
    "conditions": {
      "budget": "中低",
      "purpose": ["履歷", "LinkedIn", "畢業紀念"]
    },
    "recommended_services": ["portrait_pro", "headshot_korean"],
    "reasoning": "專業形象照可作為履歷/LinkedIn 萬用，韓式證件照可一併處理護照/證件。"
  },
  {
    "persona": "working_professional",
    "conditions": {
      "budget": "中高",
      "purpose": ["履歷", "LinkedIn", "公司官網"]
    },
    "recommended_services": ["portrait_pro"],
    "reasoning": "主打專業形象與職場品牌，多拍幾張可覆蓋不同用途。"
  }
]


✅ LLM 在 decision_recommendation 模式時，可以根據 slots（身份 / 用途 / 預算）用這個 JSON 當「推薦參考」。

2.3 回覆模板變數

🔧 要補成的東西：knowledge/templates.json

{
  "recommendation": "以你的狀況（{persona_desc}，用途主要是 {purpose_desc}），我會優先推薦 {service_name_list}。大約價格是 {price_hint}，實際金額以現場與官網公告為準。",
  "price_simple": "{service_name} 約為 {price}，實際金額會依你最後選幾張而定，以現場與官網公告為準。",
  "flow_simple": "如果你預約的是 {service_name}，當天流程大致是：{flow_steps}"
}


第一版可以只讓 LLM「參考」這些模板，不一定要硬做程式替換；之後如果要更 deterministic，再改成後端 fill 變數。

---

## 三、邊界情況處理（High Priority）

🔧 要補成的東西：一份 backend/fallback_rules.md + backend/fallback_messages.json

3.1 無法理解

定義：

LLM 回傳「我不確定」信心低

或規則判斷「無意圖／無實體」

fallback_messages.json 範例：

{
  "dont_understand_first": "抱歉，我沒有完全理解你的問題 🥺 方便再多跟我說一點嗎？你可以這樣描述，例如：我是學生，想拍履歷照；或是我們家想拍全家福。",
  "dont_understand_second": "我還是沒有很確定你的需求，怕誤會了反而幫不上忙。比較重要或緊急的狀況，會建議你直接聯絡真人夥伴：Email（goldenyears166@gmail.com）或電話（中山店 02-2709-2224 / 公館店 02-2936-5460）。"
}


再在 fallback_rules.md 寫清楚：

連續 2 次觸發 → 強烈建議轉真人。

3.2 轉人工觸發條件

在 fallback_rules.md 裡列出 checklist：

問題包含：企業, 公司, 20人以上, 報價, 合作, 贊助, 互惠, 合約

情緒類字：不滿意, 生氣, 投訴, 抱怨

連續 3 次無法理解

使用者明講：「我要真人」「可以打電話嗎？」

fallback_messages.json 加一段：

{
  "handoff": "這類問題比較適合由真人夥伴來協助，會比較精準、也更貼近你的狀況 🙏 建議你可以透過以下方式聯絡我們：\n- Email：goldenyears166@gmail.com\n- 電話：中山店 02-2709-2224 / 公館店 02-2936-5460\n- IG：@goldenyears_studio\n\n如果你願意，我也可以先幫你整理一小段需求摘要，讓你貼給他們看。"
}

3.3 API / Timeout 處理

在 backend/fallback_messages.json 補：

{
  "api_error": "糟糕，後台系統現在有點忙碌，我暫時拿不到正確的資訊 😣 你可以過幾分鐘再試一次，或直接透過 Email（goldenyears166@gmail.com）或電話（中山店 02-2709-2224 / 公館店 02-2936-5460）聯絡我們的真人夥伴。",
  "timeout": "這次回覆花的時間有點久，我怕系統卡住了。你可以重新提問一次，或直接用 Email 或電話找真人協助。"
}


Timeout 時間建議：

後端呼叫 LLM：8–10 秒

超過就回 fallback。

### 前端 Timeout 處理規格

**實作要求：**

1. **前端 Timeout 監控：**
   - 前端在發送請求後，設定 8-10 秒 timeout 計時器
   - 若超過時間未收到回應，顯示「這次有點久，我怕系統卡住了」提示
   - 與後端 timeout fallback 文案對齊

2. **重試機制：**
   - 提供「重新提問」按鈕
   - 最多重試 2 次
   - 若連續 2 次 timeout，建議轉真人客服

3. **Loading 狀態：**
   - 顯示明確的 loading 動畫或文字
   - 超過 5 秒未回應時，顯示「正在處理中，請稍候...」提示

**實作範例：**
```javascript
const TIMEOUT_MS = 10000; // 10 秒

async function sendMessage(message) {
  const timeoutId = setTimeout(() => {
    showTimeoutMessage();
  }, TIMEOUT_MS);
  
  try {
    const response = await fetch('/api/chat', { ... });
    clearTimeout(timeoutId);
    // 處理回應
  } catch (error) {
    clearTimeout(timeoutId);
    handleError(error);
  }
}
```

---

## 四、多輪對話上下文管理（Medium）

🔧 要補成的東西：backend/state_machine.md + backend/context_schema.json

你 checklist 的 state 設計可以收斂成這樣：

INIT → COLLECTING_INFO → RECOMMENDING → FOLLOW_UP → COMPLETE


簡單規則：

INIT：第一句，通常是 greeting 或第一個問題

COLLECTING_INFO：

decision_recommendation 模式下，正在問身份 / 用途 / 預算

RECOMMENDING：

已經有推薦，正在講解方案

FOLLOW_UP：

使用者追問價格 / 流程 / 預約

COMPLETE：

使用者說謝謝 / 先這樣 / 我之後再預約

上下文有效期（建議）：

一個 conversationId 內有效

超過 30 分鐘無互動 → 當成新對話。

（先寫成 rule，真的要「過期自動清掉」可以第二版再實作）

---

## 五、AI 模型集成規格（Critical）

🔧 要明確決定：平台 + 調用方式 + prompt 結構

5.1 平台

你前面打算用 Gemini，那這裡直接寫死：

平台：Google AI Studio / Gemini API

模型：

意圖 + 實體分類：gemini-1.5-flash

生成最終回答：同樣用 gemini-1.5-flash（先簡化）

5.2 Prompt 結構（重點）

建議拆兩段 function（兩個 prompt）：

classifyIntentAndEntities()

system prompt：定義意圖、實體的 JSON 輸出格式

input：user message + context + entity_dictionary.json

generateReply()

system prompt：定義「你是好時有影 AI 顧問」＋ 品牌語氣規則

input：

user message

intent + entities + context

knowledge.json 中抽取出來的 snippets

templates.json 中相關模板

✅ 這部分你之後要我幫你寫 prompt，我可以給你可以直接貼進 Cursor 的 version。

六～九（測試、部署、語氣、動態資訊）

你 checklist 已經列得很清楚了，工程角度補一句話總結：

測試（6）：
先為「MVP 5 大場景」各寫 3–5 組 input/output，用人眼對。

部署（7）：
初版可以只用一個輕量 Node server（Vercel / Cloudflare Workers 都行），只記 memory context，不必一開始建 DB。

語氣（8）：
放進 system prompt + 幾個 few-shot 對話例子即可，暫時不需要額外機制。

動態資訊（9）：
MVP 不接「查可用時段」，只提供預約連結（https://www.goldenyearsphoto.com/booking/）；真正查 slot 的功能等你有穩定流量再上。

---

## 最後：工程實作路線圖（你現在可以怎麼做）
Milestone 1（MVP 後端可跑）

寫好：

entity_dictionary.json

knowledge/faq.json（先 20~30 題核心）

knowledge/services.json（你已有表，轉成 JSON）

實作 /api/chat：

單一 LLM call（先用 auto 模式 + prompt internal 做 intent & 回答）

不做 state machine，只做簡單 context（上一輪 service_type）

這個階段：就可以 demo「首頁 + QA 頁的 Widget」了。

Milestone 2（加上 decision_recommendation 流程）

補：recommendation_rules.json

實作 decision_recommendation 的 3 輪提問邏輯（在後端或 prompt 裡控制）

開始記 slot：service_type / use_case / budget / persona

Milestone 3（加上 fallback、轉真人）

補：fallback_messages.json、fallback_rules.md

實作：

N 次不理解 → fallback message + 建議真人

關鍵字 / 情緒 → handoff_to_human