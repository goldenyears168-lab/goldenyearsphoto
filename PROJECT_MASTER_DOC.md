# Golden Years Photo - Comprehensive Development Guide

## 1. Project Overview

**Golden Years Photo** (好時有影) is a professional photography studio website built as a static site. The platform showcases the studio's services including professional portraits, Korean-style ID photos, graduation photography, and various portrait services across two locations in Taipei (Zhongshan and Gongguan).

**Value Proposition:**
- High-performance static site with CDN-optimized image delivery
- SEO-optimized with automated sitemap generation
- Accessibility-first design with ARIA-compliant navigation
- Mobile-responsive with progressive enhancement patterns

**Target Audience:** Potential clients seeking professional photography services in Taipei, Taiwan.

---

## 2. Tech Stack & Architecture

### Core Frameworks

- **Eleventy (11ty) v2.0.1** - Static Site Generator
  - Template Engine: Nunjucks (`.njk` files)
  - Build System: Integrated SCSS compilation, image processing

### Build Tools

- **Sass (Dart Sass) v1.94.0** - CSS preprocessing
- **Sharp v0.34.5** - Image optimization (standalone scripts)
- **@11ty/eleventy-img v4.0.2** - Responsive image generation
- **AWS SDK (S3 Client) v3.932.0** - Cloudflare R2 integration for portfolio images

### Styling Strategy

**Architecture:** ITCSS-inspired modular SCSS with CSS Layers

- **Global Styles:** `main.scss` imports core/layout/component styles
- **Page-Specific Styles:** Individual SCSS files compiled separately (e.g., `p-home.scss`)
- **CSS Layers:** `reset, tokens, base, layout, components, pages, utilities`
- **Organization:**
  - `1-core/` - Design tokens, base styles
  - `2-layout/` - Header, footer, structure
  - `3-components/` - Reusable UI components
  - `4-pages/` - Page-specific overrides

**Code Quality Tools:**
- **ESLint v9.39.1** - JavaScript linting
- **Stylelint v16.25.0** - SCSS linting
- **Accessibility Testing:** @axe-core/cli, pa11y, html-validate
- **Performance Testing:** Lighthouse, @lhci/cli

### Directory Structure

```
goldenyearsphoto/
├── _data/                          # Global data files
│   └── metadata.json               # Site-wide constants (URL, etc.)
│
├── _includes/                      # Shared templates
│   └── base-layout.njk             # Master layout (header, footer, <head>)
│
├── _site/                          # Build output (deployed directory)
│   ├── assets/                     # Compiled CSS, copied JS/images
│   ├── blog/                       # Generated blog pages
│   ├── booking/                    # Generated booking pages
│   └── sitemap.xml                 # Auto-generated sitemap
│
├── assets/
│   ├── css/
│   │   ├── 1-core/                 # Design tokens, base styles
│   │   │   ├── _c-00-tokens.scss   # CSS variables, z-index
│   │   │   └── _c-01-base.scss     # Reset, typography
│   │   ├── 2-layout/               # Layout components
│   │   │   ├── _l-00-structure.scss
│   │   │   ├── _l-01-header.scss   # Navigation, mobile menu
│   │   │   └── _l-02-footer.scss
│   │   ├── 3-components/           # Reusable components
│   │   │   ├── _k-00-components.scss # Cards, buttons
│   │   │   └── _k-02-team-grid.scss
│   │   ├── 4-pages/                # Page-specific styles
│   │   │   ├── p-home.scss
│   │   │   ├── p-price-list.scss
│   │   │   └── ...
│   │   └── main.scss               # Global entry point
│   │
│   ├── images/
│   │   ├── content/                # Page-specific images
│   │   │   ├── about/              # Team photos
│   │   │   ├── blog/               # Blog post images
│   │   │   └── ...
│   │   ├── portfolio/              # Portfolio galleries (20+ categories)
│   │   └── ui/                     # Logos, favicons
│   │
│   ├── images-original/            # Unprocessed source images
│   └── js/
│       └── main.js                 # Global JavaScript (navigation, filters)
│
├── blog/                           # Blog page templates
│   ├── index.njk                   # Blog listing
│   ├── profile.njk                 # Professional portraits
│   ├── graduation.njk              # Graduation photography
│   └── ...
│
├── booking/                        # Booking page templates
│   ├── index.njk                   # Location selection hub
│   ├── zhongshan.njk               # Zhongshan location
│   └── gongguan.njk                # Gongguan location
│
├── guide/                          # Guide page templates
│   ├── faq.njk
│   ├── makeup-and-hair.njk
│   └── crop-tool.njk
│
├── scripts/                        # Build automation
│   ├── compress-images.mjs         # Image optimization pipeline
│   └── upload-portfolio-to-r2.mjs  # R2 CDN upload automation
│
├── .eleventy.js                    # Eleventy configuration
├── eslint.config.js                # JavaScript linting rules
├── package.json                    # Dependencies and scripts
├── sitemap.xml.njk                 # Sitemap template
├── robots.txt                      # SEO robots file
└── _redirects                      # Netlify redirects (if applicable)
```

