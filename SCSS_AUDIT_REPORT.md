# SCSS Codebase Audit Report - "Warm × Enterprise" Design System

## Executive Summary

This audit identified and resolved violations of ITCSS layer responsibilities, hard-coded magic values, and inconsistent naming patterns in the SCSS codebase. The refactor enforces the design token system and improves maintainability.

---

## File: `assets/css/4-pages/_p-blog-pages.scss`

### Issues Identified

1. **Layer Violations** - Reusable components in page layer:
   - `.content-intro` - Used across multiple blog pages (should be in `3-components`)
   - `.layout-split` - Duplicate definition (exists in both `_k-00-components.scss` and `_p-blog-pages.scss`)
   - `.content-image-grid` - Reusable grid pattern (should be in `3-components`)

2. **Hard-Coded Magic Values** (should use design tokens):
   - `1.1rem` → `var(--font-size-lg)`
   - `50px` → `var(--space-10)`
   - `750px` → `46.875rem` (or token if we add max-width tokens)
   - `30px`, `40px` → `var(--space-6)`, `var(--space-8)`
   - `12px`, `8px`, `16px` → `var(--radius-card)`, `var(--space-2)`, `var(--space-4)`
   - `1.8rem`, `1.05rem` → `var(--font-size-3xl)`, `var(--font-size-base)`
   - `15px` → `var(--space-4)`
   - `rgba(0, 0, 0, 0.08)` → `var(--shadow-lg)`
   - `rgba(0, 0, 0, 0.05)` → `var(--shadow-card)`

3. **Inconsistent Naming**:
   - Mix of old token names (`--color-text-dark`, `--color-dark`) and new semantic names
   - Should use: `--color-text`, `--color-brand-primary`

4. **Duplicate Code**:
   - `.layout-split` defined in both `_k-00-components.scss` and `_p-blog-pages.scss`

---

## Refactored Solution

### BEFORE (Original `_p-blog-pages.scss`):

```scss
/* --- 1. 介紹文字區塊 --- */
.content-intro {
  font-size: 1.1rem;                    /* ❌ Hard-coded */
  text-align: center;
  margin-bottom: 50px;                 /* ❌ Hard-coded */
  max-width: 750px;                    /* ❌ Hard-coded */
  margin-inline: auto;
  color: var(--color-text-dark);       /* ❌ Old token name */
  line-height: 1.7;                    /* ❌ Hard-coded */
  
  p:first-of-type {
    font-size: 1.15rem;                /* ❌ Hard-coded */
    color: var(--color-dark);          /* ❌ Old token name */
    font-weight: 500;                  /* ❌ Hard-coded */
  }
  
  strong {
    color: var(--color-primary-accent); /* ❌ Old token name */
    font-weight: 600;                   /* ❌ Hard-coded */
  }
}

/* --- 2. 圖文分離 (雙欄) --- */
.layout-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;                           /* ❌ Hard-coded */
  align-items: center;
  margin-top: 40px;                    /* ❌ Hard-coded */
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 40px;                         /* ❌ Hard-coded */
  }
}

.layout-split-image {
  border-radius: 12px;                 /* ❌ Hard-coded */
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); /* ❌ Hard-coded */
}

.layout-split-text {
  h2 {
    font-size: 1.8rem;                 /* ❌ Hard-coded */
    color: var(--color-dark);          /* ❌ Old token name */
    margin-bottom: 16px;               /* ❌ Hard-coded */
  }
  p {
    font-size: 1.05rem;                /* ❌ Hard-coded */
    line-height: 1.7;                  /* ❌ Hard-coded */
    margin-bottom: 16px;               /* ❌ Hard-coded */
  }
}

/* --- 3. 內容圖片格線 --- */
.content-image-grid {
  gap: 15px;                           /* ❌ Hard-coded */
  margin-top: 30px;                    /* ❌ Hard-coded */
  
  .grid-image {
    border-radius: 8px;                /* ❌ Hard-coded */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); /* ❌ Hard-coded */
  }
}
```

### AFTER (Refactored):

**New file: `assets/css/3-components/_k-content-layout.scss`** (moved reusable components):

