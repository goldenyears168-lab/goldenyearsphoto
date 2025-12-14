# Project Health Audit Report
**Golden Years Photo Website - Eleventy Static Site**

**Audit Date:** 2025-01-27  
**Project Type:** Eleventy (11ty) Static Site Generator  
**Tech Stack:** Node.js, Nunjucks, Tailwind CSS, Cloudflare R2

---

## Executive Summary

This audit examines the codebase across 5 critical dimensions. Overall, the project demonstrates **good architectural practices** with proper environment variable usage and a well-structured Eleventy setup. However, several areas require attention, particularly around code duplication, large files, and debugging code in production.

**Overall Health Score: 72/100**

---

## 1. Architecture & Structure (架構與結構)

### ✅ Strengths

| Aspect | Status | Details |
|--------|--------|---------|
| **Directory Logic** | ✅ Good | Clear separation: `src/` for source, `_includes/` for templates, `_data/` for JSON |
| **Template Organization** | ✅ Good | Nunjucks templates well-organized with macros in `_includes/macros/` |
| **Asset Management** | ✅ Good | Images properly separated into portfolio/content/booking folders |

### ⚠️ Issues Found

| Issue | Risk | File Path | Details |
|-------|------|-----------|---------|
| **Large Template Files** | Medium | `src/index.njk` (570 lines) | Homepage template contains inline JavaScript (300+ lines) and hardcoded portfolio data |
| **Large JavaScript File** | High | `src/assets/js/identity-test.js` (1065 lines) | Single file contains entire quiz system; should be modularized |
| **Mixed Concerns** | Medium | `src/index.njk` | Template mixing presentation logic with data (portfolio object embedded) |
| **Scripts Directory Bloat** | Low | `scripts/` (28 files) | Many one-off Python analysis scripts that may be obsolete |

### 📊 File Size Analysis

| File | Lines | Status | Recommendation |
|------|-------|--------|----------------|
| `src/assets/js/identity-test.js` | 1065 | ⚠️ Too Large | Split into modules: quiz-engine.js, scoring.js, ui.js |
| `src/index.njk` | 570 | ⚠️ Large | Extract portfolio data to `_data/portfolio.json` |
| `src/about.njk` | 460 | ⚠️ Large | Consider component extraction |
| `src/price-list.njk` | 408 | ⚠️ Large | Extract pricing data to JSON |
| `.eleventy.js` | 269 | ✅ Acceptable | Well-structured config file |

### 🔍 Naming Conventions

| Pattern | Status | Examples |
|---------|--------|----------|
| **File Naming** | ✅ Consistent | kebab-case: `identity-test.js`, `base-layout.njk` |
| **Template Files** | ✅ Consistent | `.njk` extension, descriptive names |
| **JavaScript** | ✅ Consistent | camelCase for functions/variables |

---

## 2. Code Hygiene & Quality (代碼衛生)

### ⚠️ Critical Issues

| Issue | Risk | Location | Count | Details |
|-------|------|----------|--------|----------|
| **Hardcoded R2 CDN URL** | High | `src/index.njk:301` | 1 | `const IMG_BASE = 'https://pub-921f2b933c1f49a89e97bbf617baef6f.r2.dev'` should use env variable |
| **Debug Fetch Calls** | High | `src/assets/js/identity-test.js` | 50+ | Hardcoded `http://127.0.0.1:7242/ingest/...` calls throughout file |
| **Console Statements** | Medium | Multiple files | 43 | Production code contains console.log/warn/error statements |
| **Hardcoded Domain** | Low | `src/robots.txt:3` | 1 | `Sitemap: https://www.your-domain.com/sitemap.xml` placeholder |

### 🔄 DRY Violations (Don't Repeat Yourself)

| Pattern | Risk | Locations | Recommendation |
|---------|------|-----------|----------------|
| **Portfolio Data Duplication** | Medium | `src/index.njk:308-487` | Extract to `_data/portfolio.json` |
| **Instagram Embed HTML** | Low | `src/index.njk:132-143` | Create reusable macro |
| **Repeated Client Names** | Low | `src/index.njk:148-214` | Extract to data file |
| **Similar Card Structures** | Low | Multiple `.njk` files | Already using macros (good), but some inline cards remain |

### 🗑️ Dead Code & Unused Imports

| Issue | Risk | Location | Details |
|-------|------|----------|---------|
| **Commented Code** | Low | `src/assets/js/main.js:8-24` | Commented-out desktop navigation code |
| **Unused Sitemap Plugin** | Low | `package.json:31` | `@quasibit/eleventy-plugin-sitemap` installed but commented in `.eleventy.js:11` |
| **Debug Agent Logging** | High | `src/assets/js/identity-test.js` | 50+ fetch calls to localhost debug endpoint |

### 📝 Documentation & Comments

