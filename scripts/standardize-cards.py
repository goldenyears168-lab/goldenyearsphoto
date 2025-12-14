#!/usr/bin/env python3
"""
標準化卡片腳本
將自定義卡片樣式替換為標準的 .bento-card variant 類
"""

import re
from pathlib import Path
from typing import Dict, List

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# 卡片替換規則
CARD_REPLACEMENTS = [
    # bento-card bg-white border-sand-200 → bento-card bento-card-default
    {
        'pattern': r'class=["\']([^"\']*?)bento-card[^"\']*?bg-white[^"\']*?border-sand-200[^"\']*?rounded-2xl[^"\']*?shadow-sm[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}bento-card bento-card-default"',
        'description': 'Standard white card → bento-card-default'
    },
    # bento-card bg-sand-50 → bento-card bento-card-sand
    {
        'pattern': r'class=["\']([^"\']*?)bento-card[^"\']*?bg-sand-50[^"\']*?rounded-2xl[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}bento-card bento-card-sand"',
        'description': 'Sand background card → bento-card-sand'
    },
    # bento-card bg-slate-50 → bento-card bento-card-sand (slate-50 應該改為 sand-50)
    {
        'pattern': r'class=["\']([^"\']*?)bento-card[^"\']*?bg-slate-50[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}bento-card bento-card-sand"',
        'description': 'Slate-50 card → bento-card-sand'
    },
    # bento-card bg-white border-slate-200 → bento-card bento-card-default (slate-200 應該改為 sand-200)
    {
        'pattern': r'class=["\']([^"\']*?)bento-card[^"\']*?bg-white[^"\']*?border-slate-200[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}bento-card bento-card-default"',
        'description': 'Slate border card → bento-card-default'
    },
]

def standardize_cards_in_file(file_path: Path, dry_run: bool = True) -> Dict:
    """標準化檔案中的卡片"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            original_content = content
        
        replacements = []
        total_replacements = 0
        
        for rule in CARD_REPLACEMENTS:
            pattern = re.compile(rule['pattern'])
            matches = list(pattern.finditer(content))
            
            if matches:
                # 從後往前替換，避免位置偏移
                for match in reversed(matches):
                    old_text = match.group(0)
                    new_text = rule['replacement'](match)
                    
                    # 檢查是否已經包含 variant 類
                    if 'bento-card-default' in old_text or 'bento-card-sand' in old_text:
                        continue
                    
                    # 替換
                    start, end = match.span()
                    content = content[:start] + new_text + content[end:]
                    replacements.append({
                        'old': old_text[:60] + '...' if len(old_text) > 60 else old_text,
                        'new': new_text[:60] + '...' if len(new_text) > 60 else new_text,
                        'rule': rule['description']
                    })
                    total_replacements += 1
        
        if total_replacements > 0 and not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        return {
            'file': str(file_path.relative_to(PROJECT_ROOT)),
            'replacements': replacements,
            'total': total_replacements,
            'modified': total_replacements > 0 and not dry_run
        }
    except Exception as e:
        return {'file': str(file_path.relative_to(PROJECT_ROOT)), 'error': str(e)}

def main():
    """主函數"""
    import sys
    
    dry_run = '--apply' not in sys.argv
    
    print(f"🔍 {'乾跑模式' if dry_run else '實際替換模式'}...")
    
    results = []
    njk_files = list(SRC_DIR.rglob('*.njk'))
    
    for njk_file in njk_files:
        result = standardize_cards_in_file(njk_file, dry_run=dry_run)
        if result.get('total', 0) > 0:
            results.append(result)
            print(f"\n  📄 {result['file']}: {result['total']} 處替換")
            for rep in result['replacements'][:3]:  # 只顯示前 3 個
                print(f"     - {rep['rule']}")
            if len(result['replacements']) > 3:
                print(f"     ... 還有 {len(result['replacements']) - 3} 處")
    
    if not results:
        print("✅ 沒有發現需要標準化的卡片")
    else:
        total = sum(r['total'] for r in results)
        print(f"\n📊 總計: {total} 處替換")
        
        if dry_run:
            print("\n💡 提示: 使用 --apply 參數來實際應用替換")
        else:
            print("\n✅ 標準化完成！")

if __name__ == '__main__':
    main()

