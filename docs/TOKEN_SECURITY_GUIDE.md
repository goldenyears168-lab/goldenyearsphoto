# 🔒 GitHub Token 安全指南

## ⚠️ 重要提醒

**永遠不要在代碼庫中提交任何 Personal Access Token！**

如果你不小心提交了 token，請立即：
1. 撤銷該 token
2. 從 git 歷史中移除
3. 創建新的 token

---

## 🚨 Token 暴露處理步驟

### 步驟 1: 立即撤銷 Token

1. 進入 GitHub → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. 找到暴露的 token
4. 點擊 "Revoke"（撤銷）

### 步驟 2: 從 Git 歷史中移除

如果 token 已經被推送到遠程倉庫：

```bash
# 使用 git filter-branch 或 BFG Repo-Cleaner
# 或者聯繫 GitHub Support 尋求幫助
```

### 步驟 3: 創建新 Token

1. Generate new token (classic)
2. 勾選必要權限：
   - ✅ `repo` (完整倉庫訪問)
   - ✅ `workflow` (更新 GitHub Action workflows)
3. 設置合理的過期時間
4. **安全保存**（使用密碼管理器）

---

## 🔒 最佳實踐

### 1. 使用 GitHub CLI（推薦）

```bash
# 安裝
# macOS: brew install gh

# 登錄（自動處理認證）
gh auth login

# 以後推送不需要 token
git push origin main
```

### 2. 使用 SSH Keys

```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 GitHub
# GitHub → Settings → SSH and GPG keys → New SSH key

# 切換到 SSH URL
git remote set-url origin git@github.com:username/repo.git
```

### 3. 使用環境變數

如果必須使用 token：

```bash
# 設置環境變數（不要提交到代碼庫）
export GITHUB_TOKEN=your_token_here

# 使用環境變數
git remote set-url origin https://${GITHUB_TOKEN}@github.com/username/repo.git
```

### 4. 使用 Git Credential Helper

```bash
# macOS
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper cache
```

---

## 📝 安全規則

✅ **應該做的**:
- 使用密碼管理器保存 token
- 定期輪換 token
- 為每個用途創建不同的 token
- 設置最短的過期時間
- 使用 GitHub CLI 或 SSH

❌ **不應該做的**:
- 將 token 提交到代碼庫
- 在聊天中分享 token
- 在文檔中寫入真實 token
- 使用過期的 token
- 共享個人 token

---

## 🔍 檢查工具

### 檢查是否有 token 洩露

```bash
# 使用 GitHub CLI 檢查
gh secret scan

# 或使用 git-secrets
git secrets --scan
```

### 檢查 Git 歷史

```bash
# 搜索可能洩露的 token
git log --all --full-history -S "ghp_" -- source
```

---

## 💡 提示

- GitHub 會自動掃描並阻止提交包含 token 的 commit
- 如果看到 "Secret Detected" 警告，請不要強制推送
- 使用 GitHub CLI 是最安全和方便的方式

---

**記住：Token 安全是每個開發者的責任！** 🔒

