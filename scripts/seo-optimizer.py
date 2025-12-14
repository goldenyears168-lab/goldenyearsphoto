#!/usr/bin/env python3
"""
SEO 優化腳本
根據 SEO 改善方案自動優化頁面的 front matter
"""

import re
from pathlib import Path
from typing import Dict, Tuple, Optional

PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"

# SEO 優化建議（根據頁面類型）
SEO_IMPROVEMENTS = {
    'index.njk': {
        'title': '台北專業形象照｜韓式證件照、履歷照服務 - 好時有影 Golden Years',
        'description': '台北專業形象照攝影首選｜韓式證件照、履歷照、畢業照服務。好時有影位於中山/公館，為醫師、律師、企業主打造職場第一印象。立即預約拍攝，查看價目表與作品集。',
        'keywords': '韓式證件照, 專業形象照, 履歷照, 畢業照, LinkedIn頭像, 台北攝影, 中山攝影, 公館攝影, 形象照推薦',
    },
    'services/portrait.njk': {
        'title': '專業形象照推薦｜LinkedIn履歷照、醫師律師形象照 - 好時有影',
        'description': '專業形象照不能用AI生成，您的職場第一印象需要真實呈現。好時有影為醫師、律師、講師、企業主提供LinkedIn履歷照服務，位於台北中山/公館，立即預約拍攝，打造專業個人品牌形象。',
        'keywords': '台北專業形象照推薦, 專業形象照, LinkedIn頭像, 履歷照, 醫師形象照, 律師形象照, 求職形象照, 個人品牌攝影, 職場人像寫真',
    },
    'about.njk': {
        'title': '關於我們｜專業攝影團隊介紹 - 好時有影 Golden Years',
        'description': '認識好時有影專業攝影團隊：經驗豐富的攝影師、專業造型師與修圖師，為您打造真實又好看的職場形象照。我們相信一張好的形象照是職涯自信的起點，立即了解我們的服務理念與團隊故事。',
        'keywords': '好時有影團隊, 攝影師介紹, 造型師介紹, 修圖師, 專業攝影團隊, 台北照相館, 形象照攝影師推薦',
    },
    'price-list.njk': {
        'title': '價目表｜韓式證件照、專業形象照價格 - 好時有影',
        'description': '好時有影價格透明公開，韓式證件照、專業形象照完整價目表。提供急件服務，所有價格含妝髮與精修，立即查看各項服務價格，選擇最適合的拍攝方案。',
        'keywords': '好時有影價目表, 證件照價格, 形象照價格, 韓式證件照價格, 專業形象照費用, 台北攝影價格',
    },
    'booking/index.njk': {
        'title': '立即預約｜中山店/公館店專業形象照拍攝 - 好時有影',
        'description': '好時有影預約系統，選擇中山店或公館店進行專業形象照拍攝。線上預約流程簡單，提供完整服務說明與注意事項，立即選擇適合的時間地點，開始您的職場形象打造之旅。',
        'keywords': '好時有影預約, 中山店預約, 公館店預約, 形象照預約, 證件照預約, 台北攝影預約',
    },
    'booking/zhongshan.njk': {
        'title': '預約中山店｜台北專業形象照拍攝服務 - 好時有影',
        'description': '好時有影中山店位於捷運中山站2號出口，提供韓式證件照、專業形象照服務。交通便利，專業團隊為您打造職場第一印象，立即預約拍攝時間，體驗專業攝影服務。',
        'keywords': '好時有影中山店, 中山站攝影, 台北中山形象照, 中山區證件照, 好時有影預約中山',
    },
    'booking/gongguan.njk': {
        'title': '預約公館店｜台北專業形象照拍攝服務 - 好時有影',
        'description': '好時有影公館店位於捷運公館站1號出口，提供韓式證件照、專業形象照服務。鄰近台大、師大，方便學生與職場人士預約，立即預約拍攝時間，打造專業個人形象。',
        'keywords': '好時有影公館店, 公館站攝影, 台北公館形象照, 公館區證件照, 好時有影預約公館, 台大攝影',
    },
    'guide/identity-test.njk': {
        'title': '身份原型測驗｜找出你的職場人格類型 - 好時有影',
        'description': '透過RIASEC六種人格類型測驗，找出你的職場身份原型。好時有影提供專業身份原型測驗，幫助你了解最適合的形象照風格，立即開始測驗，發現你的專業氣質。',
        'keywords': '身份原型測驗, RIASEC測驗, 職場人格測驗, 形象照風格, 職場氣質測試',
    },
    'guide/makeup-and-hair.njk': {
        'title': '專業妝髮服務｜形象照妝髮造型 - 好時有影',
        'description': '好時有影提供專業妝髮服務，由經驗豐富的彩妝師打造自然妝感，讓每一位顧客展現自信風采。妝髮服務包含在拍攝費用中，立即預約體驗專業妝髮造型服務。',
        'keywords': '形象照妝髮, 證件照化妝, 專業彩妝, 攝影妝髮, 台北化妝師, 形象照造型',
    },
    'guide/faq.njk': {
        'title': '常見問題 FAQ｜預約拍攝、修圖取件說明 - 好時有影',
        'description': '好時有影常見問題解答：預約流程、拍攝注意事項、修圖服務、取件方式等。完整解答您的疑問，讓您輕鬆了解服務流程，立即查看FAQ，或直接預約體驗專業形象照服務。',
        'keywords': '好時有影FAQ, 形象照常見問題, 證件照預約, 拍攝流程, 修圖服務, 取件方式',
    },
}


