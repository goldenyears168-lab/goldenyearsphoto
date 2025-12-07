#!/usr/bin/env node

/**
 * 生成 Pipeline 執行流程圖
 * 從實際的 Pipeline 日誌生成視覺化圖表
 * 
 * 使用方式:
 *   1. 從 Cloudflare Pages 日誌複製 Pipeline 日誌
 *   2. 或使用示例數據生成圖表
 *   3. 或提供 JSON 格式的執行追蹤數據
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * 生成 ASCII 流程圖
 */
function generateASCIIFlow(logs) {
  let diagram = `
┌─────────────────────────────────────────────────────────┐
│              Pipeline 執行流程追蹤                       │
└─────────────────────────────────────────────────────────┘

`;
  
  const successLogs = logs.filter(l => l.level === 'SUCCESS' || l.level === 'ERROR');
  
  successLogs.forEach((log, index) => {
    const emoji = {
      'INFO': 'ℹ️',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARN': '⚠️',
    }[log.level] || '•';
    
    const duration = log.duration ? ` (${log.duration}ms)` : '';
    const arrow = index < successLogs.length - 1 ? '│' : ' ';
    
    diagram += `   ${emoji} [${log.node}] ${log.message}${duration}\n`;
    if (index < successLogs.length - 1) {
      diagram += `   ${arrow}\n`;
      diagram += `   ${arrow}\n`;
    }
  });
  
  return diagram;
}

/**
 * 生成時間軸圖
 */
function generateTimeline(logs, totalDuration) {
  const maxWidth = 60;
  const successLogs = logs.filter(l => l.level === 'SUCCESS' && l.duration);
  const maxDuration = Math.max(...successLogs.map(l => l.duration || 0), totalDuration);
  
  let timeline = `
┌─────────────────────────────────────────────────────────┐
│              執行時間軸（總耗時: ${totalDuration}ms）    │
└─────────────────────────────────────────────────────────┘

`;
  
  successLogs.forEach(log => {
    if (!log.duration) return;
    
    const width = Math.round((log.duration / maxDuration) * maxWidth);
    const bar = '█'.repeat(Math.max(1, width));
    const padding = ' '.repeat(Math.max(0, 25 - log.node.length));
    
    timeline += `${log.node}:${padding}[${bar}] ${log.duration}ms\n`;
  });
  
  return timeline;
}

/**
 * 生成 Mermaid 流程圖代碼
 */
function generateMermaidFlow(logs) {
  const nodeNames = [...new Set(logs.map(l => l.node))];
  const nodeIds = nodeNames.map((name, i) => ({
    name,
    id: `N${i + 1}`,
    status: logs.filter(l => l.node === name && l.level === 'SUCCESS').length > 0 ? 'success' : 'error',
  }));
  
  let mermaid = `flowchart TD
    Start([請求進入]) --> ${nodeIds[0].id}[${nodeIds[0].name}]
`;
  
  for (let i = 0; i < nodeIds.length - 1; i++) {
    mermaid += `    ${nodeIds[i].id} --> ${nodeIds[i + 1].id}[${nodeIds[i + 1].name}]\n`;
  }
  
  mermaid += `    ${nodeIds[nodeIds.length - 1].id} --> End([返回響應])\n`;
  
  // 添加樣式
  nodeIds.forEach(node => {
    const color = node.status === 'success' ? '#90caf9' : '#ffccbc';
    mermaid += `    style ${node.id} fill:${color}\n`;
  });
  
  mermaid += `    style Start fill:#e1f5ff\n`;
  mermaid += `    style End fill:#d4edda\n`;
  
  return mermaid;
}

/**
 * 生成 JSON 格式的執行報告
 */
