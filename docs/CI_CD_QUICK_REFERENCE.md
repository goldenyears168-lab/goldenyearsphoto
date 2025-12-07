# CI/CD 快速參考

## 🚀 快速開始

### 已建立的 Workflows

1. **Test Pipeline Nodes** - 測試 Pipeline 節點
2. **Test Backend** - 測試後端 API

---

## 📋 Workflow 列表

### 1. Test Pipeline Nodes

**文件**: `.github/workflows/test-pipeline-nodes.yml`

**測試內容**:
- ✅ Pipeline 結構驗證
- ✅ 所有節點存在性檢查
- ✅ 節點導出和註冊檢查

**觸發條件**:
- PR 或 Push 時修改 `functions/api/**`

---

### 2. Test Backend

**文件**: `.github/workflows/test-backend.yml`

**測試內容**:
- ✅ API 結構檢查
- ✅ 代碼質量檢查 (lint)
- ⚠️ API 集成測試（需要 API key）

**觸發條件**:
- PR 或 Push 時修改 `functions/api/**`

---

## 🔧 本地測試命令

```bash
# 測試 Pipeline
npm run test:pipeline

# 測試 Backend
npm run test:backend

# 運行所有測試
npm run test:all
```

---

## 📊 查看測試結果

### 在 GitHub 上

1. **Pull Request**: 查看 "Checks" tab
2. **Actions 頁面**: Repository → Actions

### 狀態圖標

- ✅ 綠色勾勾 = 通過
- ❌ 紅色叉叉 = 失敗
- ⏸️ 黃色圓圈 = 運行中
- ⚠️ 黃色警告 = 跳過/警告

---

## ⚙️ 可選配置

### 設置 GEMINI_API_KEY Secret

如需運行完整的 API 集成測試：

1. Repository → Settings
2. Secrets and variables → Actions
3. New repository secret
4. Name: `GEMINI_API_KEY`
5. Value: [你的 API key]

**注意**: 未設置時 API 集成測試會被跳過，其他測試正常運行。

---

## 🐛 故障排除

### Workflow 失敗？

1. 查看詳細日誌
2. 本地運行: `npm run test:pipeline`
3. 修復錯誤後重新提交

---

**詳細文檔**: 查看 [CI_CD_SETUP.md](CI_CD_SETUP.md)

