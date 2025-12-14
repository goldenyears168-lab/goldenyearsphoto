#!/usr/bin/env python3
"""
重構大文件工具
1. 拆分 main.css 為多個模塊
2. 拆分 identity-test.js 為多個模塊
3. 清理註釋掉的代碼
4. 處理 TODO/FIXME 註釋
"""

import re
from pathlib import Path
from typing import List, Dict, Tuple

PROJECT_ROOT = Path(__file__).parent.parent

def analyze_css_structure(css_file: Path) -> Dict:
    """分析 CSS 文件結構"""
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    sections = []
    current_section = None
    current_start = 0
    
    for i, line in enumerate(lines):
        # 檢測主要區塊
        if re.match(r'^\s*/\*\s*=+\s*\*/\s*$', line) or re.match(r'^\s*/\*.*===', line):
            if current_section:
                sections.append({
                    'name': current_section,
                    'start': current_start,
                    'end': i,
                    'lines': i - current_start
                })
            
            # 提取區塊名稱
            next_line = lines[i+1] if i+1 < len(lines) else ''
            if 'Theme Configuration' in next_line or 'CSS Variables' in next_line:
                current_section = 'variables'
            elif 'Base Styles' in next_line or 'Reset' in next_line:
                current_section = 'base'
            elif 'Button' in next_line:
                current_section = 'buttons'
            elif 'Card' in next_line or 'Bento' in next_line:
                current_section = 'cards'
            elif 'Navigation' in next_line or 'Nav' in next_line:
                current_section = 'navigation'
            elif 'Utility' in next_line or 'Utility Classes' in next_line:
                current_section = 'utilities'
            elif 'Animation' in next_line:
                current_section = 'animations'
            elif 'Component' in next_line:
                current_section = 'components'
            else:
                current_section = f'section_{len(sections)}'
            
            current_start = i
    
    # 添加最後一個區塊
    if current_section:
        sections.append({
            'name': current_section,
            'start': current_start,
            'end': len(lines),
            'lines': len(lines) - current_start
        })
    
    return {
        'total_lines': len(lines),
        'sections': sections
    }

def split_css_file(css_file: Path) -> bool:
    """拆分 CSS 文件為多個模塊"""
    css_dir = css_file.parent
    modules_dir = css_dir / 'modules'
    modules_dir.mkdir(exist_ok=True)
    
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    # 定義拆分策略
    splits = {
        'variables.css': (0, 160),  # CSS 變量
        'base.css': (160, 1120),     # 基礎樣式
        'utilities.css': (1120, 1407), # 工具類
        'components.css': (1407, 2000), # 組件
        'navigation.css': (2000, 2200), # 導航
        'animations.css': (2200, len(lines)), # 動畫和其他
    }
    
    # 提取並保存各個模塊
    for module_name, (start, end) in splits.items():
        module_content = '\n'.join(lines[start:end])
        module_file = modules_dir / module_name
        
        with open(module_file, 'w', encoding='utf-8') as f:
            f.write(module_content)
        
        print(f"  ✅ 創建模塊: {module_name} ({end-start} 行)")
    
    # 創建新的 main.css，只包含 @import
    new_main_content = """@import "tailwindcss";
@import "modules/variables.css";
@import "modules/base.css";
@import "modules/utilities.css";
@import "modules/components.css";
@import "modules/navigation.css";
@import "modules/animations.css";
"""
    
    # 備份原文件
    backup_file = css_file.with_suffix('.css.backup')
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  💾 原文件已備份到: {backup_file.name}")
    
    # 寫入新的 main.css
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write(new_main_content)
    
    print(f"  ✅ 已拆分 main.css 為 {len(splits)} 個模塊")
    return True

def analyze_js_structure(js_file: Path) -> Dict:
    """分析 JavaScript 文件結構"""
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    functions = []
    current_function = None
    current_start = 0
    
    for i, line in enumerate(lines):
        # 檢測函數定義
        if re.match(r'^\s*(function|const|let|var)\s+\w+', line):
            if current_function:
                functions.append({
                    'name': current_function,
                    'start': current_start,
                    'end': i,
                    'lines': i - current_start
                })
            
            # 提取函數名
            match = re.search(r'(?:function|const|let|var)\s+(\w+)', line)
            if match:
                current_function = match.group(1)
                current_start = i
    
    # 添加最後一個函數
    if current_function:
        functions.append({
            'name': current_function,
            'start': current_start,
            'end': len(lines),
            'lines': len(lines) - current_start
        })
    
    return {
        'total_lines': len(lines),
        'functions': functions
    }

