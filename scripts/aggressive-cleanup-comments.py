#!/usr/bin/env python3
"""
積極清理註釋掉的代碼
更徹底地檢測和移除註釋掉的代碼
"""

import re
from pathlib import Path
from typing import List, Tuple

PROJECT_ROOT = Path(__file__).parent.parent

# 排除的目錄
EXCLUDE_DIRS = {'node_modules', '_site', '.git', '.cache', '.cursor', 'images-original'}

def find_commented_code_aggressive(content: str, file_ext: str, file_path: Path) -> List[Tuple[int, str, str]]:
    """更積極地找出註釋掉的代碼"""
    lines = content.split('\n')
    commented_code = []
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Python 文件
        if file_ext == '.py':
            if stripped.startswith('#') and len(stripped) > 1:
                code_part = stripped[1:].strip()
                
                # 檢測各種代碼模式
                patterns = [
                    r'\w+\s*\([^)]*\)',  # 函數調用
                    r'\w+\s*=\s*\w+',    # 賦值
                    r'import\s+\w+',     # 導入
                    r'from\s+\w+\s+import',  # from import
                    r'def\s+\w+',        # 函數定義
                    r'class\s+\w+',      # 類定義
                    r'if\s+.*:',         # if 語句
                    r'for\s+.*:',        # for 循環
                    r'return\s+',        # return
                    r'print\s*\(',       # print
                ]
                
                # 排除純註釋關鍵詞
                exclude_patterns = [
                    r'^(TODO|FIXME|NOTE|NOTE:|HACK|XXX|WARNING|INFO|DEPRECATED|WARN|INFO|TIP)',
                    r'^[A-Z][a-z]+:',  # 如 "Note:", "Warning:"
                    r'^See\s+',        # "See ..."
                    r'^Ref:',          # "Ref: ..."
                ]
                
                is_excluded = any(re.match(pattern, code_part, re.IGNORECASE) for pattern in exclude_patterns)
                
                if not is_excluded:
                    for pattern in patterns:
                        if re.search(pattern, code_part):
                            commented_code.append((i, line, '可能的註釋掉的代碼'))
                            break
        
        # JavaScript 文件
        elif file_ext in ['.js', '.mjs']:
            if stripped.startswith('//') and len(stripped) > 2:
                code_part = stripped[2:].strip()
                
                patterns = [
                    r'\w+\s*\([^)]*\)',  # 函數調用
                    r'\w+\s*=\s*\w+',    # 賦值
                    r'const\s+\w+',      # const
                    r'let\s+\w+',        # let
                    r'var\s+\w+',        # var
                    r'function\s+\w+',   # function
                    r'import\s+.*from',  # import
                    r'export\s+',        # export
                    r'console\.',        # console
                    r'document\.',       # document
                    r'window\.',         # window
                    r'return\s+',        # return
                ]
                
                exclude_patterns = [
                    r'^(TODO|FIXME|NOTE|NOTE:|HACK|XXX|WARNING|INFO|DEPRECATED)',
                    r'^[A-Z][a-z]+:',  # 如 "Note:", "Warning:"
                    r'^See\s+',
                    r'^Ref:',
                    r'^http',           # URL
                ]
                
                is_excluded = any(re.match(pattern, code_part, re.IGNORECASE) for pattern in exclude_patterns)
                
                if not is_excluded:
                    for pattern in patterns:
                        if re.search(pattern, code_part):
                            commented_code.append((i, line, '可能的註釋掉的代碼'))
                            break
        
        # CSS 文件 - 檢測註釋掉的 CSS 規則
        elif file_ext == '.css':
            # 單行註釋中的 CSS
            if '/*' in line and '*/' in line:
                comment_match = re.search(r'/\*(.*?)\*/', line)
                if comment_match:
                    comment_content = comment_match.group(1).strip()
                    # 檢測 CSS 規則特徵
                    if re.search(r'[{}:;]|\.\w+|#\w+|\w+\s*\{', comment_content) and len(comment_content) > 5:
                        # 排除純註釋
                        if not re.match(r'^(TODO|FIXME|NOTE|Deprecated|Design System)', comment_content, re.IGNORECASE):
                            commented_code.append((i, line, '可能的註釋掉的 CSS'))
    
    return commented_code

