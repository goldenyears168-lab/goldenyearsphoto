#!/usr/bin/env python3
"""
全面 SEO 審計與評分系統
為每個頁面進行多維度 SEO 分析並給出綜合評分
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from collections import defaultdict, Counter
from datetime import datetime
import urllib.parse

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"
REPORT_DIR = PROJECT_ROOT / "report"

# 網站 URL
SITE_URL = "https://goldenyearsphoto.com"

# SEO 最佳實踐標準
SEO_STANDARDS = {
    'title': {
        'min_length': 30,
        'max_length': 60,
        'optimal_length': 50,
    },
    'description': {
        'min_length': 120,
        'max_length': 160,
        'optimal_length': 150,
    },
    'keywords': {
        'min_count': 5,
        'max_count': 10,
    },
    'content': {
        'min_length': 300,  # 最少內容長度
        'optimal_length': 1000,
    },
    'heading_structure': {
        'max_h1': 1,
        'prefer_h2_after_h1': True,
    },
    'images': {
        'require_alt': True,
    },
    'links': {
        'min_internal_links': 2,
        'max_external_links': 10,
    },
}


class ComprehensiveSEOAuditor:
    """全面 SEO 審計器"""
    
    def __init__(self, src_dir: Path, site_url: str):
        self.src_dir = src_dir
        self.site_url = site_url
        self.pages: List[Dict[str, Any]] = []
        self.issues: List[Dict[str, Any]] = []
        self.page_urls: Dict[str, str] = {}  # file_path -> url mapping
        
    def audit(self) -> Dict[str, Any]:
        """執行完整 SEO 審計"""
        print("🔍 開始全面 SEO 審計...\n")
        
        # 1. 掃描所有頁面
        print("📁 掃描頁面文件...")
        page_files = self._scan_pages()
        print(f"   找到 {len(page_files)} 個頁面文件\n")
        
        # 2. 解析所有頁面（第一遍：建立URL映射）
        print("📄 解析頁面 front matter...")
        for file_path in page_files:
            page_data = self._parse_page(file_path)
            if page_data:
                self.pages.append(page_data)
                self.page_urls[page_data['file_path']] = page_data['url']
        print(f"   成功解析 {len(self.pages)} 個頁面\n")
        
        # 3. 深入分析每個頁面
        print("🔎 執行全面 SEO 分析...")
        for page in self.pages:
            page['seo_analysis'] = self._comprehensive_analyze(page)
        print("   SEO 分析完成\n")
        
        # 4. 檢查跨頁面問題
        print("🔗 檢查跨頁面問題...")
        self._check_cross_page_issues()
        print("   檢查完成\n")
        
        # 5. 生成統計
        print("📊 生成統計數據...")
        stats = self._generate_stats()
        print("   統計完成\n")
        
        return {
            'timestamp': datetime.now().isoformat(),
            'site_url': self.site_url,
            'total_pages': len(self.pages),
            'pages': self.pages,
            'stats': stats,
            'issues': self.issues,
        }
    
    def _scan_pages(self) -> List[Path]:
        """掃描所有 .njk 頁面文件"""
        pages = []
        for file_path in self.src_dir.rglob("*.njk"):
            rel_path = file_path.relative_to(self.src_dir)
            if str(rel_path).startswith("_includes/"):
                continue
            if str(rel_path).startswith("_data/"):
                continue
            pages.append(file_path)
        return sorted(pages)
    
    def _parse_page(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """解析頁面的 front matter 和內容"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 提取 front matter
            front_matter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
            
            if not front_matter_match:
                return None
            
            front_matter_text = front_matter_match.group(1)
            body_content = front_matter_match.group(2)
            
            # 解析 YAML
            try:
                front_matter = self._parse_simple_yaml(front_matter_text)
            except Exception as e:
                print(f"   ⚠️  YAML 解析錯誤 ({file_path.relative_to(PROJECT_ROOT)}): {e}")
                return None
            
            # 推斷 URL 和頁面類型
            rel_path = file_path.relative_to(self.src_dir)
            url = self._infer_url(rel_path, front_matter)
            page_type = self._infer_page_type(rel_path, front_matter)
            
            return {
                'file_path': str(file_path.relative_to(PROJECT_ROOT)),
                'rel_path': str(rel_path),
                'url': url,
                'page_type': page_type,
                'front_matter': front_matter,
                'title': front_matter.get('title', ''),
                'seo': front_matter.get('seo', {}),
                'body_content': body_content,
                'content_length': len(body_content),
            }
        except Exception as e:
            print(f"   ⚠️  解析錯誤 ({file_path.relative_to(PROJECT_ROOT)}): {e}")
            return None
    
    def _parse_simple_yaml(self, yaml_text: str) -> Dict[str, Any]:
        """簡單的 YAML 解析器"""
        result = {}
        lines = yaml_text.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            
            if not stripped or stripped.startswith('#'):
                i += 1
                continue
            
            indent = len(line) - len(line.lstrip())
            
            if ':' in line:
                colon_idx = line.index(':')
                key = line[:colon_idx].strip()
                value_part = line[colon_idx + 1:].strip()
                
                # 檢查是否是嵌套對象
                is_object = False
                if i + 1 < len(lines):
                    next_line = lines[i + 1]
                    next_stripped = next_line.strip()
                    if next_stripped and ':' in next_line:
                        next_indent = len(next_line) - len(next_line.lstrip())
                        if next_indent > indent:
                            is_object = True
                
                if is_object:
                    nested_lines = []
                    i += 1
                    while i < len(lines):
                        nested_line = lines[i]
                        nested_stripped = nested_line.strip()
                        if not nested_stripped or nested_stripped.startswith('#'):
                            i += 1
                            continue
                        nested_indent = len(nested_line) - len(nested_line.lstrip())
                        if nested_indent <= indent:
                            break
                        nested_lines.append(nested_line)
                        i += 1
                    i -= 1
                    
                    nested_text = '\n'.join(nested_lines)
                    result[key] = self._parse_simple_yaml(nested_text)
                else:
                    value = value_part
                    
                    if value in ('|', '>'):
                        multiline_lines = []
                        i += 1
                        while i < len(lines):
                            next_line = lines[i]
                            next_indent = len(next_line) - len(next_line.lstrip())
                            if next_indent <= indent and next_line.strip():
                                break
                            if next_indent > indent:
                                multiline_lines.append(next_line[indent:])
                            i += 1
                        value = '\n'.join(multiline_lines).strip()
                        if value.startswith('|') or value.startswith('>'):
                            value = value[1:].lstrip()
                        i -= 1
                    else:
                        if (value.startswith('"') and value.endswith('"')) or \
                           (value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]
                    
                    result[key] = value
            
            i += 1
        
        return result
    
    def _infer_url(self, rel_path: Path, front_matter: Dict) -> str:
        """推斷頁面 URL"""
        if 'permalink' in front_matter:
            return front_matter['permalink']
        
        url_path = str(rel_path).replace('\\', '/')
        if url_path.endswith('.njk'):
            url_path = url_path[:-4]
        if url_path.endswith('/index'):
            url_path = url_path[:-6]
        elif url_path == 'index':
            url_path = ''
        
        url = f"{self.site_url}/{url_path}" if url_path else self.site_url
        return url.rstrip('/') + '/'
    
    def _infer_page_type(self, rel_path: Path, front_matter: Dict) -> str:
        """推斷頁面類型"""
        rel_str = str(rel_path).lower()
        if rel_str == 'index.njk':
            return 'home'
        elif 'services/' in rel_str:
            return 'service'
        elif 'blog/' in rel_str:
            return 'blog'
        elif 'guide/' in rel_str:
            return 'guide'
        elif 'booking/' in rel_str:
            return 'booking'
        elif 'about' in rel_str:
            return 'about'
        elif 'price-list' in rel_str or 'price' in rel_str:
            return 'pricing'
        else:
            return 'other'
    
    def _comprehensive_analyze(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """全面 SEO 分析"""
        analysis = {
            'scores': {},
            'overall_score': 0,
            'issues': [],
            'recommendations': [],
            'details': {},
        }
        
        body_content = page.get('body_content', '')
        
        # 1. Title 分析
        title_score, title_details = self._analyze_title(page.get('title', ''))
        analysis['scores']['title'] = title_score
        analysis['details']['title'] = title_details
        
        # 2. Description 分析
        description = page.get('seo', {}).get('description', '')
        desc_score, desc_details = self._analyze_description(description)
        analysis['scores']['description'] = desc_score
        analysis['details']['description'] = desc_details
        
        # 3. Keywords 分析
        keywords = page.get('seo', {}).get('keywords', '')
        keywords_score, keywords_details = self._analyze_keywords(keywords)
        analysis['scores']['keywords'] = keywords_score
        analysis['details']['keywords'] = keywords_details
        
        # 4. H1 分析
        h1_score, h1_details = self._analyze_headings(body_content, 'h1')
        analysis['scores']['h1'] = h1_score
        analysis['details']['h1'] = h1_details
        
        # 5. 標題結構分析 (H1-H6)
        heading_structure_score, heading_details = self._analyze_heading_structure(body_content)
        analysis['scores']['heading_structure'] = heading_structure_score
        analysis['details']['heading_structure'] = heading_details
        
        # 6. 內容質量分析
        content_score, content_details = self._analyze_content_quality(body_content, page.get('title', ''))
        analysis['scores']['content'] = content_score
        analysis['details']['content'] = content_details
        
        # 7. 圖片分析
        images_score, images_details = self._analyze_images(body_content)
        analysis['scores']['images'] = images_score
        analysis['details']['images'] = images_details
        
        # 8. 內部鏈接分析
        internal_links_score, links_details = self._analyze_internal_links(body_content, page['url'])
        analysis['scores']['internal_links'] = internal_links_score
        analysis['details']['internal_links'] = links_details
        
        # 9. 外部鏈接分析
        external_links_score, external_details = self._analyze_external_links(body_content)
        analysis['scores']['external_links'] = external_links_score
        analysis['details']['external_links'] = external_details
        
        # 10. URL 結構分析
        url_score, url_details = self._analyze_url(page['url'])
        analysis['scores']['url'] = url_score
        analysis['details']['url'] = url_details
        
        # 11. Meta 標籤完整性（從 base-layout 檢查，這裡僅做提示）
        meta_score, meta_details = self._analyze_meta_tags(page)
        analysis['scores']['meta_tags'] = meta_score
        analysis['details']['meta_tags'] = meta_details
        
        # 12. 移動端友好性（檢查 viewport meta）
        mobile_score, mobile_details = self._analyze_mobile_friendliness(page)
        analysis['scores']['mobile'] = mobile_score
        analysis['details']['mobile'] = mobile_details
        
        # 計算加權總分
        weights = {
            'title': 0.15,
            'description': 0.15,
            'keywords': 0.05,
            'h1': 0.10,
            'heading_structure': 0.08,
            'content': 0.15,
            'images': 0.10,
            'internal_links': 0.08,
            'external_links': 0.04,
            'url': 0.05,
            'meta_tags': 0.03,
            'mobile': 0.02,
        }
        
        overall_score = sum(
            analysis['scores'].get(key, 0) * weight
            for key, weight in weights.items()
        )
        
        analysis['overall_score'] = round(overall_score, 1)
        
        # 收集所有問題和建議
        for detail_key, detail_data in analysis['details'].items():
            if isinstance(detail_data, dict):
                if 'issues' in detail_data:
                    analysis['issues'].extend(detail_data['issues'])
                if 'recommendations' in detail_data:
                    analysis['recommendations'].extend(detail_data['recommendations'])
        
        return analysis
    
    def _analyze_title(self, title: str) -> Tuple[float, Dict[str, Any]]:
        """分析 Title"""
        details = {
            'value': title,
            'length': len(title),
            'issues': [],
            'recommendations': [],
        }
        score = 0
        
        if not title:
            details['issues'].append({
                'priority': 'high',
                'message': '缺少 Title 標籤',
            })
            return 0, details
        
        std = SEO_STANDARDS['title']
        length = len(title)
        
        if length < std['min_length']:
            details['issues'].append({
                'priority': 'high',
                'message': f'Title 過短（{length} 字符，建議至少 {std["min_length"]} 字符）',
            })
            score = (length / std['min_length']) * 50
        elif length > std['max_length']:
            details['issues'].append({
                'priority': 'medium',
                'message': f'Title 過長（{length} 字符，建議不超過 {std["max_length"]} 字符）',
            })
            excess = length - std['max_length']
            score = max(50, 100 - (excess * 2))
        else:
            if std['min_length'] <= length <= std['optimal_length']:
                score = 100
            else:
                score = 90
            details['recommendations'].append({
                'priority': 'low',
                'message': f'Title 長度良好（{length} 字符）',
            })
        
        # 檢查品牌名
        if '好時有影' not in title and 'Golden Years' not in title:
            details['recommendations'].append({
                'priority': 'low',
                'message': '建議在 Title 中包含品牌名稱',
            })
            score *= 0.9
        
        return round(score, 1), details
    
    def _analyze_description(self, description: str) -> Tuple[float, Dict[str, Any]]:
        """分析 Description"""
        details = {
            'value': description,
            'length': len(description),
            'issues': [],
            'recommendations': [],
        }
        score = 0
        
        if not description:
            details['issues'].append({
                'priority': 'high',
                'message': '缺少 Meta Description',
            })
            return 0, details
        
        std = SEO_STANDARDS['description']
        length = len(description)
        
        if length < std['min_length']:
            details['issues'].append({
                'priority': 'high',
                'message': f'Description 過短（{length} 字符，建議至少 {std["min_length"]} 字符）',
            })
            score = (length / std['min_length']) * 60
        elif length > std['max_length']:
            details['issues'].append({
                'priority': 'medium',
                'message': f'Description 過長（{length} 字符，可能被截斷）',
            })
            excess = length - std['max_length']
            score = max(60, 100 - (excess * 2))
        else:
            score = 100
            details['recommendations'].append({
                'priority': 'low',
                'message': f'Description 長度良好（{length} 字符）',
            })
        
        # 檢查 CTA
        cta_words = ['立即', '查看', '預約', '了解更多', '開始']
        has_cta = any(word in description for word in cta_words)
        if not has_cta:
            details['recommendations'].append({
                'priority': 'low',
                'message': '建議在 Description 中包含行動呼籲（CTA）',
            })
            score *= 0.95
        
        return round(score, 1), details
    
    def _analyze_keywords(self, keywords: str) -> Tuple[float, Dict[str, Any]]:
        """分析 Keywords"""
        details = {
            'value': keywords,
            'count': 0,
            'issues': [],
            'recommendations': [],
        }
        
        if not keywords:
            details['recommendations'].append({
                'priority': 'low',
                'message': '建議添加 keywords（雖然 Google 不再使用，但其他搜索引擎可能使用）',
            })
            return 70, details
        
        if isinstance(keywords, str):
            keyword_list = [k.strip() for k in keywords.split(',') if k.strip()]
        elif isinstance(keywords, list):
            keyword_list = keywords
        else:
            keyword_list = []
        
        details['count'] = len(keyword_list)
        std = SEO_STANDARDS['keywords']
        
        if len(keyword_list) < std['min_count']:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'關鍵詞數量較少（{len(keyword_list)} 個）',
            })
            score = 80
        elif len(keyword_list) > std['max_count']:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'關鍵詞數量較多（{len(keyword_list)} 個，建議不超過 {std["max_count"]} 個）',
            })
            score = 85
        else:
            score = 100
        
        return round(score, 1), details
    
    def _analyze_headings(self, content: str, tag: str) -> Tuple[float, Dict[str, Any]]:
        """分析特定標題標籤"""
        pattern = f'<{tag}[^>]*>(.*?)</{tag}>'
        matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
        headings = [re.sub(r'<[^>]+>', '', h).strip() for h in matches]
        
        details = {
            'count': len(headings),
            'headings': headings,
            'issues': [],
            'recommendations': [],
        }
        
        if tag == 'h1':
            if len(headings) == 0:
                details['issues'].append({
                    'priority': 'high',
                    'message': '頁面缺少 H1 標籤',
                })
                return 0, details
            elif len(headings) == 1:
                details['recommendations'].append({
                    'priority': 'low',
                    'message': f'H1 標籤良好: "{headings[0]}"',
                })
                return 100, details
            else:
                details['issues'].append({
                    'priority': 'medium',
                    'message': f'頁面包含多個 H1 標籤（{len(headings)} 個），建議只使用一個',
                })
                return 50, details
        
        return 100, details
    
    def _analyze_heading_structure(self, content: str) -> Tuple[float, Dict[str, Any]]:
        """分析標題結構（H1-H6）"""
        heading_counts = {f'h{i}': 0 for i in range(1, 7)}
        for i in range(1, 7):
            pattern = f'<h{i}[^>]*>'
            heading_counts[f'h{i}'] = len(re.findall(pattern, content, re.IGNORECASE))
        
        details = {
            'counts': heading_counts,
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        # 檢查 H1 數量
        if heading_counts['h1'] == 0:
            details['issues'].append({
                'priority': 'high',
                'message': '缺少 H1 標籤',
            })
            score -= 30
        elif heading_counts['h1'] > 1:
            details['issues'].append({
                'priority': 'medium',
                'message': f'多個 H1 標籤（{heading_counts["h1"]} 個）',
            })
            score -= 20
        
        # 檢查標題順序（H1 後應該有 H2）
        if heading_counts['h1'] == 1 and heading_counts['h2'] == 0:
            details['recommendations'].append({
                'priority': 'low',
                'message': '建議在 H1 後使用 H2 標題來組織內容',
            })
            score -= 10
        
        # 檢查是否有跳級（如 H1 後直接 H3）
        # 這個需要更複雜的解析，暫時跳過
        
        total_headings = sum(heading_counts.values())
        if total_headings == 0:
            details['issues'].append({
                'priority': 'medium',
                'message': '頁面沒有任何標題標籤，影響內容結構',
            })
            score -= 40
        elif total_headings < 3:
            details['recommendations'].append({
                'priority': 'low',
                'message': '建議使用更多標題標籤來組織內容結構',
            })
            score -= 5
        
        return max(0, round(score, 1)), details
    
    def _analyze_content_quality(self, content: str, title: str) -> Tuple[float, Dict[str, Any]]:
        """分析內容質量"""
        # 移除 HTML 標籤獲取純文本
        text_content = re.sub(r'<[^>]+>', ' ', content)
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        content_length = len(text_content)
        
        details = {
            'length': content_length,
            'word_count': len(text_content.split()),
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        std = SEO_STANDARDS['content']
        
        if content_length < std['min_length']:
            details['issues'].append({
                'priority': 'high',
                'message': f'內容過短（{content_length} 字符，建議至少 {std["min_length"]} 字符）',
            })
            score = min(60, (content_length / std['min_length']) * 60)
        elif content_length < std['optimal_length']:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'內容長度可接受（{content_length} 字符），但建議達到 {std["optimal_length"]} 字符以上',
            })
            score = 80
        else:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'內容長度良好（{content_length} 字符）',
            })
        
        # 檢查是否包含標題相關關鍵詞
        if title:
            title_words = set(re.findall(r'\w+', title.lower()))
            content_words = set(re.findall(r'\w+', text_content.lower()))
            overlap = len(title_words & content_words)
            if overlap == 0 and len(title_words) > 0:
                details['recommendations'].append({
                    'priority': 'low',
                    'message': '建議內容中包含標題中的關鍵詞',
                })
                score *= 0.95
        
        return round(score, 1), details
    
    def _analyze_images(self, content: str) -> Tuple[float, Dict[str, Any]]:
        """分析圖片"""
        img_pattern = r'<img[^>]*>'
        images = re.findall(img_pattern, content, re.IGNORECASE)
        
        total_images = len(images)
        images_with_alt = 0
        images_without_alt = []
        
        for img_tag in images:
            alt_match = re.search(r'alt=["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
            if alt_match and alt_match.group(1).strip():
                images_with_alt += 1
            else:
                # 提取 src 用於報告
                src_match = re.search(r'src=["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
                src = src_match.group(1) if src_match else '未知'
                images_without_alt.append(src)
        
        details = {
            'total': total_images,
            'with_alt': images_with_alt,
            'without_alt': len(images_without_alt),
            'missing_alt_images': images_without_alt[:5],  # 只記錄前5個
            'issues': [],
            'recommendations': [],
        }
        
        if total_images == 0:
            details['recommendations'].append({
                'priority': 'low',
                'message': '頁面沒有圖片，可以考慮添加相關圖片提升用戶體驗',
            })
            return 80, details
        
        if images_without_alt:
            details['issues'].append({
                'priority': 'high',
                'message': f'{len(images_without_alt)} 張圖片缺少 alt 屬性',
            })
            score = (images_with_alt / total_images) * 100
        else:
            details['recommendations'].append({
                'priority': 'low',
                'message': '所有圖片都包含 alt 屬性，良好！',
            })
            score = 100
        
        return round(score, 1), details
    
    def _analyze_internal_links(self, content: str, current_url: str) -> Tuple[float, Dict[str, Any]]:
        """分析內部鏈接"""
        link_pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>'
        links = re.findall(link_pattern, content, re.IGNORECASE)
        
        internal_links = []
        external_links = []
        
        for link in links:
            if link.startswith('http://') or link.startswith('https://'):
                if self.site_url in link:
                    internal_links.append(link)
                else:
                    external_links.append(link)
            elif link.startswith('/') or not link.startswith('#'):
                internal_links.append(link)
        
        details = {
            'total': len(internal_links),
            'links': internal_links[:10],  # 只記錄前10個
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        std = SEO_STANDARDS['links']
        
        if len(internal_links) < std['min_internal_links']:
            details['issues'].append({
                'priority': 'medium',
                'message': f'內部鏈接較少（{len(internal_links)} 個，建議至少 {std["min_internal_links"]} 個）',
            })
            score = min(70, (len(internal_links) / std['min_internal_links']) * 70)
        elif len(internal_links) >= std['min_internal_links']:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'內部鏈接數量良好（{len(internal_links)} 個）',
            })
        
        return round(score, 1), details
    
    def _analyze_external_links(self, content: str) -> Tuple[float, Dict[str, Any]]:
        """分析外部鏈接"""
        link_pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>'
        links = re.findall(link_pattern, content, re.IGNORECASE)
        
        external_links = []
        for link in links:
            if (link.startswith('http://') or link.startswith('https://')) and self.site_url not in link:
                external_links.append(link)
        
        details = {
            'total': len(external_links),
            'links': external_links[:5],
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        std = SEO_STANDARDS['links']
        
        if len(external_links) > std['max_external_links']:
            details['issues'].append({
                'priority': 'low',
                'message': f'外部鏈接較多（{len(external_links)} 個），可能影響頁面權重傳遞',
            })
            score = max(80, 100 - (len(external_links) - std['max_external_links']) * 2)
        elif len(external_links) > 0:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'外部鏈接數量合理（{len(external_links)} 個），建議添加 rel="nofollow" 屬性',
            })
        
        return round(score, 1), details
    
    def _analyze_url(self, url: str) -> Tuple[float, Dict[str, Any]]:
        """分析 URL 結構"""
        details = {
            'url': url,
            'length': len(url),
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        # 檢查長度
        if len(url) > 100:
            details['issues'].append({
                'priority': 'medium',
                'message': f'URL 過長（{len(url)} 字符）',
            })
            score -= 20
        
        # 檢查是否包含參數
        if '?' in url or '&' in url:
            details['recommendations'].append({
                'priority': 'low',
                'message': 'URL 包含查詢參數，建議使用友好的 URL 結構',
            })
            score -= 10
        
        # 檢查深度（斜線數量）
        depth = url.count('/') - 3  # 減去 http://domain.com/
        if depth > 4:
            details['recommendations'].append({
                'priority': 'low',
                'message': f'URL 深度較深（{depth} 層），建議保持淺層結構',
            })
            score -= 5
        
        # 檢查是否包含關鍵詞（相對 URL 部分）
        url_path = url.replace(self.site_url, '').strip('/')
        if not url_path or url_path in ['', '/']:
            # 首頁，不需要檢查
            pass
        elif re.match(r'^[a-z0-9\-/]+$', url_path, re.IGNORECASE):
            details['recommendations'].append({
                'priority': 'low',
                'message': 'URL 結構清晰，使用小寫字母和連字符',
            })
        
        return max(0, round(score, 1)), details
    
    def _analyze_meta_tags(self, page: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """分析 Meta 標籤完整性"""
        details = {
            'has_description': bool(page.get('seo', {}).get('description')),
            'has_keywords': bool(page.get('seo', {}).get('keywords')),
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        # 檢查 Open Graph（需要在模板中檢查，這裡僅提示）
        details['recommendations'].append({
            'priority': 'low',
            'message': '建議添加 Open Graph 標籤以改善社交媒體分享效果',
        })
        score -= 10
        
        # 檢查 Twitter Cards
        details['recommendations'].append({
            'priority': 'low',
            'message': '建議添加 Twitter Card 標籤',
        })
        score -= 10
        
        return round(score, 1), details
    
    def _analyze_mobile_friendliness(self, page: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """分析移動端友好性"""
        # 檢查 viewport meta（通常在 base-layout 中，這裡假設有）
        details = {
            'viewport_expected': True,  # base-layout.njk 中應該有
            'issues': [],
            'recommendations': [],
        }
        score = 100
        
        details['recommendations'].append({
            'priority': 'low',
            'message': '建議確保 viewport meta 標籤已設置（通常已在 base-layout 中）',
        })
        
        return score, details
    
    def _check_cross_page_issues(self):
        """檢查跨頁面問題"""
        # 檢查重複的 title
        titles = defaultdict(list)
        descriptions = defaultdict(list)
        
        for page in self.pages:
            title = page.get('title', '')
            if title:
                titles[title].append(page['url'])
            
            description = page.get('seo', {}).get('description', '')
            if description:
                descriptions[description].append(page['url'])
        
        # 重複 title
        for title, urls in titles.items():
            if len(urls) > 1:
                self.issues.append({
                    'type': 'duplicate_title',
                    'priority': 'high',
                    'message': f'標題重複: "{title}"',
                    'affected_pages': urls[:5],
                    'count': len(urls),
                })
        
        # 重複 description
        for desc, urls in descriptions.items():
            if len(urls) > 1:
                self.issues.append({
                    'type': 'duplicate_description',
                    'priority': 'medium',
                    'message': f'描述重複（出現在 {len(urls)} 個頁面）',
                    'affected_pages': urls[:3],
                    'count': len(urls),
                })
    
    def _generate_stats(self) -> Dict[str, Any]:
        """生成統計數據"""
        if not self.pages:
            return {}
        
        scores = [p['seo_analysis']['overall_score'] for p in self.pages]
        all_scores = {key: [] for key in ['title', 'description', 'keywords', 'h1', 'heading_structure', 
                                          'content', 'images', 'internal_links', 'external_links', 'url', 
                                          'meta_tags', 'mobile']}
        
        for page in self.pages:
            for key in all_scores:
                if key in page['seo_analysis']['scores']:
                    all_scores[key].append(page['seo_analysis']['scores'][key])
        
        category_averages = {
            key: round(sum(values) / len(values), 1) if values else 0
            for key, values in all_scores.items()
        }
        
        # 統計問題
        total_issues = sum(len(p['seo_analysis']['issues']) for p in self.pages)
        pages_with_issues = sum(1 for p in self.pages if p['seo_analysis']['issues'])
        
        # 問題優先級統計
        issue_priority_count = {'high': 0, 'medium': 0, 'low': 0}
        for page in self.pages:
            for issue in page['seo_analysis']['issues']:
                priority = issue.get('priority', 'low')
                issue_priority_count[priority] = issue_priority_count.get(priority, 0) + 1
        
        return {
            'overall': {
                'average_score': round(sum(scores) / len(scores), 1),
                'min_score': round(min(scores), 1),
                'max_score': round(max(scores), 1),
                'median_score': round(sorted(scores)[len(scores) // 2], 1) if scores else 0,
            },
            'category_averages': category_averages,
            'pages_with_issues': pages_with_issues,
            'total_issues': total_issues,
            'issue_priority_count': issue_priority_count,
            'total_pages': len(self.pages),
        }


def generate_detailed_report(audit_result: Dict[str, Any]) -> str:
    """生成詳細的 Markdown 報告"""
    lines = []
    
    lines.append("# 📊 全面 SEO 審計報告")
    lines.append("")
    lines.append(f"**生成時間**: {audit_result['timestamp']}")
    lines.append(f"**網站 URL**: {audit_result['site_url']}")
    lines.append(f"**總頁面數**: {audit_result['total_pages']}")
    lines.append("")
    
    # 總體統計
    stats = audit_result['stats']
    overall_stats = stats.get('overall', {})
    
    lines.append("## 📈 總體統計")
    lines.append("")
    lines.append(f"- **平均 SEO 分數**: {overall_stats.get('average_score', 0)}/100")
    lines.append(f"- **最低分數**: {overall_stats.get('min_score', 0)}/100")
    lines.append(f"- **最高分數**: {overall_stats.get('max_score', 0)}/100")
    lines.append(f"- **中位數分數**: {overall_stats.get('median_score', 0)}/100")
    lines.append(f"- **有問題的頁面**: {stats.get('pages_with_issues', 0)}/{audit_result['total_pages']}")
    lines.append(f"- **總問題數**: {stats.get('total_issues', 0)}")
    lines.append("")
    
    # 分類平均分數
    category_averages = stats.get('category_averages', {})
    if category_averages:
        lines.append("### 分類平均分數")
        lines.append("")
        category_names = {
            'title': '標題 (Title)',
            'description': '描述 (Description)',
            'keywords': '關鍵詞 (Keywords)',
            'h1': 'H1 標籤',
            'heading_structure': '標題結構',
            'content': '內容質量',
            'images': '圖片優化',
            'internal_links': '內部鏈接',
            'external_links': '外部鏈接',
            'url': 'URL 結構',
            'meta_tags': 'Meta 標籤',
            'mobile': '移動端友好',
        }
        
        for key, avg_score in sorted(category_averages.items(), key=lambda x: x[1]):
            name = category_names.get(key, key)
            lines.append(f"- **{name}**: {avg_score}/100")
        lines.append("")
    
    # 問題優先級統計
    issue_priority = stats.get('issue_priority_count', {})
    if issue_priority:
        lines.append("### 問題優先級統計")
        lines.append("")
        lines.append(f"- 🔴 **高優先級**: {issue_priority.get('high', 0)} 個")
        lines.append(f"- 🟡 **中優先級**: {issue_priority.get('medium', 0)} 個")
        lines.append(f"- 🟢 **低優先級**: {issue_priority.get('low', 0)} 個")
        lines.append("")
    
    # 頁面詳情
    lines.append("## 📄 頁面詳情")
    lines.append("")
    lines.append("按 SEO 分數排序（從低到高）")
    lines.append("")
    
    sorted_pages = sorted(audit_result['pages'], key=lambda x: x['seo_analysis']['overall_score'])
    
    for page in sorted_pages:
        url = page['url']
        title = page.get('title', '無標題')
        score = page['seo_analysis']['overall_score']
        analysis = page['seo_analysis']
        
        # 分數顏色標記
        if score >= 80:
            score_badge = f"🟢 {score}"
        elif score >= 60:
            score_badge = f"🟡 {score}"
        else:
            score_badge = f"🔴 {score}"
        
        lines.append(f"### {title} {score_badge}")
        lines.append("")
        lines.append(f"- **URL**: {url}")
        lines.append(f"- **文件**: `{page['file_path']}`")
        lines.append(f"- **頁面類型**: {page.get('page_type', 'unknown')}")
        lines.append("")
        
        # 各項分數詳情
        lines.append("#### 📊 分項評分")
        lines.append("")
        score_names = {
            'title': '標題 (Title)',
            'description': '描述 (Description)',
            'keywords': '關鍵詞',
            'h1': 'H1 標籤',
            'heading_structure': '標題結構',
            'content': '內容質量',
            'images': '圖片優化',
            'internal_links': '內部鏈接',
            'external_links': '外部鏈接',
            'url': 'URL 結構',
            'meta_tags': 'Meta 標籤',
            'mobile': '移動端友好',
        }
        
        for key, name in score_names.items():
            if key in analysis['scores']:
                score_val = analysis['scores'][key]
                detail = analysis['details'].get(key, {})
                
                # 根據類別顯示額外信息
                if key == 'title' and 'length' in detail:
                    lines.append(f"- **{name}**: {score_val}/100 ({detail['length']} 字符)")
                elif key == 'description' and 'length' in detail:
                    lines.append(f"- **{name}**: {score_val}/100 ({detail['length']} 字符)")
                elif key == 'h1' and 'count' in detail:
                    lines.append(f"- **{name}**: {score_val}/100 ({detail['count']} 個)")
                elif key == 'content' and 'length' in detail:
                    lines.append(f"- **{name}**: {score_val}/100 ({detail['length']} 字符)")
                elif key == 'images' and 'total' in detail:
                    lines.append(f"- **{name}**: {score_val}/100 ({detail['total']} 張圖片, {detail.get('with_alt', 0)} 張有 alt)")
                elif key == 'internal_links' and 'total' in detail:
                    lines.append(f"- **{name}**: {score_val}/100 ({detail['total']} 個內部鏈接)")
                else:
                    lines.append(f"- **{name}**: {score_val}/100")
        
        lines.append("")
        
        # 問題
        if analysis['issues']:
            lines.append("#### ⚠️ 問題")
            lines.append("")
            # 按優先級排序
            sorted_issues = sorted(analysis['issues'], key=lambda x: {'high': 0, 'medium': 1, 'low': 2}.get(x.get('priority', 'low'), 3))
            for issue in sorted_issues:
                priority = issue.get('priority', 'low')
                priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(priority, '⚪')
                lines.append(f"- {priority_emoji} **{priority.upper()}**: {issue['message']}")
            lines.append("")
        
        # 建議
        if analysis['recommendations']:
            lines.append("#### 💡 建議")
            lines.append("")
            sorted_recs = sorted(analysis['recommendations'], key=lambda x: {'high': 0, 'medium': 1, 'low': 2}.get(x.get('priority', 'low'), 3))
            for rec in sorted_recs:
                priority = rec.get('priority', 'low')
                priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(priority, '⚪')
                lines.append(f"- {priority_emoji} **{priority.upper()}**: {rec['message']}")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # 全局問題
    if audit_result['issues']:
        lines.append("## 🔗 全局問題")
        lines.append("")
        for issue in audit_result['issues']:
            priority = issue.get('priority', 'low')
            priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(priority, '⚪')
            lines.append(f"### {priority_emoji} {issue['message']}")
            lines.append("")
            lines.append(f"**影響頁面數**: {issue.get('count', 0)}")
            lines.append("")
            lines.append("**受影響的頁面**:")
            for url in issue.get('affected_pages', [])[:5]:
                lines.append(f"- {url}")
            if issue.get('count', 0) > 5:
                lines.append(f"- ... 還有 {issue['count'] - 5} 個頁面")
            lines.append("")
    
    return '\n'.join(lines)


def main():
    """主函數"""
    # 讀取網站 URL
    metadata_file = PROJECT_ROOT / "src" / "_data" / "metadata.json"
    site_url = SITE_URL
    if metadata_file.exists():
        try:
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                site_url = metadata.get('url', SITE_URL)
        except:
            pass
    
    # 確保報告目錄存在
    REPORT_DIR.mkdir(exist_ok=True)
    
    # 執行審計
    auditor = ComprehensiveSEOAuditor(SRC_DIR, site_url)
    audit_result = auditor.audit()
    
    # 保存 JSON 報告
    json_report_path = REPORT_DIR / "comprehensive-seo-audit.json"
    with open(json_report_path, 'w', encoding='utf-8') as f:
        json.dump(audit_result, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON 報告已保存: {json_report_path}")
    
    # 生成並保存 Markdown 報告
    md_report = generate_detailed_report(audit_result)
    md_report_path = REPORT_DIR / "comprehensive-seo-audit.md"
    with open(md_report_path, 'w', encoding='utf-8') as f:
        f.write(md_report)
    print(f"✅ Markdown 報告已保存: {md_report_path}")
    
    # 輸出摘要
    print("\n" + "="*60)
    print("📊 全面 SEO 審計摘要")
    print("="*60)
    stats = audit_result['stats']
    overall = stats.get('overall', {})
    print(f"總頁面數: {audit_result['total_pages']}")
    print(f"平均分數: {overall.get('average_score', 0)}/100")
    print(f"最低分數: {overall.get('min_score', 0)}/100")
    print(f"最高分數: {overall.get('max_score', 0)}/100")
    print(f"有問題的頁面: {stats.get('pages_with_issues', 0)}/{audit_result['total_pages']}")
    print(f"總問題數: {stats.get('total_issues', 0)}")
    
    # 顯示最需要改進的前5個頁面
    sorted_pages = sorted(audit_result['pages'], key=lambda x: x['seo_analysis']['overall_score'])
    print("\n最需要改進的5個頁面:")
    for i, page in enumerate(sorted_pages[:5], 1):
        print(f"  {i}. {page.get('title', '無標題')[:40]} - {page['seo_analysis']['overall_score']}/100")
    
    print("="*60)


if __name__ == '__main__':
    main()