def split_js_file(js_file: Path) -> bool:
    """拆分 JavaScript 文件為多個模塊"""
    js_dir = js_file.parent
    modules_dir = js_dir / 'modules'
    modules_dir.mkdir(exist_ok=True)
    
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 備份原文件
    backup_file = js_file.with_suffix('.js.backup')
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  💾 原文件已備份到: {backup_file.name}")
    
    # 定義拆分策略（基於功能）
    # 這裡需要根據實際代碼結構調整
    print("  ⚠️  JavaScript 拆分需要手動調整，建議按功能模塊拆分")
    print("  💡 建議模塊:")
    print("    - state.js (狀態管理)")
    print("    - dom.js (DOM 操作)")
    print("    - quiz.js (測驗邏輯)")
    print("    - results.js (結果顯示)")
    print("    - ui.js (UI 交互)")
    
    return False  # 暫時不自動拆分，需要手動處理

def remove_commented_code(file_path: Path) -> Tuple[int, bool]:
    """移除註釋掉的代碼"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
        
        original_line_count = len(lines)
        new_lines = []
        in_commented_block = False
        removed_count = 0
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # 檢測註釋掉的代碼塊開始
            if re.match(r'^\s*//.*\w+.*\(', line) or re.match(r'^\s*#.*\w+.*\(', line):
                # 檢查是否是真正的註釋掉的代碼（包含函數調用等）
                if re.search(r'\w+\s*\(', line):
                    # 跳過這一行
                    removed_count += 1
                    i += 1
                    continue
            
            # 檢測多行註釋掉的代碼
            if re.match(r'^\s*/\*.*\w+.*\(', line):
                # 跳過直到找到結束
                while i < len(lines) and '*/' not in lines[i]:
                    removed_count += 1
                    i += 1
                if i < len(lines):
                    removed_count += 1
                    i += 1
                continue
            
            new_lines.append(line)
            i += 1
        
        if removed_count > 0:
            new_content = '\n'.join(new_lines)
            # 清理多餘空行
            new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            return removed_count, True
        
        return 0, False
    
    except Exception as e:
        print(f"  ⚠️  處理 {file_path} 時出錯: {e}")
        return 0, False

def process_todo_comments(file_path: Path) -> Tuple[int, bool]:
    """處理 TODO/FIXME 註釋"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
        
        todo_count = 0
        new_lines = []
        modified = False
        
        for line in lines:
            # 檢測 TODO/FIXME
            if re.search(r'\b(TODO|FIXME|XXX|HACK)\b', line, re.IGNORECASE):
                todo_count += 1
                # 轉換為標準格式或移除
                # 這裡選擇轉換為標準格式
                new_line = re.sub(
                    r'\b(TODO|FIXME|XXX|HACK)\b',
                    r'// TODO',
                    line,
                    flags=re.IGNORECASE
                )
                if new_line != line:
                    modified = True
                    new_lines.append(new_line)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
        
        return todo_count, modified
    
    except Exception as e:
        print(f"  ⚠️  處理 {file_path} 時出錯: {e}")
        return 0, False

def find_files_with_commented_code() -> List[Path]:
    """找出包含註釋掉的代碼的文件"""
    files = []
    
    for ext in ['.py', '.js', '.mjs', '.css', '.njk', '.html']:
        for file_path in PROJECT_ROOT.rglob(f'*{ext}'):
            # 跳過排除目錄
            if any(excluded in str(file_path) for excluded in ['node_modules', '_site', '.git', '.cache']):
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                    # 檢測註釋掉的代碼
                    if re.search(r'^\s*//.*\w+.*\(|^\s*#.*\w+.*\(|/\*.*\w+.*\(', content, re.MULTILINE):
                        files.append(file_path)
            except:
                pass
    
    return files

