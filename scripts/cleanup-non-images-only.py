#!/usr/bin/env python3
"""
清理專案中的非圖片檔案（保留所有圖片）
基於 find-unused-files.py 的結果，只清理非圖片檔案
"""

from pathlib import Path
from typing import List, Tuple

# 圖片副檔名
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'}

def is_image_file(file_path: Path) -> bool:
    """判斷是否為圖片檔案"""
    return file_path.suffix.lower() in IMAGE_EXTENSIONS

def get_unused_files_from_script() -> List[Tuple[str, Path]]:
    """從 find-unused-files.py 獲取未使用檔案列表"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # 讀取清理腳本（由 find-unused-files.py 生成）
    cleanup_script = project_root / 'scripts' / 'cleanup-unused-files.sh'
    
    if not cleanup_script.exists():
        print("⚠️  請先運行 find-unused-files.py 生成清理腳本")
        return []
    
    files_to_clean = []
    
    with open(cleanup_script, 'r', encoding='utf-8') as f:
        for line in f:
            # 提取 rm 命令中的檔案路徑
            if line.strip().startswith('rm -v'):
                # 提取引號中的路徑
                import re
                match = re.search(r"'([^']+)'", line)
                if match:
                    file_path = Path(match.group(1))
                    rel_path = file_path.relative_to(project_root)
                    
                    # 只保留非圖片檔案
                    if not is_image_file(file_path):
                        files_to_clean.append((str(rel_path), file_path))
    
    return files_to_clean

def format_size(size: int) -> str:
    """格式化檔案大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def main():
    """主函數"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    print("🧹 掃描需要清理的非圖片檔案...\n")
    
    # 獲取未使用的非圖片檔案
    files_to_clean = get_unused_files_from_script()
    
    if not files_to_clean:
        print("✅ 沒有發現需要清理的非圖片檔案！")
        print("   （所有未使用的檔案都是圖片，已保留）")
        return 0
    
    # 計算大小
    total_size = 0
    files_with_size = []
    
    for rel_path, file_path in files_to_clean:
        try:
            if file_path.exists():
                size = file_path.stat().st_size
                total_size += size
                files_with_size.append((rel_path, file_path, size))
            else:
                print(f"⚠️  檔案不存在: {rel_path}")
        except Exception as e:
            print(f"⚠️  無法讀取 {rel_path}: {e}")
    
    if not files_with_size:
        print("✅ 沒有需要清理的檔案（檔案可能已被刪除）")
        return 0
    
    # 顯示報告
    print("="*80)
    print("📊 清理報告（僅非圖片檔案）")
    print("="*80)
    print(f"\n找到 {len(files_with_size)} 個非圖片檔案可以清理：\n")
    
    for rel_path, file_path, size in sorted(files_with_size):
        size_str = format_size(size)
        print(f"  {rel_path} ({size_str})")
    
    print("\n" + "="*80)
    print(f"📈 統計:")
    print(f"   總檔案數: {len(files_with_size)}")
    print(f"   總大小: {format_size(total_size)}")
    print("="*80)
    
    # 確認刪除（非互動模式直接執行）
    print("\n⚠️  即將刪除以上檔案（不包含任何圖片）")
    
    # 檢查是否在非互動環境
    import sys
    if not sys.stdin.isatty():
        print("非互動模式，自動執行清理...")
    else:
        response = input("確認刪除？(yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("❌ 已取消")
            return 1
    
    # 執行刪除
    print("\n🗑️  開始刪除...")
    deleted_count = 0
    deleted_size = 0
    errors = []
    
    for rel_path, file_path, size in files_with_size:
        try:
            file_path.unlink()
            deleted_count += 1
            deleted_size += size
            print(f"  ✅ 已刪除: {rel_path}")
        except Exception as e:
            errors.append((rel_path, str(e)))
            print(f"  ❌ 刪除失敗: {rel_path} - {e}")
    
    print("\n" + "="*80)
    print(f"✅ 清理完成！")
    print(f"   已刪除: {deleted_count} 個檔案")
    print(f"   釋放空間: {format_size(deleted_size)}")
    
    if errors:
        print(f"\n⚠️  有 {len(errors)} 個檔案刪除失敗:")
        for rel_path, error in errors:
            print(f"   - {rel_path}: {error}")
    
    print("="*80)
    
    return 0

if __name__ == '__main__':
    exit(main())
