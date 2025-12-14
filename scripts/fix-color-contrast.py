#!/usr/bin/env python3
"""修复颜色对比度问题"""

import re
from pathlib import Path

# 需要修复的问题组合
# 在浅蓝色背景上，浅色文字需要改为深色文字
fixes = [
    # (背景类, 旧文字类, 新文字类, 说明)
    ('bg-trust-50', 'text-white', 'text-trust-900', '浅蓝色背景上的白色文字'),
    ('bg-trust-50', 'text-white/70', 'text-trust-900', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-50', 'text-white/80', 'text-trust-900', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-50', 'text-white/90', 'text-trust-900', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-50', 'text-slate-400', 'text-trust-800', '浅蓝色背景上的浅灰色文字'),
    ('bg-trust-50', 'text-slate-500', 'text-trust-800', '浅蓝色背景上的浅灰色文字'),
    
    ('bg-trust-100', 'text-white', 'text-trust-900', '浅蓝色背景上的白色文字'),
    ('bg-trust-100', 'text-white/70', 'text-trust-900', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-100', 'text-white/80', 'text-trust-900', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-100', 'text-white/90', 'text-trust-900', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-100', 'text-slate-400', 'text-trust-800', '浅蓝色背景上的浅灰色文字'),
    ('bg-trust-100', 'text-slate-500', 'text-trust-800', '浅蓝色背景上的浅灰色文字'),
    
    ('bg-trust-200', 'text-white', 'text-trust-950', '浅蓝色背景上的白色文字'),
    ('bg-trust-200', 'text-white/70', 'text-trust-950', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-200', 'text-white/80', 'text-trust-950', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-200', 'text-white/90', 'text-trust-950', '浅蓝色背景上的半透明白色文字'),
    ('bg-trust-200', 'text-slate-400', 'text-trust-950', '浅蓝色背景上的浅灰色文字'),
    ('bg-trust-200', 'text-slate-500', 'text-trust-950', '浅蓝色背景上的浅灰色文字'),
    
    # 半透明背景也需要检查
    ('bg-trust-50/50', 'text-white', 'text-trust-900', '半透明浅蓝色背景上的白色文字'),
    ('bg-trust-50/50', 'text-slate-400', 'text-trust-800', '半透明浅蓝色背景上的浅灰色文字'),
    ('bg-trust-50/50', 'text-slate-500', 'text-trust-800', '半透明浅蓝色背景上的浅灰色文字'),
]

def find_and_fix_in_file(file_path):
    """在文件中查找并修复问题"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        changes = []
        
        for bg_class, old_text, new_text, desc in fixes:
            # 查找包含背景类和旧文字类的行
            # 匹配模式：class="... bg-trust-50 ... text-white ..."
            pattern1 = rf'class="([^"]*{re.escape(bg_class)}[^"]*{re.escape(old_text)}[^"]*)"'
            pattern2 = rf'class="([^"]*{re.escape(old_text)}[^"]*{re.escape(bg_class)}[^"]*)"'
            
            def replace_func(match):
                class_attr = match.group(1)
                # 替换文字类
                new_class = class_attr.replace(old_text, new_text)
                changes.append(f"  - {desc}: {old_text} → {new_text}")
                return f'class="{new_class}"'
            
            content = re.sub(pattern1, replace_func, content)
            content = re.sub(pattern2, replace_func, content)
            
            # 也检查分开的情况（在同一元素的不同属性中）
            # 例如：class="bg-trust-50" 和另一个元素有 text-white
            # 这个比较复杂，先处理明显的同元素情况
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return changes
        return []
    except Exception as e:
        print(f"  错误: {e}")
        return []

# 扫描所有文件
src_dir = Path('src')
files_to_check = list(src_dir.rglob('*.njk')) + list(src_dir.rglob('*.html'))

print("="*80)
print("修复颜色对比度问题")
print("="*80)
print()

total_changes = 0
files_changed = []

for file_path in files_to_check:
    changes = find_and_fix_in_file(file_path)
    if changes:
        files_changed.append(file_path)
        print(f"✅ {file_path.relative_to(Path('.'))}")
        for change in changes:
            print(change)
        print()
        total_changes += len(changes)

if files_changed:
    print("="*80)
    print(f"修复完成！共修改 {len(files_changed)} 个文件，{total_changes} 处")
    print("="*80)
else:
    print("✅ 未发现需要修复的问题（或问题已在之前的检查中修复）")

