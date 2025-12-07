# 🔒 安全最佳實踐

## GitHub Personal Access Token 安全

### ✅ 推薦做法

1. **使用 GitHub CLI**
   ```bash
   gh auth login
   ```

2. **使用 SSH Keys**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   git remote set-url origin git@github.com:username/repo.git
   ```

3. **使用環境變數**
   - 在本地設置，不要提交到代碼庫
   - 使用 `.env` 文件（已添加到 `.gitignore`）

### ❌ 避免的做法

- ❌ 在代碼或文檔中寫入真實 token
- ❌ 通過聊天工具分享 token
- ❌ 將 token 提交到 git 倉庫
- ❌ 使用過期的 token

---

## 如果 Token 已暴露

1. **立即撤銷**: GitHub → Settings → Developer settings → Personal access tokens
2. **從歷史移除**: 使用 `git filter-branch` 或聯繫 GitHub Support
3. **創建新的**: 確保勾選 `workflow` 權限

---

## CI/CD Workflow 權限

如果需要在 GitHub Actions 中使用 token：
- 使用 GitHub Secrets（Repository → Settings → Secrets）
- 不要在 workflow 文件中硬編碼 token
- 使用 `${{ secrets.TOKEN_NAME }}` 引用

---

**安全第一！** 🔒

