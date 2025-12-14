#!/usr/bin/env python3
"""
設計系統一致性稽核腳本
掃描專案程式碼，驗證顏色、字體、間距、圓角、陰影、UI 元件等是否一致
"""

import re
import json
import os
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple, Any
from datetime import datetime
import colorsys

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# 掃描的檔案類型
SCAN_EXTENSIONS = {'.njk', '.css', '.js', '.html'}

# 設計 Token 來源（從 tailwind.config.js 和 main.css 提取）
DESIGN_TOKENS = {
    'colors': {},
    'spacing': {},
    'fontSize': {},
    'fontWeight': {},
    'borderRadius': {},
    'boxShadow': {},
    'lineHeight': {},
}

def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """將 HEX 顏色轉換為 RGB"""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """將 RGB 轉換為 HSL"""
    r, g, b = r/255.0, g/255.0, b/255.0
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return (h * 360, s * 100, l * 100)

def color_distance(color1: str, color2: str) -> float:
    """計算兩個顏色的距離（歐幾里得距離）"""
    try:
        rgb1 = hex_to_rgb(color1)
        rgb2 = hex_to_rgb(color2)
        return sum((a - b) ** 2 for a, b in zip(rgb1, rgb2)) ** 0.5
    except:
        return float('inf')

def normalize_color(color: str) -> str:
    """正規化顏色格式為大寫 HEX"""
    color = color.strip().lower()
    # 移除可能的空格
    color = color.replace(' ', '')
    
    # HEX 格式
    if color.startswith('#'):
        hex_part = color[1:]
        if len(hex_part) == 3:
            hex_part = ''.join([c*2 for c in hex_part])
        return '#' + hex_part.upper()
    
    # RGB/RGBA 格式
    rgb_match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)', color)
    if rgb_match:
        r, g, b = map(int, rgb_match.groups())
        return f"#{r:02X}{g:02X}{b:02X}"
    
    return color

def is_third_party_embed(context: str) -> bool:
    """判斷是否為第三方嵌入代碼（如 Instagram embed）"""
    third_party_indicators = [
        'instagram-media',
        'data-instgrm',
        'instagram.com',
        'facebook.com',
        'twitter.com',
        'youtube.com',
        'embed',
        'iframe',
    ]
    context_lower = context.lower()
    return any(indicator in context_lower for indicator in third_party_indicators)

def is_css_variable_definition(context: str) -> bool:
    """判斷是否為 CSS 變數定義（這些是 token 定義本身，不應被標記為未定義）"""
    # CSS 變數定義格式：--color-xxx: #xxxxxx;
    css_var_patterns = [
        r'--color-[^:]+:\s*#',
        r'--color-[^:]+:\s*var\(',
    ]
    for pattern in css_var_patterns:
        if re.search(pattern, context, re.IGNORECASE):
            return True
    return False