**Key Annotations:**
- `_includes/` - Shared templates (layouts)
- `_data/` - Global data accessible in all templates
- `_site/` - Generated static files (deployment target)
- Files starting with `_` in SCSS are partials (not compiled separately)
- `.njk` files are Nunjucks templates

---

## 3. Getting Started

### Prerequisites

- **Node.js:** v16+ (tested with v18+)
- **npm:** v7+ (comes with Node.js)
- **Git:** For version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd goldenyearsphoto

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory (optional, for R2 CDN):

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_BASE_URL=https://your-r2-domain.com
```

**Note:** The site works without `.env` (falls back to local images), but R2 is recommended for production performance.

### Development Commands

```bash
# Start development server with hot reload
npm run dev
# or
npm start

# The site will be available at http://localhost:8080
```

**Development Features:**
- Hot reload on file changes
- SCSS compilation on save
- Watch mode for templates and assets

### Production Build

```bash
# Generate static site
npm run build

# Output directory: _site/
```

**Build Process:**
1. Eleventy processes all `.njk` templates
2. SCSS files compile to CSS
3. Images are processed (responsive WebP generation)
4. Static assets are copied to `_site/`
5. Sitemap is generated automatically

### Additional Scripts

```bash
# Image optimization (standalone)
npm run compress-images

# Upload portfolio images to R2 CDN
npm run upload-portfolio

# Lint JavaScript
npm run lint:js
npm run lint:js:fix

# Lint SCSS
npm run lint:css
npm run lint:css:fix

# Run all linters
npm run lint
```

---

## 4. Core Logic & Development Guidelines

### Page Generation

**How Source Files Become HTML:**

1. **Template Processing:**
   - Eleventy scans root directory for `.njk`, `.md`, `.html` files
   - Each file's front matter (YAML) is parsed
   - Template is rendered using Nunjucks engine
   - Output is written to `_site/` maintaining directory structure

2. **Example Flow:**
   ```
   index.njk (with front matter)
        ↓
   Eleventy processes template
        ↓
   Injects into base-layout.njk
        ↓
   Compiles SCSS → CSS
        ↓
   Generates _site/index.html
   ```

3. **URL Structure:**
   - `index.njk` → `/index.html` (root)
   - `blog/profile.njk` → `/blog/profile/index.html`
   - `permalink` in front matter overrides default URL

### Templating System

**Layouts:**
- **Single Layout:** `_includes/base-layout.njk`
- All pages inherit via front matter: `layout: "base-layout.njk"`
- Layout provides: `<head>`, header navigation, footer, `{{ content | safe }}` injection

**Adding a New Page:**
```yaml
---
layout: "base-layout.njk"
title: "Page Title"
seo:
  description: "SEO description"
  keywords: "keyword1, keyword2"