def main():
    """主函數"""
    print("🔧 開始重構大文件和清理代碼...\n")
    
    # 1. 拆分 main.css
    print("=" * 80)
    print("1️⃣  拆分 main.css")
    print("=" * 80)
    css_file = PROJECT_ROOT / 'src' / 'assets' / 'css' / 'main.css'
    if css_file.exists():
        structure = analyze_css_structure(css_file)
        print(f"📊 文件結構分析:")
        print(f"   總行數: {structure['total_lines']}")
        print(f"   主要區塊: {len(structure['sections'])}")
        
        response = input("\n是否拆分 main.css? (yes/no): ").strip().lower()
        if response in ['yes', 'y']:
            if split_css_file(css_file):
                print("✅ main.css 拆分完成")
        else:
            print("⏭️  跳過 main.css 拆分")
    else:
        print("⚠️  main.css 不存在")
    
    # 2. 分析 identity-test.js（暫時不自動拆分）
    print("\n" + "=" * 80)
    print("2️⃣  分析 identity-test.js")
    print("=" * 80)
    js_file = PROJECT_ROOT / 'src' / 'assets' / 'js' / 'identity-test.js'
    if js_file.exists():
        structure = analyze_js_structure(js_file)
        print(f"📊 文件結構分析:")
        print(f"   總行數: {structure['total_lines']}")
        print(f"   函數數量: {len(structure['functions'])}")
        print(f"\n💡 建議手動拆分為以下模塊:")
        print("   - state.js (狀態管理)")
        print("   - dom.js (DOM 元素初始化)")
        print("   - quiz.js (測驗邏輯)")
        print("   - results.js (結果計算和顯示)")
        print("   - ui.js (UI 交互)")
    else:
        print("⚠️  identity-test.js 不存在")
    
    # 3. 清理註釋掉的代碼
    print("\n" + "=" * 80)
    print("3️⃣  清理註釋掉的代碼")
    print("=" * 80)
    files_with_comments = find_files_with_commented_code()
    print(f"找到 {len(files_with_comments)} 個文件包含註釋掉的代碼")
    
    if files_with_comments:
        response = input("\n是否清理註釋掉的代碼? (yes/no): ").strip().lower()
        if response in ['yes', 'y']:
            total_removed = 0
            for file_path in files_with_comments[:10]:  # 限制處理前10個
                removed, modified = remove_commented_code(file_path)
                if modified:
                    rel_path = file_path.relative_to(PROJECT_ROOT)
                    print(f"  ✅ {rel_path}: 移除 {removed} 行註釋掉的代碼")
                    total_removed += removed
            print(f"\n✅ 共移除 {total_removed} 行註釋掉的代碼")
        else:
            print("⏭️  跳過清理註釋掉的代碼")
    
    # 4. 處理 TODO/FIXME
    print("\n" + "=" * 80)
    print("4️⃣  處理 TODO/FIXME 註釋")
    print("=" * 80)
    
    todo_files = []
    for ext in ['.py', '.js', '.mjs', '.css', '.njk']:
        for file_path in PROJECT_ROOT.rglob(f'*{ext}'):
            if any(excluded in str(file_path) for excluded in ['node_modules', '_site', '.git', '.cache']):
                continue
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    if re.search(r'\b(TODO|FIXME|XXX|HACK)\b', f.read(), re.IGNORECASE):
                        todo_files.append(file_path)
            except:
                pass
    
    print(f"找到 {len(todo_files)} 個文件包含 TODO/FIXME")
    
    if todo_files:
        for file_path in todo_files[:10]:  # 限制處理前10個
            count, modified = process_todo_comments(file_path)
            if count > 0:
                rel_path = file_path.relative_to(PROJECT_ROOT)
                print(f"  ℹ️  {rel_path}: {count} 個 TODO/FIXME")
    
    print("\n✅ 重構完成！")
    print("\n💡 注意事項:")
    print("  1. 已創建備份文件 (.backup)")
    print("  2. 請測試拆分後的代碼確保功能正常")
    print("  3. 如果 main.css 使用 @import，需要確認構建工具支持")

if __name__ == '__main__':
    main()