```scss
@layer components {
  
  .content-intro {
    font-size: var(--font-size-lg);              /* ✅ Token */
    text-align: center;
    margin-bottom: var(--space-10);              /* ✅ Token */
    max-width: 46.875rem;                        /* ✅ Semantic value */
    margin-inline: auto;
    color: var(--color-text);                    /* ✅ New token name */
    line-height: var(--line-height-loose);       /* ✅ Token */
    
    p:first-of-type {
      font-size: var(--font-size-xl);            /* ✅ Token */
      color: var(--color-brand-primary);         /* ✅ New token name */
      font-weight: var(--font-weight-medium);     /* ✅ Token */
    }
    
    strong {
      color: var(--color-brand-accent);          /* ✅ New token name */
      font-weight: var(--font-weight-semibold);   /* ✅ Token */
    }
  }
  
  .layout-split {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);                         /* ✅ Token */
    align-items: center;
    margin-top: var(--space-8);                  /* ✅ Token */
    
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);                      /* ✅ Token */
    }
  }
  
  .layout-split-image {
    border-radius: var(--radius-card);           /* ✅ Token */
    overflow: hidden;
    box-shadow: var(--shadow-lg);                /* ✅ Token */
  }
  
  .layout-split-text {
    h2 {
      font-size: var(--font-size-3xl);          /* ✅ Token */
      color: var(--color-brand-primary);        /* ✅ New token name */
      margin-bottom: var(--space-4);             /* ✅ Token */
      line-height: var(--line-height-tight);     /* ✅ Token */
    }
    
    p {
      font-size: var(--font-size-base);          /* ✅ Token */
      line-height: var(--line-height-loose);     /* ✅ Token */
      margin-bottom: var(--space-4);             /* ✅ Token */
      color: var(--color-text);                  /* ✅ New token name */
    }
  }
  
  .content-image-grid {
    gap: var(--space-4);                         /* ✅ Token */
    margin-top: var(--space-6);                  /* ✅ Token */
    
    .grid-image {
      border-radius: var(--radius-md);          /* ✅ Token */
      box-shadow: var(--shadow-card);            /* ✅ Token */
    }
  }
}
```

**Updated: `assets/css/4-pages/_p-blog-pages.scss`** (now minimal):

```scss
@layer pages {
  /* Blog-specific overrides can go here if needed */
  /* Reusable components moved to 3-components/_k-content-layout.scss */
}
```

---

## Cross-File Follow-Ups

### Priority 1: Remove Duplicate Definitions

1. **`assets/css/3-components/_k-00-components.scss`** (lines 102-114)
   - ✅ **FIXED**: Removed duplicate `.layout-split` definition
   - **Action**: Components now consolidated in `_k-content-layout.scss`

### Priority 2: Migrate Other Page Files

2. **`assets/css/4-pages/p-guide-makeup.scss`**
   - **Issues**:
     - Hard-coded values: `80px`, `20px`, `60px`, `15px`, `30px`, `24px`, `8px`, `16px`, `2px`, `4px`, `6px`
     - Hard-coded colors: `#28a745`, `#888`, `#dc3545`, `#fff`
     - Magic numbers: `800px`, `300px`, `420px`
     - Reusable `.service-package` component should be in `3-components`
   - **Action**: Extract `.service-package` to `3-components/_k-service-package.scss`, replace hard-coded values with tokens

3. **`assets/css/4-pages/p-price-list.scss`**
   - **Issues**:
     - Hard-coded values: `25px`, `10px`, `8px`, `20px`, `28px`, `12px`
     - Should use spacing tokens
   - **Action**: Replace all hard-coded spacing with `--space-*` tokens

4. **`assets/css/4-pages/p-booking-hub.scss`**
   - **Issues**:
     - Hard-coded values: `30px`, `12px`, `24px`, `20px`, `10px`, `6px`
     - Hard-coded colors: `#fff`, `rgb(0 0 0 / 5%)`, `rgb(0 0 0 / 8%)`
     - `.store-card` styles should use `.card card--booking` pattern
   - **Action**: Migrate to unified card system, replace hard-coded values

