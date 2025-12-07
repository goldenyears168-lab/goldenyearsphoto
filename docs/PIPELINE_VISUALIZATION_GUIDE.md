# Pipeline 視覺化指南

## 📖 如何使用 Pipeline 視覺化功能

作為資深工程師，我已經為你創建了完整的 Pipeline 視覺化系統。以下是使用指南。

---

## 🎨 1. 視覺化文檔

### 已創建的文檔

1. **`docs/PIPELINE_VISUALIZATION.md`**
   - 完整的 ASCII 流程圖
   - 時間軸視覺化
   - 結構化日誌示例
   - 舊架構 vs Pipeline 對比

2. **`docs/PIPELINE_FLOW_DIAGRAM.md`**
   - Mermaid 格式的流程圖
   - 可在 GitHub/GitLab/Notion 直接渲染
   - 包含多種圖表類型（流程圖、數據流圖、時間軸等）

---

## 🛠️ 2. 視覺化工具

### 工具 1: `scripts/generate-pipeline-diagram.mjs`

生成各種格式的 Pipeline 流程圖。

**使用方式**:
```bash
node scripts/generate-pipeline-diagram.mjs
```

**輸出**:
- ASCII 流程圖
- 時間軸圖
- Mermaid 流程圖代碼
- JSON 執行報告
- 自動保存到 `docs/pipeline-visualizations/`

### 工具 2: `scripts/visualize-pipeline-execution.mjs`

從實際日誌生成視覺化圖表。

**使用方式**:
```bash
node scripts/visualize-pipeline-execution.mjs
```

---

## 📊 3. 實際應用場景

### 場景 1: 調試執行問題

當需要調試 Pipeline 執行時：

1. **查看 Cloudflare Pages 日誌**:
   ```bash
   wrangler pages deployment tail --project-name=goldenyearsphoto
   ```

2. **過濾 Pipeline 日誌**:
   查找 `[Pipeline:` 開頭的日誌

3. **使用視覺化工具**:
   將日誌複製到工具中，生成視覺化圖表

### 場景 2: 性能分析

識別性能瓶頸：

1. **查看時間軸圖**:
   找出執行最慢的節點

2. **查看統計資訊**:
   - 平均執行時間
   - 最慢節點
   - 總執行時間

3. **優化建議**:
   針對慢節點進行優化

### 場景 3: 團隊展示

向團隊展示 Pipeline 架構：

1. **使用 Mermaid 流程圖**:
   在 GitHub README 或文檔中展示

2. **使用 ASCII 圖**:
   在技術文檔中展示

3. **使用對比圖**:
   展示舊架構 vs Pipeline 架構的優勢

---

## 🔍 4. 查看實際執行流程

### 方法 1: 從日誌查看

Pipeline 框架已經實現了結構化日誌：

```
ℹ️  [Pipeline:validateRequest] [INFO] 開始執行節點: validateRequest
✅ [Pipeline:validateRequest] [SUCCESS] 節點 validateRequest 執行完成 (5ms)
```

### 方法 2: 從 PipelineContext 查看

每個 Pipeline 執行都會在 `ctx.logs` 中記錄：

```typescript
// 在響應中添加執行資訊（開發模式）
if (ctx.env.ENVIRONMENT === 'development') {
  console.log('Pipeline Execution Logs:', JSON.stringify(ctx.logs, null, 2));
}
```

### 方法 3: 使用響應頭部（可選）

可以修改 `chat-pipeline.ts` 在響應中添加執行資訊：

```typescript
const response = await pipeline.execute(pipelineContext);

// 開發模式：添加執行追蹤
if (ctx.env.DEBUG === 'true') {
  const executionInfo = {
    nodes: pipelineContext.logs.map(log => ({
      node: log.node,
      level: log.level,
      duration: log.duration,
    })),
    totalDuration: Date.now() - startTime,
  };
  response.headers.set('X-Pipeline-Execution', JSON.stringify(executionInfo));
}
```

---

## 📈 5. 創建監控儀表板

### 使用 Cloudflare Analytics

1. 過濾 `[Pipeline:` 日誌
2. 分析執行時間
3. 追蹤錯誤率

### 使用第三方監控工具

1. 將日誌匯出到 Grafana/Datadog
2. 創建可視化儀表板
3. 設置告警規則

---

## 🎯 6. 展現 Pipeline 優勢的具體方法

### 方法 1: 在 README 中展示

在項目 README.md 中添加：

```markdown
## Pipeline 架構

我們使用 Pipeline 模式來處理 AI 客服請求：

![Pipeline Flow](docs/PIPELINE_FLOW_DIAGRAM.md)

詳細流程圖請查看 [Pipeline 視覺化文檔](docs/PIPELINE_VISUALIZATION.md)
```

### 方法 2: 在代碼審查中展示

展示：
- 舊代碼（400+ 行單一函數）
- 新代碼（9 個獨立節點）
- 執行流程對比圖

### 方法 3: 在技術分享中展示

使用 Mermaid 流程圖：
- GitHub 自動渲染
- Notion 支持 Mermaid
- 也可以匯出為圖片

### 方法 4: 創建執行追蹤頁面（可選）

可以創建一個開發工具頁面：

```typescript
// functions/api/pipeline-trace.ts
export async function onRequestGet(context: {
  request: Request;
  env: any;
}): Promise<Response> {
  // 返回最近的 Pipeline 執行追蹤（可視化）
  // 需要存儲執行記錄（如使用 KV 或 D1）
}
```

---

## 💡 7. 最佳實踐

### 實踐 1: 定期檢查執行時間

使用視覺化工具定期分析：
- 哪個節點最慢
- 是否有性能退化
- 是否需要優化

### 實踐 2: 使用視覺化調試

當遇到問題時：
1. 查看執行流程圖
2. 找出失敗的節點
3. 查看該節點的日誌
4. 快速定位問題

### 實踐 3: 向團隊展示

使用視覺化圖表：
- 展示架構優勢
- 說明執行流程
- 培訓新成員

---

## 📚 8. 相關文檔

- `docs/PIPELINE_VISUALIZATION.md` - 完整視覺化展示
- `docs/PIPELINE_FLOW_DIAGRAM.md` - Mermaid 流程圖
- `docs/PIPELINE_REFACTORING_PLAN.md` - 重構計劃
- `docs/PIPELINE_TEST_REPORT.md` - 測試報告

---

**這些視覺化工具幫助你清晰展示 Pipeline 模式的優勢！** 🎉

