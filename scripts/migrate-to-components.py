#!/usr/bin/env python3
"""
遷移現有代碼到使用新元件的腳本
掃描並建議將現有 HTML 遷移到使用標準化元件
"""

import re
from pathlib import Path
from typing import Dict, List

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# 遷移模式
MIGRATION_PATTERNS = [
    {
        'name': 'Button Migration',
        'pattern': r'<a[^>]*class=["\'][^"\']*?(?:bg-trust-950|bg-slate-900|bg-white)[^"\']*?px-8 py-4 rounded-full[^"\']*?["\'][^>]*>([^<]+)</a>',
        'suggestion': '使用 button macro: {{ button("$1", "$href", "primary|secondary", "lg") }}',
        'priority': 'high'
    },
    {
        'name': 'Card Migration',
        'pattern': r'<div[^>]*class=["\'][^"\']*?bento-card[^"\']*?bg-(?:white|sand-50|slate-50)[^"\']*?["\'][^>]*>',
        'suggestion': '使用 card macro: {{ card("default|sand", "", "...") }}',
        'priority': 'medium'
    },
]

def find_migration_opportunities(file_path: Path) -> List[Dict]:
    """查找遷移機會"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        opportunities = []
        
        for pattern_info in MIGRATION_PATTERNS:
            pattern = re.compile(pattern_info['pattern'])
            matches = list(pattern.finditer(content))
            
            if matches:
                for match in matches:
                    line_num = content[:match.start()].count('\n') + 1
                    context = content[max(0, match.start()-50):match.end()+50]
                    
                    opportunities.append({
                        'file': str(file_path.relative_to(PROJECT_ROOT)),
                        'line': line_num,
                        'pattern': pattern_info['name'],
                        'match': match.group(0)[:100],
                        'suggestion': pattern_info['suggestion'],
                        'priority': pattern_info['priority'],
                        'context': context
                    })
        
        return opportunities
    except Exception as e:
        return [{'file': str(file_path.relative_to(PROJECT_ROOT)), 'error': str(e)}]

def generate_migration_report() -> str:
    """生成遷移報告"""
    print("🔍 掃描遷移機會...")
    
    all_opportunities = []
    njk_files = list(SRC_DIR.rglob('*.njk'))
    
    for njk_file in njk_files:
        # 跳過元件展示頁面
        if 'components-showcase' in str(njk_file):
            continue
        
        opportunities = find_migration_opportunities(njk_file)
        all_opportunities.extend(opportunities)
    
    # 按優先級和文件分組
    by_priority = {'high': [], 'medium': [], 'low': []}
    for opp in all_opportunities:
        if 'error' in opp:
            continue
        priority = opp.get('priority', 'low')
        by_priority[priority].append(opp)
    
    report = "# 代碼遷移建議報告\n\n"
    report += f"**掃描日期**: 2025-12-14\n"
    report += f"**掃描檔案數**: {len(njk_files)}\n"
    report += f"**發現遷移機會**: {len(all_opportunities)}\n\n"
    
    report += "## 📊 遷移機會統計\n\n"
    report += f"- **高優先級**: {len(by_priority['high'])} 處\n"
    report += f"- **中優先級**: {len(by_priority['medium'])} 處\n"
    report += f"- **低優先級**: {len(by_priority['low'])} 處\n\n"
    
    report += "---\n\n"
    
    # 按文件分組
    by_file = {}
    for opp in all_opportunities:
        if 'error' in opp:
            continue
        file = opp['file']
        if file not in by_file:
            by_file[file] = []
        by_file[file].append(opp)
    
    report += "## 📝 遷移建議（按文件）\n\n"
    
    for file, opportunities in sorted(by_file.items()):
        report += f"### `{file}`\n\n"
        report += f"**發現 {len(opportunities)} 處遷移機會**\n\n"
        
        for i, opp in enumerate(opportunities[:10], 1):  # 只顯示前 10 個
            report += f"{i}. **{opp['pattern']}** (第 {opp['line']} 行) - {opp['priority']} 優先級\n"
            report += f"   - 建議: {opp['suggestion']}\n"
            report += f"   - 上下文: `{opp['context'][:80]}...`\n\n"
        
        if len(opportunities) > 10:
            report += f"   - ... 還有 {len(opportunities) - 10} 處\n\n"
    
    report += "\n---\n\n"
    report += "## ✅ 遷移步驟\n\n"
    report += "1. **審查建議**: 檢查每個遷移建議是否適用\n"
    report += "2. **逐步遷移**: 一次遷移一個文件，確保功能正常\n"
    report += "3. **測試驗證**: 遷移後測試頁面功能和樣式\n"
    report += "4. **更新文檔**: 更新相關文檔和註釋\n\n"
    
    return report

def main():
    """主函數"""
    report = generate_migration_report()
    
    # 保存報告
    # 確保 report 目錄存在
    report_dir = PROJECT_ROOT / 'report'
    report_dir.mkdir(exist_ok=True)
    
    report_path = report_dir / "MIGRATION_SUGGESTIONS.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ 遷移建議報告已保存至: {report_path}")

if __name__ == '__main__':
    main()