pageStyles: |
  <link rel="stylesheet" href="/assets/css/4-pages/p-custom.css">
---

<div class="module">
  <div class="container">
    <h1>{{ title }}</h1>
    <!-- Your content here -->
  </div>
</div>
```

**Editing Layouts:**
- Modify `_includes/base-layout.njk` for global changes
- Header/footer are hardcoded in layout (not extracted as partials)
- Navigation structure uses ARIA attributes for accessibility

**Custom Filters & Shortcodes:**
- `r2img` filter: Routes images to R2 CDN or local fallback
  ```nunjucks
  <img src="{{ 'portfolio/korean-id/korean-id-1.jpg' | r2img }}" alt="...">
  ```
- `image` shortcode: Generates responsive images with WebP
  ```nunjucks
  {% image "/assets/images/ui/logo.jpg", "Alt text", "100vw", "logo-class" %}
  ```
- `dateToISO` filter: Converts dates to ISO format (for sitemap)

### Data Management

**Three Data Sources:**

1. **Global Data (`_data/metadata.json`):**
   ```json
   {
     "url": "https://goldenyearsphoto.com"
   }
   ```
   - Accessible in all templates as `metadata.url`
   - Used for canonical URLs, sitemap generation

2. **Front Matter (YAML in templates):**
   ```yaml
   ---
   title: "Page Title"
   seo:
     description: "SEO description"
   pageStyles: |
     <link rel="stylesheet" href="/assets/css/custom.css">
   ---
   ```
   - Page-specific metadata
   - Injected into layout via `{{ title }}`, `{{ seo.description }}`

3. **Collections:**
   - Custom collection `pagesForSitemap` filters all pages
   - Used in `sitemap.xml.njk` to generate XML dynamically
   - Defined in `.eleventy.js` (lines 90-112)

**No External APIs:**
- All data is static (no CMS, no API calls)
- Portfolio images served from R2 CDN (URLs generated at build time)

### Asset Pipeline

**CSS Compilation:**

1. **Global Styles:**
   - `main.scss` imports all core/layout/component styles
   - Compiled to `_site/assets/css/main.css`
   - Loaded on every page via `base-layout.njk`

2. **Page-Specific Styles:**
   - Individual SCSS files in `4-pages/` (e.g., `p-home.scss`)
   - Compiled separately to individual CSS files
   - Injected via front matter `pageStyles`:
     ```yaml
     pageStyles: |
       <link rel="stylesheet" href="/assets/css/4-pages/p-home.css">
     ```

3. **SCSS Processing:**
   - Eleventy custom extension compiles SCSS → CSS
   - Files starting with `_` are partials (not output)
   - Uses Sass `@use` (not `@import`) for modern module system
   - CSS Layers prevent specificity conflicts

**JavaScript:**
- Single global file: `assets/js/main.js`
- Handles: mobile navigation, dropdowns, portfolio filters
- Loaded once in `base-layout.njk`
- No module system (vanilla JS in IIFE)

**Image Management:**

1. **R2 CDN (Portfolio Images):**
   - Images uploaded via `npm run upload-portfolio`
   - Templates use `r2img` filter for CDN URLs
   - Falls back to local if `R2_PUBLIC_BASE_URL` not set

2. **Local Processing (UI Assets):**
   - Uses `image` shortcode for responsive WebP generation
   - Generates multiple widths: 400w, 800w, 1200w
   - Outputs optimized `<picture>` elements

---

## 5. Deployment

### Recommended Platforms

**Netlify (Recommended):**
1. Connect repository to Netlify
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`
   - **Node version:** 18.x (or latest LTS)
3. Environment variables (optional, for R2):
   - Add all `R2_*` variables from `.env`
4. Deploy automatically on push to `main` branch

**Vercel:**
1. Connect repository to Vercel
2. Framework preset: **Other**
3. Build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `_site`
4. Environment variables: Add `R2_*` variables if using R2

