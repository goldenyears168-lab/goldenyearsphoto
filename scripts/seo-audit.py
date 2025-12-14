#!/usr/bin/env python3
"""
SEO 審計腳本
掃描所有 .njk 頁面文件，分析 SEO 元素，生成詳細審計報告
包含 Schema.org 結構化數據建議
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from collections import defaultdict
from datetime import datetime

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"
REPORT_DIR = PROJECT_ROOT / "report"

# 網站 URL（從 metadata.json 讀取）
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
}


class SEOAuditor:
    """SEO 審計器"""
    
    def __init__(self, src_dir: Path, site_url: str):
        self.src_dir = src_dir
        self.site_url = site_url
        self.pages: List[Dict[str, Any]] = []
        self.issues: List[Dict[str, Any]] = []
        self.schema_recommendations: Dict[str, Any] = {}
        
    def audit(self) -> Dict[str, Any]:
        """執行完整 SEO 審計"""
        print("🔍 開始 SEO 審計...\n")
        
        # 1. 掃描所有 .njk 頁面文件
        print("📁 掃描頁面文件...")
        page_files = self._scan_pages()
        print(f"   找到 {len(page_files)} 個頁面文件\n")
        
        # 2. 解析每個頁面的 front matter
        print("📄 解析頁面 front matter...")
        for file_path in page_files:
            page_data = self._parse_page(file_path)
            if page_data:
                self.pages.append(page_data)
        print(f"   成功解析 {len(self.pages)} 個頁面\n")
        
        # 3. 分析 SEO 元素
        print("🔎 分析 SEO 元素...")
        for page in self.pages:
            page['seo_analysis'] = self._analyze_seo(page)
            page['schema_recommendation'] = self._recommend_schema(page)
        print("   SEO 分析完成\n")
        
        # 4. 檢查重複和一致性
        print("🔗 檢查重複和一致性...")
        self._check_duplicates()
        print("   檢查完成\n")
        
        # 5. 生成總體統計
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
            'schema_recommendations': self.schema_recommendations,
        }
    
    def _scan_pages(self) -> List[Path]:
        """掃描所有 .njk 頁面文件"""
        pages = []
        
        for file_path in self.src_dir.rglob("*.njk"):
            # 排除模板和部分文件
            rel_path = file_path.relative_to(self.src_dir)
            if str(rel_path).startswith("_includes/"):
                continue
            if str(rel_path).startswith("_data/"):
                continue
            pages.append(file_path)
        
        return sorted(pages)
    
    def _parse_page(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """解析頁面的 front matter"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 提取 front matter（YAML 在 --- 之間）
            front_matter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
            
            if not front_matter_match:
                return None
            
            front_matter_text = front_matter_match.group(1)
            body_content = front_matter_match.group(2)
            
            # 解析 YAML（使用簡單解析器）
            try:
                front_matter = self._parse_simple_yaml(front_matter_text)
            except Exception as e:
                print(f"   ⚠️  YAML 解析錯誤 ({file_path.relative_to(PROJECT_ROOT)}): {e}")
                return None
            
            # 推斷 URL
            rel_path = file_path.relative_to(self.src_dir)
            url = self._infer_url(rel_path, front_matter)
            
            # 推斷頁面類型
            page_type = self._infer_page_type(rel_path, front_matter)
            
            # 提取 H1 標籤（如果有的話）
            h1_tags = self._extract_h1_tags(body_content)
            
            return {
                'file_path': str(file_path.relative_to(PROJECT_ROOT)),
                'rel_path': str(rel_path),
                'url': url,
                'page_type': page_type,
                'front_matter': front_matter,
                'title': front_matter.get('title', ''),
                'seo': front_matter.get('seo', {}),
                'h1_tags': h1_tags,
                'body_length': len(body_content),
            }
        except Exception as e:
            print(f"   ⚠️  解析錯誤 ({file_path.relative_to(PROJECT_ROOT)}): {e}")
            return None
    
    def _infer_url(self, rel_path: Path, front_matter: Dict) -> str:
        """推斷頁面 URL"""
        # 優先使用 front matter 中的 permalink
        if 'permalink' in front_matter:
            return front_matter['permalink']
        
        # 根據文件路徑推斷
        url_path = str(rel_path).replace('\\', '/')
        
        # 移除 .njk 擴展名
        if url_path.endswith('.njk'):
            url_path = url_path[:-4]
        
        # index.njk 轉換為目錄
        if url_path.endswith('/index'):
            url_path = url_path[:-6]
        elif url_path == 'index':
            url_path = ''
        
        # 構建完整 URL
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
    
    def _parse_simple_yaml(self, yaml_text: str) -> Dict[str, Any]:
        """簡單的 YAML 解析器（用於解析 front matter）
        支持基本格式：key: value 和嵌套結構（seo: description: ...）
        """
        result = {}
        lines = yaml_text.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            
            # 跳過空行和註釋
            if not stripped or stripped.startswith('#'):
                i += 1
                continue
            
            # 計算縮進（使用空格數）
            indent = len(line) - len(line.lstrip())
            
            # 解析 key: value
            if ':' in line:
                colon_idx = line.index(':')
                key = line[:colon_idx].strip()
                value_part = line[colon_idx + 1:].strip()
                
                # 檢查是否是嵌套對象（下一行有更多縮進）
                is_object = False
                if i + 1 < len(lines):
                    next_line = lines[i + 1]
                    next_stripped = next_line.strip()
                    if next_stripped and ':' in next_line:
                        next_indent = len(next_line) - len(next_line.lstrip())
                        if next_indent > indent:
                            is_object = True
                
                if is_object:
                    # 這是一個對象，遞歸解析
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
                    i -= 1  # 回退一行，因為外層循環會增加
                    
                    nested_text = '\n'.join(nested_lines)
                    result[key] = self._parse_simple_yaml(nested_text)
                else:
                    # 處理普通值
                    value = value_part
                    
                    # 處理多行值（| 或 >）
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
                        # 移除引號
                        if (value.startswith('"') and value.endswith('"')) or \
                           (value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]
                    
                    result[key] = value
            
            i += 1
        
        return result
    
    def _extract_h1_tags(self, content: str) -> List[str]:
        """提取 H1 標籤"""
        h1_pattern = r'<h1[^>]*>(.*?)</h1>'
        matches = re.findall(h1_pattern, content, re.DOTALL | re.IGNORECASE)
        # 清理 HTML 標籤
        h1_tags = [re.sub(r'<[^>]+>', '', h1).strip() for h1 in matches]
        return h1_tags
    
    def _analyze_seo(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """分析頁面的 SEO 元素"""
        analysis = {
            'title_score': 0,
            'description_score': 0,
            'keywords_score': 0,
            'h1_score': 0,
            'overall_score': 0,
            'issues': [],
            'recommendations': [],
        }
        
        # 1. Title 分析
        title = page.get('title', '')
        title_analysis = self._analyze_title(title)
        analysis['title'] = title_analysis
        analysis['title_score'] = title_analysis['score']
        
        # 2. Description 分析
        description = page.get('seo', {}).get('description', '')
        desc_analysis = self._analyze_description(description)
        analysis['description'] = desc_analysis
        analysis['description_score'] = desc_analysis['score']
        
        # 3. Keywords 分析
        keywords = page.get('seo', {}).get('keywords', '')
        keywords_analysis = self._analyze_keywords(keywords)
        analysis['keywords'] = keywords_analysis
        analysis['keywords_score'] = keywords_analysis['score']
        
        # 4. H1 分析
        h1_analysis = self._analyze_h1(page.get('h1_tags', []))
        analysis['h1'] = h1_analysis
        analysis['h1_score'] = h1_analysis['score']
        
        # 5. 計算總體分數
        analysis['overall_score'] = (
            analysis['title_score'] * 0.3 +
            analysis['description_score'] * 0.35 +
            analysis['keywords_score'] * 0.15 +
            analysis['h1_score'] * 0.2
        )
        
        # 收集問題和建議
        if title_analysis['issues']:
            analysis['issues'].extend(title_analysis['issues'])
        if desc_analysis['issues']:
            analysis['issues'].extend(desc_analysis['issues'])
        if keywords_analysis['issues']:
            analysis['issues'].extend(keywords_analysis['issues'])
        if h1_analysis['issues']:
            analysis['issues'].extend(h1_analysis['issues'])
        
        if title_analysis['recommendations']:
            analysis['recommendations'].extend(title_analysis['recommendations'])
        if desc_analysis['recommendations']:
            analysis['recommendations'].extend(desc_analysis['recommendations'])
        if keywords_analysis['recommendations']:
            analysis['recommendations'].extend(keywords_analysis['recommendations'])
        if h1_analysis['recommendations']:
            analysis['recommendations'].extend(h1_analysis['recommendations'])
        
        return analysis
    
    def _analyze_title(self, title: str) -> Dict[str, Any]:
        """分析 Title 標籤"""
        analysis = {
            'value': title,
            'length': len(title),
            'score': 0,
            'issues': [],
            'recommendations': [],
        }
        
        if not title:
            analysis['issues'].append({
                'priority': 'high',
                'message': '缺少 Title 標籤',
            })
            return analysis
        
        # 長度檢查
        length = len(title)
        std = SEO_STANDARDS['title']
        
        if length < std['min_length']:
            analysis['issues'].append({
                'priority': 'high',
                'message': f'Title 過短（{length} 字符，建議至少 {std["min_length"]} 字符）',
            })
            score = (length / std['min_length']) * 50
        elif length > std['max_length']:
            analysis['issues'].append({
                'priority': 'medium',
                'message': f'Title 過長（{length} 字符，建議不超過 {std["max_length"]} 字符）',
            })
            # 超過長度時分數遞減
            excess = length - std['max_length']
            score = max(50, 100 - (excess * 2))
        else:
            # 最佳長度範圍內
            if std['min_length'] <= length <= std['optimal_length']:
                score = 100
            else:
                # 在 optimal 和 max 之間，分數略微降低
                score = 90
            analysis['recommendations'].append({
                'priority': 'low',
                'message': f'Title 長度良好（{length} 字符）',
            })
        
        # 檢查是否包含品牌名
        if '好時有影' not in title and 'Golden Years' not in title:
            analysis['recommendations'].append({
                'priority': 'low',
                'message': '建議在 Title 中包含品牌名稱',
            })
            score *= 0.9
        
        # 檢查特殊字符
        if '｜' in title or '|' in title:
            # 分隔符使用良好
            pass
        else:
            analysis['recommendations'].append({
                'priority': 'low',
                'message': '可以考慮使用分隔符（｜或 |）分隔品牌和頁面標題',
            })
        
        analysis['score'] = round(score, 1)
        return analysis
    
    def _analyze_description(self, description: str) -> Dict[str, Any]:
        """分析 Meta Description"""
        analysis = {
            'value': description,
            'length': len(description),
            'score': 0,
            'issues': [],
            'recommendations': [],
        }
        
        if not description:
            analysis['issues'].append({
                'priority': 'high',
                'message': '缺少 Meta Description',
            })
            return analysis
        
        # 長度檢查
        length = len(description)
        std = SEO_STANDARDS['description']
        
        if length < std['min_length']:
            analysis['issues'].append({
                'priority': 'high',
                'message': f'Description 過短（{length} 字符，建議至少 {std["min_length"]} 字符）',
            })
            score = (length / std['min_length']) * 60
        elif length > std['max_length']:
            analysis['issues'].append({
                'priority': 'medium',
                'message': f'Description 過長（{length} 字符，建議不超過 {std["max_length"]} 字符，可能被截斷）',
            })
            excess = length - std['max_length']
            score = max(60, 100 - (excess * 2))
        else:
            score = 100
            analysis['recommendations'].append({
                'priority': 'low',
                'message': f'Description 長度良好（{length} 字符）',
            })
        
        # 檢查內容質量
        # 是否包含 CTA 詞彙
        cta_words = ['立即', '查看', '預約', '了解更多', '開始', 'Get', 'Try', 'Learn']
        has_cta = any(word in description for word in cta_words)
        if not has_cta:
            analysis['recommendations'].append({
                'priority': 'low',
                'message': '建議在 Description 中包含行動呼籲（CTA）',
            })
            score *= 0.95
        
        # 檢查是否包含關鍵詞
        if length > 50:
            # 對於較長的描述，關鍵詞檢查不那麼重要
            pass
        
        analysis['score'] = round(score, 1)
        return analysis
    
    def _analyze_keywords(self, keywords: str) -> Dict[str, Any]:
        """分析 Keywords"""
        analysis = {
            'value': keywords,
            'count': 0,
            'score': 0,
            'issues': [],
            'recommendations': [],
        }
        
        if not keywords:
            # Keywords 不是必須的，但建議提供
            analysis['recommendations'].append({
                'priority': 'low',
                'message': '建議添加 keywords 字段（雖然 Google 不再使用，但其他搜索引擎可能使用）',
            })
            analysis['score'] = 70  # 不影響太大
            return analysis
        
        # 解析關鍵詞（可能是逗號分隔的字串）
        if isinstance(keywords, str):
            keyword_list = [k.strip() for k in keywords.split(',') if k.strip()]
        elif isinstance(keywords, list):
            keyword_list = keywords
        else:
            keyword_list = []
        
        analysis['count'] = len(keyword_list)
        std = SEO_STANDARDS['keywords']
        
        if len(keyword_list) < std['min_count']:
            analysis['recommendations'].append({
                'priority': 'low',
                'message': f'關鍵詞數量較少（{len(keyword_list)} 個，建議 {std["min_count"]}-{std["max_count"]} 個）',
            })
            score = 80
        elif len(keyword_list) > std['max_count']:
            analysis['recommendations'].append({
                'priority': 'low',
                'message': f'關鍵詞數量較多（{len(keyword_list)} 個，建議不超過 {std["max_count"]} 個）',
            })
            score = 85
        else:
            score = 100
        
        analysis['score'] = round(score, 1)
        return analysis
    
    def _analyze_h1(self, h1_tags: List[str]) -> Dict[str, Any]:
        """分析 H1 標籤"""
        analysis = {
            'count': len(h1_tags),
            'tags': h1_tags,
            'score': 0,
            'issues': [],
            'recommendations': [],
        }
        
        if len(h1_tags) == 0:
            analysis['issues'].append({
                'priority': 'medium',
                'message': '頁面缺少 H1 標籤',
            })
            analysis['score'] = 0
        elif len(h1_tags) == 1:
            analysis['score'] = 100
            analysis['recommendations'].append({
                'priority': 'low',
                'message': f'H1 標籤良好: "{h1_tags[0]}"',
            })
        else:
            # 多個 H1（不推薦）
            analysis['issues'].append({
                'priority': 'medium',
                'message': f'頁面包含多個 H1 標籤（{len(h1_tags)} 個），建議只使用一個',
            })
            analysis['score'] = 50
        
        return analysis
    
    def _recommend_schema(self, page: Dict[str, Any]) -> Dict[str, Any]:
        """推薦 Schema.org 結構化數據"""
        page_type = page.get('page_type', 'other')
        url = page.get('url', '')
        title = page.get('title', '')
        description = page.get('seo', {}).get('description', '')
        
        schemas = []
        
        if page_type == 'home':
            # Organization + WebSite
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                'name': '好時有影 Golden Years',
                'url': self.site_url,
                'logo': f'{self.site_url}/assets/images/ui/好時有影logo藍字透明底.png',
                'sameAs': [
                    'https://www.instagram.com/goldenyears_studio/'
                ],
                'contactPoint': {
                    '@type': 'ContactPoint',
                    'telephone': '+886-2-2709-2224',
                    'contactType': 'customer service',
                    'areaServed': 'TW',
                    'availableLanguage': ['Chinese', 'English']
                },
                'address': {
                    '@type': 'PostalAddress',
                    'addressCountry': 'TW',
                    'addressLocality': '台北市',
                    'addressRegion': '台北市',
                }
            })
            
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                'name': '好時有影 Golden Years',
                'url': self.site_url,
                'potentialAction': {
                    '@type': 'SearchAction',
                    'target': {
                        '@type': 'EntryPoint',
                        'urlTemplate': f'{self.site_url}/search?q={{search_term_string}}'
                    },
                    'query-input': 'required name=search_term_string'
                }
            })
            
        elif page_type == 'service':
            # Service + LocalBusiness
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'Service',
                'name': title,
                'description': description,
                'provider': {
                    '@type': 'LocalBusiness',
                    'name': '好時有影 Golden Years',
                    'url': self.site_url,
                },
                'areaServed': {
                    '@type': 'City',
                    'name': '台北市'
                },
                'serviceType': 'Professional Photography'
            })
            
        elif page_type == 'blog':
            # BlogPosting 或 Article
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                'headline': title,
                'description': description,
                'url': url,
                'author': {
                    '@type': 'Organization',
                    'name': '好時有影 Golden Years'
                },
                'publisher': {
                    '@type': 'Organization',
                    'name': '好時有影 Golden Years',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': f'{self.site_url}/assets/images/ui/好時有影logo藍字透明底.png'
                    }
                },
                'datePublished': datetime.now().isoformat(),
                'inLanguage': 'zh-Hant'
            })
            
        elif page_type == 'about':
            # AboutPage + Organization
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'AboutPage',
                'name': title,
                'description': description,
                'url': url,
                'mainEntity': {
                    '@type': 'Organization',
                    'name': '好時有影 Golden Years',
                    'url': self.site_url,
                }
            })
            
        elif page_type == 'booking':
            # ReservationPage
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'ReservationPage',
                'name': title,
                'description': description,
                'url': url,
            })
            
        elif page_type == 'pricing':
            # WebPage + PriceSpecification
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                'name': title,
                'description': description,
                'url': url,
            })
        
        # 如果沒有特定類型，至少提供基本 WebPage
        if not schemas:
            schemas.append({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                'name': title,
                'description': description,
                'url': url,
            })
        
        return {
            'recommended_types': [s['@type'] for s in schemas],
            'schema_json': schemas,
            'implementation': self._generate_schema_html(schemas),
        }
    
    def _generate_schema_html(self, schemas: List[Dict]) -> str:
        """生成 Schema.org JSON-LD HTML 代碼"""
        html_parts = []
        for schema in schemas:
            json_str = json.dumps(schema, ensure_ascii=False, indent=2)
            html_parts.append(f'<script type="application/ld+json">\n{json_str}\n</script>')
        return '\n\n'.join(html_parts)
    
    def _check_duplicates(self):
        """檢查重複的 title 和 description"""
        titles = defaultdict(list)
        descriptions = defaultdict(list)
        
        for page in self.pages:
            title = page.get('title', '')
            if title:
                titles[title].append(page['url'])
            
            description = page.get('seo', {}).get('description', '')
            if description:
                descriptions[description].append(page['url'])
        
        # 檢查重複的 title
        for title, urls in titles.items():
            if len(urls) > 1:
                self.issues.append({
                    'type': 'duplicate_title',
                    'priority': 'high',
                    'message': f'標題重複: "{title}"',
                    'affected_pages': urls,
                })
        
        # 檢查重複的 description
        for desc, urls in descriptions.items():
            if len(urls) > 1:
                self.issues.append({
                    'type': 'duplicate_description',
                    'priority': 'medium',
                    'message': f'描述重複（出現在 {len(urls)} 個頁面）',
                    'affected_pages': urls[:3],  # 只顯示前3個
                })
    
    def _generate_stats(self) -> Dict[str, Any]:
        """生成統計數據"""
        if not self.pages:
            return {}
        
        scores = [p['seo_analysis']['overall_score'] for p in self.pages]
        
        return {
            'average_score': round(sum(scores) / len(scores), 1),
            'min_score': round(min(scores), 1),
            'max_score': round(max(scores), 1),
            'pages_with_issues': sum(1 for p in self.pages if p['seo_analysis']['issues']),
            'total_issues': sum(len(p['seo_analysis']['issues']) for p in self.pages),
            'pages_with_schema_recommendations': len([p for p in self.pages if p.get('schema_recommendation')]),
        }


