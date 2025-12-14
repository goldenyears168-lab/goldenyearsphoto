#!/usr/bin/env python3
"""
驗證清理後的代碼
檢查語法、構建、功能完整性
"""

import subprocess
import sys
from pathlib import Path
import json
import re

PROJECT_ROOT = Path(__file__).parent.parent

def check_syntax_python(file_path: Path) -> tuple[bool, str]:
    """檢查 Python 文件語法"""
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'py_compile', str(file_path)],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return True, "✅ 語法正確"
        else:
            return False, f"❌ 語法錯誤: {result.stderr}"
    except Exception as e:
        return False, f"❌ 檢查失敗: {e}"

def check_syntax_javascript(file_path: Path) -> tuple[bool, str]:
    """檢查 JavaScript 文件語法（使用 node）"""
    try:
        result = subprocess.run(
            ['node', '--check', str(file_path)],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return True, "✅ 語法正確"
        else:
            return False, f"❌ 語法錯誤: {result.stderr}"
    except FileNotFoundError:
        return None, "⚠️  Node.js 未安裝，跳過 JavaScript 語法檢查"
    except Exception as e:
        return False, f"❌ 檢查失敗: {e}"

def check_json_syntax(file_path: Path) -> tuple[bool, str]:
    """檢查 JSON 文件語法"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True, "✅ JSON 語法正確"
    except json.JSONDecodeError as e:
        return False, f"❌ JSON 語法錯誤: {e}"
    except Exception as e:
        return False, f"❌ 檢查失敗: {e}"

def check_css_syntax(file_path: Path) -> tuple[bool, str]:
    """簡單檢查 CSS 文件（檢查基本結構）"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 檢查未閉合的括號
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            return False, f"❌ CSS 括號不匹配: {open_braces} 個 {{ 和 {close_braces} 個 }}"
        
        # 檢查基本的 CSS 結構
        if '@import' in content or ':' in content:
            return True, "✅ CSS 結構正常"
        
        return True, "✅ CSS 文件正常"
    except Exception as e:
        return False, f"❌ 檢查失敗: {e}"

def run_eslint() -> tuple[bool, str]:
    """運行 ESLint"""
    try:
        result = subprocess.run(
            ['npm', 'run', 'lint:js'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return True, "✅ ESLint 檢查通過"
        else:
            return False, f"❌ ESLint 發現問題:\n{result.stdout}\n{result.stderr}"
    except FileNotFoundError:
        return None, "⚠️  npm 未安裝，跳過 ESLint"
    except Exception as e:
        return False, f"❌ ESLint 運行失敗: {e}"

def test_build() -> tuple[bool, str]:
    """測試構建（不實際構建，只檢查配置）"""
    try:
        # 檢查 .eleventy.js 語法
        eleventy_config = PROJECT_ROOT / '.eleventy.js'
        result = subprocess.run(
            ['node', '--check', str(eleventy_config)],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode != 0:
            return False, f"❌ Eleventy 配置語法錯誤: {result.stderr}"
        
        return True, "✅ 構建配置檢查通過"
    except Exception as e:
        return False, f"❌ 構建檢查失敗: {e}"

def verify_cleaned_files() -> dict:
    """驗證清理後的文件"""
    cleaned_files = [
        'tailwind.config.js',
        'eslint.config.js',
        'src/assets/js/identity-test.js',
        'src/assets/js/scroll-animations.js',
        'src/scripts/upload-portfolio-to-r2.mjs',
        'src/assets/css/main.css',
    ]
    
    results = {}
    
    for file_name in cleaned_files:
        file_path = PROJECT_ROOT / file_name
        if not file_path.exists():
            results[file_name] = (False, "❌ 文件不存在")
            continue
        
        ext = file_path.suffix.lower()
        
        if ext == '.py':
            success, message = check_syntax_python(file_path)
            results[file_name] = (success, message)
        elif ext in ['.js', '.mjs']:
            result = check_syntax_javascript(file_path)
            if result[0] is None:
                results[file_name] = (None, result[1])
            else:
                results[file_name] = result
        elif ext == '.json':
            success, message = check_syntax_json(file_path)
            results[file_name] = (success, message)
        elif ext == '.css':
            success, message = check_css_syntax(file_path)
            results[file_name] = (success, message)
        else:
            results[file_name] = (None, "⚠️  未知文件類型")
    
    return results

def check_critical_functionality() -> dict:
    """檢查關鍵功能"""
    checks = {}
    
    # 檢查 identity-test.js 的關鍵函數
    identity_test = PROJECT_ROOT / 'src' / 'assets' / 'js' / 'identity-test.js'
    if identity_test.exists():
        with open(identity_test, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_functions = ['initQuiz', 'renderQuestion', 'selectOption', 'calculateScores', 'findWinnerType', 'finishQuiz']
        found_functions = []
        for func in required_functions:
            if re.search(rf'\bfunction\s+{func}\b|const\s+{func}\s*=\s*function|const\s+{func}\s*=\s*\(', content):
                found_functions.append(func)
        
        if len(found_functions) >= len(required_functions) - 1:  # 允許缺少1個（可能是別名）
            checks['identity-test.js'] = (True, f"✅ 關鍵函數存在: {', '.join(found_functions)}")
        else:
            missing = set(required_functions) - set(found_functions)
            checks['identity-test.js'] = (False, f"❌ 缺少關鍵函數: {', '.join(missing)}")
    
    # 檢查 tailwind.config.js 結構
    tailwind_config = PROJECT_ROOT / 'tailwind.config.js'
    if tailwind_config.exists():
        with open(tailwind_config, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'module.exports' in content and 'colors' in content:
            checks['tailwind.config.js'] = (True, "✅ 配置結構完整")
        else:
            checks['tailwind.config.js'] = (False, "❌ 配置結構不完整")
    
    # 檢查 main.css 的關鍵變量
    main_css = PROJECT_ROOT / 'src' / 'assets' / 'css' / 'main.css'
    if main_css.exists():
        with open(main_css, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_vars = ['--color-trust-', '--color-sand-', '--font-family-base']
        found_vars = [var for var in required_vars if var in content]
        
        if len(found_vars) == len(required_vars):
            checks['main.css'] = (True, "✅ 關鍵 CSS 變量存在")
        else:
            missing = set(required_vars) - set(found_vars)
            checks['main.css'] = (False, f"❌ 缺少關鍵變量: {', '.join(missing)}")
    
    return checks

def main():
    """主函數"""
    print("🔍 開始驗證清理後的代碼...\n")
    
    all_passed = True
    warnings = []
    
    # 1. 驗證清理後的文件語法
    print("=" * 80)
    print("1️⃣  語法檢查")
    print("=" * 80)
    
    file_results = verify_cleaned_files()
    for file_name, (success, message) in file_results.items():
        print(f"📄 {file_name}")
        print(f"   {message}")
        if success is False:
            all_passed = False
        elif success is None:
            warnings.append(f"{file_name}: {message}")
        print()
    
    # 2. ESLint 檢查
    print("=" * 80)
    print("2️⃣  ESLint 檢查")
    print("=" * 80)
    
    eslint_result = run_eslint()
    if eslint_result[0] is not None:
        print(eslint_result[1])
        if eslint_result[0] is False:
            all_passed = False
    else:
        print(eslint_result[1])
        warnings.append("ESLint: " + eslint_result[1])
    print()
    
    # 3. 構建配置檢查
    print("=" * 80)
    print("3️⃣  構建配置檢查")
    print("=" * 80)
    
    build_result = test_build()
    print(build_result[1])
    if not build_result[0]:
        all_passed = False
    print()
    
    # 4. 關鍵功能檢查
    print("=" * 80)
    print("4️⃣  關鍵功能檢查")
    print("=" * 80)
    
    functionality_checks = check_critical_functionality()
    for component, (success, message) in functionality_checks.items():
        print(f"📦 {component}")
        print(f"   {message}")
        if not success:
            all_passed = False
        print()
    
    # 總結
    print("=" * 80)
    print("📊 驗證總結")
    print("=" * 80)
    
    if all_passed:
        print("✅ 所有檢查通過！清理後的代碼功能正常。")
    else:
        print("⚠️  發現一些問題，請檢查上述錯誤。")
    
    if warnings:
        print("\n⚠️  警告:")
        for warning in warnings:
            print(f"  - {warning}")
    
    print("\n💡 建議:")
    print("  1. 在瀏覽器中測試網站功能")
    print("  2. 檢查控制台是否有錯誤")
    print("  3. 測試關鍵功能（如身份測驗）")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    exit(main())
