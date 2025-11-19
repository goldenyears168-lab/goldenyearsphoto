# Design Tokens Usage Guide

## Overview

The design tokens in `_c-00-tokens.scss` provide a semantic, maintainable way to style components across the codebase. This guide explains how to migrate existing styles and use tokens in new code.

## Token Categories

### 1. Color Tokens

**Brand Colors** - Core brand identity (change these to rebrand):
- `--color-brand-primary` - Main brand color (#353242)
- `--color-brand-accent` - Secondary accent (#958985)
- `--color-brand-cta` - Call-to-action color (#d0d7f1)

**Semantic Colors** - Use these instead of hard-coded colors:
- `--color-text` - Primary text color
- `--color-text-subtle` - Muted/secondary text
- `--color-surface` - Card/container backgrounds
- `--color-surface-2` - Page backgrounds
- `--color-border` - Default borders

**Migration Example:**
```scss
// ❌ Old way
color: #242436;
background: #fff;

// ✅ New way
color: var(--color-text);
background: var(--color-surface);
```

### 2. Typography Tokens

**Font Sizes:**
- `--font-size-xs` through `--font-size-4xl`
- Use semantic sizes: `--font-size-base` for body, `--font-size-2xl` for headings

**Line Heights:**
- `--line-height-tight` (1.2) - Headings
- `--line-height-relaxed` (1.6) - Body text
- `--line-height-loose` (1.7) - Prose

**Migration Example:**
```scss
// ❌ Old way
font-size: 16px;
line-height: 1.6;

// ✅ New way
font-size: var(--font-size-base);
line-height: var(--line-height-relaxed);
```

### 3. Spacing Tokens

**Spacing Scale** - Use these instead of hard-coded pixel values:
- `--space-1` (4px) through `--space-12` (64px)
- Common sizes: `--space-4` (16px), `--space-6` (24px), `--space-8` (32px)

**Migration Example:**
```scss
// ❌ Old way
padding: 24px;
margin-bottom: 30px;
gap: 20px;

// ✅ New way
padding: var(--space-6);
margin-bottom: var(--space-8);
gap: var(--space-5);
```

### 4. Radius Tokens

**Component-Specific:**
- `--radius-button` - For buttons (20px/pill shape)
- `--radius-card` - For cards (12px)
- `--radius-input` - For form inputs (8px)

**Size-Based:**
- `--radius-sm` (4px) through `--radius-full` (9999px)

**Migration Example:**
```scss
// ❌ Old way
border-radius: 12px;
border-radius: 20px;

// ✅ New way
border-radius: var(--radius-card);
border-radius: var(--radius-button);
```

### 5. Shadow Tokens

**Component-Specific:**
- `--shadow-card` - Default card shadow
- `--shadow-card-hover` - Card hover state
- `--shadow-button` - Button shadow
- `--shadow-button-hover` - Button hover

**Migration Example:**
```scss
// ❌ Old way
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);

// ✅ New way
box-shadow: var(--shadow-card);
box-shadow: var(--shadow-card-hover);
```

## Migration Strategy

### Phase 1: Update Base Layer (`_c-01-base.scss`)

Start with the base layer since it affects everything:

```scss
// Update body styles
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text);
  background-color: var(--color-surface-2);
}

// Update headings
h1, h2, h3, h4 {
  color: var(--color-brand-primary);
  line-height: var(--line-height-tight);
}

// Update links
a {
  color: var(--color-text-link);
}
a:hover {
  color: var(--color-text-link-hover);
}
```

### Phase 2: Update Component Layer (`3-components/`)

Migrate reusable components:

```scss
// Button component
.button {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-button);
}

.button-primary {
  background-color: var(--color-brand-cta);
  color: var(--color-text-on-accent);
}

// Card component
.c-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
}

.c-card:hover {
  box-shadow: var(--shadow-card-hover);
}
```

### Phase 3: Update Layout Layer (`2-layout/`)

Migrate layout components:

```scss
// Header
.global-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
}

// Container
.container {
  max-width: var(--container-max-width);
  padding: 0 var(--container-padding);
}
```

### Phase 4: Update Page-Specific Styles (`4-pages/`)

Finally, update page-specific overrides:

```scss
// Filter buttons
.filter-btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-base);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

// Gallery items
.gallery-item {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
```

## Common Patterns

### Spacing in Grids
```scss
.portfolio-gallery {
  display: grid;
  gap: var(--space-5); // Instead of 20px
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
```

### Module Padding
```scss
.module {
  padding-block: var(--space-8); // Instead of clamp(2rem, 4vw, 4rem)
}

.module-gray {
  background: var(--color-surface-2);
  border-radius: var(--radius-card);
}
```

### Text Hierarchy
```scss
.hero-title {
  font-size: var(--font-size-4xl);
  line-height: var(--line-height-tight);
  color: var(--color-brand-primary);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-subtle);
}
```

## Backward Compatibility

The refactored tokens file includes legacy mappings, so existing code won't break:

- `--color-dark` → `--color-brand-primary`
- `--color-cta` → `--color-brand-cta`
- `--color-primary-accent` → `--color-brand-accent`
- `--header-h` → `--header-height`
- `--radius-1`, `--radius-2`, `--radius-3` → semantic radius tokens

**However**, you should migrate to semantic tokens over time for better maintainability.

## Best Practices

1. **Always use tokens** - Never hard-code colors, spacing, or other design values
2. **Use semantic names** - Prefer `--color-text` over `--color-neutral-900`
3. **Component-specific tokens** - Use `--radius-button` instead of `--radius-xl` when styling buttons
4. **Consistent spacing** - Use the spacing scale (`--space-*`) instead of arbitrary values
5. **Test contrast** - Ensure text colors meet WCAG AA standards (especially `--color-text` on `--color-surface`)

## Quick Reference

| Category | Token Pattern | Example |
|----------|--------------|---------|
| Colors | `--color-{semantic}` | `--color-text`, `--color-surface` |
| Typography | `--font-size-{size}` | `--font-size-base`, `--font-size-2xl` |
| Spacing | `--space-{number}` | `--space-4`, `--space-6` |
| Radius | `--radius-{component}` | `--radius-button`, `--radius-card` |
| Shadows | `--shadow-{component}` | `--shadow-card`, `--shadow-button` |

## Questions?

If you're unsure which token to use:
1. Check the tokens file for available options
2. Use semantic names that describe the purpose (e.g., `--color-text` not `--color-gray-900`)
3. When in doubt, use the component-specific token (e.g., `--radius-button` for buttons)

