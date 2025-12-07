# Pipeline 執行流程圖（Mermaid 格式）

## 🎨 Mermaid 流程圖

這些流程圖可以在支持 Mermaid 的平台（如 GitHub、GitLab、Notion）直接渲染。

---

## 1. 完整執行流程

```mermaid
flowchart TD
    Start([請求進入]) --> Validate[1. validateRequest<br/>驗證請求]
    Validate --> Init[2. initializeServices<br/>初始化服務]
    Init --> Context[3. contextManagement<br/>上下文管理]
    Context --> Intent[4. intentExtraction<br/>意圖提取]
    Intent --> State[5. stateTransition<br/>狀態轉換]
    State --> Special[6. specialIntents<br/>特殊意圖處理]
    
    Special -->|特殊意圖匹配| Exit1[提前退出<br/>返回響應]
    Special -->|繼續| FAQ[7. faqCheck<br/>FAQ 檢查]
    
    FAQ -->|FAQ 匹配| Exit2[提前退出<br/>返回響應]
    FAQ -->|繼續| LLM[8. llmGeneration<br/>LLM 生成]
    
    LLM --> Build[9. buildResponse<br/>構建響應]
    Build --> End([返回響應])
    
    Validate -.->|錯誤| ErrorHandler[99. error-handler<br/>錯誤處理]
    Init -.->|錯誤| ErrorHandler
    Context -.->|錯誤| ErrorHandler
    Intent -.->|錯誤| ErrorHandler
    State -.->|錯誤| ErrorHandler
    Special -.->|錯誤| ErrorHandler
    FAQ -.->|錯誤| ErrorHandler
    LLM -.->|錯誤| ErrorHandler
    Build -.->|錯誤| ErrorHandler
    
    ErrorHandler --> ErrorResponse([錯誤響應])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Exit1 fill:#d4edda
    style Exit2 fill:#d4edda
    style ErrorResponse fill:#f8d7da
    style ErrorHandler fill:#fff3cd
```

---

## 2. 數據流圖

```mermaid
flowchart LR
    Request[Request] --> V[validateRequest]
    V -->|ctx.body<br/>ctx.corsHeaders| I[initializeServices]
    I -->|ctx.knowledgeBase<br/>ctx.llmService<br/>ctx.contextManager| C[contextManagement]
    C -->|ctx.conversationContext| E[intentExtraction]
    E -->|ctx.intent<br/>ctx.entities<br/>ctx.mergedEntities| S[stateTransition]
    S -->|ctx.nextState| SP[specialIntents]
    SP -->|可能返回 Response| FAQ[faqCheck]
    FAQ -->|可能返回 Response| L[llmGeneration]
    L -->|ctx.reply| B[buildResponse]
    B --> Response[Response]
    
    style Request fill:#e1f5ff
    style Response fill:#d4edda
```

---

## 3. 執行時間軸

```mermaid
gantt
    title Pipeline 執行時間軸
    dateFormat X
    axisFormat %L ms
    
    section 請求處理
    validateRequest :0, 5
    initializeServices :5, 125
    contextManagement :125, 127
    intentExtraction :127, 135
    stateTransition :135, 138
    specialIntents :138, 139
    faqCheck :139, 141
    llmGeneration :141, 1941
    buildResponse :1941, 1944
```

---

## 4. 節點依賴關係

```mermaid
graph TD
    V[validateRequest] --> I[initializeServices]
    I --> C[contextManagement]
    C --> E[intentExtraction]
    E --> S[stateTransition]
    S --> SP[specialIntents]
    SP -->|可選| FAQ[faqCheck]
    FAQ -->|可選| L[llmGeneration]
    L --> B[buildResponse]
    
    EH[error-handler] -.->|捕獲所有錯誤| V
    EH -.->|捕獲所有錯誤| I
    EH -.->|捕獲所有錯誤| C
    EH -.->|捕獲所有錯誤| E
    EH -.->|捕獲所有錯誤| S
    EH -.->|捕獲所有錯誤| SP
    EH -.->|捕獲所有錯誤| FAQ
    EH -.->|捕獲所有錯誤| L
    EH -.->|捕獲所有錯誤| B
    
    style V fill:#90caf9
    style I fill:#90caf9
    style C fill:#90caf9
    style E fill:#90caf9
    style S fill:#90caf9
    style SP fill:#fff9c4
    style FAQ fill:#fff9c4
    style L fill:#90caf9
    style B fill:#90caf9
    style EH fill:#ffccbc
```