**Cloudflare Pages:**
1. Connect repository
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`
   - **Node version:** 18
3. Environment variables: Add `R2_*` variables

### Pre-Deployment Checklist

- [ ] Run `npm run build` locally to verify build succeeds
- [ ] Test all pages load correctly
- [ ] Verify images load (check R2 CDN if using)
- [ ] Run `npm run lint` and fix any errors
- [ ] Check `_site/sitemap.xml` is generated
- [ ] Verify `robots.txt` is copied to `_site/`
- [ ] Test mobile navigation and responsive design

### Post-Deployment

1. **Verify Sitemap:** Check `https://yourdomain.com/sitemap.xml`
2. **Test Images:** Verify portfolio images load from R2 CDN
3. **Lighthouse Audit:** Run Lighthouse to check performance/accessibility
4. **Monitor:** Check Netlify/Vercel logs for build errors

---

## 6. TODOs & Optimization Suggestions

### 1. Extract Navigation to Partial
**Current State:** Navigation HTML is hardcoded in `base-layout.njk` (~140 lines)

**Recommendation:**
- Create `_includes/navigation.njk` partial
- Include via `{% include "navigation.njk" %}`
- **Benefit:** Easier maintenance, reusable across layouts if needed

**Priority:** Medium

---

### 2. Implement Nunjucks Macros for Portfolio Galleries
**Current State:** Portfolio galleries use repeated `<img>` tags with manual `r2img` filter calls

**Recommendation:**
- Create `_includes/macros/portfolio.njk` with macro:
  ```nunjucks
  {% macro portfolioImage(category, filename, alt) %}
    <img src="{{ (category + '/' + filename) | r2img }}" alt="{{ alt }}" ...>
  {% endmacro %}
  ```
- **Benefit:** Reduces duplication, easier to update image attributes globally

**Priority:** Low (works but could be cleaner)

---

### 3. Add Blog Posts Collection
**Current State:** Blog pages are individual `.njk` files, no collection structure

**Recommendation:**
- Create `blog/` directory with individual post files
- Use Eleventy collections to organize by category
- Generate blog index page dynamically
- **Benefit:** Easier to add new blog posts, better organization

**Priority:** Low (current structure works for small number of pages)

---

### 4. Optimize JavaScript Bundle
**Current State:** Single `main.js` file handles all functionality

**Recommendation:**
- Split into modules: `navigation.js`, `portfolio-filter.js`
- Use ES6 modules or build tool (Rollup/Webpack) for production
- **Benefit:** Better code organization, potential for code splitting

**Priority:** Low (current file is small, but will scale better)

---

### 5. Add Image Lazy Loading Enhancement
**Current State:** Images use `loading="lazy"` attribute (good), but no intersection observer

**Recommendation:**
- Implement Intersection Observer API for more precise lazy loading
- Add blur-up placeholder technique for better UX
- **Benefit:** Improved perceived performance, better user experience

**Priority:** Low (current implementation is functional)

---

### 6. Environment-Specific Configuration
**Current State:** R2 fallback logic exists, but could be more robust

**Recommendation:**
- Add `NODE_ENV` checks in `.eleventy.js`
- Separate config files for dev/prod if needed
- **Benefit:** Clearer separation of concerns, easier debugging

**Priority:** Low (current implementation works)

---

### 7. Documentation Improvements
**Current State:** This document is new

**Recommendation:**
- Add inline code comments for complex logic (e.g., `r2img` filter)
- Create `CONTRIBUTING.md` with code style guidelines
- Document custom filters/shortcodes in separate file

**Priority:** Low (this document addresses immediate needs)

---

## Additional Resources

- **Eleventy Documentation:** https://www.11ty.dev/docs/
- **Nunjucks Documentation:** https://mozilla.github.io/nunjucks/
- **Sass Documentation:** https://sass-lang.com/documentation
- **Cloudflare R2:** https://developers.cloudflare.com/r2/

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team

