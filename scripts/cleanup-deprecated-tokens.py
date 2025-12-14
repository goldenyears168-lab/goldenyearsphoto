#!/usr/bin/env python3
"""
清理 Deprecated Token 腳本
替換 deprecated token 為新的設計 token
"""

import re
from pathlib import Path
from typing import Dict

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# Deprecated Token 映射（僅處理實際使用，不處理 CSS 變數定義）
DEPRECATED_REPLACEMENTS = {
    'var(--color-brand-primary)': 'var(--color-trust-950)',
    'var(--color-brand-accent)': 'var(--color-trust-800)',
    'var(--color-brand-cta)': 'var(--color-trust-200)',
    'var(--color-brand-cta-hover)': 'var(--color-trust-800)',
    'var(--color-accent)': 'var(--color-trust-800)',
    'var(--color-accent-weak)': 'var(--color-trust-600)',
    'var(--color-accent-strong)': 'var(--color-trust-950)',
    'var(--color-neutral-50)': 'var(--color-sand-50)',
    'var(--color-neutral-100)': 'var(--color-sand-100)',
    'var(--color-neutral-200)': 'var(--color-sand-200)',
    'var(--color-neutral-300)': 'var(--color-sand-200)',
    'var(--color-neutral-400)': 'var(--color-neutral-400)',  # 保留，因為 slate-500 常用
    'var(--color-neutral-900)': 'var(--color-trust-900)',
    'var(--color-neutral-950)': 'var(--color-trust-950)',
    'var(--color-surface)': 'var(--color-white)',
    'var(--color-surface-alt)': 'var(--color-sand-100)',
    'var(--color-surface-2)': 'var(--color-sand-50)',
    'var(--color-surface-3)': 'var(--color-trust-950)',
    'var(--color-surface-elevated)': 'var(--color-white)',
    'var(--color-text)': 'var(--color-text)',  # 保留，因為 slate-600 常用
    'var(--color-text-main)': 'var(--color-trust-900)',
    'var(--color-text-subtle)': 'var(--color-neutral-400)',  # slate-500
    'var(--color-text-on-dark)': 'var(--color-trust-50)',
    'var(--color-text-on-accent)': 'var(--color-white)',
    'var(--color-text-link)': 'var(--color-trust-600)',
    'var(--color-text-link-hover)': 'var(--color-trust-800)',
    'var(--color-border)': 'var(--color-sand-200)',
    'var(--color-border-strong)': 'var(--color-sand-300)',
    'var(--color-border-subtle)': 'var(--color-sand-100)',
    'var(--color-border-dark)': 'var(--color-trust-900)',
    'var(--color-dark)': 'var(--color-trust-950)',
    'var(--color-cta)': 'var(--color-trust-200)',
    'var(--color-primary-accent)': 'var(--color-trust-800)',
    'var(--color-gray-bg)': 'var(--color-sand-200)',
    'var(--color-light-bg)': 'var(--color-sand-50)',
    'var(--color-text-dark)': 'var(--color-trust-900)',
    'var(--color-text-light)': 'var(--color-trust-50)',
}

def is_css_variable_definition(line: str) -> bool:
    """判斷是否為 CSS 變數定義行"""
    return re.match(r'\s*--color-[^:]+:\s*', line) is not None

def cleanup_file(file_path: Path, dry_run: bool = True) -> Dict[str, int]:
    """清理檔案中的 deprecated token"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            original_content = content
        
        replacements = {}
        total_replacements = 0
        
        # 替換每個 deprecated token
        for old_token, new_token in DEPRECATED_REPLACEMENTS.items():
            if old_token == new_token:
                continue  # 跳過不需要替換的
            
            count = content.count(old_token)
            if count > 0:
                # 檢查是否在 CSS 變數定義中
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if old_token in line and is_css_variable_definition(line):
                        # 跳過 CSS 變數定義行
                        continue
                    elif old_token in line:
                        # 替換使用
                        lines[i] = lines[i].replace(old_token, new_token)
                        total_replacements += line.count(old_token)
                
                if total_replacements > 0:
                    content = '\n'.join(lines)
                    replacements[old_token] = count
        
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
    css_files = list(SRC_DIR.rglob('*.css'))
    
    for css_file in css_files:
        result = cleanup_file(css_file, dry_run=dry_run)
        if result.get('total', 0) > 0:
            results.append(result)
            print(f"  - {result['file']}: {result['total']} 處替換")
    
    if not results:
        print("✅ 沒有發現需要替換的 deprecated token")
    else:
        total = sum(r['total'] for r in results)
        print(f"\n📊 總計: {total} 處替換")
        
        if dry_run:
            print("\n💡 提示: 使用 --apply 參數來實際應用替換")
        else:
            print("\n✅ 替換完成！")

if __name__ == '__main__':
    main()