| Aspect | Status | Details |
|--------|--------|---------|
| **Function Comments** | ✅ Good | `.eleventy.js` has clear section comments |
| **Complex Logic Documentation** | ⚠️ Partial | `identity-test.js` lacks JSDoc for complex scoring functions |
| **Configuration Comments** | ✅ Good | Tailwind config well-commented |

---

## 3. Dependencies & Tech Stack (依賴與技術棧)

### 📦 Package Analysis

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@11ty/eleventy` | ^2.0.1 | ✅ Latest | Using Eleventy v2 (good) |
| `@aws-sdk/client-s3` | ^3.932.0 | ✅ Current | Latest AWS SDK v3 |
| `tailwindcss` | ^4.1.18 | ✅ Latest | Tailwind v4 (cutting edge) |
| `sharp` | ^0.34.5 | ✅ Current | Image processing library |
| `dotenv` | ^17.2.3 | ✅ Latest | Version 17.2.3 is the latest stable version (released Sep 2025) |

### ⚠️ Dependency Issues

| Issue | Risk | Details | Recommendation |
|-------|------|--------|----------------|
| **Unused Sitemap Plugin** | Low | `@quasibit/eleventy-plugin-sitemap` installed but not used | Remove or implement |
| **Dotenv Version** | ✅ Resolved | `dotenv@^17.2.3` - version is correct and latest | No action needed |
| **Heavy Dev Dependencies** | Low | Many analysis tools (lighthouse, pa11y, axe-core) | Acceptable for QA workflow |

### 🔍 Dependency Health

| Category | Status | Count |
|----------|--------|-------|
| **Production Dependencies** | ✅ Minimal | 3 packages (eleventy-img, aws-sdk, dotenv) |
| **Dev Dependencies** | ✅ Reasonable | 22 packages (build tools, linters, QA tools) |
| **Deprecated Packages** | ✅ None Found | All packages appear current |
| **Security Vulnerabilities** | ⚠️ Unknown | Run `npm audit` to check |

### 💡 Recommendations

1. **Run `npm audit`** to check for security vulnerabilities
2. **Verify dotenv version** - `^17.2.3` seems incorrect
3. **Remove unused sitemap plugin** if not planning to use it
4. **Consider dependency updates** - some packages may have newer patch versions

---

## 4. Performance Bottlenecks (效能隱憂)

### ⚠️ Critical Performance Issues

| Issue | Risk | Location | Impact |
|-------|------|----------|--------|
| **Synchronous File I/O in Build** | ✅ Acceptable | `.eleventy.js:182-183, 215-216, 222-223` | `fs.readFileSync()` is acceptable for build-time; files are small and blocking is minimal |
| **Synchronous File I/O in Scripts** | Low | `src/scripts/compress-images.mjs:44-46, 76-77` | Acceptable for build scripts |
| **Large Inline JavaScript** | Medium | `src/index.njk:299-539` | 240 lines of JS in HTML increases initial parse time |
| **Hardcoded Portfolio Data** | Low | `src/index.njk:308-487` | Large object embedded in template |

### 🖼️ Image & Asset Performance

| Aspect | Status | Details |
|--------|--------|---------|
| **Image Optimization** | ✅ Good | Using Sharp for compression, R2 CDN for delivery |
| **Lazy Loading** | ✅ Good | `loading="lazy"` and `decoding="async"` used |
| **Responsive Images** | ⚠️ Partial | Some images use `srcset`, but hardcoded CDN URLs |
| **WebP Support** | ✅ Good | Eleventy-img generates WebP variants |

### 🔄 Build Performance

| Operation | Status | Notes |
|-----------|--------|-------|
| **CSS Processing** | ✅ Good | PostCSS/Tailwind compilation is async |
| **Image Processing** | ✅ Good | Async image shortcode |
| **File Watching** | ✅ Good | Proper watch targets configured |

### 💡 Performance Recommendations

1. **Extract inline JavaScript** from `index.njk` to external file
2. **Move portfolio data** to `_data/portfolio.json` for Eleventy data cascade
3. **Optional: Modernize to async file operations** in `.eleventy.js` filters (current sync usage is acceptable for build-time; async is optional improvement)
4. **Implement code splitting** for `identity-test.js` if quiz is not on every page

---

## 5. Security Risks (安全性)

### ✅ Security Strengths

| Aspect | Status | Details |
|--------|--------|---------|
| **Environment Variables** | ✅ Excellent | All sensitive data (R2 credentials) use `process.env` |
| **Gitignore Configuration** | ✅ Good | `.env`, `.dev.vars` properly ignored |
| **No Hardcoded Secrets** | ✅ Good | No API keys, tokens, or passwords in code |
| **External Links** | ✅ Good | Instagram links use `rel="noopener noreferrer"` |

### ⚠️ Security Concerns

| Issue | Risk | Location | Details |
|-------|------|----------|---------|
| **Debug Endpoint Exposure** | High | `src/assets/js/identity-test.js` | 50+ fetch calls to `http://127.0.0.1:7242` - should be removed or gated |
| **Hardcoded CDN URL** | Medium | `src/index.njk:301` | R2 CDN URL hardcoded; should use env variable |
| **Supabase Config Exposure** | Low | `src/assets/js/identity-test.js:565-692` | Config check logs to console; ensure no secrets in production |
| **Placeholder Domain** | Low | `src/robots.txt:3` | `your-domain.com` should be replaced with actual domain |

