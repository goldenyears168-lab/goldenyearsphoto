#!/usr/bin/env node

/**
 * 知識庫驗證腳本
 * 
 * 功能：
 * 1. 檢查所有 JSON 檔案中的 ID 是否在 schema_ids.md 中定義
 * 2. 檢查 JSON 檔案的結構完整性
 * 3. 檢查 referential integrity（ID 引用是否有效）
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const knowledgeDir = join(rootDir, 'knowledge');
const schemaFile = join(knowledgeDir, 'schema_ids.md');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 從 schema_ids.md 提取所有合法 ID
function parseSchemaIds() {
  try {
    const content = readFileSync(schemaFile, 'utf-8');
    const ids = {
      serviceTypes: [],
      personas: [],
      useCases: [],
      branches: [],
      bookingActions: [],
      faqCategories: [],
      intentTypes: [],
    };

    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      if (line.startsWith('## Service Types')) {
        currentSection = 'serviceTypes';
      } else if (line.startsWith('## Personas')) {
        currentSection = 'personas';
      } else if (line.startsWith('## Use Cases')) {
        currentSection = 'useCases';
      } else if (line.startsWith('## Branches')) {
        currentSection = 'branches';
      } else if (line.startsWith('## Booking Actions')) {
        currentSection = 'bookingActions';
      } else if (line.startsWith('## FAQ Categories')) {
        currentSection = 'faqCategories';
      } else if (line.startsWith('## Intent Types')) {
        currentSection = 'intentTypes';
      } else if (line.startsWith('---')) {
        currentSection = null;
      } else if (currentSection && line.trim().startsWith('-')) {
        const match = line.match(/`([^`]+)`/);
        if (match) {
          ids[currentSection].push(match[1]);
        }
      }
    }

    return ids;
  } catch (error) {
    log(`❌ 無法讀取 schema_ids.md: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 遞迴讀取 JSON 檔案
function readJsonFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...readJsonFiles(fullPath));
    } else if (entry.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 驗證 JSON 檔案
function validateJsonFile(filePath, validIds) {
  const errors = [];
  const warnings = [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const fileName = filePath.replace(rootDir + '/', '');

    // 檢查 version 和 last_updated
    if (!data.version) {
      warnings.push(`${fileName}: 缺少 'version' 欄位`);
    }
    if (!data.last_updated) {
      warnings.push(`${fileName}: 缺少 'last_updated' 欄位`);
    }

    // 檢查 services.json
    if (data.services && Array.isArray(data.services)) {
      for (const service of data.services) {
        if (!service.id) {
          errors.push(`${fileName}: service 缺少 'id' 欄位`);
        } else if (!validIds.serviceTypes.includes(service.id)) {
          errors.push(`${fileName}: service.id '${service.id}' 不在 schema_ids.md 中定義`);
        }
      }
    }

    // 檢查 personas.json
    if (data.personas && Array.isArray(data.personas)) {
      for (const persona of data.personas) {
        if (!persona.id) {
          errors.push(`${fileName}: persona 缺少 'id' 欄位`);
        } else if (!validIds.personas.includes(persona.id)) {
          errors.push(`${fileName}: persona.id '${persona.id}' 不在 schema_ids.md 中定義`);
        }

        // 檢查推薦服務的 ID
        if (persona.recommended_services && Array.isArray(persona.recommended_services)) {
          for (const serviceId of persona.recommended_services) {
            if (!validIds.serviceTypes.includes(serviceId)) {
              errors.push(`${fileName}: persona.recommended_services 中的 '${serviceId}' 不在 schema_ids.md 中定義`);
            }
          }
        }
      }
    }

    // 檢查 contact_info.json
    if (data.branches && Array.isArray(data.branches)) {
      for (const branch of data.branches) {
        if (!branch.id) {
          errors.push(`${fileName}: branch 缺少 'id' 欄位`);
        } else if (!validIds.branches.includes(branch.id)) {
          errors.push(`${fileName}: branch.id '${branch.id}' 不在 schema_ids.md 中定義`);
        }
      }
    }

    // 檢查 policies.json
    if (data.policies && Array.isArray(data.policies)) {
      for (const policy of data.policies) {
        if (!policy.id) {
          errors.push(`${fileName}: policy 缺少 'id' 欄位`);
        }
        if (policy.category && !validIds.faqCategories.includes(policy.category)) {
          warnings.push(`${fileName}: policy.category '${policy.category}' 不在 schema_ids.md 中定義（可能是新分類）`);
        }
      }
    }

  } catch (error) {
    if (error instanceof SyntaxError) {
      errors.push(`${filePath}: JSON 格式錯誤 - ${error.message}`);
    } else {
      errors.push(`${filePath}: 讀取錯誤 - ${error.message}`);
    }
  }

  return { errors, warnings };
}

// 主函數
function main() {
  log('\n🔍 開始驗證知識庫...\n', 'blue');

  // 讀取合法 ID
  log('📖 讀取 schema_ids.md...', 'blue');
  const validIds = parseSchemaIds();
  log(`✓ 找到 ${validIds.serviceTypes.length} 個 service types`, 'green');
  log(`✓ 找到 ${validIds.personas.length} 個 personas`, 'green');
  log(`✓ 找到 ${validIds.useCases.length} 個 use cases`, 'green');
  log(`✓ 找到 ${validIds.branches.length} 個 branches`, 'green');
  log(`✓ 找到 ${validIds.bookingActions.length} 個 booking actions`, 'green');
  log(`✓ 找到 ${validIds.faqCategories.length} 個 FAQ categories`, 'green');
  log(`✓ 找到 ${validIds.intentTypes.length} 個 intent types\n`, 'green');

  // 讀取所有 JSON 檔案
  log('📂 掃描 JSON 檔案...', 'blue');
  const jsonFiles = readJsonFiles(knowledgeDir);
  log(`✓ 找到 ${jsonFiles.length} 個 JSON 檔案\n`, 'green');

  // 驗證每個檔案
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const filePath of jsonFiles) {
    const { errors, warnings } = validateJsonFile(filePath, validIds);
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (errors.length > 0 || warnings.length > 0) {
      const fileName = filePath.replace(rootDir + '/', '');
      log(`\n📄 ${fileName}:`, 'yellow');
      
      for (const error of errors) {
        log(`  ❌ ${error}`, 'red');
      }
      
      for (const warning of warnings) {
        log(`  ⚠️  ${warning}`, 'yellow');
      }
    }
  }

  // 總結
  log('\n' + '='.repeat(50), 'blue');
  if (totalErrors === 0 && totalWarnings === 0) {
    log('✅ 所有驗證通過！知識庫結構完整。', 'green');
    process.exit(0);
  } else {
    if (totalErrors > 0) {
      log(`❌ 發現 ${totalErrors} 個錯誤`, 'red');
    }
    if (totalWarnings > 0) {
      log(`⚠️  發現 ${totalWarnings} 個警告`, 'yellow');
    }
    log('\n請修正上述問題後重新執行驗證。', 'yellow');
    process.exit(totalErrors > 0 ? 1 : 0);
  }
}

main();

