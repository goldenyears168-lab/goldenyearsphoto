# Pipeline 視覺化快速開始

## 🚀 5 分鐘快速開始

### 步驟 1: 查看 Mermaid 流程圖（最簡單）

在 GitHub/GitLab 上打開：

```
docs/PIPELINE_FLOW_DIAGRAM.md
```

**會自動渲染 Mermaid 流程圖！** ✨

---

### 步驟 2: 查看 ASCII 流程圖

```bash
cat docs/PIPELINE_VISUALIZATION.md
```

**看到完整的 ASCII 流程圖和時間軸！** 📊

---

### 步驟 3: 生成自定義圖表

```bash
node scripts/generate-pipeline-diagram.mjs
```

**在終端查看所有視覺化內容！** 🎨

---

### 步驟 4: 查看實際執行

```bash
wrangler pages deployment tail --project-name=goldenyearsphoto | grep "\[Pipeline:"
```

**看到實際的 Pipeline 執行日誌！** 📈

---

## 📚 完整文檔

- **`docs/PIPELINE_VISUALIZATION.md`** - 完整視覺化展示
- **`docs/PIPELINE_FLOW_DIAGRAM.md`** - Mermaid 流程圖
- **`docs/HOW_TO_VISUALIZE_PIPELINE.md`** - 詳細使用指南

---

**就是這麼簡單！** 🎉

