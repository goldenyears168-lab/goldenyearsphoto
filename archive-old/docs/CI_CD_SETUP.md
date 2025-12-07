# Pipeline CI/CD 設置說明

## ✅ 已建立的 CI/CD Workflows

### 1. Test Pipeline Nodes (`test-pipeline-nodes.yml`)

**用途**: 測試 Pipeline 節點結構和完整性

**觸發條件**:
- Pull Request (當修改 `functions/api/**` 或相關測試腳本)
- Push 到 main 分支

**測試內容**:
- ✅ MVP 實現驗證 (`verify-mvp.mjs`)
- ✅ Pipeline 對比測試 (`test-pipeline-comparison.mjs`)
- ✅ TypeScript 編譯檢查（如果可用）
- ✅ 所有節點文件存在性檢查
- ✅ Pipeline 核心文件檢查
- ✅ 節點導出檢查
- ✅ 節點註冊檢查

**運行時間**: ~2-3 分鐘

---

### 2. Test Backend (`test-backend.yml`)

**用途**: 測試後端 API 結構和代碼質量

**觸發條件**:
- Pull Request (當修改 `functions/api/**` 或測試腳本)
- Push 到 main 分支

**測試內容**:
- ✅ API 結構完整性檢查
- ✅ API 導出檢查
- ✅ 測試腳本存在性檢查
- ✅ JavaScript 代碼檢查 (lint)
- ✅ CSS 代碼檢查 (lint)
- ⚠️ API 集成測試（需要 GEMINI_API_KEY secret）

**運行時間**: ~3-5 分鐘

---

## 🔧 配置說明

### 環境要求

- Node.js 18
- npm

### 必要的 Secrets（可選）

要運行完整的 API 集成測試，需要在 GitHub Repository Settings 中設置：

**Repository Secrets**:
- `GEMINI_API_KEY` - Gemini API 密鑰（用於 API 集成測試）

**設置方法**:
1. 進入 Repository → Settings
2. Secrets and variables → Actions
3. New repository secret
4. 添加 `GEMINI_API_KEY`

**注意**: 如果未設置 `GEMINI_API_KEY`，API 集成測試會被跳過，但其他測試仍會正常運行。

---

## 📊 Workflow 執行狀態

### Test Pipeline Nodes

會在以下情況觸發：
- ✅ 修改 Pipeline 相關代碼
- ✅ 修改測試腳本
- ✅ Push 到 main 分支

### Test Backend

會在以下情況觸發：
- ✅ 修改 API 相關代碼
- ✅ 修改測試腳本
- ✅ Push 到 main 分支

---

## 🧪 本地測試

在提交之前，可以在本地運行相同的測試：

### 測試 Pipeline

```bash
npm run test:pipeline
```

這會運行：
- Pipeline 對比測試
- MVP 驗證

### 測試 Backend

```bash
npm run test:backend
```

### 運行所有測試

```bash
npm run test:all
```

---

## 📈 CI/CD 流程

### Pull Request 流程

```
PR 創建/更新
    ↓
Test Pipeline Nodes (自動觸發)
    ↓
Test Backend (自動觸發)
    ↓
顯示測試結果在 PR 中
```

### Main 分支 Push 流程

```
Push to main
    ↓
Test Pipeline Nodes (自動觸發)
    ↓
Test Backend (自動觸發)
    ↓
API 集成測試 (如果有 GEMINI_API_KEY)
    ↓
所有測試通過 ✅
```

---

## 🔍 查看測試結果

### 在 GitHub 上查看

1. **在 Pull Request 中**:
   - 點擊 "Checks" tab
   - 查看各個 workflow 的執行狀態

2. **在 Actions 頁面**:
   - 進入 Repository → Actions
   - 查看所有 workflow 運行歷史

### 測試結果說明

- ✅ **綠色勾勾**: 所有測試通過
- ❌ **紅色叉叉**: 有測試失敗
- ⏸️ **黃色圓圈**: 測試運行中
- ⚠️ **黃色警告**: 測試跳過或非阻塞性問題

---

## 🛠️ 故障排除

### Workflow 失敗

**常見原因**:
1. 缺少必要的文件
2. 測試腳本執行失敗
3. 代碼檢查失敗

**解決方法**:
1. 查看 workflow 詳細日誌
2. 在本地運行相同測試: `npm run test:pipeline`
3. 修復錯誤後重新提交

### API 集成測試被跳過

**原因**: 未設置 `GEMINI_API_KEY` secret

**解決方法**:
1. 設置 `GEMINI_API_KEY` secret（可選）
2. 或忽略此測試（其他測試仍會運行）

---

## 📝 維護建議

### 定期檢查

- ✅ 確保所有 workflow 正常運行
- ✅ 更新 Node.js 版本（如需要）
- ✅ 更新測試腳本

### 添加新測試

當添加新的 Pipeline 節點或功能時：

1. 更新 `test-pipeline-comparison.mjs`（如需要）
2. 更新 `verify-mvp.mjs`（如需要）
3. Workflow 會自動運行新測試

---

## 🎯 下一步

### 可選的增強功能

1. **自動部署**: 當所有測試通過後自動部署到 Cloudflare Pages
2. **性能測試**: 添加性能基準測試
3. **覆蓋率報告**: 添加代碼覆蓋率檢查
4. **通知**: 測試失敗時發送通知

---

**CI/CD 系統已就緒！** 🚀

所有 Pipeline 相關的更改都會自動測試，確保代碼質量。

