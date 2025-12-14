#!/usr/bin/env python3
"""
檢測專案中未使用的檔案
分析圖片、JS、CSS、模板等檔案是否被引用
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from typing import Set, Dict, List, Tuple

# 排除的目錄和檔案
EXCLUDE_DIRS = {
    'node_modules', '_site', '.git', '.cache', '.cursor',
    'images-original',  # 原始圖片目錄（已在 .gitignore）
}

EXCLUDE_FILES = {
    '.DS_Store', '.gitignore', '.eleventyignore',
    'package.json', 'package-lock.json',
    'README.md', 'favicon.ico',
}

# 要檢查的檔案類型
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
CODE_EXTENSIONS = {'.js', '.css', '.mjs'}
TEMPLATE_EXTENSIONS = {'.njk', '.html', '.md'}
DATA_EXTENSIONS = {'.json'}

# 必須保留的檔案（配置和構建腳本）
REQUIRED_FILES = {
    'eslint.config.js', 'postcss.config.js', 'tailwind.config.js',
    'src/scripts/compress-images.mjs', 'src/scripts/upload-portfolio-to-r2.mjs',
    '.eleventy.js', 'package.json', 'package-lock.json',
    '.stylelintrc.json',  # 樣式檢查配置
}

# 需要手動檢查的檔案（可能是誤報）
MANUAL_REVIEW_FILES = {
    'src/_data/',  # 數據檔案可能被 Eleventy 使用
    'src/_includes/',  # 模板檔案通過 include/extends 使用
}

class UnusedFileFinder:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root).resolve()
        self.all_files: Dict[str, Path] = {}
        self.references: Set[str] = set()
        self.file_content_cache: Dict[Path, str] = {}
        
    def should_skip(self, path: Path) -> bool:
        """判斷是否應該跳過此路徑"""
        # 檢查是否在排除目錄中
        for part in path.parts:
            if part in EXCLUDE_DIRS:
                return True
        
        # 檢查檔案名
        if path.name in EXCLUDE_FILES:
            return True
            
        # 跳過隱藏檔案（除了在允許的位置）
        if path.name.startswith('.') and path.name not in {'.eleventyignore', '.gitignore', '.stylelintrc.json'}:
            return True
            
        return False
    
    def collect_files(self):
        """收集所有要檢查的檔案"""
        print("📁 掃描專案檔案...")
        
        for root, dirs, files in os.walk(self.project_root):
            # 過濾排除的目錄
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(self.project_root)
                
                if self.should_skip(file_path):
                    continue
                
                # 只收集資源檔案和模板檔案
                ext = file_path.suffix.lower()
                if ext in IMAGE_EXTENSIONS | CODE_EXTENSIONS | TEMPLATE_EXTENSIONS | DATA_EXTENSIONS:
                    # 使用相對路徑作為 key
                    key = str(rel_path).replace('\\', '/')
                    self.all_files[key] = file_path
        
        print(f"   找到 {len(self.all_files)} 個檔案")
    
    def read_file_content(self, file_path: Path) -> str:
        """讀取檔案內容（帶快取）"""
        if file_path not in self.file_content_cache:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    self.file_content_cache[file_path] = f.read()
            except Exception as e:
                print(f"   警告: 無法讀取 {file_path}: {e}")
                return ""
        return self.file_content_cache[file_path]
    
    def extract_references(self):
        """從所有檔案中提取引用"""
        print("🔍 分析檔案引用...")
        
        for rel_path, file_path in self.all_files.items():
            ext = file_path.suffix.lower()
            
            # 讀取模板、程式碼和數據檔案來找引用
            if ext in TEMPLATE_EXTENSIONS | CODE_EXTENSIONS | DATA_EXTENSIONS:
                content = self.read_file_content(file_path)
                self._extract_from_content(content, file_path)
    
    def _extract_from_content(self, content: str, source_file: Path):
        """從內容中提取所有可能的檔案引用"""
        
        # 1. r2img filter 引用: 'portfolio/xxx.jpg' | r2img
        r2img_pattern = r"['\"]([^'\"]+\.(jpg|jpeg|png|gif|webp|svg))['\"]\s*\|\s*r2img"
        for match in re.finditer(r2img_pattern, content, re.IGNORECASE):
            ref = match.group(1)
            self.references.add(ref)
            # 也加入 assets/images/ 前綴的版本
            self.references.add(f"assets/images/{ref}")
        
        # 2. 直接路徑引用: /assets/images/xxx.jpg 或 assets/images/xxx.jpg
        direct_path_pattern = r"['\"](/?assets/images/[^'\"]+\.(jpg|jpeg|png|gif|webp|svg))['\"]"
        for match in re.finditer(direct_path_pattern, content, re.IGNORECASE):
            ref = match.group(1).lstrip('/')
            self.references.add(ref)
            # 移除 assets/images/ 前綴，保留相對路徑
            if ref.startswith('assets/images/'):
                self.references.add(ref.replace('assets/images/', ''))
        
        url_pattern = r"url\(['\"]?([^)'\"]+\.(jpg|jpeg|png|gif|webp|svg|css))['\"]?\)"
        for match in re.finditer(url_pattern, content, re.IGNORECASE):
            ref = match.group(1).lstrip('/')
            self.references.add(ref)
            if ref.startswith('assets/'):
                self.references.add(ref.replace('assets/', ''))
        
        # 4. JS/CSS 引用: <script src="/assets/js/main.js">
        script_pattern = r"(src|href)=['\"]([^'\"]+\.(js|css|mjs))['\"]"
        for match in re.finditer(script_pattern, content, re.IGNORECASE):
            ref = match.group(2).lstrip('/')
            self.references.add(ref)
            if ref.startswith('assets/'):
                self.references.add(ref.replace('assets/', ''))
        
        # 5. 模板引用: {% include "partials/navigation.njk" %}
        include_pattern = r"(include|extends|import)\s+['\"]([^'\"]+\.njk)['\"]"
        for match in re.finditer(include_pattern, content, re.IGNORECASE):
            ref = match.group(2)
            # 處理相對路徑
            if not ref.startswith('/'):
                # 嘗試從 source_file 計算相對路徑
                if 'partials' in ref or 'macros' in ref:
                    self.references.add(f"src/_includes/{ref}")
                else:
                    self.references.add(f"src/{ref}")
            else:
                self.references.add(ref.lstrip('/'))
        
        js_string_pattern = r"['\"](portfolio/[^'\"]+\.(jpg|jpeg|png|gif|webp|svg))['\"]"
        for match in re.finditer(js_string_pattern, content, re.IGNORECASE):
            ref = match.group(1)
            self.references.add(ref)
            self.references.add(f"assets/images/{ref}")
        
        # 7. JSON 檔案中的路徑引用
        json_path_pattern = r"['\"]([^'\"]+\.(jpg|jpeg|png|gif|webp|svg|js|css))['\"]"
        if source_file.suffix.lower() == '.json':
            for match in re.finditer(json_path_pattern, content, re.IGNORECASE):
                ref = match.group(1)
                self.references.add(ref)
                if not ref.startswith('http'):
                    if ref.startswith('/'):
                        self.references.add(ref.lstrip('/'))
                    else:
                        self.references.add(f"assets/{ref}")
                        self.references.add(f"src/assets/{ref}")
        
        # 這個比較複雜，暫時跳過，因為資料檔案通常都會被使用
    
    def normalize_path(self, file_path: str) -> List[str]:
        """將檔案路徑標準化為多種可能的引用格式"""
        variants = [file_path]
        
        # 移除 src/ 前綴
        if file_path.startswith('src/'):
            variants.append(file_path[4:])
        
        # 移除 assets/ 前綴
        if file_path.startswith('assets/'):
            variants.append(file_path[7:])
        
        # 移除 assets/images/ 前綴
        if file_path.startswith('assets/images/'):
            variants.append(file_path[14:])
        
        # 移除 src/assets/images/ 前綴
        if file_path.startswith('src/assets/images/'):
            variants.append(file_path[17:])
        
        # 添加完整路徑變體
        if not file_path.startswith('src/'):
            variants.append(f"src/{file_path}")
        if not file_path.startswith('assets/'):
            variants.append(f"assets/{file_path}")
        
        return variants
    
    def find_unused_files(self) -> Dict[str, List[Tuple[str, Path]]]:
        """找出未使用的檔案"""
        print("🔎 比對檔案與引用...")
        
        unused = defaultdict(list)
        
        for rel_path, file_path in self.all_files.items():
            ext = file_path.suffix.lower()
            
            # 檢查是否被引用
            is_referenced = False
            path_variants = self.normalize_path(rel_path)
            
            for variant in path_variants:
                if variant in self.references:
                    is_referenced = True
                    break
                # 也檢查檔案名（不含路徑）
                if file_path.name in self.references:
                    is_referenced = True
                    break
            
            # 特殊處理：某些檔案類型可能不需要直接引用
            if ext in TEMPLATE_EXTENSIONS:
                # 模板檔案可能通過 Eleventy 的檔案系統自動使用
                # 檢查是否在 src/ 目錄下（會被 Eleventy 處理）
                if str(rel_path).startswith('src/') and not str(rel_path).startswith('src/_includes/'):
                    # 檢查是否有 permalink（表示是有效頁面）
                    try:
                        content = self.read_file_content(file_path)
                        if 'permalink:' in content or 'permalink =' in content:
                            is_referenced = True
                        # 頁面模板通常會被使用（除非是明確的測試檔案）
                        elif 'test' not in rel_path.lower() and 'example' not in rel_path.lower():
                            is_referenced = True
                    except:
                        # 如果無法讀取，保守處理，視為已使用
                        is_referenced = True
            
            # 必須保留的檔案（配置和構建腳本）
            if rel_path in REQUIRED_FILES or file_path.name in REQUIRED_FILES:
                is_referenced = True
            
            # 檢查是否在需要手動檢查的目錄中
            for manual_review_path in MANUAL_REVIEW_FILES:
                if str(rel_path).startswith(manual_review_path):
                    # 標記為需要手動檢查，但不標記為未使用
                    # 這樣它們不會出現在清理腳本中
                    is_referenced = True
                    break
            
            if not is_referenced:
                category = self._categorize_file(rel_path, ext)
                unused[category].append((rel_path, file_path))
        
        return unused
    
    def _categorize_file(self, rel_path: str, ext: str) -> str:
        """將檔案分類"""
        if ext in IMAGE_EXTENSIONS:
            if 'portfolio' in rel_path:
                return 'portfolio_images'
            elif 'content' in rel_path:
                return 'content_images'
            elif 'ui' in rel_path:
                return 'ui_images'
            else:
                return 'other_images'
        elif ext in CODE_EXTENSIONS:
            return 'code_files'
        elif ext in TEMPLATE_EXTENSIONS:
            return 'template_files'
        else:
            return 'other'
    
    def generate_report(self, unused: Dict[str, List[Tuple[str, Path]]]):
        """生成報告"""
        print("\n" + "="*80)
        print("📊 未使用檔案報告")
        print("="*80)
        
        total_unused = sum(len(files) for files in unused.values())
        total_size = 0
        
        if total_unused == 0:
            print("\n✅ 恭喜！沒有發現未使用的檔案。")
            return
        
        # 按類別顯示
        category_names = {
            'portfolio_images': '📸 Portfolio 圖片',
            'content_images': '🖼️  Content 圖片',
            'ui_images': '🎨 UI 圖片',
            'other_images': '📷 其他圖片',
            'code_files': '💻 程式碼檔案',
            'template_files': '📄 模板檔案',
            'other': '📦 其他檔案',
        }
        
        for category, files in sorted(unused.items()):
            if not files:
                continue
            
            print(f"\n{category_names.get(category, category)} ({len(files)} 個):")
            print("-" * 80)
            
            for rel_path, file_path in sorted(files):
                try:
                    size = file_path.stat().st_size
                    total_size += size
                    size_str = self._format_size(size)
                    print(f"  {rel_path} ({size_str})")
                except Exception as e:
                    print(f"  {rel_path} (無法讀取大小: {e})")
        
        print("\n" + "="*80)
        print(f"📈 統計:")
        print(f"   總未使用檔案數: {total_unused}")
        print(f"   總大小: {self._format_size(total_size)}")
        print("="*80)
        
        # 顯示注意事項
        print("\n⚠️  注意事項:")
        print("   1. 請仔細檢查報告中的檔案，確認它們真的未被使用")
        print("   2. 某些檔案可能通過動態方式引用（如 API、資料庫等）")
        print("   3. 建議先備份專案，再執行清理腳本")
        print("   4. 可以先手動刪除幾個檔案測試，確認沒有問題後再批量刪除")
        print("="*80)
        
        # 生成刪除建議腳本
        self._generate_cleanup_script(unused)
    
    def _format_size(self, size: int) -> str:
        """格式化檔案大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def _generate_cleanup_script(self, unused: Dict[str, List[Tuple[str, Path]]]):
        """生成清理腳本"""
        script_path = self.project_root / 'scripts' / 'cleanup-unused-files.sh'
        
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write("#!/bin/bash\n")
            f.write("# 自動生成的清理腳本 - 請仔細檢查後再執行\n")
            f.write("# 此腳本會刪除未使用的檔案\n\n")
            f.write("set -e\n\n")
            f.write("echo '⚠️  警告：此腳本將刪除以下檔案...'\n")
            f.write("echo '請確認後再執行！'\n\n")
            
            for category, files in sorted(unused.items()):
                if not files:
                    continue
                f.write(f"# {category}\n")
                for rel_path, file_path in sorted(files):
                    f.write(f"rm -v '{file_path}'\n")
                f.write("\n")
            
            f.write("echo '✅ 清理完成'\n")
        
        # 設置執行權限
        os.chmod(script_path, 0o755)
        
        print(f"\n💡 清理腳本已生成: {script_path}")
        print("   請檢查報告後，手動執行清理腳本")
    
    def run(self):
        """執行完整分析流程"""
        print("🚀 開始分析未使用檔案...\n")
        
        self.collect_files()
        self.extract_references()
        unused = self.find_unused_files()
        self.generate_report(unused)
        
        return unused

def main():
    """主函數"""
    # 獲取專案根目錄（腳本所在目錄的父目錄）
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    finder = UnusedFileFinder(project_root)
    unused = finder.run()
    
    # 返回退出碼
    total_unused = sum(len(files) for files in unused.values())
    return 0 if total_unused == 0 else 1

if __name__ == '__main__':
    exit(main())
