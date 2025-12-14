# 報告配置說明

## 📋 報告輸出位置

所有報告文件現在統一輸出到 `report/` 資料夾，不再散落到專案根目錄。

## 🔧 已更新的腳本

以下腳本已更新，會自動將報告輸出到 `report/` 資料夾：

1. ✅ `comprehensive-code-analysis.py` → `report/CODE_ANALYSIS_REPORT.txt` 和 `report/code_analysis_results.json`
2. ✅ `cleanup-and-refactor.py` → `report/REFACTOR_PLAN.md`
3. ✅ `design-system-audit.py` → `report/DESIGN_SYSTEM_AUDIT_REPORT.md`
4. ✅ `visual-test.py` → `report/VISUAL_TEST_REPORT.md`
5. ✅ `test-migration.py` → `report/MIGRATION_TEST_REPORT.md`
6. ✅ `analyze-deprecated-tokens.py` → `report/DEPRECATED_TOKENS_AND_VARIANTS_REPORT.md`
7. ✅ `fix-undefined-colors.py` → `report/UNDEFINED_COLORS_REPORT.md`
8. ✅ `check-accessibility-colors.py` → `report/ACCESSIBILITY_COLOR_REPORT.json`
9. ✅ `migrate-to-components.py` → `report/MIGRATION_SUGGESTIONS.md`

## 📝 如何添加新的報告腳本

當創建新的報告生成腳本時，請遵循以下模式：

```python
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

# 確保 report 目錄存在
report_dir = PROJECT_ROOT / 'report'
report_dir.mkdir(exist_ok=True)

# 保存報告
report_path = report_dir / "YOUR_REPORT_NAME.md"
with open(report_path, 'w', encoding='utf-8') as f:
    f.write(report_content)

print(f"✅ 報告已保存到: {report_path}")
```

## 🎯 原則

1. **統一位置**: 所有報告都輸出到 `report/` 資料夾
2. **自動創建**: 腳本會自動創建 `report/` 資料夾（如果不存在）
3. **清晰命名**: 報告文件名應該清晰描述其內容
4. **README**: `report/README.md` 說明報告類型

## 📌 注意事項

- 報告文件可能會被覆蓋（每次運行腳本時）
- 可以根據需要將 `report/` 添加到 `.gitignore`
- 重要報告建議提交到版本控制

---

**最後更新**: 2024-12-14
