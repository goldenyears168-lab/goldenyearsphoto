# Development Debris Cleanup Report

**Generated:** 2025-01-27  
**Scope:** Complete project scan for debug artifacts, hardcoded localhost URLs, and hardcoded secrets

---

## Summary

| Category | Count | Risk Level |
|----------|-------|------------|
| **Debug Fetch Calls** | 31 | 🔴 High |
| **Console Statements** | 43 | 🟡 Medium |
| **Hardcoded Localhost URLs** | 3 | 🔴 High |
| **Hardcoded R2 CDN URL** | 1 | 🔴 High |
| **Total Issues** | 78 | |

---

## 1. Debug Artifacts

### 1.1 Console Statements

#### `src/assets/js/identity-test.js` (22 instances)

| Line | Type | Code Snippet |
|------|------|--------------|
| 134 | `console.error` | `console.error('Failed to load quiz data:', error);` |
| 135 | `console.error` | `console.error('Data element:', document.getElementById('quiz-data'));` |
| 146 | `console.log` | `console.log('Start button clicked');` |
| 160 | `console.error` | `console.error('Start button element not found');` |
| 246 | `console.error` | `console.error('Cannot render question: data or questions missing', state.data);` |
| 255 | `console.error` | `console.error('Cannot render question: question not found at index', state.currentQuestion);` |
| 263 | `console.error` | `console.error('Question title element not found');` |
| 275 | `console.error` | `console.error('Options grid element not found');` |
| 281 | `console.error` | `console.error('Question options missing or not an array', question);` |
| 565 | `console.warn` | `console.warn('Supabase configuration appears to be template variables, not actual values');` |
| 575 | `console.warn` | `console.warn('Supabase configuration not found on window.supabaseConfig');` |
| 576 | `console.warn` | `console.warn('Available window.supabaseConfig:', window.supabaseConfig);` |
| 608 | `console.error` | `console.error('Failed to save user info:', err);` |
| 645 | `console.warn` | `console.warn('Supabase config not found, skipping save');` |
| 662 | `console.log` | `console.log('📤 Saving to Supabase:', {...});` |
| 683 | `console.error` | `console.error('❌ Supabase API Error:', {...});` |
| 699 | `console.log` | `console.log('✅ Quiz result saved to Supabase successfully');` |
| 707 | `console.error` | `console.error('❌ Error saving quiz result to Supabase:', error);` |
| 730 | `console.error` | `console.error('Failed to save initial result:', err);` |
| 1036 | `console.log` | `console.log('Initializing identity test...');` |
| 1037 | `console.log` | `console.log('DOM ready state:', document.readyState);` |
| 1038 | `console.log` | `console.log('Start button exists:', !!document.getElementById('start-btn'));` |
| 1056 | `console.log` | `console.log('Identity test initialized');` |

#### `src/scripts/compress-images.mjs` (8 instances)

| Line | Type | Code Snippet |
|------|------|--------------|
| 48 | `console.log` | `console.log(\`⏭️  Skipped (up to date): ${relPath}\`);` |
| 57 | `console.log` | `console.log(\`📦 Compressing: ${relPath}\`);` |
| 79 | `console.log` | `console.log(\`   ✅ ${relPath} | ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${reduction}% reduction)\`);` |
| 82 | `console.warn` | `console.warn(\`⚠️  Skipping ${relPath}: ${err.message}\`);` |
| 88 | `console.log` | `console.log("Input dir: ", INPUT_DIR);` |
| 89 | `console.log` | `console.log("Output dir:", OUTPUT_DIR);` |
| 103 | `console.log` | `console.log("✅ All images processed (unsupported files were skipped).");` |
| 108 | `console.error` | `console.error("❌ Unexpected error:", err);` |

#### `src/scripts/upload-portfolio-to-r2.mjs` (6 instances)

| Line | Type | Code Snippet |
|------|------|--------------|
| 27 | `console.error` | `console.error("❌ .env 相關 R2 設定缺一個，請再確認 .env");` |
| 102 | `console.log` | `console.log(\`📊 ${path.basename(localPath)} | ...\`);` |
| 137 | `console.log` | `console.log(\`⏭️  Skipped (Already exists): ${key}\`);` |
| 166 | `console.log` | `console.log(\`✅ Uploaded: ${key} | ...\`);` |
| 192 | `console.log` | `console.log("🚀 開始同步圖片到 R2 ...");` |
| 196 | `console.warn` | `console.warn(\`⚠️ 資料夾不存在，略過：${localDir}\`);` |
| 199 | `console.log` | `console.log(\`\n=== 同步資料夾：${folder} ===\`);` |
| 202 | `console.log` | `console.log("\n🎉 全部指定資料夾同步完成！");` |
| 206 | `console.error` | `console.error("❌ 發生錯誤：", err);` |

#### `src/guide/identity-test.njk` (3 instances)

| Line | Type | Code Snippet |
|------|------|--------------|
| 227 | `console.error` | `console.error('❌ Quiz data not loaded in template!');` |
| 228 | `console.error` | `console.error('Has data:', {{ data != null }});` |
| 229 | `console.error` | `console.error('Has hero:', {{ data and data.hero }});` |

