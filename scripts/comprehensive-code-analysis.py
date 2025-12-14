#!/usr/bin/env python3
"""
全面代碼分析工具
檢測未使用的代碼、代碼健康度、專業度評估
生成全方位的分析報告
"""

import ast
import json
import os
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

# 排除的目錄
EXCLUDE_DIRS = {
    'node_modules', '_site', '.git', '.cache', '.cursor',
    'images-original', 'assets/images',
}

class CodeAnalyzer:
    def __init__(self, project_root: Path):
        self.project_root = project_root.resolve()
        self.results = {
            'unused_code': {},
            'code_quality': {},
            'best_practices': {},
            'dependencies': {},
            'security': {},
            'performance': {},
            'documentation': {},
            'health_score': 0,
        }
        self.stats = {
            'total_files': 0,
            'total_lines': 0,
            'python_files': 0,
            'js_files': 0,
            'css_files': 0,
            'template_files': 0,
        }
        
    def analyze(self):
        """執行全面分析"""
        print("🔍 開始全面代碼分析...\n")
        
        # 1. 收集所有文件
        print("📁 掃描專案文件...")
        files = self._collect_files()
        self.stats['total_files'] = len(files)
        print(f"   找到 {len(files)} 個文件\n")
        
        # 2. 分析未使用的代碼
        print("🔎 分析未使用的代碼...")
        self._analyze_unused_code(files)
        
        # 3. 代碼質量分析
        print("📊 分析代碼質量...")
        self._analyze_code_quality(files)
        
        # 4. 最佳實踐檢查
        print("✅ 檢查最佳實踐...")
        self._check_best_practices(files)
        
        # 5. 依賴分析
        print("📦 分析依賴關係...")
        self._analyze_dependencies()
        
        # 6. 安全性檢查
        print("🔒 安全性檢查...")
        self._check_security(files)
        
        # 7. 性能分析
        print("⚡ 性能分析...")
        self._analyze_performance(files)
        
        # 8. 文檔完整性
        print("📝 檢查文檔完整性...")
        self._check_documentation(files)
        
        # 9. 計算健康度評分
        print("💯 計算健康度評分...")
        self._calculate_health_score()
        
        return self.results
    
    def _collect_files(self) -> Dict[str, Path]:
        """收集所有代碼文件"""
        files = {}
        
        for root, dirs, file_list in os.walk(self.project_root):
            # 過濾排除目錄
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in file_list:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(self.project_root)
                
                # 只收集代碼文件
                ext = file_path.suffix.lower()
                if ext in {'.py', '.js', '.mjs', '.css', '.njk', '.html'}:
                    files[str(rel_path)] = file_path
                    
                    # 統計
                    if ext == '.py':
                        self.stats['python_files'] += 1
                    elif ext in {'.js', '.mjs'}:
                        self.stats['js_files'] += 1
                    elif ext == '.css':
                        self.stats['css_files'] += 1
                    elif ext in {'.njk', '.html'}:
                        self.stats['template_files'] += 1
                    
                    # 計算總行數
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            self.stats['total_lines'] += len(f.readlines())
                    except:
                        pass
        
        return files
    
    def _analyze_unused_code(self, files: Dict[str, Path]):
        """分析未使用的代碼"""
        unused = {
            'python_functions': [],
            'python_imports': [],
            'python_variables': [],
            'js_functions': [],
            'js_variables': [],
            'unused_files': [],
        }
        
        # Python 文件分析
        for rel_path, file_path in files.items():
            if file_path.suffix == '.py':
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 解析 AST
                    try:
                        tree = ast.parse(content, filename=str(file_path))
                        unused_in_file = self._analyze_python_ast(tree, file_path, files)
                        unused['python_functions'].extend(unused_in_file['functions'])
                        unused['python_imports'].extend(unused_in_file['imports'])
                        unused['python_variables'].extend(unused_in_file['variables'])
                    except SyntaxError:
                        pass
                except Exception as e:
                    pass
        
        # JavaScript 文件分析
        for rel_path, file_path in files.items():
            if file_path.suffix in {'.js', '.mjs'}:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    unused_in_file = self._analyze_javascript(content, file_path, files)
                    unused['js_functions'].extend(unused_in_file['functions'])
                    unused['js_variables'].extend(unused_in_file['variables'])
                except Exception as e:
                    pass
        
        self.results['unused_code'] = unused
    
    def _analyze_python_ast(self, tree: ast.AST, file_path: Path, all_files: Dict[str, Path]) -> Dict:
        """分析 Python AST"""
        unused = {
            'functions': [],
            'imports': [],
            'variables': [],
        }
        
        defined_functions = set()
        defined_imports = set()
        defined_variables = set()
        used_names = set()
        
        class Visitor(ast.NodeVisitor):
            def visit_FunctionDef(self, node):
                defined_functions.add(node.name)
                # 跳過私有函數（以 _ 開頭）
                if not node.name.startswith('_'):
                    self.generic_visit(node)
            
            def visit_Import(self, node):
                for alias in node.names:
                    defined_imports.add(alias.asname or alias.name.split('.')[0])
            
            def visit_ImportFrom(self, node):
                if node.module:
                    for alias in node.names:
                        defined_imports.add(alias.asname or alias.name)
            
            def visit_Name(self, node):
                if isinstance(node.ctx, ast.Load):
                    used_names.add(node.id)
        
        visitor = Visitor()
        visitor.visit(tree)
        
        # 檢查未使用的函數
        for func_name in defined_functions:
            if func_name not in used_names and not func_name.startswith('_'):
                # 檢查是否在其他文件中被使用
                if not self._is_used_in_other_files(func_name, file_path, all_files):
                    unused['functions'].append({
                        'file': str(file_path.relative_to(self.project_root)),
                        'name': func_name,
                        'type': 'function'
                    })
        
        # 檢查未使用的導入
        for import_name in defined_imports:
            if import_name not in used_names:
                unused['imports'].append({
                    'file': str(file_path.relative_to(self.project_root)),
                    'name': import_name,
                    'type': 'import'
                })
        
        return unused
    
    def _analyze_javascript(self, content: str, file_path: Path, all_files: Dict[str, Path]) -> Dict:
        """分析 JavaScript 代碼"""
        unused = {
            'functions': [],
            'variables': [],
        }
        
        # 提取函數定義
        function_pattern = r'(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(|let\s+(\w+)\s*=\s*(?:async\s*)?\(|var\s+(\w+)\s*=\s*(?:async\s*)?\()'
        defined_functions = set()
        
        for match in re.finditer(function_pattern, content):
            func_name = match.group(1) or match.group(2) or match.group(3) or match.group(4)
            if func_name and not func_name.startswith('_'):
                defined_functions.add(func_name)
        
        # 檢查函數是否被調用
        for func_name in defined_functions:
            # 在當前文件中查找調用
            call_pattern = rf'\b{re.escape(func_name)}\s*\('
            if not re.search(call_pattern, content):
                # 檢查是否在其他文件中被使用
                if not self._is_used_in_other_files(func_name, file_path, all_files, is_js=True):
                    unused['functions'].append({
                        'file': str(file_path.relative_to(self.project_root)),
                        'name': func_name,
                        'type': 'function'
                    })
        
        return unused
    
    def _is_used_in_other_files(self, name: str, current_file: Path, all_files: Dict[str, Path], is_js: bool = False) -> bool:
        """檢查名稱是否在其他文件中被使用"""
        for rel_path, file_path in all_files.items():
            if file_path == current_file:
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # 簡單的字符串匹配（可以改進）
                if is_js:
                    pattern = rf'\b{re.escape(name)}\s*\('
                else:
                    pattern = rf'\b{re.escape(name)}\b'
                
                if re.search(pattern, content):
                    return True
            except:
                pass
        
        return False
    
    def _analyze_code_quality(self, files: Dict[str, Path]):
        """分析代碼質量"""
        quality = {
            'complexity': {},
            'duplication': [],
            'long_files': [],
            'long_functions': [],
            'code_smells': [],
        }
        
        for rel_path, file_path in files.items():
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    content = ''.join(lines)
                
                # 文件長度檢查
                if len(lines) > 500:
                    quality['long_files'].append({
                        'file': rel_path,
                        'lines': len(lines),
                        'severity': 'high' if len(lines) > 1000 else 'medium'
                    })
                
                # 複雜度分析（簡單版本）
                if file_path.suffix == '.py':
                    complexity = self._calculate_complexity(content, 'python')
                    if complexity > 20:
                        quality['complexity'][rel_path] = complexity
                
                # 代碼異味檢測
                smells = self._detect_code_smells(content, file_path)
                quality['code_smells'].extend(smells)
                
            except Exception as e:
                pass
        
        self.results['code_quality'] = quality
    
    def _calculate_complexity(self, content: str, lang: str) -> int:
        """計算代碼複雜度（簡化版）"""
        complexity = 1  # 基礎複雜度
        
        if lang == 'python':
            # 計算控制流語句
            complexity += len(re.findall(r'\b(if|elif|else|for|while|try|except|with)\b', content))
            complexity += len(re.findall(r'\b(and|or)\b', content)) * 0.5
        
        return int(complexity)
    
    def _detect_code_smells(self, content: str, file_path: Path) -> List[Dict]:
        """檢測代碼異味"""
        smells = []
        
        # 註釋掉的代碼
        if re.search(r'^\s*//.*\w+.*\(|^\s*#.*\w+.*\(', content, re.MULTILINE):
            smells.append({
                'file': str(file_path.relative_to(self.project_root)),
                'type': 'commented_code',
                'severity': 'low'
            })
        
        # TODO/FIXME 註釋
        todo_count = len(re.findall(r'\b(TODO|FIXME|XXX|HACK)\b', content, re.IGNORECASE))
        if todo_count > 0:
            smells.append({
                'file': str(file_path.relative_to(self.project_root)),
                'type': 'todo_comments',
                'count': todo_count,
                'severity': 'medium'
            })
        
        # 硬編碼的敏感信息
        if re.search(r'(password|secret|api_key|token)\s*=\s*["\'][^"\']+["\']', content, re.IGNORECASE):
            smells.append({
                'file': str(file_path.relative_to(self.project_root)),
                'type': 'hardcoded_secrets',
                'severity': 'high'
            })
        
        # console.log 調用（生產環境）
        if file_path.suffix in {'.js', '.mjs'}:
            console_logs = len(re.findall(r'console\.(log|debug|info)', content))
            if console_logs > 5:
                smells.append({
                    'file': str(file_path.relative_to(self.project_root)),
                    'type': 'excessive_console_logs',
                    'count': console_logs,
                    'severity': 'low'
                })
        
        return smells
    
    def _check_best_practices(self, files: Dict[str, Path]):
        """檢查最佳實踐"""
        practices = {
            'errors': [],
            'warnings': [],
            'suggestions': [],
        }
        
        # 檢查錯誤處理
        for rel_path, file_path in files.items():
            if file_path.suffix == '.py':
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 檢查是否有適當的錯誤處理
                    has_try_except = 'try:' in content or 'except' in content
                    has_error_handling = has_try_except or 'raise' in content
                    
                    # 檢查文件操作是否有錯誤處理
                    if 'open(' in content and not has_error_handling:
                        practices['warnings'].append({
                            'file': rel_path,
                            'issue': '文件操作缺少錯誤處理',
                            'type': 'error_handling'
                        })
                except:
                    pass
        
        # 檢查代碼組織
        # 檢查是否有適當的模塊化
        py_files = [f for f in files.items() if f[1].suffix == '.py']
        if len(py_files) > 10:
            # 檢查是否有適當的目錄結構
            py_dirs = set(str(f[1].parent) for f in py_files)
            if len(py_dirs) == 1:
                practices['suggestions'].append({
                    'issue': '考慮將 Python 文件組織到子目錄中',
                    'type': 'organization'
                })
        
        self.results['best_practices'] = practices
    
    def _analyze_dependencies(self):
        """分析依賴關係"""
        deps = {
            'unused_packages': [],
            'outdated_packages': [],
            'security_issues': [],
            'duplicate_deps': [],
        }
        
        # 讀取 package.json
        package_json = self.project_root / 'package.json'
        if package_json.exists():
            try:
                with open(package_json, 'r', encoding='utf-8') as f:
                    package_data = json.load(f)
                
                all_deps = {}
                all_deps.update(package_data.get('dependencies', {}))
                all_deps.update(package_data.get('devDependencies', {}))
                
                # 檢查未使用的依賴（簡單檢查）
                # 這裡可以改進，實際掃描 import/require 語句
                
            except Exception as e:
                pass
        
        self.results['dependencies'] = deps
    
    def _check_security(self, files: Dict[str, Path]):
        """安全性檢查"""
        security = {
            'issues': [],
            'warnings': [],
        }
        
        for rel_path, file_path in files.items():
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # 檢查 SQL 注入風險
                if re.search(r'eval\s*\(|exec\s*\(', content):
                    security['issues'].append({
                        'file': rel_path,
                        'type': 'dangerous_eval',
                        'severity': 'high'
                    })
                
                # 檢查 XSS 風險（在模板中）
                if file_path.suffix in {'.njk', '.html'}:
                    if re.search(r'<script[^>]*>.*\{\{.*\}\}', content, re.DOTALL):
                        security['warnings'].append({
                            'file': rel_path,
                            'type': 'potential_xss',
                            'severity': 'medium'
                        })
                
            except:
                pass
        
        self.results['security'] = security
    
    def _analyze_performance(self, files: Dict[str, Path]):
        """性能分析"""
        performance = {
            'issues': [],
            'suggestions': [],
        }
        
        # 檢查大文件
        for rel_path, file_path in files.items():
            try:
                size = file_path.stat().st_size
                if size > 100 * 1024:  # 100KB
                    performance['suggestions'].append({
                        'file': rel_path,
                        'issue': f'文件較大 ({size/1024:.1f}KB)，考慮拆分',
                        'type': 'large_file'
                    })
            except:
                pass
        
        self.results['performance'] = performance
    
    def _check_documentation(self, files: Dict[str, Path]):
        """檢查文檔完整性"""
        documentation = {
            'missing_docstrings': [],
            'missing_readme': [],
            'coverage': 0,
        }
        
        # 檢查 README
        readme_files = ['README.md', 'readme.md', 'README.txt']
        has_readme = any((self.project_root / f).exists() for f in readme_files)
        if not has_readme:
            documentation['missing_readme'].append('專案根目錄缺少 README.md')
        
        # 檢查 Python 文件的文檔字符串
        py_files_with_docs = 0
        py_files_total = 0
        
        for rel_path, file_path in files.items():
            if file_path.suffix == '.py':
                py_files_total += 1
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 檢查是否有模塊級文檔字符串
                    if '"""' in content or "'''" in content:
                        py_files_with_docs += 1
                    else:
                        documentation['missing_docstrings'].append(rel_path)
                except:
                    pass
        
        if py_files_total > 0:
            documentation['coverage'] = (py_files_with_docs / py_files_total) * 100
        
        self.results['documentation'] = documentation
    
    def _calculate_health_score(self):
        """計算整體健康度評分"""
        score = 100
        deductions = []
        
        # 未使用代碼扣分
        unused_count = (
            len(self.results['unused_code'].get('python_functions', [])) +
            len(self.results['unused_code'].get('js_functions', [])) +
            len(self.results['unused_code'].get('python_imports', []))
        )
        if unused_count > 0:
            deduction = min(unused_count * 2, 20)
            score -= deduction
            deductions.append(f'未使用代碼: -{deduction}分')
        
        # 代碼質量問題扣分
        quality_issues = (
            len(self.results['code_quality'].get('long_files', [])) +
            len(self.results['code_quality'].get('code_smells', []))
        )
        if quality_issues > 0:
            deduction = min(quality_issues, 15)
            score -= deduction
            deductions.append(f'代碼質量問題: -{deduction}分')
        
        # 安全性問題扣分
        security_issues = len(self.results['security'].get('issues', []))
        if security_issues > 0:
            deduction = min(security_issues * 10, 30)
            score -= deduction
            deductions.append(f'安全性問題: -{deduction}分')
        
        # 文檔完整性
        doc_coverage = self.results['documentation'].get('coverage', 0)
        if doc_coverage < 50:
            deduction = int((50 - doc_coverage) / 10)
            score -= deduction
            deductions.append(f'文檔不足: -{deduction}分')
        
        score = max(0, score)
        
        self.results['health_score'] = score
        self.results['health_deductions'] = deductions
    
    def generate_report(self) -> str:
        """生成報告"""
        report = []
        report.append("=" * 80)
        report.append("📊 全面代碼分析報告")
        report.append("=" * 80)
        report.append("")
        
        # 專案統計
        report.append("📈 專案統計")
        report.append("-" * 80)
        report.append(f"總文件數: {self.stats['total_files']}")
        report.append(f"總代碼行數: {self.stats['total_lines']:,}")
        report.append(f"Python 文件: {self.stats['python_files']}")
        report.append(f"JavaScript 文件: {self.stats['js_files']}")
        report.append(f"CSS 文件: {self.stats['css_files']}")
        report.append(f"模板文件: {self.stats['template_files']}")
        report.append("")
        
        # 健康度評分
        score = self.results['health_score']
        score_emoji = "🟢" if score >= 80 else "🟡" if score >= 60 else "🔴"
        report.append(f"{score_emoji} 整體健康度評分: {score}/100")
        if self.results.get('health_deductions'):
            report.append("扣分項目:")
            for deduction in self.results['health_deductions']:
                report.append(f"  • {deduction}")
        report.append("")
        
        # 未使用的代碼
        report.append("🔎 未使用的代碼")
        report.append("-" * 80)
        unused = self.results['unused_code']
        
        if unused.get('python_functions'):
            report.append(f"\nPython 未使用函數 ({len(unused['python_functions'])} 個):")
            for item in unused['python_functions'][:10]:  # 只顯示前10個
                report.append(f"  • {item['file']}: {item['name']}")
            if len(unused['python_functions']) > 10:
                report.append(f"  ... 還有 {len(unused['python_functions']) - 10} 個")
        
        if unused.get('js_functions'):
            report.append(f"\nJavaScript 未使用函數 ({len(unused['js_functions'])} 個):")
            for item in unused['js_functions'][:10]:
                report.append(f"  • {item['file']}: {item['name']}")
            if len(unused['js_functions']) > 10:
                report.append(f"  ... 還有 {len(unused['js_functions']) - 10} 個")
        
        if unused.get('python_imports'):
            report.append(f"\nPython 未使用導入 ({len(unused['python_imports'])} 個):")
            for item in unused['python_imports'][:10]:
                report.append(f"  • {item['file']}: {item['name']}")
            if len(unused['python_imports']) > 10:
                report.append(f"  ... 還有 {len(unused['python_imports']) - 10} 個")
        
        if not any(unused.values()):
            report.append("✅ 未發現未使用的代碼")
        report.append("")
        
        # 代碼質量
        report.append("📊 代碼質量分析")
        report.append("-" * 80)
        quality = self.results['code_quality']
        
        if quality.get('long_files'):
            report.append(f"\n過長的文件 ({len(quality['long_files'])} 個):")
            for item in quality['long_files']:
                report.append(f"  • {item['file']}: {item['lines']} 行 ({item['severity']})")
        
        if quality.get('code_smells'):
            report.append(f"\n代碼異味 ({len(quality['code_smells'])} 個):")
            for item in quality['code_smells'][:10]:
                report.append(f"  • {item['file']}: {item['type']} ({item['severity']})")
            if len(quality['code_smells']) > 10:
                report.append(f"  ... 還有 {len(quality['code_smells']) - 10} 個")
        
        if not quality.get('long_files') and not quality.get('code_smells'):
            report.append("✅ 代碼質量良好")
        report.append("")
        
        # 最佳實踐
        report.append("✅ 最佳實踐檢查")
        report.append("-" * 80)
        practices = self.results['best_practices']
        
        if practices.get('errors'):
            report.append(f"\n❌ 錯誤 ({len(practices['errors'])} 個):")
            for item in practices['errors']:
                report.append(f"  • {item.get('file', 'N/A')}: {item.get('issue', 'N/A')}")
        
        if practices.get('warnings'):
            report.append(f"\n⚠️  警告 ({len(practices['warnings'])} 個):")
            for item in practices['warnings'][:5]:
                report.append(f"  • {item.get('file', 'N/A')}: {item.get('issue', 'N/A')}")
            if len(practices['warnings']) > 5:
                report.append(f"  ... 還有 {len(practices['warnings']) - 5} 個")
        
        if practices.get('suggestions'):
            report.append(f"\n💡 建議 ({len(practices['suggestions'])} 個):")
            for item in practices['suggestions']:
                report.append(f"  • {item.get('issue', 'N/A')}")
        
        if not any(practices.values()):
            report.append("✅ 符合最佳實踐")
        report.append("")
        
        # 安全性
        report.append("🔒 安全性檢查")
        report.append("-" * 80)
        security = self.results['security']
        
        if security.get('issues'):
            report.append(f"\n❌ 安全問題 ({len(security['issues'])} 個):")
            for item in security['issues']:
                report.append(f"  • {item['file']}: {item['type']} ({item['severity']})")
        
        if security.get('warnings'):
            report.append(f"\n⚠️  安全警告 ({len(security['warnings'])} 個):")
            for item in security['warnings']:
                report.append(f"  • {item['file']}: {item['type']} ({item['severity']})")
        
        if not security.get('issues') and not security.get('warnings'):
            report.append("✅ 未發現安全問題")
        report.append("")
        
        # 性能
        report.append("⚡ 性能分析")
        report.append("-" * 80)
        performance = self.results['performance']
        
        if performance.get('suggestions'):
            report.append(f"\n💡 性能建議 ({len(performance['suggestions'])} 個):")
            for item in performance['suggestions']:
                report.append(f"  • {item['file']}: {item['issue']}")
        
        if not performance.get('suggestions'):
            report.append("✅ 性能良好")
        report.append("")
        
        # 文檔
        report.append("📝 文檔完整性")
        report.append("-" * 80)
        doc = self.results['documentation']
        
        if doc.get('missing_readme'):
            report.append(f"\n⚠️  缺少 README 文件")
        
        if doc.get('missing_docstrings'):
            report.append(f"\n⚠️  缺少文檔字符串的文件 ({len(doc['missing_docstrings'])} 個):")
            for file in doc['missing_docstrings'][:5]:
                report.append(f"  • {file}")
            if len(doc['missing_docstrings']) > 5:
                report.append(f"  ... 還有 {len(doc['missing_docstrings']) - 5} 個")
        
        report.append(f"\n文檔覆蓋率: {doc.get('coverage', 0):.1f}%")
        report.append("")
        
        # 總結和建議
        report.append("=" * 80)
        report.append("📋 總結與建議")
        report.append("=" * 80)
        
        recommendations = []
        
        if unused.get('python_functions') or unused.get('js_functions'):
            recommendations.append("• 考慮移除未使用的函數，減少代碼複雜度")
        
        if quality.get('long_files'):
            recommendations.append("• 將過長的文件拆分為更小的模塊")
        
        if security.get('issues'):
            recommendations.append("• 優先修復安全問題")
        
        if doc.get('coverage', 0) < 50:
            recommendations.append("• 增加代碼文檔，提高可維護性")
        
        if not recommendations:
            recommendations.append("✅ 代碼質量良好，繼續保持！")
        
        for rec in recommendations:
            report.append(rec)
        
        report.append("")
        report.append("=" * 80)
        
        return "\n".join(report)

def main():
    """主函數"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    analyzer = CodeAnalyzer(project_root)
    results = analyzer.analyze()
    
    # 生成報告
    report = analyzer.generate_report()
    print("\n" + report)
    
    # 保存報告到文件
    report_file = project_root / 'CODE_ANALYSIS_REPORT.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n💾 報告已保存到: {report_file}")
    
    # 保存 JSON 結果
    json_file = project_root / 'code_analysis_results.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"💾 詳細結果已保存到: {json_file}")
    
    return 0

if __name__ == '__main__':
    exit(main())
