import os
import re

# 定義要掃描的危險關鍵字
PATTERNS = {
    "LOCALHOST_IP": r"127\.0\.0\.1",
    "LOCALHOST_URL": r"localhost",
    "DEBUG_PORT": r":7242",
    "CONSOLE_LOG": r"console\.log\(",
    "HARDCODED_R2": r"r2\.dev", # 檢查是否硬編碼 R2 網址
    "TODO_FIXME": r"(TODO|FIXME)"
}

IGNORE_DIRS = {'.git', 'node_modules', '.next', 'dist', '__pycache__', 'images-original'}
IGNORE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.json', '.map'}

def deep_content_scan(root_path):
    print(f"🔍 Starting Deep Content Scan in: {root_path}\n")
    findings = {k: [] for k in PATTERNS.keys()}
    
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in IGNORE_EXTS):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        for label, pattern in PATTERNS.items():
                            if re.search(pattern, line):
                                findings[label].append(f"{file_path} (Line {i+1}): {line.strip()[:60]}...")
            except Exception as e:
                pass # Skip unreadable files

    # 輸出報告
    for label, items in findings.items():
        if items:
            print(f"🚩 Found [{label}]: {len(items)} instances")
            for item in items[:5]: # 只顯示前5個，避免洗版
                print(f"   - {item}")
            if len(items) > 5: print(f"   ... and {len(items)-5} more.")
            print("-" * 30)
        else:
            print(f"✅ No issues found for [{label}]")

if __name__ == "__main__":
    deep_content_scan(os.getcwd())