def generate_markdown_report(audit_result: Dict[str, Any]) -> str:
    """生成 Markdown 格式的報告"""
    lines = []
    
    lines.append("# SEO 審計報告")
    lines.append("")
    lines.append(f"**生成時間**: {audit_result['timestamp']}")
    lines.append(f"**網站 URL**: {audit_result['site_url']}")
    lines.append(f"**總頁面數**: {audit_result['total_pages']}")
    lines.append("")
    
    # 總體統計
    stats = audit_result['stats']
    lines.append("## 📊 總體統計")
    lines.append("")
    lines.append(f"- **平均 SEO 分數**: {stats.get('average_score', 0)}/100")
    lines.append(f"- **最低分數**: {stats.get('min_score', 0)}/100")
    lines.append(f"- **最高分數**: {stats.get('max_score', 0)}/100")
    lines.append(f"- **有問題的頁面**: {stats.get('pages_with_issues', 0)}/{audit_result['total_pages']}")
    lines.append(f"- **總問題數**: {stats.get('total_issues', 0)}")
    lines.append("")
    
    # 頁面詳情
    lines.append("## 📄 頁面詳情")
    lines.append("")
    
    # 按分數排序
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
        
        # 各項分數
        lines.append("#### 分項評分")
        lines.append("")
        lines.append(f"- Title: {analysis['title_score']}/100 ({analysis['title']['length']} 字符)")
        lines.append(f"- Description: {analysis['description_score']}/100 ({analysis['description']['length']} 字符)")
        lines.append(f"- Keywords: {analysis['keywords_score']}/100")
        lines.append(f"- H1: {analysis['h1_score']}/100 ({analysis['h1']['count']} 個)")
        lines.append("")
        
        # 問題
        if analysis['issues']:
            lines.append("#### ⚠️ 問題")
            lines.append("")
            for issue in analysis['issues']:
                priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(issue['priority'], '⚪')
                lines.append(f"- {priority_emoji} **{issue['priority'].upper()}**: {issue['message']}")
            lines.append("")
        
        # 建議
        if analysis['recommendations']:
            lines.append("#### 💡 建議")
            lines.append("")
            for rec in analysis['recommendations']:
                priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(rec['priority'], '⚪')
                lines.append(f"- {priority_emoji} **{rec['priority'].upper()}**: {rec['message']}")
            lines.append("")
        
        # Schema.org 建議
        schema_rec = page.get('schema_recommendation', {})
        if schema_rec:
            lines.append("#### 📋 Schema.org 結構化數據建議")
            lines.append("")
            lines.append(f"**推薦類型**: {', '.join(schema_rec['recommended_types'])}")
            lines.append("")
            lines.append("**實現代碼**:")
            lines.append("")
            lines.append("```html")
            lines.append(schema_rec['implementation'])
            lines.append("```")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # 全局問題
    if audit_result['issues']:
        lines.append("## 🔗 全局問題")
        lines.append("")
        for issue in audit_result['issues']:
            priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(issue['priority'], '⚪')
            lines.append(f"### {priority_emoji} {issue['message']}")
            lines.append("")
            lines.append("**受影響的頁面**:")
            for url in issue.get('affected_pages', [])[:5]:
                lines.append(f"- {url}")
            if len(issue.get('affected_pages', [])) > 5:
                lines.append(f"- ... 還有 {len(issue['affected_pages']) - 5} 個頁面")
            lines.append("")
    
    return '\n'.join(lines)