---

## 5. 狀態轉換流程

```mermaid
stateDiagram-v2
    [*] --> validateRequest: 請求進入
    validateRequest --> initializeServices: 驗證通過
    initializeServices --> contextManagement: 服務就緒
    contextManagement --> intentExtraction: 上下文就緒
    intentExtraction --> stateTransition: 意圖提取完成
    stateTransition --> specialIntents: 狀態確定
    specialIntents --> faqCheck: 無特殊意圖
    specialIntents --> [*]: 特殊意圖匹配
    faqCheck --> llmGeneration: 無 FAQ 匹配
    faqCheck --> [*]: FAQ 匹配
    llmGeneration --> buildResponse: 生成完成
    buildResponse --> [*]: 響應構建完成
    
    validateRequest --> [*]: 驗證失敗
    initializeServices --> [*]: 初始化失敗
    contextManagement --> [*]: 上下文錯誤
    intentExtraction --> [*]: 提取錯誤
    stateTransition --> [*]: 轉換錯誤
    specialIntents --> [*]: 處理錯誤
    faqCheck --> [*]: 檢查錯誤
    llmGeneration --> [*]: 生成錯誤
    buildResponse --> [*]: 構建錯誤
```

---

## 6. 舊架構 vs Pipeline 架構對比

```mermaid
graph LR
    subgraph 舊架構
        A[onRequestPost<br/>400+ 行] --> B[難以追蹤<br/>難以測試<br/>難以維護]
    end
    
    subgraph Pipeline 架構
        C[onRequestPost<br/>~10 行] --> D[Pipeline 框架]
        D --> E[節點 1]
        D --> F[節點 2]
        D --> G[節點 N]
        E --> H[清晰追蹤<br/>易於測試<br/>易於維護]
        F --> H
        G --> H
    end
    
    style A fill:#ffccbc
    style B fill:#ffccbc
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#c8e6c9
    style F fill:#c8e6c9
    style G fill:#c8e6c9
    style H fill:#c8e6c9
```

---

## 7. 錯誤處理流程

```mermaid
flowchart TD
    Start([請求開始]) --> Pipeline[Pipeline 執行]
    
    Pipeline --> Node1[節點 1]
    Node1 -->|成功| Node2[節點 2]
    Node1 -->|錯誤| Catch[捕獲錯誤]
    
    Node2 -->|成功| Node3[節點 3]
    Node2 -->|錯誤| Catch
    
    Node3 -->|成功| NodeN[節點 N]
    Node3 -->|錯誤| Catch
    
    NodeN -->|成功| Success([成功響應])
    NodeN -->|錯誤| Catch
    
    Catch --> ErrorHandler[error-handler<br/>統一錯誤處理]
    ErrorHandler --> ErrorResponse([錯誤響應<br/>500/503])
    
    style Start fill:#e1f5ff
    style Success fill:#d4edda
    style ErrorResponse fill:#f8d7da
    style ErrorHandler fill:#fff3cd
    style Catch fill:#ffccbc
```

---

## 📊 使用這些圖表

### 在 GitHub/GitLab

直接在 Markdown 文件中使用，平台會自動渲染。

### 在 Notion

1. 創建代碼塊
2. 選擇語言為 `mermaid`
3. 貼上上述代碼

### 在其他平台

1. 使用 [Mermaid Live Editor](https://mermaid.live/)
2. 匯出為 PNG/SVG
3. 插入到文檔中

---

**這些視覺化圖表清晰展示了 Pipeline 模式的優勢！** 🎉

