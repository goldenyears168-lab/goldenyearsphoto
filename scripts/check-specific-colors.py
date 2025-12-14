#!/usr/bin/env python3
"""快速检查特定颜色组合的对比度"""

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_relative_luminance(rgb):
    def normalize(value):
        value = value / 255.0
        if value <= 0.03928:
            return value / 12.92
        return ((value + 0.055) / 1.055) ** 2.4
    
    r, g, b = [normalize(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def get_contrast_ratio(color1, color2):
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    l1 = get_relative_luminance(rgb1)
    l2 = get_relative_luminance(rgb2)
    
    lighter = max(l1, l2)
    darker = min(l1, l2)
    
    if darker == 0:
        return None
    
    return (lighter + 0.05) / (darker + 0.05)

# 检查关键颜色组合
checks = [
    ("luggage-tag", "#1E3A8A", "#F0F4FF", "深蓝色文字在浅蓝色背景"),
    ("gate-icon", "#1E3A8A", "#F0F4FF", "深蓝色文字在浅蓝色背景"),
    ("step-list (trust-100)", "#0F172A", "#E0E7FF", "深色文字在 trust-100 背景"),
    ("step-list (trust-600)", "#0F172A", "#E0E7FF", "深色文字在 trust-100 背景"),
    ("filter-btn active", "#020617", "#C7D2FE", "深色文字在 trust-200 背景"),
    ("Final CTA 白色文字", "#FFFFFF", "#020617", "白色文字在深色背景"),
    ("Final CTA 深色文字", "#0F172A", "#F0F4FF", "深色文字在浅蓝色背景（如果有）"),
]

print("="*80)
print("特定颜色组合对比度检查")
print("="*80)
print("\nWCAG 标准:")
print("  AA (正常文字): ≥ 4.5:1")
print("  AAA (正常文字): ≥ 7:1")
print()

issues = []
for name, text_color, bg_color, desc in checks:
    ratio = get_contrast_ratio(text_color, bg_color)
    if ratio:
        status_aa = "✅" if ratio >= 4.5 else "❌"
        status_aaa = "✅" if ratio >= 7.0 else "⚠️"
        print(f"{name}:")
        print(f"  文字: {text_color}, 背景: {bg_color}")
        print(f"  对比度: {ratio:.2f}:1")
        print(f"  WCAG AA: {status_aa} ({'通过' if ratio >= 4.5 else '未通过'})")
        print(f"  WCAG AAA: {status_aaa} ({'通过' if ratio >= 7.0 else '未通过'})")
        print(f"  说明: {desc}")
        print()
        
        if ratio < 4.5:
            issues.append((name, ratio, "严重"))
        elif ratio < 7.0:
            issues.append((name, ratio, "建议改进"))

if issues:
    print("="*80)
    print("发现的问题:")
    print("="*80)
    for name, ratio, severity in issues:
        print(f"  {severity}: {name} - 对比度 {ratio:.2f}:1")
else:
    print("✅ 所有检查的颜色组合都符合 WCAG AA 标准！")

