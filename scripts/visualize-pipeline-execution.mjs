#!/usr/bin/env node

/**
 * Pipeline 執行視覺化工具
 * 從實際日誌或測試結果生成視覺化圖表
 * 
 * 使用方式:
 *   node scripts/visualize-pipeline-execution.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 解析 Pipeline 日誌（從 Cloudflare Pages 日誌格式）
 */
function parsePipelineLogs(logText) {
  const lines = logText.split('\n');
  const logs = [];
  
  // 匹配格式: ✅ [Pipeline:nodeName] [SUCCESS] message (duration)
  const logRegex = /(ℹ️|✅|❌|⚠️)\s+\[Pipeline:(\w+)\]\s+\[(\w+)\]\s+(.+?)(?:\s+\((\d+)ms\))?$/;
  
  lines.forEach(line => {
    const match = line.match(logRegex);
    if (match) {
      const [, emoji, node, level, message, duration] = match;
      logs.push({
        node,
        level,
        message,
        duration: duration ? parseInt(duration) : null,
        timestamp: Date.now(), // 實際應該從日誌中解析
      });
    }
  });
  
  return logs;
}

/**
 * 生成視覺化報告
 */
function generateVisualization(logs) {
  const report = {
    ascii: generateASCIIFlow(logs),
    timeline: generateTimeline(logs),
    mermaid: generateMermaidFlow(logs),
    statistics: generateStatistics(logs),
  };
  
  return report;
}

function generateASCIIFlow(logs) {
  let diagram = '\n┌─────────────────────────────────────────────────────────┐\n';
  diagram += '│              Pipeline 執行流程追蹤                       │\n';
  diagram += '└─────────────────────────────────────────────────────────┘\n\n';
  
  logs.forEach((log, index) => {
    const emoji = {
      'INFO': 'ℹ️',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARN': '⚠️',
    }[log.level] || '•';
    
    const duration = log.duration ? ` (${log.duration}ms)` : '';
    diagram += `   ${emoji} [${log.node}] ${log.message}${duration}\n`;
    
    if (index < logs.length - 1) {
      diagram += '   │\n';
    }
  });
  
  return diagram;
}

function generateTimeline(logs) {
  const maxWidth = 50;
  const durations = logs.filter(l => l.duration).map(l => l.duration);
  const maxDuration = Math.max(...durations, 1);
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  
  let timeline = '\n┌─────────────────────────────────────────────────────────┐\n';
  timeline += `│              執行時間軸（總耗時: ${totalDuration}ms）    │\n`;
  timeline += '└─────────────────────────────────────────────────────────┘\n\n';
  
  logs.forEach(log => {
    if (!log.duration) return;
    
    const width = Math.round((log.duration / maxDuration) * maxWidth);
    const bar = '█'.repeat(Math.max(1, width));
    const padding = ' '.repeat(Math.max(0, 25 - log.node.length));
    
    timeline += `${log.node}:${padding}[${bar}] ${log.duration}ms\n`;
  });
  
  return timeline;
}

function generateMermaidFlow(logs) {
  const nodeNames = [...new Set(logs.map(l => l.node))];
  
  let mermaid = 'flowchart TD\n';
  mermaid += '    Start([請求進入])\n';
  
  nodeNames.forEach((name, i) => {
    const id = `N${i + 1}`;
    mermaid += `    ${id}[${i + 1}. ${name}]\n`;
  });
  
  mermaid += '    End([返回響應])\n\n';
  mermaid += '    Start --> N1\n';
  
  for (let i = 0; i < nodeNames.length - 1; i++) {
    mermaid += `    N${i + 1} --> N${i + 2}\n`;
  }
  
  mermaid += `    N${nodeNames.length} --> End\n`;
  
  return mermaid;
}

function generateStatistics(logs) {
  const durations = logs.filter(l => l.duration).map(l => l.duration);
  const slowest = logs.reduce((max, log) => 
    (log.duration || 0) > (max.duration || 0) ? log : max,
    { node: 'none', duration: 0 }
  );
  
  return {
    totalNodes: logs.length,
    totalDuration: durations.reduce((sum, d) => sum + d, 0),
    averageDuration: durations.length > 0 
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0,
    slowestNode: {
      node: slowest.node,
      duration: slowest.duration,
    },
  };
}

// 主函數
console.log('📊 Pipeline 執行視覺化工具\n');
console.log('使用示例日誌數據生成視覺化圖表...\n');

const exampleLogs = [
  { node: 'validateRequest', level: 'SUCCESS', message: '節點執行完成', duration: 5 },
  { node: 'initializeServices', level: 'SUCCESS', message: '節點執行完成', duration: 120 },
  { node: 'contextManagement', level: 'SUCCESS', message: '節點執行完成', duration: 2 },
  { node: 'intentExtraction', level: 'SUCCESS', message: '節點執行完成', duration: 8 },
  { node: 'stateTransition', level: 'SUCCESS', message: '節點執行完成', duration: 3 },
  { node: 'specialIntents', level: 'SUCCESS', message: '節點執行完成', duration: 1 },
  { node: 'faqCheck', level: 'SUCCESS', message: '節點執行完成', duration: 2 },
  { node: 'llmGeneration', level: 'SUCCESS', message: '節點執行完成', duration: 1800 },
  { node: 'buildResponse', level: 'SUCCESS', message: '節點執行完成', duration: 3 },
];

const report = generateVisualization(exampleLogs);

console.log('1. ASCII 流程圖:');
console.log(report.ascii);

console.log('\n2. 時間軸圖:');
console.log(report.timeline);

console.log('\n3. Mermaid 流程圖:');
console.log('```mermaid');
console.log(report.mermaid);
console.log('```');

console.log('\n4. 統計資訊:');
console.log(JSON.stringify(report.statistics, null, 2));

