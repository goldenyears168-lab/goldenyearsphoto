# 報告資料夾

此資料夾包含專案中所有自動生成的報告文件。

## 📋 報告類型

### 代碼分析報告
- `CODE_ANALYSIS_REPORT.txt` - 全面代碼分析報告
- `code_analysis_results.json` - 詳細分析結果（JSON 格式）

### 修復報告
- `CODE_FIXES_REPORT.md` - 代碼修復報告
- `CLEANUP_COMMENTS_REPORT.md` - 註釋清理報告
- `VERIFICATION_REPORT.md` - 代碼驗證報告
- `FINAL_VERIFICATION_SUMMARY.md` - 最終驗證總結

### 重構計劃
- `REFACTOR_PLAN.md` - 大文件拆分計劃
- `HIGH_PRIORITY_FIXES_SUMMARY.md` - 高優先級修復總結

### 其他報告
- `DESIGN_SYSTEM_AUDIT_REPORT.md` - 設計系統稽核報告（如生成）
- `VISUAL_TEST_REPORT.md` - 視覺測試報告（如生成）
- `MIGRATION_TEST_REPORT.md` - 遷移測試報告（如生成）
- `DEPRECATED_TOKENS_AND_VARIANTS_REPORT.md` - 廢棄令牌報告（如生成）
- `UNDEFINED_COLORS_REPORT.md` - 未定義顏色報告（如生成）
- `ACCESSIBILITY_COLOR_REPORT.json` - 可訪問性顏色報告（如生成）

## 📝 說明

所有報告文件都會自動生成到此資料夾，不會散落到專案根目錄。

## 🔧 生成報告的腳本

以下腳本會自動將報告輸出到此資料夾：

- `scripts/comprehensive-code-analysis.py` - 全面代碼分析
- `scripts/cleanup-and-refactor.py` - 清理和重構
- `scripts/verify-cleanup.py` - 驗證清理結果
- `scripts/design-system-audit.py` - 設計系統稽核
- `scripts/visual-test.py` - 視覺測試
- `scripts/test-migration.py` - 遷移測試
- `scripts/analyze-deprecated-tokens.py` - 分析廢棄令牌
- `scripts/fix-undefined-colors.py` - 修復未定義顏色
- `scripts/check-accessibility-colors.py` - 檢查可訪問性顏色

## 📌 注意事項

- 報告文件可能會被覆蓋（每次運行腳本時）
- 建議將重要報告提交到版本控制
- 可以根據需要將報告添加到 `.gitignore`

---

**最後更新**: 2024-12-14
