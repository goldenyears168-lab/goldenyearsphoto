#!/usr/bin/env python3
"""
分析 Deprecated Token 使用情況並評估元件 Variant 系統
"""

import re

from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# Deprecated Token 列表
DEPRECATED_TOKENS = {
    # Legacy Brand Colors
    'brand-primary': {'replacement': 'trust-950', 'type': 'color'},
    'brand-accent': {'replacement': 'trust-800', 'type': 'color'},
    'brand-cta': {'replacement': 'trust-200', 'type': 'color'},
    'brand-cta-hover': {'replacement': 'trust-800', 'type': 'color'},
    
    # Accent Colors
    'accent': {'replacement': 'trust-800', 'type': 'color'},
    'accent-weak': {'replacement': 'trust-600', 'type': 'color'},
    'accent-strong': {'replacement': 'trust-950', 'type': 'color'},
    
    'neutral-50': {'replacement': 'sand-50', 'type': 'color'},
    'neutral-100': {'replacement': 'sand-100', 'type': 'color'},
    'neutral-200': {'replacement': 'sand-200', 'type': 'color'},
    'neutral-300': {'replacement': 'sand-200', 'type': 'color'},
    'neutral-400': {'replacement': 'slate-500', 'type': 'color'},
    'neutral-900': {'replacement': 'trust-900', 'type': 'color'},
    'neutral-950': {'replacement': 'trust-950', 'type': 'color'},
    
    # Surface Colors
    'surface': {'replacement': 'white', 'type': 'color'},
    'surface-alt': {'replacement': 'sand-100', 'type': 'color'},
    'surface-2': {'replacement': 'sand-50', 'type': 'color'},
    'surface-3': {'replacement': 'trust-950', 'type': 'color'},
    'surface-elevated': {'replacement': 'white', 'type': 'color'},
    
    # Text Colors
    'text': {'replacement': 'slate-600', 'type': 'color'},
    'text-main': {'replacement': 'trust-900', 'type': 'color'},
    'text-subtle': {'replacement': 'slate-500', 'type': 'color'},
    'text-on-dark': {'replacement': 'trust-50', 'type': 'color'},
    'text-on-accent': {'replacement': 'white', 'type': 'color'},
    'text-link': {'replacement': 'trust-600', 'type': 'color'},
    'text-link-hover': {'replacement': 'trust-800', 'type': 'color'},
    
    # Border Colors
    'border': {'replacement': 'sand-200', 'type': 'color'},
    'border-strong': {'replacement': 'sand-300', 'type': 'color'},
    'border-subtle': {'replacement': 'sand-100', 'type': 'color'},
    'border-dark': {'replacement': 'trust-900', 'type': 'color'},
    
    # Legacy Mappings
    'dark': {'replacement': 'trust-950', 'type': 'color'},
    'cta': {'replacement': 'trust-200', 'type': 'color'},
    'primary-accent': {'replacement': 'trust-800', 'type': 'color'},
    'gray-bg': {'replacement': 'sand-200', 'type': 'color'},
    'light-bg': {'replacement': 'sand-50', 'type': 'color'},
    'text-dark': {'replacement': 'trust-900', 'type': 'color'},
    'text-light': {'replacement': 'trust-50', 'type': 'color'},
    
    # Dawn Gradient Colors
    'dawn-orange': {'replacement': 'sand-50', 'type': 'color'},
    'dawn-blue': {'replacement': 'trust-50', 'type': 'color'},
    'dawn-accent': {'replacement': 'trust-600', 'type': 'color'},
}

# 掃描的檔案類型
SCAN_EXTENSIONS = {'.njk', '.css', '.js', '.html'}

