#!/usr/bin/env python3
"""
复制所有客服机器人相关文件到新文件夹
"""

import os
import shutil
from pathlib import Path

# 定义所有相关文件路径（相对于项目根目录）
CHATBOT_FILES = [
    # 前端 JavaScript
    "src/assets/js/gy-chatbot.js",
    "src/assets/js/gy-chatbot-init.js",
    "src/assets/js/CHATBOT_AUTO_OPEN_LOGIC.md",
    
    # 前端样式
    "src/assets/css/3-components/_c-gy-chatbot.scss",
    "src/assets/css/4-pages/_p-faq.scss",
    
    # 模板文件
    "src/_includes/base-layout.njk",
    "src/guide/faq.njk",
    
    # Cloudflare Pages Functions
    "functions/api/chat.ts",
    "functions/api/faq-menu.ts",
    "functions/api/lib/contextManager.ts",
    "functions/api/lib/knowledge.ts",
    "functions/api/lib/llm.ts",
    "functions/api/lib/responseTemplates.ts",
    "functions/package.json",
    "functions/DEPLOYMENT.md",
    "functions/TROUBLESHOOTING.md",
    "functions/QUICK_FIX_CHECKLIST.md",
    "functions/RATE_LIMITING.md",
    "functions/SECURITY_AUDIT.md",
    "functions/SECURITY_FIXES_SUMMARY.md",
    "functions/README.md",
    "functions/SETUP_COMPLETE.md",
    "functions/FIX_DEPENDENCY.md",
    
    # Backend（可选，但包含在列表中）
    "backend/src/index.ts",
    "backend/src/routes/chat.ts",
    "backend/src/services/contextManager.ts",
    "backend/src/services/knowledge.ts",
    "backend/src/services/llm.ts",
    "backend/src/services/responseTemplates.ts",
    "backend/src/middleware/rateLimit.ts",
    "backend/src/middleware/validateRequest.ts",
    "backend/src/middleware/errorHandler.ts",
    "backend/src/utils/logger.ts",
    "backend/package.json",
    "backend/README.md",
    "backend/TESTING.md",
    
    # 知识库文件
    "knowledge/services.json",
    "knowledge/personas.json",
    "knowledge/policies.json",
    "knowledge/contact_info.json",
    "knowledge/response_templates.json",
    "knowledge/service_summaries.json",
    "knowledge/emotion_templates.json",
    "knowledge/intent_nba_mapping.json",
    "knowledge/faq_detailed.json",
    "knowledge/schema_ids.md",
    "knowledge/README.md",
    
    # 配置文件
    "wrangler.toml",
    "package.json",  # 根目录的 package.json
    ".eleventy.js",
    
    # 工具脚本
    "scripts/diagnose-chatbot.mjs",
    "test_chatbot.py",
    
    # 文档
    "DEPLOYMENT_READINESS_AUDIT.md",
    "DEPLOYMENT_CHECKLIST.md",
    "QUICK_START.md",
    "docs/webchatbotplan.md",
    "docs/客服知識庫 gemini.md",
    "docs/IMPLEMENTATION_STATUS.md",
    "docs/NEXT_STEPS.md",
    "docs/engineering_prompts.md",
]

# 目标文件夹名称
TARGET_DIR = "chatbot_files_backup"

def copy_chatbot_files():
    """复制所有客服机器人相关文件"""
    
    # 获取项目根目录
    root_dir = Path(__file__).parent.absolute()
    target_path = root_dir / TARGET_DIR
    
    # 创建目标文件夹
    target_path.mkdir(exist_ok=True)
    print(f"📁 创建目标文件夹: {target_path}")
    
    copied_count = 0
    skipped_count = 0
    error_count = 0
    
    # 复制每个文件
    for file_path in CHATBOT_FILES:
        source = root_dir / file_path
        
        if not source.exists():
            print(f"⚠️  文件不存在，跳过: {file_path}")
            skipped_count += 1
            continue
        
        # 保持目录结构
        target = target_path / file_path
        target.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            # 复制文件
            shutil.copy2(source, target)
            print(f"✅ 已复制: {file_path}")
            copied_count += 1
        except Exception as e:
            print(f"❌ 复制失败: {file_path} - {e}")
            error_count += 1
    
    # 创建文件索引
    index_file = target_path / "CHATBOT_FILES_INDEX.md"
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write("# 客服机器人文件备份索引\n\n")
        f.write(f"**备份日期**: {Path(__file__).stat().st_mtime}\n\n")
        f.write(f"**总计文件数**: {copied_count}\n\n")
        f.write("## 文件列表\n\n")
        for file_path in CHATBOT_FILES:
            source = root_dir / file_path
            if source.exists():
                f.write(f"- ✅ {file_path}\n")
            else:
                f.write(f"- ⚠️  {file_path} (不存在)\n")
    
    print(f"\n📊 复制完成:")
    print(f"   ✅ 成功: {copied_count} 个文件")
    print(f"   ⚠️  跳过: {skipped_count} 个文件（不存在）")
    print(f"   ❌ 失败: {error_count} 个文件")
    print(f"\n📁 所有文件已复制到: {target_path}")
    print(f"📄 文件索引已创建: {index_file}")

if __name__ == "__main__":
    copy_chatbot_files()

