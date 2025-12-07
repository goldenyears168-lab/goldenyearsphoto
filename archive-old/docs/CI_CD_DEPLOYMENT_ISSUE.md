# CI/CD 部署問題解決指南

## ⚠️ 推送失敗原因

推送 workflow 文件時出現錯誤：
```
refusing to allow a Personal Access Token to create or update workflow 
without `workflow` scope
```

**原因**: Personal Access Token 缺少 `workflow` 權限。

---

## 🔧 解決方案

### 方案 1: 更新 Personal Access Token（推薦）

1. **創建新的 Personal Access Token**:
   - 進入 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 點擊 "Generate new token (classic)"
   - 勾選以下權限：
     - ✅ `repo` (完整倉庫訪問)
     - ✅ `workflow` (更新 GitHub Action workflows) ← **重要**
   - 生成並複製 token

2. **更新本地 Git 配置**:
   ```bash
   # 使用新的 token
   git remote set-url origin https://[YOUR_TOKEN]@github.com/goldenyears168-lab/goldenyearsphoto.git
   
   # 或使用 GitHub CLI
   gh auth login
   ```

3. **重新推送**:
   ```bash
   git push origin main
   ```

### 方案 2: 使用 SSH（如果有配置）

如果你有 SSH key 配置：

```bash
# 切換到 SSH URL
git remote set-url origin git@github.com:goldenyears168-lab/goldenyearsphoto.git

# 推送
git push origin main
```

### 方案 3: 在 GitHub 網頁上創建（臨時方案）

如果無法更新 token，可以在 GitHub 網頁上創建 workflow 文件：

1. **複製文件內容**:
   ```bash
   # 查看文件內容
   cat .github/workflows/test-pipeline-nodes.yml
   cat .github/workflows/test-backend.yml
   ```

2. **在 GitHub 上創建**:
   - 進入 GitHub Repository
   - 點擊 "Add file" → "Create new file"
   - 路徑: `.github/workflows/test-pipeline-nodes.yml`
   - 貼上文件內容
   - 重複創建其他 workflow 文件

3. **提交其他文件**:
   ```bash
   # 只提交非 workflow 文件
   git reset HEAD .github/workflows/*.yml
   git commit --amend --no-edit
   git push origin main
   ```

---

## ✅ 推薦做法

### 最佳實踐：使用 GitHub CLI

```bash
# 安裝 GitHub CLI (如果還沒有)
# macOS: brew install gh
# 或下載: https://cli.github.com/

# 登錄
gh auth login

# 選擇 GitHub.com
# 選擇 HTTPS 或 SSH
# 完成認證

# 推送
git push origin main
```

---

## 📋 當前狀態

### 已提交的更改

✅ 本地 commit 已創建:
- Commit: `34bce79 feat: Add CI/CD workflows for Pipeline testing`
- 包含 9 個文件
- 1405 行新增代碼

### 待推送的文件

以下文件已準備好推送：
- ✅ `.github/workflows/test-pipeline-nodes.yml`
- ✅ `.github/workflows/test-backend.yml`
- ✅ `.github/workflows/test-workflow-syntax.yml`
- ✅ 所有文檔和測試腳本

---

## 🚀 完成後的效果

當成功推送後：

1. **GitHub Actions 頁面**:
   - 會出現新的 workflow
   - 可以查看運行狀態

2. **自動觸發**:
   - 下次 Push 到 main 時會自動運行
   - 創建 PR 時會自動運行

3. **測試結果**:
   - 在 Actions 頁面查看
   - 在 PR 的 "Checks" tab 查看

---

## 💡 快速修復

**最快的方法**:

1. 更新 Personal Access Token 添加 `workflow` scope
2. 更新本地 git remote URL
3. 重新推送

或使用 GitHub CLI (推薦):
```bash
gh auth login
git push origin main
```

---

**選擇其中一個方案即可解決問題！** 🔧

