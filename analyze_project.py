import os
import json
from pathlib import Path

# --- 設定忽略的資料夾 (根據你的專案調整) ---
IGNORED_DIRS = {'.git', 'node_modules', '.next', 'dist', '__pycache__', '.venv', '.vscode', '.idea'}
IGNORED_EXTS = {'.DS_Store', '.log'}

def analyze_project(root_path):
    stats = {
        "total_files": 0,
        "total_size_kb": 0,
        "file_types": {},
        "large_files": [], # > 500KB
        "deep_paths": [],  # Folder depth > 5
        "empty_dirs": []
    }
    
    structure_map = []

    for root, dirs, files in os.walk(root_path):
        # 過濾忽略的資料夾
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        current_depth = root.count(os.sep)
        if current_depth > 5:
            stats["deep_paths"].append(root)

        if not dirs and not files:
            stats["empty_dirs"].append(root)

        for file in files:
            file_path = Path(root) / file
            if file_path.suffix in IGNORED_EXTS:
                continue
                
            stats["total_files"] += 1
            try:
                size = file_path.stat().st_size / 1024 # KB
                stats["total_size_kb"] += size
                
                # 統計檔案類型
                ext = file_path.suffix or "no_extension"
                stats["file_types"][ext] = stats["file_types"].get(ext, 0) + 1
                
                # 記錄大檔案
                if size > 500: # 500KB
                    stats["large_files"].append((str(file_path), round(size, 2)))
            except Exception as e:
                pass

    return stats

def print_report(stats):
    print("="*40)
    print("📊 PROJECT PHYSICAL HEALTH REPORT")
    print("="*40)
    print(f"Total Files: {stats['total_files']}")
    print(f"Total Size:  {stats['total_size_kb']/1024:.2f} MB")
    
    print("\n📂 File Type Distribution:")
    for ext, count in sorted(stats['file_types'].items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {ext:<10}: {count}")
        
    print("\n⚠️  Large Files (>500KB) [Check if needed]:")
    for f, s in stats['large_files']:
        print(f"  {s:>8.2f} KB | {f}")
        
    print("\n⚠️  Deeply Nested Paths (>5 levels) [Complex structure]:")
    for p in stats['deep_paths'][:5]:
        print(f"  {p}")
    if len(stats['deep_paths']) > 5: print(f"  ...and {len(stats['deep_paths'])-5} more.")

    print("\n🗑️  Empty Directories:")
    for d in stats['empty_dirs']:
        print(f"  {d}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"Scanning: {current_dir}")
    data = analyze_project(current_dir)
    print_report(data)
