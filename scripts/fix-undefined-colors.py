#!/usr/bin/env python3
"""
處理剩餘低頻未定義顏色腳本
自動查找未定義顏色並映射到設計 token
"""

import re
import os
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# 未定義顏色及其建議映射
COLOR_MAPPINGS = {
    # 藍色系
    '#3897F0': {
        'token': 'trust-600',
        'value': '#4F46E5',
        'reason': 'Instagram 藍色，映射到 trust-600'
    },
    
    # 灰色系 - slate 系列（這些是 Tailwind 標準色，可以保留或映射）
    '#64748B': {
        'token': 'slate-500',
        'value': 'var(--color-neutral-400)',  # 已在 CSS 中定義
        'reason': 'slate-500，已在 CSS Variables 中定義'
    },
    '#475569': {
        'token': 'slate-600',
        'value': 'var(--color-text)',  # 已在 CSS 中定義
        'reason': 'slate-600，已在 CSS Variables 中定義'
    },
    '#94A3B8': {
        'token': 'slate-400',
        'value': 'var(--color-neutral-400)',  # 映射到 slate-500
        'reason': 'slate-400，映射到 slate-500 (neutral-400)'
    },
    '#C9C8CD': {
        'token': 'sand-200',
        'value': 'var(--color-sand-200)',
        'reason': '淺灰色，映射到 sand-200'
    },
    '#C4C7CE': {
        'token': 'sand-200',
        'value': 'var(--color-sand-200)',
        'reason': '淺灰色，映射到 sand-200'
    },
    '#E2E2E2': {
        'token': 'sand-100',
        'value': 'var(--color-sand-100)',
        'reason': '淺灰色，映射到 sand-100'
    },
    '#DAD2CE': {
        'token': 'sand-200',
        'value': 'var(--color-sand-200)',
        'reason': '米色，映射到 sand-200'
    },
    '#D3E0F1': {
        'token': 'trust-50',
        'value': 'var(--color-trust-50)',
        'reason': '淺藍色，映射到 trust-50'
    },
    
    # 黃色系
    '#E6AF2E': {
        'token': 'trust-600',
        'value': 'var(--color-trust-600)',
        'reason': '強調色，映射到 trust-600（或考慮移除）'
    },
}

# 掃描的檔案類型
SCAN_EXTENSIONS = {'.njk', '.css', '.js', '.html'}

def find_color_occurrences(color: str) -> List[Dict]:
    """查找顏色在專案中的所有出現位置"""
    occurrences = []
    
    for file_path in SRC_DIR.rglob('*'):
        if file_path.suffix in SCAN_EXTENSIONS:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    relative_path = file_path.relative_to(PROJECT_ROOT)
                    
                    # 查找顏色（不區分大小寫）
                    pattern = re.escape(color)
                    for match in re.finditer(pattern, content, re.IGNORECASE):
                        # 獲取上下文
                        start = max(0, match.start() - 30)
                        end = min(len(content), match.end() + 30)
                        context = content[start:end]
                        
                        # 檢查是否在第三方嵌入代碼中
                        if 'instagram-media' in context.lower() or 'data-instgrm' in context.lower():
                            continue
                        
                        occurrences.append({
                            'file': str(relative_path),
                            'line': content[:match.start()].count('\n') + 1,
                            'context': context,
                            'match': match.group(0)
                        })
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    
    return occurrences

def suggest_replacement(color: str, context: str) -> Tuple[str, str]:
    """根據上下文建議替換方案"""
    mapping = COLOR_MAPPINGS.get(color.upper())
    if not mapping:
        return None, None
    
    # 判斷是在 CSS 還是在 HTML/Tailwind 類名中
    if 'class=' in context or 'bg-' in context or 'text-' in context or 'border-' in context:
        # Tailwind 類名
        return f"{mapping['token']}", f"使用 Tailwind 類名（如 bg-{mapping['token']}, text-{mapping['token']}）"
    elif ':' in context or 'var(' in context or '#' in context:
        # CSS 屬性
        return mapping['value'], f"使用 CSS 變數或直接替換為 {mapping['value']}"
    
    return mapping['value'], mapping['reason']