**Note:** Script files (`compress-images.mjs`, `upload-portfolio-to-r2.mjs`) may keep console statements as they are build-time utilities, but production client-side code should use a logger.

---

### 1.2 Debugger Statements

✅ **No `debugger` statements found** - Good!

---

## 2. Hardcoded Localhost URLs

### 2.1 Debug Agent Fetch Calls in `src/assets/js/identity-test.js`

**Total: 31 instances** - All pointing to `http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3`

| Line | Context | Code Snippet |
|------|---------|--------------|
| 61 | `initQuiz()` entry | `fetch('http://127.0.0.1:7242/ingest/8e85e53a-9dde-4198-8adb-f4d864adfff3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'identity-test.js:59',message:'initQuiz() entry',...})}).catch(()=>{});` |
| 71 | DOM elements found | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 114 | Data parsed successfully | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 132 | Data loading failed | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 144 | Start button clicked | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 154 | Start button listener bound | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 158 | Start button NOT found | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 166 | Prev button clicked | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 171 | Prev button listener bound | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 178 | Next button clicked | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 183 | Next button listener bound | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 206 | `startQuiz()` called | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 225 | Sections shown/hidden | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 240 | `renderQuestion()` called | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 244 | `renderQuestion()` failed - no data | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 253 | `renderQuestion()` failed - no question | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 290 | Option element created | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 328 | Option clicked | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 341 | `selectOption()` called | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 358 | Option selection updated | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 392 | `nextQuestion()` called | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 397 | `nextQuestion()` blocked | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 434 | `prevQuestion()` called | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 474 | Navigation buttons updated | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 970 | `showSection()` called with null | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 977 | Section shown | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |
| 1034 | `initialize()` called | `fetch('http://127.0.1:7242/ingest/...',{method:'POST',...})` |
| 1054 | `initQuiz()` completed | `fetch('http://127.0.0.1:7242/ingest/...',{method:'POST',...})` |

**Pattern:** All wrapped in `// #region agent log` and `// #endregion` comments.

### 2.2 Localhost URLs in `src/_includes/base-layout.njk`

| Line | Context | Code Snippet |
|------|---------|--------------|
| 235 | Chatbot widget loader | `src="http://localhost:8788/widget/loader.js"` |
| 237 | Chatbot API endpoint | `data-api-endpoint="http://localhost:8788/api/goldenyears/chat"` |
| 238 | Chatbot API base URL | `data-api-base-url="http://localhost:8788"` |

**Note:** These appear to be for local development of a chatbot widget. Should use environment variables or be removed for production.

---

## 3. Hardcoded Secrets & URLs

### 3.1 R2 CDN URL in `src/index.njk`

| Line | Context | Code Snippet |
|------|---------|--------------|
| 301 | Hardcoded R2 CDN base URL | `const IMG_BASE = 'https://pub-921f2b933c1f49a89e97bbf617baef6f.r2.dev';` |

**Issue:** This should use `process.env.R2_PUBLIC_BASE_URL` (already available in `.eleventy.js`) or be injected via Eleventy data.

**Current Usage:**
- Line 301: Constant definition
- Line 304-306: `imgPath()` helper function
- Lines 313-486: Used throughout `portfolioData` object

### 3.2 R2 Endpoint in `src/scripts/upload-portfolio-to-r2.mjs`

| Line | Context | Code Snippet |
|------|---------|--------------|
| 33 | R2 endpoint construction | `endpoint: \`https://${ACCOUNT_ID}.r2.cloudflarestorage.com\`,` |

**Status:** ✅ **OK** - Uses `ACCOUNT_ID` from `process.env.R2_ACCOUNT_ID`, so this is acceptable.

---

## Recommended Solution: Logger Utility

### Option 1: Simple Environment-Aware Logger (Recommended)

Create `src/assets/js/utils/logger.js`:

```javascript
/**
 * Environment-aware logger utility
 * Suppresses logs in production, allows debug mode via environment
 */
(function() {
  'use strict';

  // Check if we're in development mode
  // Option 1: Check for localhost/127.0.0.1
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('.local');
  
  // Option 2: Check for debug flag in window (set by Eleventy template)
  const debugMode = window.DEBUG_MODE === true || 
                    (window.location.search.includes('debug=true'));

  const shouldLog = isDevelopment || debugMode;

  // Create logger object
  window.logger = {
    log: function(...args) {
      if (shouldLog) {
        console.log('[LOG]', ...args);
      }
    },
    
    warn: function(...args) {
      if (shouldLog) {
        console.warn('[WARN]', ...args);
      }
    },
    
    error: function(...args) {
      // Always log errors, even in production
      console.error('[ERROR]', ...args);
    },
    
    debug: function(...args) {
      if (shouldLog) {
        console.log('[DEBUG]', ...args);
      }
    },
    
    // For debug agent logging (conditional)
    agentLog: function(data) {
      // Only log if debug agent endpoint is configured AND in dev mode
      const agentEndpoint = window.DEBUG_AGENT_ENDPOINT;
      if (agentEndpoint && shouldLog) {
        fetch(agentEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            timestamp: Date.now(),
            sessionId: window.sessionId || 'unknown',
            runId: window.runId || 'run1',
            hypothesisId: data.hypothesisId || 'A'
          })
        }).catch(() => {
          // Silently fail if agent is not available
        });
      }
    }
  };

  // Export for module systems if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.logger;
  }
})();
```

