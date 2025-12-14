#!/usr/bin/env python3
"""
移动响应式设计全面健康检查脚本
检查所有HTML、CSS和NJK文件中的移动端响应式设计问题
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any
from collections import defaultdict
import sys

class MobileResponsiveAuditor:
    def __init__(self, root_dir: str = "."):
        self.root_dir = Path(root_dir)
        self.issues = defaultdict(list)
        self.stats = {
            "files_checked": 0,
            "total_issues": 0,
            "critical_issues": 0,
            "warnings": 0,
        }
        
    def audit(self) -> Dict[str, Any]:
        """执行全面审计"""
        print("🔍 开始移动响应式设计健康检查...\n")
        
        # 检查所有相关文件
        self._check_viewport_meta()
        self._check_html_files()
        self._check_css_files()
        self._check_njk_files()
        
        # 生成报告
        return self._generate_report()
    
    def _check_viewport_meta(self):
        """检查viewport meta标签"""
        print("📱 检查viewport设置...")
        
        layout_file = self.root_dir / "src" / "_includes" / "base-layout.njk"
        if layout_file.exists():
            content = layout_file.read_text(encoding="utf-8")
            
            # 检查viewport是否存在
            if "viewport" not in content:
                self._add_issue("critical", "viewport-missing", 
                              "base-layout.njk", 
                              "缺少viewport meta标签")
            else:
                # 检查viewport配置
                viewport_match = re.search(r'content="([^"]+)"', content)
                if viewport_match:
                    viewport_content = viewport_match.group(1)
                    if "viewport-fit=cover" not in viewport_content:
                        self._add_issue("warning", "viewport-safe-area",
                                       "base-layout.njk",
                                       "建议添加viewport-fit=cover以支持iOS安全区域")
    
    def _check_html_files(self):
        """检查HTML文件"""
        print("📄 检查HTML文件...")
        
        # 排除构建输出目录
        exclude_dirs = {"_site", "node_modules", ".git", "dist", "build"}
        html_files = [
            f for f in self.root_dir.rglob("*.html")
            if not any(excluded in f.parts for excluded in exclude_dirs)
        ]
        for file_path in html_files:
            self._check_file_responsive(file_path, "html")
    
    def _check_njk_files(self):
        """检查NJK模板文件"""
        print("📝 检查NJK模板文件...")
        
        njk_files = list((self.root_dir / "src").rglob("*.njk"))
        for file_path in njk_files:
            self._check_file_responsive(file_path, "njk")
    
    def _check_css_files(self):
        """检查CSS文件"""
        print("🎨 检查CSS文件...")
        
        css_files = list((self.root_dir / "src" / "assets" / "css").rglob("*.css"))
        for file_path in css_files:
            self._check_css_responsive(file_path)
    
    def _check_file_responsive(self, file_path: Path, file_type: str):
        """检查单个文件的响应式问题"""
        try:
            content = file_path.read_text(encoding="utf-8")
            self.stats["files_checked"] += 1
            
            # 检查内联样式中的固定宽度
            inline_styles = re.findall(r'style="[^"]*width:\s*(\d+)px', content)
            for width in inline_styles:
                width_val = int(width)
                if width_val > 400 and width_val < 2000:
                    self._add_issue("warning", "fixed-width",
                                  str(file_path.relative_to(self.root_dir)),
                                  f"内联样式中发现固定宽度: {width}px，建议使用响应式类")
            
            # 检查缺少响应式类的情况
            if file_type == "njk":
                # 检查大字体没有响应式断点
                large_text = re.findall(r'text-(5xl|6xl|7xl|8xl|9xl)(?!\s+md:|sm:)', content)
                if large_text:
                    self._add_issue("warning", "large-text-no-breakpoint",
                                  str(file_path.relative_to(self.root_dir)),
                                  f"发现大字体类 {large_text[0]} 没有移动端断点")
                
                # 检查固定padding/margin
                fixed_spacing = re.findall(r'(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-(\d+)(?!\s+md:|sm:)', content)
                if fixed_spacing and int(fixed_spacing[0][1]) > 8:
                    self._add_issue("info", "large-spacing-no-breakpoint",
                                  str(file_path.relative_to(self.root_dir)),
                                  "大间距值建议添加移动端断点")
                
                # 检查触摸目标大小
                buttons = re.findall(r'<button[^>]*>', content, re.IGNORECASE)
                links = re.findall(r'<a[^>]*class="[^"]*btn[^"]*"[^>]*>', content, re.IGNORECASE)
                
                for element in buttons + links:
                    if "min-w" not in element and "min-h" not in element:
                        # 检查是否有padding确保触摸目标
                        if not re.search(r'p-\d+|px-\d+|py-\d+', element):
                            self._add_issue("warning", "touch-target-size",
                                          str(file_path.relative_to(self.root_dir)),
                                          "按钮/链接可能触摸目标太小（建议至少44x44px）")
            
            # 检查水平滚动风险
            if "overflow-x" not in content and "overflow-hidden" not in content:
                # 检查是否有可能导致溢出的元素
                wide_elements = re.findall(r'(w-\[.*?\]|width:\s*\d+px|min-width:\s*\d+px)', content)
                if wide_elements:
                    self._add_issue("warning", "overflow-risk",
                                  str(file_path.relative_to(self.root_dir)),
                                  "可能存在水平滚动风险，建议添加overflow-x: hidden")
            
            # 检查移动端隐藏的元素
            mobile_hidden = re.findall(r'hidden\s+(?!md:|lg:)(sm:|)', content)
            if mobile_hidden:
                self._add_issue("info", "mobile-hidden",
                              str(file_path.relative_to(self.root_dir)),
                              "发现移动端隐藏的元素，请确认是否合理")
                
        except Exception as e:
            self._add_issue("warning", "file-read-error",
                          str(file_path.relative_to(self.root_dir)),
                          f"读取文件时出错: {str(e)}")
    
    def _check_css_responsive(self, file_path: Path):
        """检查CSS文件的响应式问题"""
        try:
            content = file_path.read_text(encoding="utf-8")
            self.stats["files_checked"] += 1
            
            # 检查媒体查询
            media_queries = re.findall(r'@media\s+([^{]+)\{', content)
            mobile_breakpoints = []
            for query in media_queries:
                if "max-width" in query:
                    mobile_breakpoints.append(query)
            
            if not mobile_breakpoints:
                self._add_issue("warning", "no-mobile-breakpoints",
                              str(file_path.relative_to(self.root_dir)),
                              "CSS文件中缺少移动端媒体查询")
            
            # 检查固定宽度（排除媒体查询中的断点和max-width）
            # 先移除所有媒体查询块
            content_without_media = re.sub(r'@media[^{]*\{[^}]*\}', '', content, flags=re.DOTALL)
            # 只检查width，不检查max-width（max-width通常是响应式的）
            fixed_widths = re.findall(r'(?<!max-)(?<!min-)width:\s*(\d+)px(?!\s*\/\*)', content_without_media)
            for width in fixed_widths:
                width_val = int(width)
                # 只报告可能影响移动端的固定宽度（排除常见的断点值和容器宽度）
                common_breakpoints = [320, 375, 390, 414, 768, 900, 992, 993, 1024, 1140, 1200, 1400]
                if width_val > 400 and width_val not in common_breakpoints:
                    self._add_issue("warning", "css-fixed-width",
                                  str(file_path.relative_to(self.root_dir)),
                                  f"CSS中发现固定宽度: {width}px，可能影响移动端显示")
            
            # 检查触摸目标
            min_sizes = re.findall(r'min-(width|height):\s*(\d+)px', content)
            for prop, size in min_sizes:
                if int(size) < 44:
                    self._add_issue("critical", "touch-target-too-small",
                                  str(file_path.relative_to(self.root_dir)),
                                  f"{prop} 最小尺寸 {size}px 小于WCAG建议的44px")
            
            # 检查字体大小
            font_sizes = re.findall(r'font-size:\s*(\d+(?:\.\d+)?)px', content)
            for size in font_sizes:
                if float(size) < 12:
                    self._add_issue("warning", "font-too-small",
                                  str(file_path.relative_to(self.root_dir)),
                                  f"字体大小 {size}px 可能在小屏幕上难以阅读")
            
            # 检查overflow设置
            if "overflow-x: hidden" not in content and "overflow-x:hidden" not in content:
                self._add_issue("info", "no-overflow-x-hidden",
                              str(file_path.relative_to(self.root_dir)),
                              "建议在body/html添加overflow-x: hidden防止水平滚动")
            
            # 检查box-sizing
            if "box-sizing: border-box" not in content and "*" not in content[:500]:
                self._add_issue("info", "box-sizing",
                              str(file_path.relative_to(self.root_dir)),
                              "建议使用box-sizing: border-box")
            
            # 检查安全区域支持
            if "safe-area-inset" not in content:
                self._add_issue("info", "safe-area-inset",
                              str(file_path.relative_to(self.root_dir)),
                              "建议添加iOS安全区域支持 (env(safe-area-inset-*))")
            
        except Exception as e:
            self._add_issue("warning", "css-read-error",
                          str(file_path.relative_to(self.root_dir)),
                          f"读取CSS文件时出错: {str(e)}")
    
    def _add_issue(self, severity: str, issue_type: str, file_path: str, message: str):
        """添加问题记录"""
        issue = {
            "severity": severity,
            "type": issue_type,
            "file": file_path,
            "message": message
        }
        
        self.issues[severity].append(issue)
        self.stats["total_issues"] += 1
        
        if severity == "critical":
            self.stats["critical_issues"] += 1
        elif severity == "warning":
            self.stats["warnings"] += 1
    
    def _generate_report(self) -> Dict[str, Any]:
        """生成审计报告"""
        report = {
            "summary": {
                "files_checked": self.stats["files_checked"],
                "total_issues": self.stats["total_issues"],
                "critical_issues": self.stats["critical_issues"],
                "warnings": self.stats["warnings"],
                "info": len(self.issues.get("info", []))
            },
            "issues": {
                "critical": self.issues.get("critical", []),
                "warning": self.issues.get("warning", []),
                "info": self.issues.get("info", [])
            },
            "recommendations": self._generate_recommendations()
        }
        
        return report
    
    def _generate_recommendations(self) -> List[str]:
        """生成建议"""
        recommendations = []
        
        if self.stats["critical_issues"] > 0:
            recommendations.append("🔴 发现关键问题，请立即修复")
        
        if len(self.issues.get("touch-target-too-small", [])) > 0:
            recommendations.append("📱 确保所有交互元素触摸目标至少44x44px (WCAG 2.1)")
        
        if len(self.issues.get("no-mobile-breakpoints", [])) > 0:
            recommendations.append("📐 为主要CSS文件添加移动端媒体查询")
        
        if len(self.issues.get("overflow-risk", [])) > 0:
            recommendations.append("📏 检查并修复可能导致水平滚动的问题")
        
        recommendations.append("✅ 使用Chrome DevTools的设备模拟器测试不同屏幕尺寸")
        recommendations.append("✅ 在真实移动设备上测试触摸交互")
        recommendations.append("✅ 检查字体大小在小屏幕上的可读性")
        
        return recommendations
    
    def print_report(self, report: Dict[str, Any]):
        """打印报告"""
        print("\n" + "="*60)
        print("📊 移动响应式设计健康检查报告")
        print("="*60)
        
        summary = report["summary"]
        print(f"\n📈 统计信息:")
        print(f"   • 检查文件数: {summary['files_checked']}")
        print(f"   • 总问题数: {summary['total_issues']}")
        print(f"   • 🔴 关键问题: {summary['critical_issues']}")
        print(f"   • ⚠️  警告: {summary['warnings']}")
        print(f"   • ℹ️  信息: {summary['info']}")
        
        # 关键问题
        if report["issues"]["critical"]:
            print(f"\n🔴 关键问题 ({len(report['issues']['critical'])}):")
            for issue in report["issues"]["critical"]:
                print(f"   • [{issue['type']}] {issue['file']}")
                print(f"     {issue['message']}")
        
        # 警告
        if report["issues"]["warning"]:
            print(f"\n⚠️  警告 ({len(report['issues']['warning'])}):")
            for issue in report["issues"]["warning"][:10]:  # 只显示前10个
                print(f"   • [{issue['type']}] {issue['file']}")
                print(f"     {issue['message']}")
            if len(report["issues"]["warning"]) > 10:
                print(f"   ... 还有 {len(report['issues']['warning']) - 10} 个警告")
        
        # 建议
        if report["recommendations"]:
            print(f"\n💡 建议:")
            for rec in report["recommendations"]:
                print(f"   {rec}")
        
        print("\n" + "="*60)
    
    def save_report(self, report: Dict[str, Any], output_file: str = "mobile-responsive-audit.json"):
        """保存报告到JSON文件"""
        output_path = self.root_dir / "report" / output_file
        output_path.parent.mkdir(exist_ok=True)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 报告已保存到: {output_path}")


def main():
    """主函数"""
    # 获取项目根目录
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    auditor = MobileResponsiveAuditor(str(project_root))
    report = auditor.audit()
    
    auditor.print_report(report)
    auditor.save_report(report)
    
    # 如果有关键问题，返回非零退出码
    if report["summary"]["critical_issues"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