### 🔒 Input Validation

| Aspect | Status | Notes |
|--------|--------|-------|
| **Form Inputs** | ⚠️ Unknown | Identity test form exists but validation not visible in audit |
| **URL Parameters** | ✅ N/A | Static site, no dynamic URL params |
| **External Content** | ⚠️ Medium | Instagram embeds loaded from external source (acceptable risk) |

### 🛡️ Security Recommendations

1. **Remove debug fetch calls** from `identity-test.js` or gate behind environment check
2. **Move R2 CDN URL** to environment variable
3. **Update robots.txt** with actual domain
4. **Add input validation** for identity test form if not already present
5. **Review Supabase config** to ensure no secrets in client-side code
6. **Consider Content Security Policy (CSP)** headers for production

---

## Summary Tables

### Risk Level Distribution

| Risk Level | Count | Categories |
|------------|-------|------------|
| **High** | 4 | Debug endpoints, large files, hardcoded URLs |
| **Medium** | 8 | Console statements, sync I/O, DRY violations |
| **Low** | 12 | Naming, unused imports, placeholder domains |

### File Complexity Ranking

| Rank | File | Lines | Complexity |
|------|------|-------|------------|
| 1 | `identity-test.js` | 1065 | Very High |
| 2 | `index.njk` | 570 | High |
| 3 | `about.njk` | 460 | Medium |
| 4 | `price-list.njk` | 408 | Medium |
| 5 | `id-photo.njk` | 401 | Medium |

---

## Top 3 Priorities for Immediate Refactoring

### 🔴 Priority 1: Remove Debug Code from Production
**Risk:** High | **Effort:** Low | **Impact:** High

**Actions:**
- Remove all `fetch('http://127.0.0.1:7242/...')` calls from `src/assets/js/identity-test.js`
- Remove or gate console.log statements in production builds
- Move R2 CDN URL from hardcoded string to environment variable

**Files:**
- `src/assets/js/identity-test.js` (50+ debug fetch calls)
- `src/index.njk:301` (hardcoded CDN URL)

---

### 🟡 Priority 2: Extract Large Files & Data
**Risk:** Medium | **Effort:** Medium | **Impact:** High

**Actions:**
- Extract portfolio data from `src/index.njk` to `src/_data/portfolio.json`
- Split `identity-test.js` (1065 lines) into modules:
  - `quiz-engine.js` (core logic)
  - `scoring.js` (RIASEC scoring)
  - `ui.js` (DOM manipulation)
  - `supabase-client.js` (data persistence)
- Extract inline JavaScript from `index.njk` to `src/assets/js/portfolio-filter.js`

**Files:**
- `src/index.njk` (extract data & JS)
- `src/assets/js/identity-test.js` (modularize)

---

### 🟢 Priority 3: Improve Code Hygiene
**Risk:** Low-Medium | **Effort:** Low | **Impact:** Medium

**Actions:**
- Remove commented code from `src/assets/js/main.js`
- Clean up unused sitemap plugin or implement it
- Update `robots.txt` with actual domain
- ~~Verify and fix `dotenv` version in `package.json`~~ ✅ Already correct
- Add JSDoc comments to complex functions in `identity-test.js`

**Files:**
- `src/assets/js/main.js`
- `package.json`
- `src/robots.txt`
- `src/assets/js/identity-test.js`

---

## Additional Recommendations

### Short-term (1-2 weeks)
1. Run `npm audit` to check for security vulnerabilities
2. Add ESLint rule to warn on console statements in production
3. Create `.env.example` file documenting required environment variables
4. Add build-time check to ensure no hardcoded secrets

### Medium-term (1 month)
1. Implement code splitting for identity test (load only when needed)
2. Add unit tests for quiz scoring logic
3. Create reusable portfolio data structure
4. Document build process and deployment steps

### Long-term (3+ months)
1. Consider migrating to TypeScript for better type safety
2. Implement automated dependency updates (Dependabot/Renovate)
3. Add performance monitoring (Web Vitals)
4. Consider implementing a design system documentation site

---

## Conclusion

The Golden Years Photo website demonstrates **solid architectural foundations** with proper separation of concerns, environment variable usage, and modern tooling. The main areas for improvement are:

1. **Code cleanliness** - Remove debug code and hardcoded values
2. **File organization** - Break down large files into smaller, maintainable modules
3. **Data extraction** - Move embedded data to proper data files

With the recommended refactoring, the project will be more maintainable, performant, and secure. The current codebase is **production-ready** but would benefit from the cleanup efforts outlined above.

---

**Report Generated By:** AI Code Auditor  
**Next Review Recommended:** After Priority 1-3 refactoring completed