def parse_front_matter(content: str) -> Tuple[Dict, str, str]:
    """解析 front matter，返回 (front_matter_dict, front_matter_text, body)"""
    front_matter_match = re.match(r'^(---\s*\n)(.*?)(\n---\s*\n)(.*)$', content, re.DOTALL)
    
    if not front_matter_match:
        return {}, '', content
    
    front_matter_start = front_matter_match.group(1)
    front_matter_text = front_matter_match.group(2)
    front_matter_end = front_matter_match.group(3)
    body = front_matter_match.group(4)
    
    # 簡單解析 YAML
    front_matter = {}
    current_key = None
    current_value = []
    in_nested = False
    nested_key = None
    nested_level = 0
    
    for line in front_matter_text.split('\n'):
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            if current_value:
                current_value.append('')
            continue
        
        indent = len(line) - len(line.lstrip())
        
        # 檢查是否是嵌套結構（如 seo:）
        if ':' in line and not line.strip().startswith('|'):
            colon_idx = line.index(':')
            key = line[:colon_idx].strip()
            value_part = line[colon_idx + 1:].strip()
            
            if not value_part or value_part in ('|', '>'):
                # 這是嵌套對象的開始
                in_nested = True
                nested_key = key
                nested_level = indent
                if key not in front_matter:
                    front_matter[key] = {}
                continue
            else:
                # 普通鍵值對
                if in_nested and indent > nested_level:
                    # 嵌套對象內的鍵值對
                    if nested_key:
                        value = value_part.strip('"\'')
                        front_matter[nested_key][key] = value
                    continue
                else:
                    # 頂層鍵值對
                    in_nested = False
                    nested_key = None
                    if current_key:
                        front_matter[current_key] = '\n'.join(current_value).strip().strip('"\'')
                    current_key = key
                    current_value = [value_part]
        else:
            # 繼續當前的值（可能是多行字符串）
            if current_key:
                current_value.append(line[indent:])
    
    if current_key:
        front_matter[current_key] = '\n'.join(current_value).strip().strip('"\'')
    
    return front_matter, front_matter_text, body


def update_seo_fields(front_matter_text: str, improvements: Dict) -> str:
    """更新 front matter 中的 SEO 字段"""
    lines = front_matter_text.split('\n')
    result_lines = []
    i = 0
    title_updated = False
    seo_section_start = None
    seo_section_end = None
    in_seo_section = False
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # 檢查 title 行
        if stripped.startswith('title:') and 'title' in improvements:
            # 更新 title
            result_lines.append(f'title: "{improvements["title"]}"')
            title_updated = True
            i += 1
            continue
        
        # 檢查 seo: 行
        if stripped == 'seo:' or stripped.startswith('seo:'):
            seo_section_start = len(result_lines)
            in_seo_section = True
            result_lines.append('seo:')
            i += 1
            # 跳過嵌套內容，我們會替換它
            indent = len(line) - len(line.lstrip())
            while i < len(lines):
                next_line = lines[i]
                next_indent = len(next_line) - len(next_line.lstrip())
                if next_indent <= indent and next_line.strip():
                    break
                i += 1
            # 添加新的 seo 內容
            result_lines.append(f'  description: "{improvements.get("description", "")}"')
            result_lines.append(f'  keywords: "{improvements.get("keywords", "")}"')
            continue
        
        result_lines.append(line)
        i += 1
    
    # 如果 title 沒有被更新，添加它
    if not title_updated and 'title' in improvements:
        # 在 layout 之後添加 title
        for j, line in enumerate(result_lines):
            if line.strip().startswith('layout:'):
                result_lines.insert(j + 1, f'title: "{improvements["title"]}"')
                break
    
    # 如果 seo 部分沒有找到，添加它
    if seo_section_start is None and ('description' in improvements or 'keywords' in improvements):
        result_lines.append('seo:')
        result_lines.append(f'  description: "{improvements.get("description", "")}"')
        result_lines.append(f'  keywords: "{improvements.get("keywords", "")}"')
    
    return '\n'.join(result_lines)


def optimize_page(file_path: Path, improvements: Dict) -> bool:
    """優化單個頁面"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 解析 front matter
        front_matter_match = re.match(r'^(---\s*\n)(.*?)(\n---\s*\n)(.*)$', content, re.DOTALL)
        
        if not front_matter_match:
            print(f"  ⚠️  無法解析 front matter: {file_path.name}")
            return False
        
        front_matter_start = front_matter_match.group(1)
        front_matter_text = front_matter_match.group(2)
        front_matter_end = front_matter_match.group(3)
        body = front_matter_match.group(4)
        
        # 更新 SEO 字段
        updated_front_matter = update_seo_fields(front_matter_text, improvements)
        
        # 重組內容
        new_content = f"{front_matter_start}{updated_front_matter}{front_matter_end}{body}"
        
        # 寫回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"  ❌ 錯誤: {e}")
        return False


def main():
    """主函數"""
    print("🚀 開始 SEO 優化...\n")
    
    updated_count = 0
    skipped_count = 0
    
    for rel_path, improvements in SEO_IMPROVEMENTS.items():
        file_path = SRC_DIR / rel_path
        
        if not file_path.exists():
            print(f"⚠️  文件不存在: {rel_path}")
            skipped_count += 1
            continue
        
        print(f"📝 優化: {rel_path}")
        
        if optimize_page(file_path, improvements):
            print(f"  ✅ 完成")
            updated_count += 1
        else:
            print(f"  ❌ 失敗")
            skipped_count += 1
        print()
    
    print("="*60)
    print(f"✅ 優化完成: {updated_count} 個文件")
    if skipped_count > 0:
        print(f"⚠️  跳過: {skipped_count} 個文件")
    print("="*60)
    print("\n💡 建議：運行 SEO 審計腳本驗證優化效果")
    print("   python3 scripts/seo-audit.py")


if __name__ == '__main__':
    main()
