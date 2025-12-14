#!/usr/bin/env python3
"""
无障碍颜色对比度检查工具
检查 CSS 文件中的颜色组合是否符合 WCAG 无障碍标准
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class WCAGLevel(Enum):
    """WCAG 级别"""
    AA_NORMAL = 4.5  # 正常文字 AA 级别
    AA_LARGE = 3.0   # 大文字 AA 级别 (18pt+ 或 14pt+ bold)
    AAA_NORMAL = 7.0  # 正常文字 AAA 级别
    AAA_LARGE = 4.5   # 大文字 AAA 级别

@dataclass
class ColorIssue:
    """颜色问题记录"""
    selector: str
    text_color: str
    bg_color: str
    contrast_ratio: float
    wcag_level: str
    status: str  # 'pass', 'fail_aa', 'fail_aaa'
    line_number: int
    context: str

class ColorContrastChecker:
    """颜色对比度检查器"""
    
    def __init__(self, css_file: str):
        self.css_file = Path(css_file)
        self.color_vars: Dict[str, str] = {}
        self.issues: List[ColorIssue] = []
        
    def hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """将十六进制颜色转换为 RGB"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 3:
            hex_color = ''.join([c*2 for c in hex_color])
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def get_color_value(self, color_ref: str) -> Optional[str]:
        """从 CSS 变量或直接颜色值获取实际颜色"""
        var_match = re.search(r'var\(--([^)]+)\)', color_ref)
        if var_match:
            var_name = var_match.group(1)
            return self.color_vars.get(var_name)
        
        # 直接颜色值
        if color_ref.startswith('#') or color_ref.startswith('rgb'):
            return color_ref
        
        return None
    
    def parse_css_variables(self, css_content: str):
        """解析 CSS 变量定义"""
        # 匹配 :root { ... } 中的变量定义
        root_match = re.search(r':root\s*\{([^}]+)\}', css_content, re.DOTALL)
        if not root_match:
            return
        
        root_content = root_match.group(1)
        # 匹配 --variable-name: value;
        var_pattern = r'--([^:]+):\s*([^;]+);'
        
        for match in re.finditer(var_pattern, root_content):
            var_name = match.group(1).strip()
            var_value = match.group(2).strip()
            
            color_match = re.search(r'(#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))', var_value)
            if color_match:
                self.color_vars[var_name] = color_match.group(1)
    
    def get_relative_luminance(self, rgb: Tuple[int, int, int]) -> float:
        """计算相对亮度 (Relative Luminance)"""
        def normalize(value):
            value = value / 255.0
            if value <= 0.03928:
                return value / 12.92
            return ((value + 0.055) / 1.055) ** 2.4
        
        r, g, b = [normalize(c) for c in rgb]
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    def get_contrast_ratio(self, color1: str, color2: str) -> Optional[float]:
        """计算两个颜色之间的对比度比率"""
        rgb1 = self.hex_to_rgb(color1) if color1.startswith('#') else None
        rgb2 = self.hex_to_rgb(color2) if color2.startswith('#') else None
        
        if not rgb1 or not rgb2:
            return None
        
        l1 = self.get_relative_luminance(rgb1)
        l2 = self.get_relative_luminance(rgb2)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        if darker == 0:
            return None
        
        return (lighter + 0.05) / (darker + 0.05)
    
    def check_contrast(self, text_color: str, bg_color: str, 
                      selector: str, line_num: int, context: str) -> ColorIssue:
        """检查颜色对比度"""
        # 获取实际颜色值
        text_rgb = self.get_color_value(text_color)
        bg_rgb = self.get_color_value(bg_color)
        
        if not text_rgb or not bg_rgb:
            return None
        
        # 只处理十六进制颜色
        if not text_rgb.startswith('#') or not bg_rgb.startswith('#'):
            return None
        
        contrast = self.get_contrast_ratio(text_rgb, bg_rgb)
        if contrast is None:
            return None
        
        # 检查 WCAG 标准
        status = 'pass'
        wcag_level = 'AA'
        
        if contrast < WCAGLevel.AA_NORMAL.value:
            status = 'fail_aa'
            wcag_level = 'AA (正常文字)'
        elif contrast < WCAGLevel.AAA_NORMAL.value:
            status = 'fail_aaa'
            wcag_level = 'AAA (正常文字)'
        
        return ColorIssue(
            selector=selector,
            text_color=text_color,
            bg_color=bg_color,
            contrast_ratio=contrast,
            wcag_level=wcag_level,
            status=status,
            line_number=line_num,
            context=context
        )
    
    def parse_css_rules(self, css_content: str):
        """解析 CSS 规则，提取颜色组合"""
        lines = css_content.split('\n')
        
        # 当前选择器和上下文
        current_selector = None
        rule_lines = []  # 存储当前规则的所有行
        in_rule = False
        brace_count = 0
        
        for i, line in enumerate(lines, 1):
            # 检测选择器
            if '{' in line and not line.strip().startswith('/*'):
                selector_match = re.match(r'^([^{]+)\{', line)
                if selector_match:
                    current_selector = selector_match.group(1).strip()
                    in_rule = True
                    brace_count = line.count('{') - line.count('}')
                    rule_lines = [line]
            elif in_rule:
                rule_lines.append(line)
                brace_count += line.count('{') - line.count('}')
                
                # 规则结束
                if brace_count <= 0:
                    # 分析整个规则块
                    self.analyze_rule_block(current_selector, rule_lines, i - len(rule_lines) + 1)
                    in_rule = False
                    current_selector = None
                    rule_lines = []
    
    def analyze_rule_block(self, selector: str, rule_lines: List[str], start_line: int):
        """分析一个完整的 CSS 规则块"""
        # 跳过伪元素（除非它们明确有文字内容）
        if selector and ('::before' in selector or '::after' in selector):
            # 检查是否有 content 属性（表示可能有文字）
            has_content = any('content:' in line for line in rule_lines)
            if not has_content:
                return  # 跳过装饰性伪元素
        
        # 提取所有颜色和背景
        text_colors = []
        bg_colors = []
        
        for line in rule_lines:
            # 只提取文字颜色（color: 属性），不包括 border-color
            # 确保匹配的是 color: 而不是其他包含 color 的属性
            color_match = re.search(r'(?<![-a-z])color:\s*(var\([^)]+\)|#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))\s*[!;]', line, re.IGNORECASE)
            if color_match:
                color_val = color_match.group(1)
                if 'transparent' not in color_val.lower():
                    text_colors.append((color_val, line.strip()))
            
            # 提取背景颜色（只匹配 background 或 background-color）
            bg_match = re.search(r'(?:^|\s)(?:background(?:-color)?):\s*(var\([^)]+\)|#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))\s*[!;]', line, re.IGNORECASE)
            if bg_match:
                bg_val = bg_match.group(1)
                if 'transparent' not in bg_val.lower():
                    bg_colors.append((bg_val, line.strip()))
        
        # 如果规则块中有文字颜色和背景颜色，检查对比度
        # 优先检查同一行的组合，否则检查规则块内的组合
        if text_colors and bg_colors:
            # 检查同一行的组合
            for text_color, text_line in text_colors:
                for bg_color, bg_line in bg_colors:
                    # 如果颜色相同，跳过（通常是误报）
                    if text_color == bg_color:
                        continue
                    
                    # 检查对比度
                    context = f"{text_line[:40]}...{bg_line[:40]}" if text_line != bg_line else text_line[:80]
                    issue = self.check_contrast(
                        text_color, bg_color,
                        selector or 'unknown',
                        start_line,
                        context
                    )
                    if issue and issue.status != 'pass' and issue.contrast_ratio > 1.0:
                        # 避免重复添加相同的问题
                        if not any(
                            i.selector == issue.selector and
                            i.text_color == issue.text_color and
                            i.bg_color == issue.bg_color
                            for i in self.issues
                        ):
                            self.issues.append(issue)
    
    def analyze(self):
        """执行完整分析"""
        if not self.css_file.exists():
            print(f"错误: 找不到文件 {self.css_file}")
            return
        
        css_content = self.css_file.read_text(encoding='utf-8')
        
        # 步骤1: 解析 CSS 变量
        print("正在解析 CSS 变量...")
        self.parse_css_variables(css_content)
        print(f"找到 {len(self.color_vars)} 个颜色变量")
        
        # 步骤2: 解析 CSS 规则
        print("正在分析颜色组合...")
        self.parse_css_rules(css_content)
        
        # 步骤3: 生成报告
        self.generate_report()
    
    def generate_report(self):
        """生成报告"""
        print("\n" + "="*80)
        print("无障碍颜色对比度检查报告")
        print("="*80)
        print("\nWCAG 标准说明:")
        print("  - AA 级别（正常文字）: 对比度 ≥ 4.5:1")
        print("  - AA 级别（大文字）: 对比度 ≥ 3:1")
        print("  - AAA 级别（正常文字）: 对比度 ≥ 7:1")
        print("  - AAA 级别（大文字）: 对比度 ≥ 4.5:1")
        
        if not self.issues:
            print("\n✅ 所有检查的颜色组合都符合 WCAG AA 标准！")
            return
        
        # 按严重程度分组
        fail_aa = [i for i in self.issues if i.status == 'fail_aa']
        fail_aaa = [i for i in self.issues if i.status == 'fail_aaa']
        
        print(f"\n❌ 发现 {len(fail_aa)} 个不符合 WCAG AA 标准的问题（需要立即修复）")
        print(f"⚠️  发现 {len(fail_aaa)} 个不符合 WCAG AAA 标准的问题（建议改进）")
        
        if fail_aa:
            print("\n" + "-"*80)
            print("❌ 不符合 WCAG AA 标准 (对比度 < 4.5:1)")
            print("-"*80)
            for issue in sorted(fail_aa, key=lambda x: x.contrast_ratio):
                print(f"\n行 {issue.line_number}: {issue.selector}")
                print(f"  文字颜色: {issue.text_color}")
                print(f"  背景颜色: {issue.bg_color}")
                print(f"  对比度: {issue.contrast_ratio:.2f}:1 (需要 ≥ 4.5:1)")
                print(f"  上下文: {issue.context}")
        
        if fail_aaa:
            print("\n" + "-"*80)
            print("⚠️  不符合 WCAG AAA 标准 (对比度 < 7:1)")
            print("-"*80)
            for issue in sorted(fail_aaa, key=lambda x: x.contrast_ratio):
                print(f"\n行 {issue.line_number}: {issue.selector}")
                print(f"  文字颜色: {issue.text_color}")
                print(f"  背景颜色: {issue.bg_color}")
                print(f"  对比度: {issue.contrast_ratio:.2f}:1 (AAA 需要 ≥ 7:1)")
                print(f"  上下文: {issue.context}")
        
        # 生成 JSON 报告
        report_file = self.css_file.parent.parent / 'ACCESSIBILITY_COLOR_REPORT.json'
        report_data = {
            'summary': {
                'total_issues': len(self.issues),
                'fail_aa_count': len(fail_aa),
                'fail_aaa_count': len(fail_aaa)
            },
            'issues': [
                {
                    'line': issue.line_number,
                    'selector': issue.selector,
                    'text_color': issue.text_color,
                    'bg_color': issue.bg_color,
                    'contrast_ratio': round(issue.contrast_ratio, 2),
                    'status': issue.status,
                    'context': issue.context
                }
                for issue in self.issues
            ]
        }
        
        report_file.write_text(json.dumps(report_data, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"\n📄 详细报告已保存到: {report_file}")

def main():
    """主函数"""
    css_file = Path(__file__).parent.parent / 'src' / 'assets' / 'css' / 'main.css'
    
    checker = ColorContrastChecker(css_file)
    checker.analyze()

if __name__ == '__main__':
    main()

