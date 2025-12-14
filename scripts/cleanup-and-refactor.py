#!/usr/bin/env python3
"""
清理和重構工具
1. 清理註釋掉的代碼
2. 處理 TODO/FIXME 註釋
3. 生成拆分計劃報告
"""

import re
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent

def find_commented_code(content: str, file_ext: str) -> List[Tuple[int, str]]:
    """找出註釋掉的代碼行"""
    lines = content.split('\n')
    commented_code = []
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # 檢測註釋掉的代碼模式
        if file_ext == '.py':
            if stripped.startswith('#') and len(stripped) > 1:
                # 檢查是否包含代碼特徵（函數調用、賦值、導入等）
                code_part = stripped[1:].strip()
                if re.search(r'\w+\s*\(|=\s*\w+|import\s+\w+|from\s+\w+|def\s+\w+|class\s+\w+', code_part):
                    # 排除純註釋（如 # TODO, # Note 等）
                    if not re.match(r'^(TODO|FIXME|NOTE|NOTE:|HACK|XXX|WARNING|INFO|DEPRECATED)', code_part, re.IGNORECASE):
                        commented_code.append((i, line))
        
        elif file_ext in ['.js', '.mjs']:
            if stripped.startswith('//') and len(stripped) > 2:
                code_part = stripped[2:].strip()
                if re.search(r'\w+\s*\(|=\s*\w+|import\s+\w+|from\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+|function\s+\w+', code_part):
                    if not re.match(r'^(TODO|FIXME|NOTE|NOTE:|HACK|XXX|WARNING|INFO|DEPRECATED)', code_part, re.IGNORECASE):
                        commented_code.append((i, line))
        
        # CSS: /* code */
        elif file_ext == '.css':
            # CSS 註釋通常是多行的，這裡只檢測明顯的註釋掉的代碼
            if '/*' in line and '*/' in line:
                # 檢測註釋中是否包含 CSS 規則
                comment_content = re.search(r'/\*(.*?)\*/', line)
                if comment_content:
                    code_part = comment_content.group(1).strip()
                    if re.search(r'[{}:;]', code_part) and len(code_part) > 10:
                        commented_code.append((i, line))
    
    return commented_code

def remove_commented_code_safe(file_path: Path) -> Tuple[int, List[str]]:
    """安全地移除註釋掉的代碼"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_ext = file_path.suffix.lower()
        commented_lines = find_commented_code(content, file_ext)
        
        if not commented_lines:
            return 0, []
        
        lines = content.split('\n')
        removed_lines = []
        new_lines = []
        
        commented_line_nums = {line_num for line_num, _ in commented_lines}
        
        for i, line in enumerate(lines, 1):
            if i in commented_line_nums:
                removed_lines.append(f"  行 {i}: {line.strip()[:60]}...")
            else:
                new_lines.append(line)
        
        # 清理多餘空行
        cleaned_content = '\n'.join(new_lines)
        cleaned_content = re.sub(r'\n\n\n+', '\n\n', cleaned_content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        return len(commented_lines), removed_lines
    
    except Exception as e:
        print(f"  ⚠️  處理 {file_path} 時出錯: {e}")
        return 0, []

def find_todo_comments(file_path: Path) -> List[Tuple[int, str]]:
    """找出 TODO/FIXME 註釋"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        todos = []
        for i, line in enumerate(lines, 1):
            if re.search(r'\b(TODO|FIXME|XXX|HACK)\b', line, re.IGNORECASE):
                todos.append((i, line.strip()))
        
        return todos
    except:
        return []

def process_todos(file_path: Path, action: str = 'list') -> int:
    """處理 TODO 註釋"""
    todos = find_todo_comments(file_path)
    
    if action == 'remove' and todos:
        # 移除 TODO 註釋（謹慎使用）
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        todo_line_nums = {line_num for line_num, _ in todos}
        new_lines = [line for i, line in enumerate(lines, 1) if i not in todo_line_nums]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        return len(todos)
    
    return len(todos)

