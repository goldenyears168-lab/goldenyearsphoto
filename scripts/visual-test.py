#!/usr/bin/env python3
"""
視覺測試輔助腳本
檢查遷移後的頁面結構和樣式類是否正確
"""

import re
from pathlib import Path
from typing import Dict

PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# 設計系統標準類
DESIGN_SYSTEM_CLASSES = {
    'cards': {
        'bento-card': True,
        'bento-card-default': True,
        'bento-card-sand': True,
        'bento-card-elevated': True,
        'bento-card-bordered': True,
    },
    'buttons': {
        'btn': True,
        'btn-primary': True,
        'btn-secondary': True,
        'btn-ghost': True,
        'btn-sm': True,
        'btn-md': True,
        'btn-lg': True,
    },
    'colors': {
        'bg-trust-950': True,
        'bg-trust-900': True,
        'bg-sand-50': True,
        'bg-sand-100': True,
        'text-trust-950': True,
        'text-slate-600': True,
        'border-sand-200': True,
    }
}

def check_design_system_compliance(file_path: Path) -> Dict:
    """檢查設計系統合規性"""
    content = file_path.read_text(encoding='utf-8')
    
    issues = []
    stats = {
        'total_classes': 0,
        'design_system_classes': 0,
        'non_design_system_classes': 0,
    }
    
    class_pattern = r'class=["\']([^"\']+)["\']'
    class_matches = re.findall(class_pattern, content)
    
    all_classes = set()
    for class_string in class_matches:
        classes = class_string.split()
        all_classes.update(classes)
        stats['total_classes'] += len(classes)
    
    # 檢查設計系統類
    design_system_found = set()
    non_design_system = set()
    
    for class_name in all_classes:
        found = False
        for category, classes in DESIGN_SYSTEM_CLASSES.items():
            if class_name in classes:
                design_system_found.add(class_name)
                stats['design_system_classes'] += 1
                found = True
                break
        
        if not found:
            # 檢查是否是 Tailwind 標準類（如 text-xl, mb-4 等）
            if re.match(r'^(text|bg|border|p|m|w|h|flex|grid|gap|rounded|shadow|hover|focus|md|lg|xl|sm|xs|xxs)', class_name):
                # 這是 Tailwind 標準類，可以接受
                pass
            else:
                non_design_system.add(class_name)
                stats['non_design_system_classes'] += 1
    
    if non_design_system:
        issues.append(f"發現 {len(non_design_system)} 個非設計系統類: {', '.join(sorted(non_design_system)[:10])}")
    
    return {
        'stats': stats,
        'design_system_classes': sorted(design_system_found),
        'non_design_system_classes': sorted(non_design_system),
        'issues': issues
    }

def check_macro_content_structure(file_path: Path) -> Dict:
    """檢查 macro 內容結構是否正確"""
    content = file_path.read_text(encoding='utf-8')
    
    issues = []
    
    # 檢查 card macro 的內容
    card_pattern = r'\{\{\s*card\s*\([^,]+,\s*[^,]+,\s*"([^"]+)"'
    card_matches = re.findall(card_pattern, content)
    
    for i, card_content in enumerate(card_matches, 1):
        # 檢查是否有基本的 HTML 結構
        if not re.search(r'<[^>]+>', card_content):
            issues.append(f"Card {i} 內容可能缺少 HTML 標籤")
        
        # 檢查是否有未轉義的引號
        if card_content.count('"') % 2 != 0:
            issues.append(f"Card {i} 內容可能有未轉義的引號")
    
    return {
        'card_count': len(card_matches),
        'issues': issues
    }

def generate_visual_test_report() -> str:
    """生成視覺測試報告"""
    report = "# 視覺測試報告\n\n"
    report += "## 📋 測試項目\n\n"
    report += "1. 設計系統類合規性\n"
    report += "2. Macro 內容結構\n"
    report += "3. 樣式一致性\n\n"
    report += "---\n\n"
    
    migrated_files = [
        PROJECT_ROOT / "src/blog/workshop.njk",
        PROJECT_ROOT / "src/guide/crop-tool.njk",
    ]
    
    for file_path in migrated_files:
        if not file_path.exists():
            continue
        
        report += f"## 📄 `{file_path.relative_to(PROJECT_ROOT)}`\n\n"
        
        # 設計系統合規性
        compliance = check_design_system_compliance(file_path)
        report += "### 設計系統合規性\n\n"
        report += f"- **總類數**: {compliance['stats']['total_classes']}\n"
        report += f"- **設計系統類**: {compliance['stats']['design_system_classes']}\n"
        report += f"- **非設計系統類**: {compliance['stats']['non_design_system_classes']}\n\n"
        
        if compliance['issues']:
            report += "⚠️ **問題**:\n"
            for issue in compliance['issues']:
                report += f"  - {issue}\n"
            report += "\n"
        
        # Macro 結構
        structure = check_macro_content_structure(file_path)
        report += f"### Macro 結構\n\n"
        report += f"- **Card macros**: {structure['card_count']}\n"
        
        if structure['issues']:
            report += "⚠️ **問題**:\n"
            for issue in structure['issues']:
                report += f"  - {issue}\n"
            report += "\n"
        
        report += "---\n\n"
    
    report += "## ✅ 視覺測試建議\n\n"
    report += "1. **瀏覽器檢查**: 在實際瀏覽器中打開頁面，檢查視覺效果\n"
    report += "2. **響應式測試**: 在不同設備尺寸下測試（手機、平板、桌面）\n"
    report += "3. **對比測試**: 與原始版本對比，確保樣式一致\n"
    report += "4. **互動測試**: 測試所有按鈕和連結的功能\n"
    report += "5. **性能測試**: 檢查頁面加載速度\n\n"
    
    return report

def main():
    """主函數"""
    print("🎨 開始視覺測試檢查...\n")
    
    report = generate_visual_test_report()
    
    # 確保 report 目錄存在
    report_dir = PROJECT_ROOT / 'report'
    report_dir.mkdir(exist_ok=True)
    
    # 保存報告（添加錯誤處理）
    report_path = report_dir / "VISUAL_TEST_REPORT.md"
    try:
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"✅ 視覺測試檢查完成！報告已保存至: {report_path}")
    except IOError as e:
        print(f"❌ 無法保存報告文件: {e}")
        return 1
    except Exception as e:
        print(f"❌ 發生錯誤: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    main()