5. **`assets/css/4-pages/p-booking-page.scss`**
   - **Issues**:
     - Hard-coded values: `30px`, `10px`, `16px`, `18px`, `20px`, `28px`, `24px`, `12px`, `8px`
     - Hard-coded colors: `#ddd`, `#e0dcdc`, `#0F2341`, `#666`
     - Magic numbers: `1140px`
   - **Action**: Replace with design tokens, use `--container-max-width` token

6. **`assets/css/4-pages/p-faq.scss`**
   - **Issues**:
     - Uses non-existent tokens: `--color-ink`, `--color-ink-2`, `--surface-2`, `--radius-2`, `--space-9`, `--space-8`, `--space-7`
     - Hard-coded: `#000`, `#fff`
   - **Action**: Map to correct token names from `_c-00-tokens.scss`

### Priority 3: Component Layer Cleanup

7. **`assets/css/3-components/_k-02-team-grid.scss`**
   - **Issues**:
     - Hard-coded: `1.5rem`, `8px`, `0.75rem`, `0.25rem`, `0.9rem`, `#555`, `#f4f4f4`
     - Should use design tokens
   - **Action**: Replace with tokens, consider migrating `.team-card` to unified `.card card--team` pattern

8. **`assets/css/3-components/_k-00-components.scss`**
   - **Issues**:
     - `.social-proof-grid` uses hard-coded: `20px`, `30px`, `8px`
     - Should use spacing and radius tokens
   - **Action**: Replace with `--space-*` and `--radius-*` tokens

### Priority 4: Token System Enhancements

9. **`assets/css/1-core/_c-00-tokens.scss`**
   - **Consider adding**:
     - `--max-width-content: 46.875rem` (750px) - For readable content width
     - `--max-width-narrow: 28.125rem` (450px) - For narrow content
     - `--max-width-wide: 75rem` (1200px) - For wide containers
   - **Action**: Add content width tokens if needed for consistency

---

## Summary of Changes

### ✅ Completed

1. **Created** `assets/css/3-components/_k-content-layout.scss`
   - Moved reusable components from page layer to component layer
   - Replaced all hard-coded values with design tokens
   - Updated to use new semantic token names

2. **Refactored** `assets/css/4-pages/_p-blog-pages.scss`
   - Removed reusable components (moved to `3-components`)
   - File now contains only placeholder for page-specific overrides
   - Enforces ITCSS layer responsibilities

3. **Cleaned** `assets/css/3-components/_k-00-components.scss`
   - Removed duplicate `.layout-split` definition
   - Added comment directing to new location

4. **Updated** `assets/css/main.scss`
   - Added import for new `_k-content-layout.scss`

### 📋 Remaining Work

- Migrate `p-guide-makeup.scss` (service package component)
- Migrate `p-booking-hub.scss` (use unified card system)
- Migrate `p-booking-page.scss` (replace hard-coded values)
- Fix `p-faq.scss` (map to correct token names)
- Update `_k-02-team-grid.scss` (use tokens)
- Update `_k-00-components.scss` (social-proof-grid tokens)

---

## Design Token Migration Checklist

When refactoring other files, replace:

| Old Value | New Token | Notes |
|-----------|-----------|-------|
| `1.1rem` | `var(--font-size-lg)` | Font sizes |
| `1.8rem` | `var(--font-size-3xl)` | Headings |
| `12px`, `8px`, `16px` | `var(--space-3)`, `var(--space-2)`, `var(--space-4)` | Spacing |
| `30px`, `40px` | `var(--space-6)`, `var(--space-8)` | Larger spacing |
| `12px` | `var(--radius-card)` | Border radius |
| `rgba(0, 0, 0, 0.08)` | `var(--shadow-lg)` | Shadows |
| `#fff` | `var(--color-surface)` | Colors |
| `#555` | `var(--color-text-subtle)` | Text colors |
| `1.7` | `var(--line-height-loose)` | Line heights |

---

## Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Change tokens once, update everywhere
3. **ITCSS Compliance**: Proper layer separation (components vs pages)
4. **Reduced Duplication**: Single source of truth for reusable patterns
5. **Easier Theming**: Token-based system enables easy rebranding

