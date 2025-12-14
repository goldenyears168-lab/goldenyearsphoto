#!/usr/bin/env python3
"""
清理專案中的非圖片檔案（保留所有圖片）
主要清理報告文件、測試檔案等
"""

import os
from pathlib import Path
from typing import List, Tuple

# 排除的目錄
EXCLUDE_DIRS = {
    'node_modules', '_site', '.git', '.cache', '.cursor',
    'images-original', 'scripts',  # 不刪除腳本目錄
}

# 必須保留的檔案
REQUIRED_FILES = {
    'README.md', 'package.json', 'package-lock.json',
    '.gitignore', '.eleventyignore', '.stylelintrc.json',
    '.eleventy.js', 'eslint.config.js', 'postcss.config.js', 
    'tailwind.config.js', 'favicon.ico',
}

# 圖片副檔名
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'}

# 要清理的檔案模式（非圖片）
CLEANUP_PATTERNS = [
    # 報告文件
    '*_REPORT.md', '*_SUMMARY.md', '*_PLAN.md', '*_GUIDE.md',
    '*_AUDIT*.md', '*_MIGRATION*.md', '*_TEST*.md',
    'COMPLETE_*.md', 'FINAL_*.md', 'EXTENSION_*.md',
    'DESIGN_*.md', 'TOKEN_*.md', 'VARIANT_*.md',
    'ACCESSIBILITY_*.md', 'BUTTON_*.md', 'COLOR_*.md',
    'DEPRECATED_*.md', 'HEADER_*.md', 'LONG_TERM_*.md',
    'MANUAL_*.md', 'MIGRATION_*.md', 'TESTING_*.md',
    'VISUAL_*.md', 'UNDEFINED_*.md',
    
    # 測試和範例檔案
    'test-*.html', 'MIGRATION_DEMO.njk',
    
    # JSON 報告檔案（但保留配置檔案）
    'src/assets/*_REPORT.json', 'src/assets/*_SUMMARY.json',
]

def should_skip(path: Path) -> bool:
    """判斷是否應該跳過此路徑"""
    # 檢查是否在排除目錄中
    for part in path.parts:
        if part in EXCLUDE_DIRS:
            return True
    
    # 檢查檔案名
    if path.name in REQUIRED_FILES:
        return True
    
    # 跳過隱藏檔案（除了在允許的位置）
    if path.name.startswith('.') and path.name not in {'.eleventyignore', '.gitignore', '.stylelintrc.json'}:
        return True
    
    # 跳過圖片檔案
    if path.suffix.lower() in IMAGE_EXTENSIONS:
        return True
    
    return False

def find_files_to_cleanup(project_root: Path) -> List[Tuple[Path, str]]:
    """找出需要清理的檔案"""
    files_to_cleanup = []
    
    for root, dirs, files in os.walk(project_root):
        # 過濾排除的目錄
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            file_path = Path(root) / file
            
            if should_skip(file_path):
                continue
            
            # 檢查是否符合清理模式
            rel_path = file_path.relative_to(project_root)
            file_name = file_path.name
            
            # 檢查報告文件模式
            should_clean = False
            category = "其他"
            
            # 報告文件（.md）
            if file_path.suffix.lower() == '.md':
                if any(pattern.replace('*', '') in file_name for pattern in CLEANUP_PATTERNS if pattern.endswith('.md')):
                    should_clean = True
                    category = "報告文件"
            
            # 測試檔案
            if file_name.startswith('test-') and file_path.suffix.lower() in {'.html', '.njk'}:
                should_clean = True
                category = "測試檔案"
            
            # JSON 報告檔案（但不在 src/_data/ 中）
            if file_path.suffix.lower() == '.json':
                if 'src/_data/' not in str(rel_path) and any(keyword in file_name.upper() for keyword in ['REPORT', 'SUMMARY', 'AUDIT']):
                    should_clean = True
                    category = "JSON 報告"
            
            # MIGRATION_DEMO.njk
            if file_name == 'MIGRATION_DEMO.njk':
                should_clean = True
                category = "範例檔案"
            
            if should_clean:
                files_to_cleanup.append((file_path, category))
    
    return files_to_cleanup

def format_size(size: int) -> str:
    """格式化檔案大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def main():
    """主函數"""
    project_root = Path(__file__).parent.parent.resolve()
    
    print("🧹 掃描需要清理的非圖片檔案...\n")
    
    files_to_cleanup = find_files_to_cleanup(project_root)
    
    if not files_to_cleanup:
        print("✅ 沒有發現需要清理的檔案！")
        return 0
    
    # 按類別分組
    by_category = {}
    total_size = 0
    
    for file_path, category in files_to_cleanup:
        if category not in by_category:
            by_category[category] = []
        
        try:
            size = file_path.stat().st_size
            total_size += size
            by_category[category].append((file_path, size))
        except Exception as e:
            print(f"⚠️  無法讀取 {file_path}: {e}")
            by_category[category].append((file_path, 0))
    
    # 顯示報告
    print("="*80)
    print("📊 清理報告（僅非圖片檔案）")
    print("="*80)
    
    for category, files in sorted(by_category.items()):
        print(f"\n{category} ({len(files)} 個):")
        print("-" * 80)
        
        for file_path, size in sorted(files):
            rel_path = file_path.relative_to(project_root)
            size_str = format_size(size) if size > 0 else "未知"
            print(f"  {rel_path} ({size_str})")
    
    print("\n" + "="*80)
    print(f"📈 統計:")
    print(f"   總檔案數: {len(files_to_cleanup)}")
    print(f"   總大小: {format_size(total_size)}")
    print("="*80)
    
    # 確認刪除
    print("\n⚠️  即將刪除以上檔案（不包含任何圖片）")
    response = input("確認刪除？(yes/no): ").strip().lower()
    
    if response not in ['yes', 'y']:
        print("❌ 已取消")
        return 1
    
    # 執行刪除
    print("\n🗑️  開始刪除...")
    deleted_count = 0
    deleted_size = 0
    errors = []
    
    for file_path, size in files_to_cleanup:
        try:
            file_path.unlink()
            deleted_count += 1
            deleted_size += size
            print(f"  ✅ 已刪除: {file_path.relative_to(project_root)}")
        except Exception as e:
            errors.append((file_path, str(e)))
            print(f"  ❌ 刪除失敗: {file_path.relative_to(project_root)} - {e}")
    
    print("\n" + "="*80)
    print(f"✅ 清理完成！")
    print(f"   已刪除: {deleted_count} 個檔案")
    print(f"   釋放空間: {format_size(deleted_size)}")
    
    if errors:
        print(f"\n⚠️  有 {len(errors)} 個檔案刪除失敗:")
        for file_path, error in errors:
            print(f"   - {file_path.relative_to(project_root)}: {error}")
    
    print("="*80)
    
    return 0

if __name__ == '__main__':
    exit(main())