def find_deprecated_token_usage() -> Dict[str, List[Dict]]:
    """查找所有 deprecated token 的使用位置"""
    usage = defaultdict(list)
    
    for file_path in SRC_DIR.rglob('*'):
        if file_path.suffix in SCAN_EXTENSIONS:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    relative_path = file_path.relative_to(PROJECT_ROOT)
                    
                    # 查找每個 deprecated token
                    for token, info in DEPRECATED_TOKENS.items():
                        # 在 Tailwind 類名中
                        pattern = rf'\b(bg|text|border)-{token}\b'
                        for match in re.finditer(pattern, content, re.IGNORECASE):
                            usage[token].append({
                                'file': str(relative_path),
                                'line': content[:match.start()].count('\n') + 1,
                                'context': content[max(0, match.start()-30):match.end()+30],
                                'type': 'tailwind-class'
                            })
                        
                        # 在 CSS 變數中
                        pattern = rf'var\(--color-{token}\)|--color-{token}:'
                        for match in re.finditer(pattern, content, re.IGNORECASE):
                            usage[token].append({
                                'file': str(relative_path),
                                'line': content[:match.start()].count('\n') + 1,
                                'context': content[max(0, match.start()-30):match.end()+30],
                                'type': 'css-variable'
                            })
                        
                        # 在 JavaScript 對象中
                        pattern = rf'["\']{token}["\']|{token}:'
                        for match in re.finditer(pattern, content, re.IGNORECASE):
                            # 排除 CSS 變數定義
                            if '--color-' in content[max(0, match.start()-20):match.start()]:
                                continue
                            usage[token].append({
                                'file': str(relative_path),
                                'line': content[:match.start()].count('\n') + 1,
                                'context': content[max(0, match.start()-30):match.end()+30],
                                'type': 'js-object'
                            })
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    
    return dict(usage)