### Option 2: Eleventy Data Injection (For R2 URL)

In `.eleventy.js`, add to the data cascade:

```javascript
// Add to eleventyConfig
eleventyConfig.addGlobalData('r2PublicBaseUrl', process.env.R2_PUBLIC_BASE_URL || '');
```

Then in `src/index.njk`, replace line 301:

```javascript
<script>
    // Get R2 base URL from Eleventy data (injected at build time)
    const IMG_BASE = {{ r2PublicBaseUrl | tojson }} || '';
    
    // Fallback to relative path if no R2 URL configured
    if (!IMG_BASE) {
        console.warn('R2_PUBLIC_BASE_URL not configured, using relative paths');
    }
    
    // ... rest of code
</script>
```

---

## Cleanup Action Plan

### Phase 1: Remove Debug Agent Calls (High Priority)

1. **Remove all 31 fetch calls** in `src/assets/js/identity-test.js`
   - Delete lines 61, 71, 114, 132, 144, 154, 158, 166, 171, 178, 183, 206, 225, 240, 244, 253, 290, 328, 341, 358, 392, 397, 434, 474, 970, 977, 1034, 1054
   - Remove surrounding `// #region agent log` and `// #endregion` comments

### Phase 2: Replace Console Statements (Medium Priority)

1. **Create logger utility** (`src/assets/js/utils/logger.js`)
2. **Include logger in base layout** before other scripts
3. **Replace console statements** in `identity-test.js`:
   - `console.log()` → `logger.log()`
   - `console.warn()` → `logger.warn()`
   - `console.error()` → `logger.error()` (keep for production errors)

### Phase 3: Fix Hardcoded URLs (High Priority)

1. **R2 CDN URL in `index.njk`**:
   - Inject via Eleventy data cascade
   - Use `{{ r2PublicBaseUrl | tojson }}` in template

2. **Localhost URLs in `base-layout.njk`**:
   - Add environment variables: `CHATBOT_API_URL`, `CHATBOT_WIDGET_URL`
   - Or conditionally include only in development builds

### Phase 4: Template Console Statements (Low Priority)

1. **Remove console.error calls** from `src/guide/identity-test.njk` (lines 227-229)
   - These are template-level debug statements, should be removed

---

## Implementation Steps

### Step 1: Create Logger Utility

```bash
mkdir -p src/assets/js/utils
# Create logger.js (see Option 1 above)
```

### Step 2: Update Base Layout

In `src/_includes/base-layout.njk`, add before closing `</body>`:

```html
<!-- Logger utility (must load before other scripts) -->
<script src="/assets/js/utils/logger.js"></script>

<!-- Set debug mode from environment (if needed) -->
<script>
  window.DEBUG_MODE = {{ (process.env.NODE_ENV !== 'production') | tojson }};
  window.DEBUG_AGENT_ENDPOINT = null; // Set only in development
</script>
```

### Step 3: Update Eleventy Config

In `.eleventy.js`, add:

```javascript
// Add R2 URL to global data
eleventyConfig.addGlobalData('r2PublicBaseUrl', process.env.R2_PUBLIC_BASE_URL || '');
eleventyConfig.addGlobalData('isProduction', process.env.NODE_ENV === 'production');
```

### Step 4: Replace Hardcoded URL in index.njk

Replace line 301:
```javascript
const IMG_BASE = {{ r2PublicBaseUrl | tojson }} || '/assets/images';
```

### Step 5: Remove Debug Agent Calls

Use find/replace or manual deletion to remove all 31 fetch calls in `identity-test.js`.

---

## Files to Modify

1. ✅ Create: `src/assets/js/utils/logger.js`
2. ✅ Modify: `src/assets/js/identity-test.js` (remove 31 fetch calls, replace console statements)
3. ✅ Modify: `src/index.njk` (replace hardcoded R2 URL)
4. ✅ Modify: `src/_includes/base-layout.njk` (add logger script, fix localhost URLs)
5. ✅ Modify: `.eleventy.js` (add global data for R2 URL)
6. ✅ Modify: `src/guide/identity-test.njk` (remove console.error statements)

---

## Testing Checklist

After cleanup:

- [ ] Verify portfolio images load correctly with R2 URL from env
- [ ] Verify no console errors in production build
- [ ] Verify logger works in development mode
- [ ] Verify no network requests to `127.0.0.1:7242` in production
- [ ] Verify chatbot widget works (if using env vars)
- [ ] Test identity test quiz functionality
- [ ] Check browser console in production build (should be clean)

---

**Next Steps:** Should I proceed with implementing these changes?
