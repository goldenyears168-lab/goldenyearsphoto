# Card Component Migration Guide

## Overview

All card-like UI blocks have been consolidated into a unified card system using the "Warm × Enterprise" design tokens. This guide explains how to migrate existing cards to the new pattern.

## Base Card Structure

All cards use the base `.card` class with variant modifiers:

```html
<div class="card card--[variant]">
  <div class="card__image">...</div>
  <div class="card__body">...</div>
  <div class="card__footer">...</div>
</div>
```

## Card Variants

### 1. Service Card (`.card--service`)

**Use for:** Price listings, service descriptions

**Example:**
```html
<div class="card card--service card--split">
  <div class="card__body">
    <h3 class="card__title">服務名稱</h3>
    <p class="card__price">
      $399 <span class="card__price-unit">/張</span>
    </p>
    <p class="card__content">服務描述...</p>
  </div>
  <div class="card__media">
    <img src="..." alt="..." />
  </div>
</div>
```

**Migration from `.c-card`:**
- `.c-card` → `.card card--service`
- `.c-card--split` → `.card--split` (modifier)
- `.c-card__body` → `.card__body`
- `.c-card__title` → `.card__title`
- `.c-card__price` → `.card__price`
- `.c-card__media` → `.card__media`

### 2. Team Card (`.card--team`)

**Use for:** Team member profiles

**Example:**
```html
<a href="..." class="card card--team">
  <div class="card__image">
    <img src="..." alt="..." />
  </div>
  <div class="card__body">
    <h3 class="card__title">姓名</h3>
    <p class="card__subtitle">職稱</p>
  </div>
</a>
```

**Migration from `.team-card`:**
- `.team-card` → `.card card--team`
- `.team-card-image` → `.card__image`
- `.team-title` → `.card__subtitle`
- Remove inline `h3` styles (now handled by `.card__title`)

### 3. Testimonial Card (`.card--testimonial`)

**Use for:** Customer quotes, testimonials

**Example:**
```html
<div class="card card--testimonial">
  <div class="card__body">
    <p class="card__content">"Customer quote here..."</p>
  </div>
  <div class="card__footer">
    <p class="card__author">- Customer Name</p>
  </div>
</div>
```

**Migration from `.magazine` blockquote:**
- `<blockquote class="magazine">` → `<div class="card card--testimonial">`
- `<p>` → `<p class="card__content">`
- `<footer>` → `<div class="card__footer"><p class="card__author">`
- Remove inline `style` attributes (use design tokens)

### 4. Booking Card (`.card--booking`)

**Use for:** Location/store selection cards

**Example:**
```html
<a href="..." class="card card--booking">
  <div class="card__image">
    <img src="..." alt="..." />
  </div>
  <div class="card__body">
    <h3 class="card__title">店名</h3>
    <p class="card__content">描述...</p>
  </div>
  <div class="card__footer">
    <span class="card__action">預約按鈕</span>
  </div>
</a>
```

**Migration from `.store-card`:**
- `.store-card` → `.card card--booking`
- `.store-card-image` → `.card__image`
- `.store-card-content` → `.card__body`
- `.store-card-title` → `.card__title`
- `.store-card-desc` → `.card__content`
- `.store-card-footer` → `.card__footer`
- `.cta-button-link` → `.card__action`

## Design Token Usage

All cards now use design tokens:

**Colors:**
- `--color-surface` - Card background
- `--color-border` - Card border
- `--color-brand-primary` - Title color
- `--color-text` / `--color-text-subtle` - Text colors

**Spacing:**
- `--space-6` - Card body padding
- `--space-8` - Split layout padding
- `--space-3`, `--space-4` - Internal gaps

**Shadows:**
- `--shadow-card` - Default shadow
- `--shadow-card-hover` - Hover state

**Radius:**
- `--radius-card` - Card corners

## Step-by-Step Migration

### Step 1: Identify Card Type
Determine which variant to use:
- Service/price listings → `.card--service`
- Team members → `.card--team`
- Testimonials → `.card--testimonial`
- Booking/location cards → `.card--booking`

### Step 2: Update HTML Structure
1. Replace old class names with new `.card` classes
2. Use semantic BEM structure: `.card__body`, `.card__title`, etc.
3. Remove inline styles (they're now handled by design tokens)

### Step 3: Remove Old SCSS
1. Remove page-specific card styles from `4-pages/` files
2. Remove old `.c-card` styles (if not using legacy support)
3. Remove `.team-card` styles from `_k-02-team-grid.scss` (if migrating)

### Step 4: Test
1. Verify visual appearance matches design
2. Check hover states work correctly
3. Test responsive behavior
4. Verify accessibility (focus states, semantic HTML)

## Common Patterns

### Split Layout (Two Columns)
Add `.card--split` modifier:
```html
<div class="card card--service card--split">
  <!-- Content on left, media on right (desktop) -->
</div>
```

### Cards in Grid
Use existing grid classes (`.team-grid`, `.store-selection-grid`) with new card classes:
```html
<div class="team-grid">
  <a href="..." class="card card--team">...</a>
  <a href="..." class="card card--team">...</a>
</div>
```

### Multiple Testimonials
Stack testimonial cards with spacing:
```html
<div class="card card--testimonial">...</div>
<div class="card card--testimonial" style="margin-top: var(--space-6);">...</div>
```

## Files to Update

**Priority 1 (Already refactored):**
- ✅ `price-list.njk` - Service cards
- ✅ `about.njk` - Team cards (one example)
- ✅ `blog/profile.njk` - Testimonials
- ✅ `booking/index.njk` - Booking cards

**Priority 2 (Remaining):**
- `about.njk` - Remaining team cards
- `price-list.njk` - Remaining service cards
- `blog/*.njk` - Other testimonial blocks
- `guide/makeup-and-hair.njk` - Any card patterns
- `assets/css/4-pages/p-booking-hub.scss` - Remove old `.store-card` styles
- `assets/css/3-components/_k-02-team-grid.scss` - Remove old `.team-card` styles (after migration)

## Backward Compatibility

The new card system includes legacy support for `.c-card` classes, so existing code won't break. However, you should migrate to the new `.card` classes for:

1. **Consistency** - All cards use the same base styles
2. **Maintainability** - Easier to update design tokens
3. **Future-proofing** - Legacy support may be removed in future versions

## Questions?

- Check `assets/css/3-components/_k-card.scss` for all available classes
- Use design tokens from `_c-00-tokens.scss` for any custom overrides
- Follow the BEM naming convention: `.card`, `.card--variant`, `.card__element`