def generate_refactor_plan():
    """生成重構計劃報告"""
    css_file = PROJECT_ROOT / 'src' / 'assets' / 'css' / 'main.css'
    js_file = PROJECT_ROOT / 'src' / 'assets' / 'js' / 'identity-test.js'
    
    plan = []
    plan.append("# 大文件拆分計劃\n")
    plan.append("## 1. main.css (2343 行)\n")
    
    if css_file.exists():
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
        
        # 分析主要區塊
        sections = []
        current_section = None
        current_start = 0
        
        for i, line in enumerate(lines):
            if re.match(r'^\s*/\*.*===', line):
                if current_section:
                    sections.append({
                        'name': current_section,
                        'start': current_start,
                        'end': i,
                        'lines': i - current_start
                    })
                
                # 提取區塊名稱
                if i + 1 < len(lines):
                    next_line = lines[i + 1]
                    if 'Theme Configuration' in next_line or 'CSS Variables' in next_line:
                        current_section = 'variables'
                    elif 'Base Styles' in next_line:
                        current_section = 'base'
                    elif 'Utility' in next_line:
                        current_section = 'utilities'
                    elif 'Component' in next_line or 'Bento' in next_line:
                        current_section = 'components'
                    elif 'Navigation' in next_line or 'Nav' in next_line:
                        current_section = 'navigation'
                    elif 'Animation' in next_line:
                        current_section = 'animations'
                    else:
                        current_section = f'section_{len(sections)}'
                
                current_start = i
        
        plan.append("### 建議拆分為以下模塊:\n")
        plan.append("```\n")
        plan.append("main.css (主文件，只包含 @import)\n")
        plan.append("├── modules/variables.css    (~160 行)  - CSS 變量定義\n")
        plan.append("├── modules/base.css         (~960 行)  - 基礎樣式和重置\n")
        plan.append("├── modules/utilities.css     (~287 行)  - 工具類\n")
        plan.append("├── modules/components.css    (~593 行)  - 組件樣式\n")
        plan.append("├── modules/navigation.css   (~200 行)  - 導航相關\n")
        plan.append("└── modules/animations.css   (~143 行)  - 動畫和其他\n")
        plan.append("```\n")
        plan.append("\n**注意**: Eleventy 使用 PostCSS，需要確認 @import 支持\n")
    
    plan.append("\n## 2. identity-test.js (971 行)\n")
    plan.append("### 建議拆分為以下模塊:\n")
    plan.append("```\n")
    plan.append("identity-test.js (主文件，初始化)\n")
    plan.append("├── modules/state.js      - 狀態管理 (state 對象)\n")
    plan.append("├── modules/dom.js        - DOM 元素初始化\n")
    plan.append("├── modules/quiz.js       - 測驗邏輯 (問題渲染、答案處理)\n")
    plan.append("├── modules/results.js    - 結果計算和顯示\n")
    plan.append("└── modules/ui.js         - UI 交互 (動畫、通知等)\n")
    plan.append("```\n")
    plan.append("\n**注意**: 需要確保模塊間的依賴關係正確\n")
    
    return '\n'.join(plan)

def main():
    """主函數"""
    print("🧹 開始清理代碼...\n")
    
    # 1. 清理註釋掉的代碼
    print("=" * 80)
    print("1️⃣  清理註釋掉的代碼")
    print("=" * 80)
    
    files_to_check = []
    for ext in ['.py', '.js', '.mjs', '.css']:
        for file_path in PROJECT_ROOT.rglob(f'*{ext}'):
            if any(excluded in str(file_path) for excluded in ['node_modules', '_site', '.git', '.cache', '.backup']):
                continue
            files_to_check.append(file_path)
    
    total_removed = 0
    files_cleaned = []
    
    for file_path in files_to_check[:20]:  # 限制處理前20個文件
        removed_count, removed_lines = remove_commented_code_safe(file_path)
        if removed_count > 0:
            rel_path = file_path.relative_to(PROJECT_ROOT)
            files_cleaned.append((rel_path, removed_count, removed_lines))
            total_removed += removed_count
    
    if files_cleaned:
        print(f"✅ 清理了 {len(files_cleaned)} 個文件，共移除 {total_removed} 行註釋掉的代碼\n")
        for file_path, count, lines in files_cleaned[:5]:  # 只顯示前5個
            print(f"  📄 {file_path}: {count} 行")
            for line_info in lines[:2]:  # 只顯示前2行示例
                print(f"    {line_info}")
            if len(lines) > 2:
                print(f"    ... 還有 {len(lines) - 2} 行")
    else:
        print("✅ 未發現需要清理的註釋掉的代碼")
    
    # 2. 統計 TODO/FIXME
    print("\n" + "=" * 80)
    print("2️⃣  TODO/FIXME 統計")
    print("=" * 80)
    
    todo_stats = defaultdict(list)
    total_todos = 0
    
    for file_path in files_to_check[:30]:
        todos = find_todo_comments(file_path)
        if todos:
            rel_path = file_path.relative_to(PROJECT_ROOT)
            todo_stats[rel_path] = todos
            total_todos += len(todos)
    
    if todo_stats:
        print(f"找到 {total_todos} 個 TODO/FIXME 註釋，分布在 {len(todo_stats)} 個文件中\n")
        for file_path, todos in list(todo_stats.items())[:10]:
            print(f"  📄 {file_path}: {len(todos)} 個")
            for line_num, line in todos[:2]:
                print(f"    行 {line_num}: {line[:70]}...")
    else:
        print("✅ 未發現 TODO/FIXME 註釋")
    
    # 3. 生成重構計劃
    print("\n" + "=" * 80)
    print("3️⃣  生成重構計劃")
    print("=" * 80)
    
    plan = generate_refactor_plan()
    plan_file = PROJECT_ROOT / 'REFACTOR_PLAN.md'
    with open(plan_file, 'w', encoding='utf-8') as f:
        f.write(plan)
    
    print(f"✅ 重構計劃已保存到: {plan_file}")
    print("\n" + plan)
    
    print("\n" + "=" * 80)
    print("✅ 清理完成！")
    print("=" * 80)
    print(f"\n📊 統計:")
    print(f"  - 清理註釋掉的代碼: {total_removed} 行 ({len(files_cleaned)} 個文件)")
    print(f"  - TODO/FIXME 註釋: {total_todos} 個 ({len(todo_stats)} 個文件)")
    print(f"  - 重構計劃: {plan_file}")

if __name__ == '__main__':
    main()
