#!/usr/bin/env python3
"""检查所有可能的颜色组合，包括 Tailwind 类"""

from pathlib import Path

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

# CSS 变量值（从 main.css 提取）
color_values = {
    'trust-50': '#F0F4FF',
    'trust-100': '#E0E7FF',
    'trust-200': '#C7D2FE',
    'trust-500': '#0F172A',
    'trust-600': '#0F172A',
    'trust-800': '#1E3A8A',
    'trust-900': '#0F172A',
    'trust-950': '#020617',
    'slate-300': '#CBD5E1',
    'slate-400': '#94A3B8',
    'slate-500': '#64748B',
    'slate-600': '#475569',
    'white': '#FFFFFF',
}

# 检查所有可能的组合
print("="*80)
print("所有颜色组合对比度检查")
print("="*80)
print()

issues = []

# 浅蓝色背景上的文字
light_bg_colors = {
    'trust-50': '#F0F4FF',
    'trust-100': '#E0E7FF',
    'trust-200': '#C7D2FE',
}

text_colors = {
    'trust-50': '#F0F4FF',
    'trust-100': '#E0E7FF',
    'trust-200': '#C7D2FE',
    'trust-600': '#0F172A',
    'trust-800': '#1E3A8A',
    'trust-900': '#0F172A',
    'slate-300': '#CBD5E1',
    'slate-400': '#94A3B8',
    'slate-500': '#64748B',
    'slate-600': '#475569',
    'white': '#FFFFFF',
}

for bg_name, bg_color in light_bg_colors.items():
    for text_name, text_color in text_colors.items():
        ratio = get_contrast_ratio(text_color, bg_color)
        if ratio:
            status_aa = "✅" if ratio >= 4.5 else "❌"
            status_aaa = "✅" if ratio >= 7.0 else "⚠️"
            
            if ratio < 4.5:
                print(f"❌ bg-{bg_name} + text-{text_name}:")
                print(f"   对比度: {ratio:.2f}:1 (需要 ≥ 4.5:1)")
                print(f"   文字: {text_color}, 背景: {bg_color}")
                print()
                issues.append((f"bg-{bg_name} + text-{text_name}", ratio, "严重"))

# 检查带透明度的白色文字
for opacity in [0.7, 0.8, 0.9]:
    # 计算混合后的颜色（简化：假设在白色背景上混合）
    for bg_name, bg_color in light_bg_colors.items():
        # 白色文字带透明度在浅蓝色背景上
        white_rgb = hex_to_rgb('#FFFFFF')
        bg_rgb = hex_to_rgb(bg_color)
        mixed_r = int(white_rgb[0] * opacity + bg_rgb[0] * (1 - opacity))
        mixed_g = int(white_rgb[1] * opacity + bg_rgb[1] * (1 - opacity))
        mixed_b = int(white_rgb[2] * opacity + bg_rgb[2] * (1 - opacity))
        mixed_hex = f"#{mixed_r:02x}{mixed_g:02x}{mixed_b:02x}"
        
        ratio = get_contrast_ratio(mixed_hex, bg_color)
        if ratio and ratio < 4.5:
            print(f"❌ bg-{bg_name} + text-white/{int(opacity*100)}:")
            print(f"   对比度: {ratio:.2f}:1 (需要 ≥ 4.5:1)")
            print(f"   混合后文字: {mixed_hex}, 背景: {bg_color}")
            print()
            issues.append((f"bg-{bg_name} + text-white/{int(opacity*100)}", ratio, "严重"))

if issues:
    print("="*80)
    print(f"发现 {len(issues)} 个严重的对比度问题：")
    print("="*80)
    for name, ratio, severity in issues:
        print(f"  {severity}: {name} - 对比度 {ratio:.2f}:1")
else:
    print("✅ 所有检查的颜色组合都符合 WCAG AA 标准！")