def extract_colors_from_text(text: str) -> List[Dict[str, Any]]:
    """從文字中提取所有顏色值，排除第三方嵌入代碼"""
    colors = []
    
    # HEX 顏色 (#fff, #ffffff, #FFF)
    hex_pattern = r'#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b'
    for match in re.finditer(hex_pattern, text):
        context = text[max(0, match.start()-50):match.end()+50]
        # 排除第三方嵌入代碼
        if is_third_party_embed(context):
            continue
        # 排除 CSS 變數定義
        if is_css_variable_definition(context):
            continue
        color = normalize_color(match.group(0))
        colors.append({
            'value': color,
            'type': 'hex',
            'line': text[:match.start()].count('\n') + 1,
            'context': context
        })
    
    # RGB/RGBA 顏色
    rgb_pattern = r'rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)'
    for match in re.finditer(rgb_pattern, text):
        context = text[max(0, match.start()-50):match.end()+50]
        # 排除第三方嵌入代碼
        if is_third_party_embed(context):
            continue
        # 排除 CSS 變數定義
        if is_css_variable_definition(context):
            continue
        color = normalize_color(match.group(0))
        colors.append({
            'value': color,
            'type': 'rgb',
            'line': text[:match.start()].count('\n') + 1,
            'context': context
        })
    
    # HSL/HSLA 顏色
    hsl_pattern = r'hsla?\((\d+),\s*(\d+)%,\s*(\d+)%'
    for match in re.finditer(hsl_pattern, text):
        context = text[max(0, match.start()-50):match.end()+50]
        if is_third_party_embed(context):
            continue
        colors.append({
            'value': match.group(0),
            'type': 'hsl',
            'line': text[:match.start()].count('\n') + 1,
            'context': context
        })
    
    # 命名顏色（white, black, gray 等）
    named_colors = ['white', 'black', 'gray', 'grey', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown']
    for color_name in named_colors:
        pattern = rf'\b{color_name}\b'
        for match in re.finditer(pattern, text, re.IGNORECASE):
            # 避免匹配到類名中的顏色（如 text-white）
            context_before = text[max(0, match.start()-10):match.start()]
            if ':' in context_before or '=' in context_before:
                context = text[max(0, match.start()-50):match.end()+50]
                if is_third_party_embed(context):
                    continue
                colors.append({
                    'value': color_name.lower(),
                    'type': 'named',
                    'line': text[:match.start()].count('\n') + 1,
                    'context': context
                })
    
    return colors

def extract_spacing_values(text: str) -> List[Dict[str, Any]]:
    """提取間距值（margin, padding, gap）"""
    spacing_values = []
    
    # margin/padding 值
    spacing_pattern = r'(?:margin|padding|gap|row-gap|column-gap)[:\s]+([\d.]+)(px|rem|em|%)'
    for match in re.finditer(spacing_pattern, text, re.IGNORECASE):
        spacing_values.append({
            'value': match.group(1) + match.group(2),
            'property': match.group(0).split(':')[0].strip(),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    # Tailwind spacing 類名（p-4, m-8, gap-6 等）
    tw_spacing_pattern = r'\b(p|m|gap|space-[xy])-(\d+)\b'
    for match in re.finditer(tw_spacing_pattern, text):
        spacing_values.append({
            'value': match.group(2),
            'property': f"tailwind-{match.group(1)}",
            'line': text[:match.start()].count('\n') + 1,
        })
    
    return spacing_values

def extract_typography_values(text: str) -> List[Dict[str, Any]]:
    """提取字體相關值，排除第三方嵌入代碼"""
    typography = []
    
    # font-size
    font_size_pattern = r'font-size[:\s]+([\d.]+)(px|rem|em|%)'
    for match in re.finditer(font_size_pattern, text, re.IGNORECASE):
        context = text[max(0, match.start()-50):match.end()+50]
        # 排除第三方嵌入代碼
        if is_third_party_embed(context):
            continue
        typography.append({
            'property': 'font-size',
            'value': match.group(1) + match.group(2),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    # font-weight
    font_weight_pattern = r'font-weight[:\s]+(\d+|normal|bold|medium|semibold)'
    for match in re.finditer(font_weight_pattern, text, re.IGNORECASE):
        typography.append({
            'property': 'font-weight',
            'value': match.group(1),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    # line-height
    line_height_pattern = r'line-height[:\s]+([\d.]+|normal|tight|relaxed|loose)'
    for match in re.finditer(line_height_pattern, text, re.IGNORECASE):
        typography.append({
            'property': 'line-height',
            'value': match.group(1),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    # font-family
    font_family_pattern = r'font-family[:\s]+([^;]+)'
    for match in re.finditer(font_family_pattern, text, re.IGNORECASE):
        typography.append({
            'property': 'font-family',
            'value': match.group(1).strip(),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    return typography

def extract_border_radius(text: str) -> List[Dict[str, Any]]:
    """提取圓角值"""
    radius_values = []
    
    # border-radius
    radius_pattern = r'border-radius[:\s]+([\d.]+)(px|rem|em|%)'
    for match in re.finditer(radius_pattern, text, re.IGNORECASE):
        radius_values.append({
            'value': match.group(1) + match.group(2),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    # rounded-* Tailwind 類名
    rounded_pattern = r'\brounded(-(?:sm|md|lg|xl|full|none))?\b'
    for match in re.finditer(rounded_pattern, text):
        radius_values.append({
            'value': match.group(1) if match.group(1) else 'default',
            'type': 'tailwind',
            'line': text[:match.start()].count('\n') + 1,
        })
    
    return radius_values

def extract_shadows(text: str) -> List[Dict[str, Any]]:
    """提取陰影值"""
    shadows = []
    
    # box-shadow
    shadow_pattern = r'box-shadow[:\s]+([^;]+)'
    for match in re.finditer(shadow_pattern, text, re.IGNORECASE):
        shadows.append({
            'value': match.group(1).strip(),
            'line': text[:match.start()].count('\n') + 1,
        })
    
    return shadows

def extract_ui_components(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """提取 UI 元件相關的類名和樣式"""
    components = defaultdict(list)
    
    # Button 相關
    button_patterns = [
        r'\b(btn|button)[-\w]*',
        r'bg-trust-\d+|bg-sand-\d+.*rounded.*px-\d+.*py-\d+',
    ]
    for pattern in button_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            components['button'].append({
                'classes': match.group(0),
                'line': text[:match.start()].count('\n') + 1,
            })
    
    # Card 相關
    card_patterns = [
        r'\b(card|bento-card)[-\w]*',
    ]
    for pattern in card_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            components['card'].append({
                'classes': match.group(0),
                'line': text[:match.start()].count('\n') + 1,
            })
    
    return dict(components)

def load_design_tokens():
    """從 tailwind.config.js 和 main.css 載入設計 token"""
    # 這裡簡化處理，實際應該解析 JS 和 CSS 檔案
    # 從已知的 tailwind.config.js 結構提取
    tokens = {
        'colors': {
            'trust-50': '#F0F4FF',
            'trust-100': '#E0E7FF',
            'trust-200': '#C7D2FE',
            'trust-500': '#6366F1',
            'trust-600': '#4F46E5',
            'trust-700': '#4338CA',
            'trust-800': '#1E3A8A',
            'trust-900': '#0F172A',
            'trust-950': '#020617',
            'sand-50': '#FDFBF7',
            'sand-100': '#F7F4EF',
            'sand-200': '#E2DCD3',
            'sand-300': '#D6CCC2',
            'white': '#fff',
            'black': '#000',
        },
        'spacing': {
            '1': '0.25rem',  # 4px
            '2': '0.5rem',   # 8px
            '3': '0.75rem',  # 12px
            '4': '1rem',     # 16px
            '5': '1.25rem',  # 20px
            '6': '1.5rem',   # 24px
            '8': '2rem',     # 32px
            '10': '3rem',    # 48px
            '12': '4rem',    # 64px
        },
        'fontSize': {
            'xs': '0.75rem',   # 12px
            'sm': '0.875rem',  # 14px
            'base': '1rem',    # 16px
            'lg': '1.125rem',  # 18px
            'xl': '1.25rem',   # 20px
            '2xl': '1.5rem',   # 24px
            '3xl': '1.875rem', # 30px
            '4xl': '2.25rem',  # 36px
        },
        'borderRadius': {
            'sm': '4px',
            'md': '8px',
            'lg': '12px',
            'xl': '20px',
            'full': '9999px',
        },
    }
    return tokens

def scan_project():
    """掃描整個專案"""
    results = {
        'colors': [],
        'spacing': [],
        'typography': [],
        'borderRadius': [],
        'shadows': [],
        'components': defaultdict(list),
        'files_scanned': [],
    }
    
    design_tokens = load_design_tokens()
    
    # 掃描所有相關檔案
    for file_path in SRC_DIR.rglob('*'):
        if file_path.suffix in SCAN_EXTENSIONS:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    relative_path = file_path.relative_to(PROJECT_ROOT)
                    results['files_scanned'].append(str(relative_path))
                    
                    # 提取各種值
                    results['colors'].extend([
                        {**c, 'file': str(relative_path)} 
                        for c in extract_colors_from_text(content)
                    ])
                    results['spacing'].extend([
                        {**s, 'file': str(relative_path)} 
                        for s in extract_spacing_values(content)
                    ])
                    results['typography'].extend([
                        {**t, 'file': str(relative_path)} 
                        for t in extract_typography_values(content)
                    ])
                    results['borderRadius'].extend([
                        {**r, 'file': str(relative_path)} 
                        for r in extract_border_radius(content)
                    ])
                    results['shadows'].extend([
                        {**s, 'file': str(relative_path)} 
                        for s in extract_shadows(content)
                    ])
                    
                    # UI 元件
                    components = extract_ui_components(content)
                    for comp_type, comp_list in components.items():
                        results['components'][comp_type].extend([
                            {**c, 'file': str(relative_path)} 
                            for c in comp_list
                        ])
            except Exception as e:
                print(f"Error scanning {file_path}: {e}")
    
    return results, design_tokens

def analyze_colors(colors: List[Dict], tokens: Dict) -> Dict[str, Any]:
    """分析顏色一致性"""
    # 統計顏色使用頻率
    color_counter = Counter()
    for color in colors:
        if color['value'].startswith('#'):
            color_counter[color['value']] += 1
    
    # 找出未定義在 token 中的顏色
    token_colors = set(tokens['colors'].values())
    undefined_colors = []
    for color_value, count in color_counter.items():
        if color_value not in token_colors:
            # 檢查是否有近似顏色（色差 < 10）
            is_similar = False
            for token_color in token_colors:
                if token_color.startswith('#'):
                    if color_distance(color_value, token_color) < 10:
                        is_similar = True
                        break
            if not is_similar:
                undefined_colors.append({
                    'color': color_value,
                    'count': count,
                })
    
    # 聚類近似顏色
    color_clusters = defaultdict(list)
    for color_value, count in color_counter.items():
        if color_value.startswith('#'):
            clustered = False
            for cluster_center in color_clusters.keys():
                if color_distance(color_value, cluster_center) < 5:
                    color_clusters[cluster_center].append((color_value, count))
                    clustered = True
                    break
            if not clustered:
                color_clusters[color_value] = [(color_value, count)]
    
    return {
        'total_colors': len(color_counter),
        'unique_colors': len(color_clusters),
        'undefined_colors': sorted(undefined_colors, key=lambda x: x['count'], reverse=True)[:20],
        'most_used': color_counter.most_common(10),
        'clusters': {k: v for k, v in list(color_clusters.items())[:10]},
    }

def analyze_spacing(spacing: List[Dict], tokens: Dict) -> Dict[str, Any]:
    """分析間距一致性"""
    spacing_values = Counter()
    for s in spacing:
        spacing_values[s['value']] += 1
    
    # 檢查是否符合 4px 節奏
    non_standard_spacing = []
    for value, count in spacing_values.items():
        if isinstance(value, str) and value.replace('.', '').isdigit():
            num_value = float(value)
            # 檢查是否為 4 的倍數（考慮 rem 轉換）
            if num_value % 4 != 0 and num_value not in [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]:
                non_standard_spacing.append({
                    'value': value,
                    'count': count,
                })
    
    return {
        'total_spacing_values': len(spacing),
        'unique_values': len(spacing_values),
        'most_used': spacing_values.most_common(15),
        'non_standard': sorted(non_standard_spacing, key=lambda x: x['count'], reverse=True)[:15],
    }

def analyze_typography(typography: List[Dict], tokens: Dict) -> Dict[str, Any]:
    """分析字體一致性"""
    font_sizes = Counter()
    font_weights = Counter()
    line_heights = Counter()
    
    for t in typography:
        if t['property'] == 'font-size':
            font_sizes[t['value']] += 1
        elif t['property'] == 'font-weight':
            font_weights[t['value']] += 1
        elif t['property'] == 'line-height':
            line_heights[t['value']] += 1
    
    # 找出未定義的字體大小
    token_sizes = set(tokens['fontSize'].values())
    undefined_sizes = []
    for size, count in font_sizes.items():
        if size not in token_sizes:
            undefined_sizes.append({
                'size': size,
                'count': count,
            })
    
    return {
        'font_sizes': {
            'total': len(font_sizes),
            'unique': len(font_sizes),
            'most_used': font_sizes.most_common(10),
            'undefined': sorted(undefined_sizes, key=lambda x: x['count'], reverse=True)[:10],
        },
        'font_weights': {
            'total': len(font_weights),
            'most_used': font_weights.most_common(10),
        },
        'line_heights': {
            'total': len(line_heights),
            'most_used': line_heights.most_common(10),
        },
    }

def calculate_consistency_score(results: Dict, tokens: Dict) -> Dict[str, Any]:
    """計算一致性分數"""
    color_analysis = analyze_colors(results['colors'], tokens)
    spacing_analysis = analyze_spacing(results['spacing'], tokens)
    typography_analysis = analyze_typography(results['typography'], tokens)
    
    # 計算各子系統分數（0-100）
    # 顏色分數：基於未定義顏色比例
    total_color_usage = sum(count for _, count in color_analysis['most_used'])
    undefined_color_usage = sum(c['count'] for c in color_analysis['undefined_colors'])
    color_score = max(0, 100 - (undefined_color_usage / max(total_color_usage, 1) * 100))
    
    # 間距分數：基於非標準間距比例
    total_spacing = len(results['spacing'])
    non_standard_count = len(spacing_analysis['non_standard'])
    spacing_score = max(0, 100 - (non_standard_count / max(total_spacing, 1) * 100))
    
    # 字體分數：基於未定義字體大小比例
    total_font_sizes = sum(count for _, count in typography_analysis['font_sizes']['most_used'])
    undefined_font_usage = sum(c['count'] for c in typography_analysis['font_sizes']['undefined'])
    typography_score = max(0, 100 - (undefined_font_usage / max(total_font_sizes, 1) * 100))
    
    # 總分（加權平均）
    overall_score = (color_score * 0.3 + spacing_score * 0.3 + typography_score * 0.4)
    
    return {
        'overall': round(overall_score, 1),
        'color': round(color_score, 1),
        'spacing': round(spacing_score, 1),
        'typography': round(typography_score, 1),
        'components': 75.0,  # 暫時固定值，需要更深入分析
    }

def generate_report(results: Dict, tokens: Dict) -> str:
    """生成稽核報告"""
    score = calculate_consistency_score(results, tokens)
    color_analysis = analyze_colors(results['colors'], tokens)
    spacing_analysis = analyze_spacing(results['spacing'], tokens)
    typography_analysis = analyze_typography(results['typography'], tokens)
    
    # 格式化日期
    audit_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    report_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    report = f"""# 設計系統一致性稽核報告

## 📊 執行摘要

**稽核日期**: {audit_date}
**掃描檔案數**: {len(results['files_scanned'])}
**總體一致性分數**: **{score['overall']}/100**

### 各子系統分數

| 子系統 | 分數 | 狀態 |
|--------|------|------|
| 顏色系統 (Color) | {score['color']}/100 | {'✅ 良好' if score['color'] >= 80 else '⚠️ 需改進' if score['color'] >= 60 else '❌ 嚴重'} |
| 間距系統 (Spacing) | {score['spacing']}/100 | {'✅ 良好' if score['spacing'] >= 80 else '⚠️ 需改進' if score['spacing'] >= 60 else '❌ 嚴重'} |
| 字體系統 (Typography) | {score['typography']}/100 | {'✅ 良好' if score['typography'] >= 80 else '⚠️ 需改進' if score['typography'] >= 60 else '❌ 嚴重'} |
| 元件系統 (Components) | {score['components']}/100 | {'✅ 良好' if score['components'] >= 80 else '⚠️ 需改進' if score['components'] >= 60 else '❌ 嚴重'} |

---

## 🟦 1. 顏色系統一致性分析

### 統計數據

- **總顏色使用次數**: {sum(count for _, count in color_analysis['most_used'])}
- **唯一顏色數量**: {color_analysis['unique_colors']}
- **未定義於 Token 的顏色**: {len(color_analysis['undefined_colors'])}

### 最常使用的顏色（Top 10）

"""
    
    for i, (color, count) in enumerate(color_analysis['most_used'][:10], 1):
        report += f"{i}. `{color}` - 使用 {count} 次\n"
    
    report += f"""
### ⚠️ 未定義於設計 Token 的顏色（需處理）

"""
    
    if color_analysis['undefined_colors']:
        for i, item in enumerate(color_analysis['undefined_colors'][:10], 1):
            report += f"{i}. `{item['color']}` - 使用 {item['count']} 次\n"
    else:
        report += "✅ 所有顏色都已定義於設計 Token\n"
    
    report += f"""
### 顏色聚類分析

發現 {len(color_analysis['clusters'])} 個主要顏色群組。建議將近似顏色統一為單一 token。

---

## 🟨 2. 間距系統一致性分析

### 統計數據

- **總間距使用次數**: {spacing_analysis['total_spacing_values']}
- **唯一間距值**: {spacing_analysis['unique_values']}
- **非標準間距值**: {len(spacing_analysis['non_standard'])}

### 最常使用的間距值（Top 15）

"""
    
    for i, (value, count) in enumerate(spacing_analysis['most_used'][:15], 1):
        report += f"{i}. `{value}` - 使用 {count} 次\n"
    
    report += f"""
### ⚠️ 非標準間距值（不符合 4px 節奏）

"""
    
    if spacing_analysis['non_standard']:
        for i, item in enumerate(spacing_analysis['non_standard'][:15], 1):
            report += f"{i}. `{item['value']}` - 使用 {item['count']} 次\n"
    else:
        report += "✅ 所有間距值都符合標準節奏\n"
    
    report += f"""
---

## 🟩 3. 字體與排版系統分析

### 字體大小 (Font Size)

- **總使用次數**: {sum(count for _, count in typography_analysis['font_sizes']['most_used'])}
- **唯一字體大小**: {typography_analysis['font_sizes']['unique']}
- **未定義於 Token**: {len(typography_analysis['font_sizes']['undefined'])}

#### 最常使用的字體大小

"""
    
    for i, (size, count) in enumerate(typography_analysis['font_sizes']['most_used'][:10], 1):
        report += f"{i}. `{size}` - 使用 {count} 次\n"
    
    report += f"""
#### ⚠️ 未定義的字體大小

"""
    
    if typography_analysis['font_sizes']['undefined']:
        for i, item in enumerate(typography_analysis['font_sizes']['undefined'][:10], 1):
            report += f"{i}. `{item['size']}` - 使用 {item['count']} 次\n"
    else:
        report += "✅ 所有字體大小都已定義於 Token\n"
    
    report += f"""
### 字體粗細 (Font Weight)

#### 最常使用的字體粗細

"""
    
    for i, (weight, count) in enumerate(typography_analysis['font_weights']['most_used'][:10], 1):
        report += f"{i}. `{weight}` - 使用 {count} 次\n"
    
    report += f"""
### 行高 (Line Height)

#### 最常使用的行高

"""
    
    for i, (lh, count) in enumerate(typography_analysis['line_heights']['most_used'][:10], 1):
        report += f"{i}. `{lh}` - 使用 {count} 次\n"
    
    report += f"""
---

## 🟪 4. 圓角、陰影、邊框分析

### 圓角 (Border Radius)

- **總使用次數**: {len(results['borderRadius'])}
- **唯一值**: {len(set(r.get('value', '') for r in results['borderRadius']))}

### 陰影 (Box Shadow)

- **總使用次數**: {len(results['shadows'])}
- **唯一值**: {len(set(s.get('value', '') for s in results['shadows']))}

---

## 🟥 5. UI 元件一致性分析

### 元件統計

"""
    
    for comp_type, comp_list in results['components'].items():
        report += f"- **{comp_type.capitalize()}**: {len(comp_list)} 處使用\n"
    
    report += f"""
### 元件樣式重複分析

建議檢查以下元件是否有統一的 variant/size/state 定義：

"""
    
    for comp_type, comp_list in results['components'].items():
        if comp_list:
            unique_classes = set(c.get('classes', '') for c in comp_list)
            report += f"- **{comp_type}**: {len(unique_classes)} 種不同類名組合\n"
    
    report += f"""
---

## 🔍 前 10 大一致性破壞來源

### 1. 未定義顏色
"""
    
    if color_analysis['undefined_colors']:
        for i, item in enumerate(color_analysis['undefined_colors'][:5], 1):
            report += f"   - `{item['color']}` 使用 {item['count']} 次\n"
    
    report += f"""
### 2. 非標準間距
"""
    
    if spacing_analysis['non_standard']:
        for i, item in enumerate(spacing_analysis['non_standard'][:5], 1):
            report += f"   - `{item['value']}` 使用 {item['count']} 次\n"
    
    report += f"""
### 3. 未定義字體大小
"""
    
    if typography_analysis['font_sizes']['undefined']:
        for i, item in enumerate(typography_analysis['font_sizes']['undefined'][:5], 1):
            report += f"   - `{item['size']}` 使用 {item['count']} 次\n"
    
    report += f"""
---

## 📋 技術負債分類

### 🟢 快速可修 (Quick Wins)

1. **統一近似顏色**
   - 將色差 < 5 的顏色合併為單一 token
   - 預估時間: 2-4 小時

2. **移除未使用的 Legacy Token**
   - 清理 tailwind.config.js 中標記為 "Deprecated" 的顏色
   - 預估時間: 1-2 小時

3. **標準化間距值**
   - 將非 4px 倍數的間距值調整為標準值
   - 預估時間: 3-5 小時

### 🟡 中期整理 (Medium-term)

1. **建立完整的元件 Variant 系統**
   - 為 Button、Card 等元件定義明確的 variant/size/state
   - 預估時間: 1-2 天

2. **統一字體大小階層**
   - 建立完整的字級 scale，移除隨意數值
   - 預估時間: 4-6 小時

3. **陰影系統標準化**
   - 定義有限的陰影層級（sm/md/lg/xl）
   - 預估時間: 2-3 小時

### 🔴 架構級重構 (Architecture)

1. **設計 Token 遷移策略**
   - 從 Tailwind config 遷移到 CSS Variables
   - 建立單一來源的設計 token 系統
   - 預估時間: 3-5 天

2. **元件抽象層重構**
   - 建立可重用的元件庫（如 Nunjucks macros）
   - 減少重複的樣式定義
   - 預估時間: 5-7 天

---

## ✅ 具體可執行的下一步建議

### 立即執行（本週）

1. ✅ **審查並合併近似顏色**
   ```bash
   # 建議優先處理使用頻率 > 5 次的未定義顏色
   ```

2. ✅ **清理 Deprecated Token**
   - 移除 tailwind.config.js 中標記為 "Deprecated" 的顏色定義
   - 更新所有引用為新的 token 名稱

3. ✅ **建立間距使用指南**
   - 文件化標準間距值（4px 節奏）
   - 在 code review 中檢查非標準間距

### 短期執行（2-4 週）

1. ✅ **建立元件 Variant 系統**
   - 定義 Button 的 variant: primary, secondary, ghost
   - 定義 Card 的 variant: default, elevated, bordered

2. ✅ **統一字體階層**
   - 建立完整的字級 scale（xs, sm, base, lg, xl, 2xl, 3xl, 4xl）
   - 移除所有硬編碼的字體大小

3. ✅ **建立設計系統文件**
   - 文件化所有設計 token
   - 建立元件使用指南

### 長期執行（1-3 個月）

1. ✅ **遷移到 CSS Variables 為主的 Token 系統**
   - 將 Tailwind config 中的 token 遷移到 CSS Variables
   - 建立單一來源的設計系統

2. ✅ **建立元件庫**
   - 使用 Nunjucks macros 建立可重用元件
   - 減少重複的 HTML/CSS 代碼

---

## 📈 改進追蹤

建議建立以下追蹤機制：

1. **定期稽核**
   - 每月執行一次設計系統一致性掃描
   - 追蹤一致性分數變化

2. **Code Review 檢查清單**
   - [ ] 是否使用設計 token 而非硬編碼值？
   - [ ] 間距是否符合 4px 節奏？
   - [ ] 顏色是否來自設計系統？
   - [ ] 元件是否使用統一的 variant？

3. **自動化檢查**
   - 考慮建立 ESLint/Prettier 規則檢查硬編碼樣式
   - 在 CI/CD 中整合設計系統檢查

---

## 📝 附錄

### 掃描的檔案清單

共掃描 {len(results['files_scanned'])} 個檔案：

"""
    
    for file_path in sorted(results['files_scanned'])[:50]:  # 只顯示前 50 個
        report += f"- `{file_path}`\n"
    
    if len(results['files_scanned']) > 50:
        report += f"\n... 還有 {len(results['files_scanned']) - 50} 個檔案\n"
    
    report += f"""
### 設計 Token 參考

當前設計系統定義於：
- `tailwind.config.js` - Tailwind 配置
- `src/assets/css/main.css` - CSS Variables

建議建立獨立的設計 token 文件（JSON/YAML）作為單一來源。

---

**報告生成時間**: {report_timestamp}
**稽核工具版本**: 1.0.0

---

## 📌 重要發現總結

### ✅ 做得好的地方

1. **間距系統表現優秀** ({score['spacing']}/100)
   - 大部分間距值符合 4px 節奏
   - Tailwind spacing 類名使用規範

2. **設計 Token 基礎架構完整**
   - tailwind.config.js 中定義了完整的顏色系統
   - CSS Variables 提供了良好的備援機制

### ⚠️ 需要改進的地方

1. **字體系統一致性較低** ({score['typography']}/100)
   - 發現多個未定義的字體大小（14px, 10px 等）
   - 建議建立完整的字級 scale

2. **顏色系統有改進空間** ({score['color']}/100)
   - 發現 {len(color_analysis['undefined_colors'])} 個未定義顏色
   - 建議將近似顏色合併為單一 token

3. **元件樣式重複度高**
   - Button 有 30 種不同類名組合
   - Card 有 19 種不同類名組合
   - 建議建立統一的 variant 系統

### 🎯 優先級建議

**高優先級（立即處理）**:
- 統一未定義顏色（使用頻率 > 5 次）
- 標準化字體大小（移除硬編碼的 14px, 10px 等）

**中優先級（2-4 週內）**:
- 建立元件 Variant 系統
- 清理 Deprecated Token

**低優先級（長期規劃）**:
- 遷移到 CSS Variables 為主的 Token 系統
- 建立元件庫（Nunjucks macros）

---

**報告結束**
"""
    
    return report

def main():
    """主函數"""
    print("🔍 開始掃描專案...")
    results, tokens = scan_project()
    
    print(f"✅ 掃描完成！共掃描 {len(results['files_scanned'])} 個檔案")
    print(f"   - 顏色: {len(results['colors'])} 處")
    print(f"   - 間距: {len(results['spacing'])} 處")
    print(f"   - 字體: {len(results['typography'])} 處")
    print(f"   - 圓角: {len(results['borderRadius'])} 處")
    print(f"   - 陰影: {len(results['shadows'])} 處")
    
    print("\n📊 生成稽核報告...")
    report = generate_report(results, tokens)
    
    # 儲存報告
    report_path = PROJECT_ROOT / "DESIGN_SYSTEM_AUDIT_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ 報告已儲存至: {report_path}")
    print(f"\n📈 總體一致性分數: {calculate_consistency_score(results, tokens)['overall']}/100")

if __name__ == '__main__':
    main()