def generate_report() -> str:
    """生成處理報告"""
    report = "# 未定義顏色處理報告\n\n"
    report += "## 顏色映射建議\n\n"
    
    total_occurrences = 0
    
    for color, mapping in COLOR_MAPPINGS.items():
        occurrences = find_color_occurrences(color)
        if not occurrences:
            continue
        
        total_occurrences += len(occurrences)
        report += f"### {color}\n\n"
        report += f"- **建議映射**: `{mapping['token']}` ({mapping['value']})\n"
        report += f"- **原因**: {mapping['reason']}\n"
        report += f"- **出現次數**: {len(occurrences)}\n"
        report += f"- **出現位置**:\n\n"
        
        for occ in occurrences[:10]:  # 只顯示前 10 個
            report += f"  - `{occ['file']}` (第 {occ['line']} 行)\n"
            report += f"    ```\n    {occ['context'].strip()}\n    ```\n"
        
        if len(occurrences) > 10:
            report += f"  - ... 還有 {len(occurrences) - 10} 處\n"
        
        report += "\n"
    
    report += f"\n## 統計\n\n"
    report += f"- **總未定義顏色數**: {len(COLOR_MAPPINGS)}\n"
    report += f"- **總出現次數**: {total_occurrences}\n"
    
    return report

def apply_replacements(dry_run: bool = True) -> Dict[str, List[Dict]]:
    """應用顏色替換（可選：dry_run 模式）"""
    results = defaultdict(list)
    
    for color, mapping in COLOR_MAPPINGS.items():
        occurrences = find_color_occurrences(color)
        if not occurrences:
            continue
        
        # 按文件分組
        by_file = defaultdict(list)
        for occ in occurrences:
            by_file[occ['file']].append(occ)
        
        for file_path_str, occs in by_file.items():
            file_path = PROJECT_ROOT / file_path_str
            if not file_path.exists():
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                replacements_made = 0
                
                # 對每個出現位置進行替換
                for occ in sorted(occs, key=lambda x: x['line'], reverse=True):
                    # 獲取匹配位置
                    lines = content.split('\n')
                    if occ['line'] > len(lines):
                        continue
                    
                    line_content = lines[occ['line'] - 1]
                    
                    # 判斷替換方式
                    if 'class=' in line_content or 'bg-' in line_content or 'text-' in line_content or 'border-' in line_content:
                        # Tailwind 類名替換
                        # 這需要更智能的替換邏輯，暫時跳過
                        continue
                    else:
                        # CSS 屬性替換
                        new_value, reason = suggest_replacement(color, line_content)
                        if new_value:
                            # 替換顏色值
                            pattern = re.escape(color)
                            if re.search(pattern, line_content, re.IGNORECASE):
                                new_line = re.sub(pattern, new_value, line_content, flags=re.IGNORECASE)
                                lines[occ['line'] - 1] = new_line
                                replacements_made += 1
                
                if replacements_made > 0:
                    new_content = '\n'.join(lines)
                    if not dry_run:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                    
                    results[file_path_str].append({
                        'color': color,
                        'mapping': mapping,
                        'replacements': replacements_made,
                        'dry_run': dry_run
                    })
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
    
    return results

def main():
    """主函數"""
    import sys
    
    dry_run = '--apply' not in sys.argv
    
    print("🔍 查找未定義顏色...")
    report = generate_report()
    
    # 保存報告
    report_path = PROJECT_ROOT / "UNDEFINED_COLORS_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ 報告已保存至: {report_path}")
    
    if dry_run:
        print("\n🔍 執行乾跑模式（不實際修改檔案）...")
        results = apply_replacements(dry_run=True)
        
        print("\n📊 替換統計：")
        total_replacements = 0
        for file_path, changes in results.items():
            for change in changes:
                total_replacements += change['replacements']
                print(f"  - {file_path}: {change['color']} → {change['mapping']['token']} ({change['replacements']} 處)")
        
        print(f"\n總計: {total_replacements} 處替換")
        print("\n💡 提示: 使用 --apply 參數來實際應用替換")
    else:
        print("\n⚠️  執行實際替換...")
        results = apply_replacements(dry_run=False)
        
        print("\n✅ 替換完成！")
        for file_path, changes in results.items():
            for change in changes:
                print(f"  - {file_path}: {change['color']} → {change['mapping']['token']} ({change['replacements']} 處)")

if __name__ == '__main__':
    main()