def cleanup_file(file_path: Path, dry_run: bool = False) -> Tuple[int, List[str]]:
    """清理文件中的註釋掉的代碼"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_ext = file_path.suffix.lower()
        commented_lines = find_commented_code_aggressive(content, file_ext, file_path)
        
        if not commented_lines:
            return 0, []
        
        lines = content.split('\n')
        removed_info = []
        lines_to_remove = {line_num for line_num, _, _ in commented_lines}
        
        for line_num, line, reason in commented_lines:
            removed_info.append(f"  行 {line_num}: {reason} - {line.strip()[:70]}")
        
        if not dry_run:
            new_lines = [line for i, line in enumerate(lines, 1) if i not in lines_to_remove]
            cleaned_content = '\n'.join(new_lines)
            cleaned_content = re.sub(r'\n\n\n+', '\n\n', cleaned_content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
        
        return len(commented_lines), removed_info
    
    except Exception as e:
        return 0, [f"錯誤: {e}"]

def main():
    """主函數"""
    print("🧹 積極清理註釋掉的代碼...\n")
    
    # 收集所有代碼文件
    files_to_check = []
    for ext in ['.py', '.js', '.mjs', '.css', '.njk']:
        for file_path in PROJECT_ROOT.rglob(f'*{ext}'):
            # 跳過排除目錄
            if any(excluded in str(file_path) for excluded in EXCLUDE_DIRS):
                continue
            # 跳過備份文件
            if '.backup' in str(file_path) or file_path.name.startswith('.'):
                continue
            files_to_check.append(file_path)
    
    print(f"📁 掃描 {len(files_to_check)} 個文件...\n")
    
    # 先進行乾運行（dry run）
    print("=" * 80)
    print("🔍 檢測階段（乾運行）")
    print("=" * 80)
    
    total_found = 0
    files_with_comments = []
    
    for file_path in files_to_check:
        count, info = cleanup_file(file_path, dry_run=True)
        if count > 0:
            rel_path = file_path.relative_to(PROJECT_ROOT)
            files_with_comments.append((rel_path, count, info))
            total_found += count
    
    if not files_with_comments:
        print("✅ 未發現註釋掉的代碼")
        return
    
    print(f"\n找到 {total_found} 行可能的註釋掉的代碼，分布在 {len(files_with_comments)} 個文件中\n")
    
    # 顯示前10個文件
    for file_path, count, info in files_with_comments[:10]:
        print(f"📄 {file_path} ({count} 行):")
        for line_info in info[:3]:
            print(line_info)
        if len(info) > 3:
            print(f"  ... 還有 {len(info) - 3} 行")
        print()
    
    if len(files_with_comments) > 10:
        print(f"... 還有 {len(files_with_comments) - 10} 個文件\n")
    
    # 確認清理
    print("=" * 80)
    response = input("是否清理這些註釋掉的代碼? (yes/no): ").strip().lower()
    
    if response not in ['yes', 'y']:
        print("❌ 已取消")
        return
    
    # 執行清理
    print("\n" + "=" * 80)
    print("🧹 執行清理")
    print("=" * 80)
    
    total_removed = 0
    cleaned_files = []
    
    for file_path_str, count, info in files_with_comments:
        file_path = PROJECT_ROOT / file_path_str
        removed_count, _ = cleanup_file(file_path, dry_run=False)
        if removed_count > 0:
            cleaned_files.append((file_path_str, removed_count))
            total_removed += removed_count
            print(f"  ✅ {file_path_str}: 移除 {removed_count} 行")
    
    print("\n" + "=" * 80)
    print(f"✅ 清理完成！")
    print(f"   共清理 {total_removed} 行註釋掉的代碼")
    print(f"   涉及 {len(cleaned_files)} 個文件")
    print("=" * 80)

if __name__ == '__main__':
    main()
