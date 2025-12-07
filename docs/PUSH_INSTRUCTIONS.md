# 推送指南

## ⚠️ 關於 Token 檢測

GitHub 檢測到歷史 commit (`442bc19`) 中包含 token。

## 🔧 解決方案

### 選項 1: 使用 Bypass（如果可用）

如果 GitHub Desktop 顯示 "Bypass" 按鈕：
1. 點擊 "Bypass" 按鈕
2. 推送會繼續

**注意**: Token 仍然會在 git 歷史中，請確保已撤銷。

### 選項 2: 從歷史中移除（推薦但複雜）

如果需要完全移除 token 從歷史：

```bash
# 使用 git filter-branch 移除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch docs/IMPORTANT_TOKEN_SECURITY.md" \
  --prune-empty --tag-name-filter cat -- --all

# 強制推送（需要權限）
git push origin --force --all
```

**警告**: 這會重寫 git 歷史，影響所有協作者。

### 選項 3: 只推送新的 commit（當前推薦）

當前狀態：
- ✅ 已刪除包含 token 的文件
- ✅ 已創建安全指南（無 token）
- ✅ 新的 commit 不包含 token

可以直接推送新的 commit：

```bash
git push origin main
```

如果 GitHub 仍然阻止，這是因為它檢測到**歷史 commit** 中的 token，不是當前 commit。

---

## ✅ 當前準備狀態

- ✅ 本地已刪除包含 token 的文件
- ✅ 已創建安全文檔
- ✅ 新的 commit 已準備好
- ⚠️  歷史 commit 中仍有 token（這是 GitHub 檢測到的）

---

## 💡 建議

1. **先撤銷 token**（最重要）
2. **嘗試推送**，如果失敗：
   - 使用 Bypass（如果可用）
   - 或從歷史中移除（如果必須）
3. **未來使用 GitHub CLI 或 SSH**，避免直接在代碼中使用 token

---

**記住：即使從 git 歷史中移除，如果 token 已經暴露，還是應該立即撤銷！**