def analyze_button_variants() -> Dict[str, Any]:
    """分析按鈕 variant 使用情況"""
    button_patterns = [
        r'\b(bg|text|border)-(trust|sand|slate)-\d+.*rounded.*px-.*py-',
        r'\bbtn(-primary|-secondary|-ghost)?\b',
        r'\bbutton[-\w]*\b',
    ]
    
    button_combinations = Counter()
    variant_usage = defaultdict(int)
    
    for file_path in SRC_DIR.rglob('*.njk'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # 查找按鈕元素
                button_elements = re.finditer(r'<(button|a)[^>]*class=["\']([^"\']+)["\']', content)
                for match in button_elements:
                    classes = match.group(2)
                    
                    # 檢查是否包含按鈕相關類
                    if 'btn' in classes or 'button' in classes or ('rounded-full' in classes and 'px-' in classes and 'py-' in classes):
                        # 提取關鍵類名
                        key_classes = []
                        for cls in classes.split():
                            if any(x in cls for x in ['btn', 'button', 'bg-trust', 'bg-sand', 'rounded-full', 'px-', 'py-']):
                                key_classes.append(cls)
                        
                        if key_classes:
                            combo = ' '.join(sorted(key_classes))
                            button_combinations[combo] += 1
                            
                            # 識別 variant
                            if 'btn-primary' in classes or 'button-primary' in classes:
                                variant_usage['primary'] += 1
                            elif 'btn-secondary' in classes or 'button-secondary' in classes:
                                variant_usage['secondary'] += 1
                            elif 'btn-ghost' in classes or 'button-ghost' in classes:
                                variant_usage['ghost'] += 1
                            else:
                                variant_usage['custom'] += 1
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return {
        'total_combinations': len(button_combinations),
        'most_common': button_combinations.most_common(20),
        'variant_usage': dict(variant_usage),
    }

def analyze_card_variants() -> Dict[str, Any]:
    """分析卡片 variant 使用情況"""
    card_combinations = Counter()
    variant_usage = defaultdict(int)
    
    for file_path in SRC_DIR.rglob('*.njk'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # 查找包含 bento-card 或 card 相關的元素
                card_elements = re.finditer(r'<div[^>]*class=["\']([^"\']*bento-card[^"\']*|.*card[^"\']*)["\']', content)
                for match in card_elements:
                    classes = match.group(1)
                    
                    if 'bento-card' in classes or ('card' in classes and 'bg-white' in classes):
                        # 提取關鍵類名
                        key_classes = []
                        for cls in classes.split():
                            if any(x in cls for x in ['card', 'bento', 'bg-', 'border-', 'rounded-', 'shadow-']):
                                key_classes.append(cls)
                        
                        if key_classes:
                            combo = ' '.join(sorted(key_classes))
                            card_combinations[combo] += 1
                            
                            # 識別 variant
                            if 'bento-card' in classes:
                                variant_usage['bento-card'] += 1
                            else:
                                variant_usage['custom'] += 1
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return {
        'total_combinations': len(card_combinations),
        'most_common': card_combinations.most_common(20),
        'variant_usage': dict(variant_usage),
    }

def generate_report() -> str:
    """生成分析報告"""
    print("🔍 分析 Deprecated Token 使用情況...")
    deprecated_usage = find_deprecated_token_usage()
    
    print("🔍 分析按鈕 Variant 使用情況...")
    button_analysis = analyze_button_variants()
    
    print("🔍 分析卡片 Variant 使用情況...")
    card_analysis = analyze_card_variants()
    
    report = "# Deprecated Token 與元件 Variant 分析報告\n\n"
    report += "## 📊 執行摘要\n\n"
    report += f"- **Deprecated Token 使用數**: {len([k for k, v in deprecated_usage.items() if v])}\n"
    report += f"- **按鈕類名組合數**: {button_analysis['total_combinations']}\n"
    report += f"- **卡片類名組合數**: {card_analysis['total_combinations']}\n\n"
    
    report += "---\n\n"
    report += "## 🗑️ Deprecated Token 使用情況\n\n"
    
    if not any(deprecated_usage.values()):
        report += "✅ **好消息**：沒有發現 deprecated token 的使用！\n\n"
    else:
        report += "### 仍在使用中的 Deprecated Token\n\n"
        for token, usages in sorted(deprecated_usage.items(), key=lambda x: len(x[1]), reverse=True):
            if not usages:
                continue
            
            info = DEPRECATED_TOKENS[token]
            report += f"### `{token}`\n\n"
            report += f"- **建議替換為**: `{info['replacement']}`\n"
            report += f"- **出現次數**: {len(usages)}\n"
            report += f"- **出現位置**:\n\n"
            
            for usage in usages[:10]:
                report += f"  - `{usage['file']}` (第 {usage['line']} 行) - {usage['type']}\n"
                report += f"    ```\n    {usage['context'].strip()}\n    ```\n"
            
            if len(usages) > 10:
                report += f"  - ... 還有 {len(usages) - 10} 處\n"
            
            report += "\n"
    
    report += "---\n\n"
    report += "## 🔘 按鈕 Variant 分析\n\n"
    report += f"### Variant 使用統計\n\n"
    for variant, count in button_analysis['variant_usage'].items():
        report += f"- **{variant}**: {count} 處\n"
    
    report += f"\n### 最常見的按鈕類名組合（Top 20）\n\n"
    for i, (combo, count) in enumerate(button_analysis['most_common'][:20], 1):
        report += f"{i}. `{combo}` - {count} 次\n"
    
    report += "\n---\n\n"
    report += "## 🃏 卡片 Variant 分析\n\n"
    report += f"### Variant 使用統計\n\n"
    for variant, count in card_analysis['variant_usage'].items():
        report += f"- **{variant}**: {count} 處\n"
    
    report += f"\n### 最常見的卡片類名組合（Top 20）\n\n"
    for i, (combo, count) in enumerate(card_analysis['most_common'][:20], 1):
        report += f"{i}. `{combo}` - {count} 次\n"
    
    report += "\n---\n\n"
    report += "## ✅ 建議與行動方案\n\n"
    
    # Deprecated Token 清理建議
    report += "### 1. 清理 Deprecated Token\n\n"
    if any(deprecated_usage.values()):
        report += "**步驟**：\n"
        report += "1. 掃描所有使用 deprecated token 的位置\n"
        report += "2. 逐一替換為新的 token 名稱\n"
        report += "3. 更新 tailwind.config.js，移除 deprecated token 定義\n"
        report += "4. 更新 main.css，移除 deprecated CSS 變數定義\n\n"
    else:
        report += "✅ **可以安全移除**：所有 deprecated token 都未被使用，可以直接從配置中移除。\n\n"
    
    # Variant 系統建議
    report += "### 2. 建立元件 Variant 系統\n\n"
    report += "**按鈕 Variant 標準化**：\n"
    report += "- 確保所有按鈕使用 `.btn` 基礎類 + variant 類（`.btn-primary`, `.btn-secondary`, `.btn-ghost`）\n"
    report += "- 移除自定義的按鈕樣式組合\n"
    report += "- 統一按鈕尺寸：`.btn-sm`, `.btn-md`, `.btn-lg`\n\n"
    
    report += "**卡片 Variant 標準化**：\n"
    report += "- 確保所有卡片使用 `.bento-card` 基礎類\n"
    report += "- 定義卡片 variant：`.bento-card-default`, `.bento-card-elevated`, `.bento-card-bordered`\n"
    report += "- 移除重複的卡片樣式定義\n\n"
    
    return report

def main():
    """主函數"""
    report = generate_report()
    
    # 保存報告
    report_path = PROJECT_ROOT / "DEPRECATED_TOKENS_AND_VARIANTS_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ 報告已保存至: {report_path}")

if __name__ == '__main__':
    main()