def main():
    """主函數"""
    # 讀取 metadata.json 獲取網站 URL
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
    auditor = SEOAuditor(SRC_DIR, site_url)
    audit_result = auditor.audit()
    
    # 保存 JSON 報告
    json_report_path = REPORT_DIR / "seo-audit-report.json"
    with open(json_report_path, 'w', encoding='utf-8') as f:
        json.dump(audit_result, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON 報告已保存: {json_report_path}")
    
    # 生成並保存 Markdown 報告
    md_report = generate_markdown_report(audit_result)
    md_report_path = REPORT_DIR / "seo-audit-report.md"
    with open(md_report_path, 'w', encoding='utf-8') as f:
        f.write(md_report)
    print(f"✅ Markdown 報告已保存: {md_report_path}")
    
    # 輸出摘要
    print("\n" + "="*60)
    print("📊 SEO 審計摘要")
    print("="*60)
    stats = audit_result['stats']
    print(f"總頁面數: {audit_result['total_pages']}")
    print(f"平均分數: {stats.get('average_score', 0)}/100")
    print(f"有問題的頁面: {stats.get('pages_with_issues', 0)}/{audit_result['total_pages']}")
    print(f"總問題數: {stats.get('total_issues', 0)}")
    print("="*60)


if __name__ == '__main__':
    main()
