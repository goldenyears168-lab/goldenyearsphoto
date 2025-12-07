#!/bin/bash

# 設置 wrangler 本地測試環境

echo "🚀 設置 wrangler 本地測試環境"
echo "=" | tr '\n' '='
echo ""

# 1. 構建項目
echo "📦 步驟 1: 構建項目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 構建失敗"
    exit 1
fi

echo "✅ 構建成功"
echo ""

# 2. 檢查 wrangler 是否安裝
echo "🔍 步驟 2: 檢查 wrangler..."
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  wrangler 未安裝，嘗試使用 npx..."
    WRANGLER_CMD="npx wrangler"
else
    WRANGLER_CMD="wrangler"
fi

echo "✅ 使用: $WRANGLER_CMD"
echo ""

# 3. 啟動 wrangler pages dev
echo "🌐 步驟 3: 啟動 wrangler pages dev..."
echo ""
echo "將在 http://localhost:8788 啟動服務器"
echo "chatbot 測試 URL: http://localhost:8788?chatbot=open"
echo ""
echo "按 Ctrl+C 停止服務器"
echo ""

$WRANGLER_CMD pages dev _site --project-name=goldenyearsphoto

