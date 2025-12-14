#!/usr/bin/env python3
"""
測試遷移後的代碼
驗證 macro 使用、語法正確性、樣式一致性等
"""

import re
from pathlib import Path
from typing import Dict, List
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"
MACROS_DIR = PROJECT_ROOT / "src" / "_includes" / "macros"

# 已遷移的文件
MIGRATED_FILES = [
    "src/blog/workshop.njk",
    "src/guide/crop-tool.njk",
    "src/services/group-photo.njk",
]

# 可用的 macros
AVAILABLE_MACROS = {
    'button': 'button.njk',
    'card': 'card.njk',
    'input': 'input.njk',
    'textarea': 'textarea.njk',
    'select': 'select.njk',
    'checkbox': 'checkbox.njk',
    'radio': 'radio.njk',
    'formGroup': 'form-group.njk',
    'badge': 'badge.njk',
    'alert': 'alert.njk',
    'heading': 'heading.njk',
    'container': 'container.njk',
    'grid': 'grid.njk',
    'stack': 'stack.njk',
    'flex': 'flex.njk',
}

class MigrationTester:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
        self.stats = defaultdict(int)
    
    def test_file(self, file_path: Path) -> Dict:
        """測試單個文件"""
        print(f"\n🔍 測試文件: {file_path.relative_to(PROJECT_ROOT)}")
        
        try:
            content = file_path.read_text(encoding='utf-8')
        except Exception as e:
            self.errors.append(f"無法讀取文件: {e}")
            return {'status': 'error', 'errors': [str(e)]}
        
        results = {
            'file': str(file_path.relative_to(PROJECT_ROOT)),
            'status': 'pass',
            'errors': [],
            'warnings': [],
            'info': []
        }
        
        # 1. 檢查 macro 導入
        macro_imports = self.check_macro_imports(content, file_path)
        results['macro_imports'] = macro_imports
        
        # 2. 檢查 macro 使用
        macro_usage = self.check_macro_usage(content, file_path)
        results['macro_usage'] = macro_usage
        
        # 3. 檢查硬編碼樣式
        hardcoded_styles = self.check_hardcoded_styles(content, file_path)
        results['hardcoded_styles'] = hardcoded_styles
        
        # 4. 檢查語法
        syntax_errors = self.check_syntax(content, file_path)
        results['syntax_errors'] = syntax_errors
        
        # 5. 檢查卡片遷移
        card_migration = self.check_card_migration(content, file_path)
        results['card_migration'] = card_migration
        
        # 6. 檢查按鈕遷移
        button_migration = self.check_button_migration(content, file_path)
        results['button_migration'] = button_migration
        
        # 收集結果
        if results['errors']:
            results['status'] = 'error'
        elif results['warnings']:
            results['status'] = 'warning'
        else:
            results['status'] = 'pass'
        
        return results
    
    def check_macro_imports(self, content: str, file_path: Path) -> Dict:
        """檢查 macro 導入"""
        imports = {}
        used_macros = set()
        
        # 查找使用的 macros
        for macro_name in AVAILABLE_MACROS.keys():
            pattern = r'\{\{\s*' + re.escape(macro_name) + r'\s*\('
            if re.search(pattern, content, re.IGNORECASE):
                used_macros.add(macro_name)
        
        # 查找導入語句
        import_pattern = r"{%\s*from\s+[\"']macros/([^\"']+)\.njk[\"']\s+import\s+(\w+)\s*%}"
        found_imports = re.findall(import_pattern, content)
        
        imported_macros = {}
        for macro_file, macro_name in found_imports:
            imported_macros[macro_name] = macro_file
        
        # 檢查缺失的導入
        missing_imports = []
        for macro_name in used_macros:
            if macro_name not in imported_macros.values():
                # 檢查是否有對應的導入
                macro_file = AVAILABLE_MACROS.get(macro_name)
                if macro_file:
                    found = False
                    for imported_file, imported_name in found_imports:
                        if imported_file == macro_file.replace('.njk', '') and imported_name == macro_name:
                            found = True
                            break
                    if not found:
                        missing_imports.append(f"{macro_name} (應從 {macro_file} 導入)")
        
        return {
            'used': list(used_macros),
            'imported': imported_macros,
            'missing': missing_imports
        }
    
    def check_macro_usage(self, content: str, file_path: Path) -> Dict:
        """檢查 macro 使用是否正確"""
        issues = []
        
        # 檢查 button macro 使用
        button_pattern = r'\{\{\s*button\s*\([^)]*\)\s*\}\}'
        button_matches = re.findall(button_pattern, content)
        
        for match in button_matches:
            # 檢查是否有基本參數
            if not re.search(r'button\s*\([^,)]+', match):
                issues.append(f"Button macro 參數可能不完整: {match[:50]}...")
        
        # 檢查 card macro 使用
        card_pattern = r'\{\{\s*card\s*\([^)]*\)\s*\}\}'
        card_matches = re.findall(card_pattern, content)
        
        for match in card_matches:
            # 檢查是否有基本參數
            if not re.search(r'card\s*\([^,)]+', match):
                issues.append(f"Card macro 參數可能不完整: {match[:50]}...")
        
        return {
            'button_count': len(button_matches),
            'card_count': len(card_matches),
            'issues': issues
        }
    
    def check_hardcoded_styles(self, content: str, file_path: Path) -> Dict:
        """檢查是否還有硬編碼的樣式"""
        issues = []
        
        # 檢查硬編碼的卡片樣式
        hardcoded_card_pattern = r'class=["\'][^"\']*bento-card[^"\']*(?:bg-white|bg-sand-50|rounded-2xl|border\s+border-sand-200)[^"\']*["\']'
        hardcoded_cards = re.findall(hardcoded_card_pattern, content)
        
        if hardcoded_cards:
            issues.append(f"發現 {len(hardcoded_cards)} 處硬編碼卡片樣式，建議使用 card macro")
        
        # 檢查硬編碼的按鈕樣式
        hardcoded_button_pattern = r'class=["\'][^"\']*(?:btn-primary|btn-secondary|btn-ghost)[^"\']*(?:px-8\s+py-4|rounded-full)[^"\']*["\']'
        hardcoded_buttons = re.findall(hardcoded_button_pattern, content)
        
        if hardcoded_buttons:
            issues.append(f"發現 {len(hardcoded_buttons)} 處硬編碼按鈕樣式，建議使用 button macro")
        
        return {
            'hardcoded_cards': len(hardcoded_cards),
            'hardcoded_buttons': len(hardcoded_buttons),
            'issues': issues
        }
    
    def check_syntax(self, content: str, file_path: Path) -> Dict:
        """檢查基本語法"""
        issues = []
        
        # 檢查未閉合的標籤（簡單檢查）
        open_tags = len(re.findall(r'<[^/][^>]*>', content))
        close_tags = len(re.findall(r'</[^>]+>', content))
        
        # 檢查 Nunjucks 語法
        nunjucks_blocks = len(re.findall(r'{%\s*[^%]+%}', content))
        nunjucks_vars = len(re.findall(r'\{\{[^}]+\}\}', content))
        
        # 檢查可能的語法錯誤
        if content.count('{{') != content.count('}}'):
            issues.append("Nunjucks 變數標籤可能未閉合")
        
        if content.count('{%') != content.count('%}'):
            issues.append("Nunjucks 語句標籤可能未閉合")
        
        return {
            'open_tags': open_tags,
            'close_tags': close_tags,
            'nunjucks_blocks': nunjucks_blocks,
            'nunjucks_vars': nunjucks_vars,
            'issues': issues
        }
    
    def check_card_migration(self, content: str, file_path: Path) -> Dict:
        """檢查卡片遷移情況"""
        # 使用 card macro 的次數
        card_macro_usage = len(re.findall(r'\{\{\s*card\s*\(', content))
        
        # 硬編碼的卡片（應該被遷移的）
        hardcoded_cards = len(re.findall(
            r'class=["\'][^"\']*bento-card[^"\']*(?:bg-white|bg-sand-50)[^"\']*["\']',
            content
        ))
        
        return {
            'card_macro_count': card_macro_usage,
            'hardcoded_count': hardcoded_cards,
            'migration_complete': hardcoded_cards == 0
        }
    
    def check_button_migration(self, content: str, file_path: Path) -> Dict:
        """檢查按鈕遷移情況"""
        # 使用 button macro 的次數
        button_macro_usage = len(re.findall(r'\{\{\s*button\s*\(', content))
        
        # 使用 btn 類的次數（可能已標準化但未使用 macro）
        btn_class_usage = len(re.findall(r'class=["\'][^"\']*\bbtn\b[^"\']*["\']', content))
        
        return {
            'button_macro_count': button_macro_usage,
            'btn_class_count': btn_class_usage,
            'migration_suggested': btn_class_usage > button_macro_usage
        }
    
    def generate_report(self, results: List[Dict]) -> str:
        """生成測試報告"""
        report = "# 遷移測試報告\n\n"
        report += f"**測試日期**: 2025-12-14\n"
        report += f"**測試文件數**: {len(results)}\n\n"
        
        # 統計
        passed = sum(1 for r in results if r['status'] == 'pass')
        warnings = sum(1 for r in results if r['status'] == 'warning')
        errors = sum(1 for r in results if r['status'] == 'error')
        
        report += "## 📊 測試統計\n\n"
        report += f"- ✅ **通過**: {passed} 個文件\n"
        report += f"- ⚠️ **警告**: {warnings} 個文件\n"
        report += f"- ❌ **錯誤**: {errors} 個文件\n\n"
        
        report += "---\n\n"
        
        # 詳細結果
        report += "## 📝 詳細結果\n\n"
        
        for result in results:
            status_icon = {
                'pass': '✅',
                'warning': '⚠️',
                'error': '❌'
            }.get(result['status'], '❓')
            
            report += f"### {status_icon} `{result['file']}`\n\n"
            
            # Macro 導入
            if result.get('macro_imports'):
                imports = result['macro_imports']
                report += f"**使用的 Macros**: {', '.join(imports.get('used', [])) or '無'}\n\n"
                if imports.get('missing'):
                    report += f"⚠️ **缺失的導入**: {', '.join(imports['missing'])}\n\n"
            
            # Macro 使用
            if result.get('macro_usage'):
                usage = result['macro_usage']
                report += f"- Button macro: {usage.get('button_count', 0)} 處\n"
                report += f"- Card macro: {usage.get('card_count', 0)} 處\n"
                if usage.get('issues'):
                    report += f"⚠️ **問題**: {', '.join(usage['issues'])}\n"
                report += "\n"
            
            # 硬編碼樣式
            if result.get('hardcoded_styles'):
                styles = result['hardcoded_styles']
                if styles.get('hardcoded_cards', 0) > 0:
                    report += f"⚠️ **硬編碼卡片**: {styles['hardcoded_cards']} 處\n"
                if styles.get('hardcoded_buttons', 0) > 0:
                    report += f"⚠️ **硬編碼按鈕**: {styles['hardcoded_buttons']} 處\n"
                if styles.get('issues'):
                    for issue in styles['issues']:
                        report += f"  - {issue}\n"
                report += "\n"
            
            # 遷移狀態
            if result.get('card_migration'):
                card_mig = result['card_migration']
                report += f"**卡片遷移**: {card_mig.get('card_macro_count', 0)} 處使用 macro"
                if card_mig.get('hardcoded_count', 0) > 0:
                    report += f", {card_mig['hardcoded_count']} 處仍硬編碼"
                report += "\n\n"
            
            if result.get('button_migration'):
                btn_mig = result['button_migration']
                report += f"**按鈕遷移**: {btn_mig.get('button_macro_count', 0)} 處使用 macro"
                if btn_mig.get('btn_class_count', 0) > 0:
                    report += f", {btn_mig['btn_class_count']} 處使用 btn 類"
                report += "\n\n"
            
            # 錯誤
            if result.get('errors'):
                report += "❌ **錯誤**:\n"
                for error in result['errors']:
                    report += f"  - {error}\n"
                report += "\n"
            
            # 警告
            if result.get('warnings'):
                report += "⚠️ **警告**:\n"
                for warning in result['warnings']:
                    report += f"  - {warning}\n"
                report += "\n"
            
            report += "---\n\n"
        
        # 總結
        report += "## ✅ 測試總結\n\n"
        
        if errors == 0 and warnings == 0:
            report += "🎉 **所有測試通過！** 遷移成功，沒有發現問題。\n\n"
        elif errors == 0:
            report += "✅ **基本通過**，但有一些警告需要關注。建議檢查警告項目。\n\n"
        else:
            report += "❌ **發現錯誤**，請修復後重新測試。\n\n"
        
        report += "## 🔍 建議\n\n"
        report += "1. **視覺檢查**: 在瀏覽器中查看遷移後的頁面，確保樣式正確\n"
        report += "2. **功能測試**: 測試所有互動功能（按鈕點擊、表單提交等）\n"
        report += "3. **響應式測試**: 在不同設備尺寸下測試頁面顯示\n"
        report += "4. **性能測試**: 檢查頁面加載速度是否正常\n\n"
        
        return report

def main():
    """主函數"""
    print("🧪 開始測試遷移後的代碼...\n")
    
    tester = MigrationTester()
    results = []
    
    for file_path_str in MIGRATED_FILES:
        file_path = PROJECT_ROOT / file_path_str
        if file_path.exists():
            result = tester.test_file(file_path)
            results.append(result)
        else:
            print(f"⚠️ 文件不存在: {file_path_str}")
    
    # 生成報告
    report = tester.generate_report(results)
    
    # 確保 report 目錄存在
    report_dir = PROJECT_ROOT / 'report'
    report_dir.mkdir(exist_ok=True)
    
    # 保存報告
    report_path = report_dir / "MIGRATION_TEST_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✅ 測試完成！報告已保存至: {report_path}")
    
    # 打印摘要
    passed = sum(1 for r in results if r['status'] == 'pass')
    warnings = sum(1 for r in results if r['status'] == 'warning')
    errors = sum(1 for r in results if r['status'] == 'error')
    
    print(f"\n📊 測試摘要:")
    print(f"  ✅ 通過: {passed}")
    print(f"  ⚠️ 警告: {warnings}")
    print(f"  ❌ 錯誤: {errors}")

if __name__ == '__main__':
    main()