function generateJSONReport(logs, startTime, endTime) {
  const successLogs = logs.filter(l => l.level === 'SUCCESS' || l.level === 'ERROR');
  
  return JSON.stringify({
    executionId: `exec_${Date.now()}`,
    startTime,
    endTime,
    totalDuration: endTime - startTime,
    nodes: successLogs.map(log => ({
      node: log.node,
      level: log.level,
      message: log.message,
      timestamp: log.timestamp,
      duration: log.duration,
    })),
    statistics: {
      totalNodes: successLogs.length,
      successNodes: successLogs.filter(l => l.level === 'SUCCESS').length,
      errorNodes: successLogs.filter(l => l.level === 'ERROR').length,
      avgDuration: successLogs.filter(l => l.duration).length > 0
        ? successLogs.filter(l => l.duration).reduce((sum, l) => sum + (l.duration || 0), 0) / successLogs.filter(l => l.duration).length
        : 0,
      slowestNode: successLogs.reduce((slowest, log) => 
        (log.duration || 0) > (slowest.duration || 0) ? log : slowest, 
        { node: 'none', duration: 0 }
      ),
    },
  }, null, 2);
}

/**
 * 主函數
 */
function main() {
  console.log('📊 Pipeline 流程圖生成器\n');
  console.log('='.repeat(70));
  
  // 示例日誌數據（實際使用時可以從實際執行中獲取）
  const exampleLogs = [
    { node: 'validateRequest', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1944, duration: null },
    { node: 'validateRequest', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1939, duration: 5 },
    { node: 'initializeServices', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1939, duration: null },
    { node: 'initializeServices', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1819, duration: 120 },
    { node: 'contextManagement', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1819, duration: null },
    { node: 'contextManagement', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1817, duration: 2 },
    { node: 'intentExtraction', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1817, duration: null },
    { node: 'intentExtraction', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1809, duration: 8 },
    { node: 'stateTransition', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1809, duration: null },
    { node: 'stateTransition', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1806, duration: 3 },
    { node: 'specialIntents', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1806, duration: null },
    { node: 'specialIntents', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1805, duration: 1 },
    { node: 'faqCheck', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1805, duration: null },
    { node: 'faqCheck', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 1803, duration: 2 },
    { node: 'llmGeneration', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 1803, duration: null },
    { node: 'llmGeneration', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now() - 3, duration: 1800 },
    { node: 'buildResponse', level: 'INFO', message: '開始執行節點', timestamp: Date.now() - 3, duration: null },
    { node: 'buildResponse', level: 'SUCCESS', message: '節點執行完成', timestamp: Date.now(), duration: 3 },
  ];
  
  const startTime = exampleLogs[0].timestamp;
  const endTime = exampleLogs[exampleLogs.length - 1].timestamp;
  const totalDuration = endTime - startTime;
  
  console.log('\n1. ASCII 流程圖:');
  console.log(generateASCIIFlow(exampleLogs));
  
  console.log('\n2. 時間軸圖:');
  console.log(generateTimeline(exampleLogs, totalDuration));
  
  console.log('\n3. Mermaid 流程圖代碼:');
  console.log('```mermaid');
  console.log(generateMermaidFlow(exampleLogs));
  console.log('```');
  
  console.log('\n4. JSON 執行報告:');
  console.log(generateJSONReport(exampleLogs, startTime, endTime));
  
  // 保存到文件
  const outputDir = join(projectRoot, 'docs', 'pipeline-visualizations');
  try {
    mkdirSync(outputDir, { recursive: true });
    
    writeFileSync(
      join(outputDir, 'example-flow.txt'),
      generateASCIIFlow(exampleLogs) + '\n' + generateTimeline(exampleLogs, totalDuration)
    );
    
    writeFileSync(
      join(outputDir, 'example-flow.mmd'),
      generateMermaidFlow(exampleLogs)
    );
    
    writeFileSync(
      join(outputDir, 'example-report.json'),
      generateJSONReport(exampleLogs, startTime, endTime)
    );
    
    console.log('\n✅ 圖表已保存到 docs/pipeline-visualizations/');
    console.log('   - example-flow.txt (ASCII 流程圖)');
    console.log('   - example-flow.mmd (Mermaid 流程圖)');
    console.log('   - example-report.json (JSON 報告)');
  } catch (error) {
    console.log('\n⚠️  無法保存文件:', error.message);
    console.log('   但可以在終端查看所有視覺化內容');
  }
}

// 執行
main();

