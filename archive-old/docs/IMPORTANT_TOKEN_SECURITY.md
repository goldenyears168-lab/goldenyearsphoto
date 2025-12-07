# ⚠️ 重要：Token 安全提醒

## 🚨 立即行動

**你的 GitHub Personal Access Token 已經暴露！**

Token: `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`

**請立即撤銷這個 token 並創建新的！**

---

## 🔧 如何撤銷 Token

### 步驟 1: 撤銷舊 Token

1. 進入 GitHub → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. 找到 token `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`
4. 點擊 "Revoke"（撤銷）

### 步驟 2: 創建新 Token

1. 點擊 "Generate new token (classic)"
2. 設置名稱（例如：`CI/CD Workflow Access`）
3. 設置過期時間（建議：30 天或更短）
4. 勾選權限：
   - ✅ `repo` (完整倉庫訪問)
   - ✅ `workflow` (更新 GitHub Action workflows) ← **必須勾選**
5. 生成並**立即複製** token

### 步驟 3: 安全保存新 Token

**重要**: 
- ❌ 不要將 token 分享給任何人
- ❌ 不要將 token 提交到代碼庫
- ❌ 不要在聊天中發送 token
- ✅ 使用密碼管理器保存
- ✅ 如果暴露，立即撤銷

---

## 🔒 更安全的做法

### 使用 GitHub CLI (推薦)

```bash
# 安裝 GitHub CLI
# macOS: brew install gh

# 登錄（會自動處理認證）
gh auth login

# 以後推送時不需要手動輸入 token
git push origin main
```

### 使用 SSH Keys

```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 GitHub
# 1. 複製公鑰: cat ~/.ssh/id_ed25519.pub
# 2. GitHub → Settings → SSH and GPG keys → New SSH key

# 切換到 SSH URL
git remote set-url origin git@github.com:goldenyears168-lab/goldenyearsphoto.git
```

---

## ✅ 推送狀態

代碼已成功推送到 GitHub！

你可以在以下位置查看：
- Repository → Actions (查看 workflow 運行狀態)
- Repository → .github/workflows/ (查看 workflow 文件)

---

## 📝 最佳實踐

1. **永遠不要在代碼中硬編碼 token**
2. **使用環境變數或密碼管理器**
3. **定期輪換 token**
4. **為每個用途創建不同的 token**
5. **設置最短的過期時間**

---

**請立即撤銷已暴露的 token！** 🔒

