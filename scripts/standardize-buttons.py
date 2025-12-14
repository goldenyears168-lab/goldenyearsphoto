#!/usr/bin/env python3
"""
標準化按鈕腳本
將自定義按鈕樣式替換為標準的 .btn variant 類
"""

import re
from pathlib import Path
from typing import Dict

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# 按鈕替換規則
BUTTON_REPLACEMENTS = [
    {
        'pattern': r'class=["\']([^"\']*?)(?:bg-white|bg-transparent)[^"\']*?px-8 py-4 rounded-full[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}btn btn-secondary btn-lg"',
        'description': 'Large white/transparent button → btn-secondary btn-lg'
    },
    {
        'pattern': r'class=["\']([^"\']*?)(?:bg-trust-950|border-trust-950|text-trust-950)[^"\']*?px-8 py-4 rounded-full[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}btn btn-primary btn-lg"',
        'description': 'Large trust-950 button → btn-primary btn-lg'
    },
    {
        'pattern': r'class=["\']([^"\']*?)px-4 py-2 rounded-full[^"\']*?hover:bg-sand-50[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}btn btn-ghost btn-sm"',
        'description': 'Small navigation button → btn-ghost btn-sm'
    },
    {
        'pattern': r'class=["\']([^"\']*?)px-8 py-4 rounded-full[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}btn btn-secondary btn-lg"',
        'description': 'Generic large button → btn-secondary btn-lg'
    },
    {
        'pattern': r'class=["\']([^"\']*?)px-4 py-2 rounded-full[^"\']*?["\']',
        'replacement': lambda m: f'class="{m.group(1)}btn btn-ghost btn-sm"',
        'description': 'Generic small button → btn-ghost btn-sm'
    },
]

def standardize_buttons_in_file(file_path: Path, dry_run: bool = True) -> Dict:
    """標準化檔案中的按鈕"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            original_content = content
        
        replacements = []
        total_replacements = 0
        
        for rule in BUTTON_REPLACEMENTS:
            pattern = re.compile(rule['pattern'])
            matches = list(pattern.finditer(content))
            
            if matches:
                # 從後往前替換，避免位置偏移
                for match in reversed(matches):
                    old_text = match.group(0)
                    new_text = rule['replacement'](match)
                    
                    # 檢查是否已經包含 btn 類
                    if 'btn ' in old_text or ' btn' in old_text:
                        continue
                    
                    # 替換
                    start, end = match.span()
                    content = content[:start] + new_text + content[end:]
                    replacements.append({
                        'old': old_text[:50] + '...' if len(old_text) > 50 else old_text,
                        'new': new_text[:50] + '...' if len(new_text) > 50 else new_text,
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
        result = standardize_buttons_in_file(njk_file, dry_run=dry_run)
        if result.get('total', 0) > 0:
            results.append(result)
            print(f"\n  📄 {result['file']}: {result['total']} 處替換")
            for rep in result['replacements'][:3]:  # 只顯示前 3 個
                print(f"     - {rep['rule']}")
            if len(result['replacements']) > 3:
                print(f"     ... 還有 {len(result['replacements']) - 3} 處")
    
    if not results:
        print("✅ 沒有發現需要標準化的按鈕")
    else:
        total = sum(r['total'] for r in results)
        print(f"\n📊 總計: {total} 處替換")
        
        if dry_run:
            print("\n💡 提示: 使用 --apply 參數來實際應用替換")
        else:
            print("\n✅ 標準化完成！")

if __name__ == '__main__':
    main()

