# Deprecated Token 與元件 Variant 分析報告

## 📊 執行摘要

- **Deprecated Token 使用數**: 37
- **按鈕類名組合數**: 18
- **卡片類名組合數**: 13

---

## 🗑️ Deprecated Token 使用情況

### 仍在使用中的 Deprecated Token

### `border`

- **建議替換為**: `sand-200`
- **出現次數**: 38
- **出現位置**:

  - `src/index.njk` (第 133 行) - js-object
    ```
    "14" style=" background:#FFF; border:0; border-radius:3px; box-shad
    ```
  - `src/index.njk` (第 136 行) - js-object
    ```
    "14" style=" background:#FFF; border:0; border-radius:3px; box-shad
    ```
  - `src/index.njk` (第 139 行) - js-object
    ```
    "14" style=" background:#FFF; border:0; border-radius:3px; box-shad
    ```
  - `src/index.njk` (第 142 行) - js-object
    ```
    "14" style=" background:#FFF; border:0; border-radius:3px; box-shad
    ```
  - `src/guide/faq.njk` (第 35 行) - js-object
    ```
    kground-color: white;
        border: 1px solid #E2DCD3; /* sand-20
    ```
  - `src/guide/faq.njk` (第 44 行) - js-object
    ```
    FDFBF7; /* sand-50 */
        border: 1px solid #E2DCD3; /* sand-20
    ```
  - `src/guide/faq.njk` (第 87 行) - js-object
    ```
    ff 0%, #F8FAFC 100%);
        border: 2px dashed #C7D2FE; /* trust-
    ```
  - `src/booking/zhongshan.njk` (第 30 行) - js-object
    ```
    round-color: #FFFFFF;
        border: 1px solid #E2DCD3; /* sand-20
    ```
  - `src/booking/index.njk` (第 12 行) - js-object
    ```
    kground-color: white;
        border: 1px solid #E2DCD3; /* sand-20
    ```
  - `src/booking/gongguan.njk` (第 30 行) - js-object
    ```
    round-color: #FFFFFF;
        border: 1px solid #E2DCD3; /* sand-20
    ```
  - ... 還有 28 處

### `text`

- **建議替換為**: `slate-600`
- **出現次數**: 15
- **出現位置**:

  - `src/guide/identity-test.njk` (第 183 行) - js-object
    ```
    input 
                  type="text" 
                  id="user-n
    ```
  - `src/assets/css/main.css` (第 51 行) - css-variable
    ```
    lor-surface-elevated: #fff;
  --color-text: #475569; /* slate-600 */
  --
    ```
  - `src/assets/css/main.css` (第 1254 行) - css-variable
    ```
    ar(--spacing-1) 0;
    color: var(--color-text);
  }

  .card--team .card__su
    ```
  - `src/assets/css/main.css` (第 1391 行) - css-variable
    ```
    - Design System */
    color: var(--color-text); /* slate-600 - Design System
    ```
  - `src/assets/css/main.css` (第 1711 行) - css-variable
    ```
    - Design System */
    color: var(--color-text); /* slate-600 - Design System
    ```
  - `src/assets/css/main.css` (第 870 行) - js-object
    ```
    }

  .btn-ghost:hover,
  .btn-text:hover {
    color: var(--color
    ```
  - `src/assets/css/main.css` (第 884 行) - js-object
    ```
    tn-ghost:hover .arrow,
  .btn-text:hover .arrow {
    transform:
    ```
  - `src/assets/css/main.css` (第 889 行) - js-object
    ```
    n-ghost:focus-visible,
  .btn-text:focus-visible {
    outline: 3
    ```
  - `src/assets/css/main.css` (第 935 行) - js-object
    ```
    .btn-ghost:disabled,
  .btn-text:disabled,
  .btn-tag:disabled
    ```
  - `src/assets/css/main.css` (第 1081 行) - js-object
    ```
    .btn-ghost:hover,
    .btn-text:hover,
    .btn-tag:hover {
    ```
  - ... 還有 5 處

### `neutral-400`

- **建議替換為**: `slate-500`
- **出現次數**: 12
- **出現位置**:

  - `src/assets/css/main.css` (第 43 行) - css-variable
    ```
    color-neutral-300: #C4C7CE;
  --color-neutral-400: #64748B; /* slate-500 */
  --
    ```
  - `src/assets/css/main.css` (第 861 行) - css-variable
    ```
    olor: transparent;
    color: var(--color-neutral-400); /* slate-500 / #64748B - Des
    ```
  - `src/assets/css/main.css` (第 901 行) - css-variable
    ```
    200); /* E2DCD3 */
    color: var(--color-neutral-400); /* slate-500 / #64748B */
    ```
  - `src/assets/css/main.css` (第 1438 行) - css-variable
    ```
    ne-height-normal);
    color: var(--color-neutral-400); /* slate-500 - Design System
    ```
  - `src/assets/css/main.css` (第 1683 行) - css-variable
    ```
    font-weight: 600;
    color: var(--color-neutral-400); /* slate-500 - Design System
    ```
  - `src/assets/css/main.css` (第 1869 行) - css-variable
    ```
    stamp {
    border: 1px solid var(--color-neutral-400); /* slate-500 - Design System
    ```
  - `src/assets/css/main.css` (第 1870 行) - css-variable
    ```
    - Design System */
    color: var(--color-neutral-400); /* slate-500 - Design System
    ```
  - `src/assets/css/main.css` (第 1891 行) - css-variable
    ```
    : 3px;
    border: 1px dashed var(--color-neutral-400); /* slate-500 - Design System
    ```
  - `src/assets/css/main.css` (第 2018 行) - css-variable
    ```
    p-box {
    border: 1px solid var(--color-neutral-400); /* slate-500 - Design System
    ```
  - `src/assets/css/main.css` (第 2019 行) - css-variable
    ```
    - Design System */
    color: var(--color-neutral-400); /* slate-500 - Design System
    ```
  - ... 還有 2 處

### `brand-primary`

- **建議替換為**: `trust-950`
- **出現次數**: 11
- **出現位置**:

  - `src/assets/css/main.css` (第 32 行) - css-variable
    ```
    ======================== */
  --color-brand-primary: #020617; /* trust-950 */
  --
    ```
  - `src/assets/css/main.css` (第 290 行) - css-variable
    ```
    0%,
      color-mix(in srgb, var(--color-brand-primary) 95%, var(--color-white)) 0%,
    ```
  - `src/assets/css/main.css` (第 291 行) - css-variable
    ```
    var(--color-white)) 0%,
      var(--color-brand-primary) 100%
    );
  }

  /* Hero ba
    ```
  - `src/assets/css/main.css` (第 381 行) - css-variable
    ```
    t: 2px;
    background-color: var(--color-brand-primary);
    transition: width 180ms
    ```
  - `src/assets/css/main.css` (第 432 行) - css-variable
    ```
    ecoration: none;
      color: var(--color-brand-primary);
    }

    .header-nav a:hov
    ```
  - `src/assets/css/main.css` (第 473 行) - css-variable
    ```
    ext-align: left;
      color: var(--color-brand-primary);
      text-decoration: none;
    ```
  - `src/assets/css/main.css` (第 535 行) - css-variable
    ```
    -color-brand-cta);
    color: var(--color-brand-primary);
    border-color: var(--colo
    ```
  - `src/assets/css/main.css` (第 549 行) - css-variable
    ```
    -brand-cta-hover);
    color: var(--color-brand-primary);
    transform: translate3d(0
    ```
  - `src/assets/css/main.css` (第 595 行) - css-variable
    ```
    -color-brand-cta);
    color: var(--color-brand-primary);
    border-radius: var(--rad
    ```
  - `src/assets/css/main.css` (第 1051 行) - css-variable
    ```
    lor-brand-accent);
    color: var(--color-brand-primary);
    transform: translate3d(0
    ```
  - ... 還有 1 處

### `brand-cta`

- **建議替換為**: `trust-200`
- **出現次數**: 8
- **出現位置**:

  - `src/assets/css/main.css` (第 34 行) - css-variable
    ```
    updated from old system */
  --color-brand-cta: #C7D2FE; /* trust-200 - updat
    ```
  - `src/assets/css/main.css` (第 394 行) - css-variable
    ```
    ible {
    outline: 2px solid var(--color-brand-cta);
    outline-offset: 4px;
    ```
  - `src/assets/css/main.css` (第 534 行) - css-variable
    ```
    ctive {
    background-color: var(--color-brand-cta);
    color: var(--color-brand
    ```
  - `src/assets/css/main.css` (第 536 行) - css-variable
    ```
    d-primary);
    border-color: var(--color-brand-cta);
    box-shadow: var(--shadow
    ```
  - `src/assets/css/main.css` (第 594 行) - css-variable
    ```
    ing-6);
    background-color: var(--color-brand-cta);
    color: var(--color-brand
    ```
  - `src/assets/css/main.css` (第 1019 行) - css-variable
    ```
    ible {
    outline: 3px solid var(--color-brand-cta);
    outline-offset: 3px;
  }
    ```
  - `src/assets/css/main.css` (第 1056 行) - css-variable
    ```
    ible {
    outline: 2px solid var(--color-brand-cta);
    outline-offset: 2px;
  }
    ```
  - `src/assets/css/main.css` (第 1153 行) - css-variable
    ```
    ible {
    outline: 3px solid var(--color-brand-cta);
    outline-offset: 3px;
  }
    ```

### `dark`

- **建議替換為**: `trust-950`
- **出現次數**: 8
- **出現位置**:

  - `src/assets/css/main.css` (第 63 行) - tailwind-class
    ```
    4EF; /* sand-100 */
  --color-border-dark: #0F172A; /* trust-900 */
  -
    ```
  - `src/assets/css/main.css` (第 69 行) - tailwind-class
    ```
    and-50 - updated */
  --color-text-dark: #0F172A; /* trust-900 */
  -
    ```
  - `src/assets/css/main.css` (第 181 行) - tailwind-class
    ```
    ite */
    color: var(--color-text-dark);
    line-height: var(--line
    ```
  - `src/assets/css/main.css` (第 64 行) - css-variable
    ```
    k: #0F172A; /* trust-900 */
  --color-dark: #020617; /* trust-950 */
  --
    ```
  - `src/assets/css/main.css` (第 342 行) - js-object
    ```
    Overlay effects */
  .overlay-dark::before {
    content: '';
    ```
  - `src/_includes/macros/hero-section.njk` (第 12 行) - js-object
    ```
    ink (optional)
    - variant: 'dark' or 'light' (default: 'dark')
    ```
  - `src/_includes/macros/hero-section.njk` (第 12 行) - js-object
    ```
    : 'dark' or 'light' (default: 'dark')
  
  Usage:
    {% from "mac
    ```
  - `src/_includes/macros/hero-section.njk` (第 19 行) - js-object
    ```
    y, ctaSecondary=null, variant='dark') %}
<div class="module module
    ```

### `surface`

- **建議替換為**: `white`
- **出現次數**: 6
- **出現位置**:

  - `src/assets/css/main.css` (第 46 行) - css-variable
    ```
    0: #020617; /* trust-950 */
  --color-surface: #fff;
  --color-surface-alt:
    ```
  - `src/assets/css/main.css` (第 812 行) - css-variable
    ```
    0617 */
    background-color: var(--color-surface); /* white */
    transform: t
    ```
  - `src/assets/css/main.css` (第 899 行) - css-variable
    ```
    n-tag {
    background-color: var(--color-surface); /* white */
    border: 1px
    ```
  - `src/assets/css/main.css` (第 1033 行) - css-variable
    ```
    -main);
    background-color: var(--color-surface);
    border: 1px solid var(--
    ```
  - `src/assets/css/main.css` (第 1135 行) - css-variable
    ```
    column;
    background-color: var(--color-surface);
    border: 1px solid var(--
    ```
  - `src/assets/css/main.css` (第 1439 行) - css-variable
    ```
    stem */
    background-color: var(--color-surface); /* white - Design System */
    ```

### `neutral-100`

- **建議替換為**: `sand-100`
- **出現次數**: 5
- **出現位置**:

  - `src/assets/css/main.css` (第 40 行) - css-variable
    ```
    -color-neutral-50: #f7f7f7;
  --color-neutral-100: #f0f0f0;
  --color-neutral-20
    ```
  - `src/assets/css/main.css` (第 437 行) - css-variable
    ```
    ver {
      background-color: var(--color-neutral-100);
    }

    .dropdown-menu,
    ```
  - `src/assets/css/main.css` (第 522 行) - css-variable
    ```
    tom: 0;
    background-color: var(--color-neutral-100);
    opacity: 0;
    transiti
    ```
  - `src/assets/css/main.css` (第 1203 行) - css-variable
    ```
    hidden;
    background-color: var(--color-neutral-100);
  }

  .card__media img {
    ```
  - `src/assets/css/main.css` (第 1334 行) - css-variable
    ```
    block;
    background-color: var(--color-neutral-100);
  }

  .price-gallery__capti
    ```

### `brand-accent`

- **建議替換為**: `trust-800`
- **出現次數**: 4
- **出現位置**:

  - `src/assets/css/main.css` (第 33 行) - css-variable
    ```
    y: #020617; /* trust-950 */
  --color-brand-accent: #1E3A8A; /* trust-800 - updat
    ```
  - `src/assets/css/main.css` (第 1050 行) - css-variable
    ```
    ase:hover {
    border-color: var(--color-brand-accent);
    color: var(--color-brand
    ```
  - `src/assets/css/main.css` (第 1183 行) - css-variable
    ```
    font-weight-bold);
    color: var(--color-brand-accent);
    margin: var(--spacing-2)
    ```
  - `src/assets/css/main.css` (第 1197 行) - css-variable
    ```
    var(--radius-sm);
    color: var(--color-brand-accent);
  }

  .card__media {
    wi
    ```

### `text-subtle`

- **建議替換為**: `slate-500`
- **出現次數**: 4
- **出現位置**:

  - `src/assets/css/main.css` (第 53 行) - css-variable
    ```
    n: #0F172A; /* trust-900 */
  --color-text-subtle: #64748B; /* slate-500 */
  --
    ```
  - `src/assets/css/main.css` (第 1121 行) - css-variable
    ```
    e-height-relaxed);
    color: var(--color-text-subtle);
    margin-bottom: var(--spa
    ```
  - `src/assets/css/main.css` (第 1177 行) - css-variable
    ```
    e-height-relaxed);
    color: var(--color-text-subtle);
  }

  .card__price {
    fo
    ```
  - `src/assets/css/main.css` (第 1259 行) - css-variable
    ```
    r(--font-size-sm);
    color: var(--color-text-subtle);
    margin: 0;
  }

  /* Tea
    ```

### `brand-cta-hover`

- **建議替換為**: `trust-800`
- **出現次數**: 3
- **出現位置**:

  - `src/assets/css/main.css` (第 35 行) - css-variable
    ```
    updated from old system */
  --color-brand-cta-hover: #1E3A8A; /* trust-800 */
  --
    ```
  - `src/assets/css/main.css` (第 543 行) - css-variable
    ```
    efore {
    background-color: var(--color-brand-cta-hover);
    opacity: 0;
  }

  .filt
    ```
  - `src/assets/css/main.css` (第 548 行) - css-variable
    ```
    ive:hover {
    border-color: var(--color-brand-cta-hover);
    color: var(--color-brand
    ```

### `surface-alt`

- **建議替換為**: `sand-100`
- **出現次數**: 2
- **出現位置**:

  - `src/assets/css/main.css` (第 47 行) - css-variable
    ```
    */
  --color-surface: #fff;
  --color-surface-alt: #F7F4EF; /* sand-100 */
  --c
    ```
  - `src/assets/css/main.css` (第 912 行) - css-variable
    ```
    d-300);
    background-color: var(--color-surface-alt); /* sand-100 */
  }

  .btn-t
    ```

### `surface-2`

- **建議替換為**: `sand-50`
- **出現次數**: 2
- **出現位置**:

  - `src/assets/css/main.css` (第 48 行) - css-variable
    ```
    lt: #F7F4EF; /* sand-100 */
  --color-surface-2: #FDFBF7; /* sand-50 */
  --co
    ```
  - `src/assets/css/main.css` (第 1195 行) - css-variable
    ```
    ibold);
    background-color: var(--color-surface-2);
    border-radius: var(--rad
    ```

### `text-main`

- **建議替換為**: `trust-900`
- **出現次數**: 2
- **出現位置**:

  - `src/assets/css/main.css` (第 52 行) - css-variable
    ```
    t: #475569; /* slate-600 */
  --color-text-main: #0F172A; /* trust-900 */
  --
    ```
  - `src/assets/css/main.css` (第 1032 行) - css-variable
    ```
    ne-height-normal);
    color: var(--color-text-main);
    background-color: var(--
    ```

### `border-strong`

- **建議替換為**: `sand-300`
- **出現次數**: 2
- **出現位置**:

  - `src/assets/css/main.css` (第 61 行) - css-variable
    ```
    er: #E2DCD3; /* sand-200 */
  --color-border-strong: #D6CCC2; /* sand-300 */
  --c
    ```
  - `src/assets/css/main.css` (第 1034 行) - css-variable
    ```
    rface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--rad
    ```

### `cta`

- **建議替換為**: `trust-200`
- **出現次數**: 2
- **出現位置**:

  - `src/assets/css/main.css` (第 65 行) - css-variable
    ```
    k: #020617; /* trust-950 */
  --color-cta: #C7D2FE; /* trust-200 */
  --
    ```
  - `src/assets/css/main.css` (第 973 行) - js-object
    ```
    flex-shrink: 0;
  }

  .hero-cta:focus-visible {
    outline: 3
    ```

### `text-dark`

- **建議替換為**: `trust-900`
- **出現次數**: 2
- **出現位置**:

  - `src/assets/css/main.css` (第 69 行) - css-variable
    ```
    F7; /* sand-50 - updated */
  --color-text-dark: #0F172A; /* trust-900 */
  --
    ```
  - `src/assets/css/main.css` (第 181 行) - css-variable
    ```
    em: Paper White */
    color: var(--color-text-dark);
    line-height: var(--line-
    ```

### `accent`

- **建議替換為**: `trust-800`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 36 行) - css-variable
    ```
    r: #1E3A8A; /* trust-800 */
  --color-accent: #1E3A8A; /* trust-800 */
  --
    ```

### `accent-weak`

- **建議替換為**: `trust-600`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 37 行) - css-variable
    ```
    t: #1E3A8A; /* trust-800 */
  --color-accent-weak: #4F46E5; /* trust-600 */
  --
    ```

### `accent-strong`

- **建議替換為**: `trust-950`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 38 行) - css-variable
    ```
    k: #4F46E5; /* trust-600 */
  --color-accent-strong: #020617; /* trust-950 */
  --
    ```

### `neutral-50`

- **建議替換為**: `sand-50`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 39 行) - css-variable
    ```
    g: #020617; /* trust-950 */
  --color-neutral-50: #f7f7f7;
  --color-neutral-10
    ```

### `neutral-200`

- **建議替換為**: `sand-200`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 41 行) - css-variable
    ```
    color-neutral-100: #f0f0f0;
  --color-neutral-200: #e2e2e2;
  --color-neutral-30
    ```

### `neutral-300`

- **建議替換為**: `sand-200`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 42 行) - css-variable
    ```
    color-neutral-200: #e2e2e2;
  --color-neutral-300: #C4C7CE;
  --color-neutral-40
    ```

### `neutral-900`

- **建議替換為**: `trust-900`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 44 行) - css-variable
    ```
    0: #64748B; /* slate-500 */
  --color-neutral-900: #0F172A; /* trust-900 */
  --
    ```

### `neutral-950`

- **建議替換為**: `trust-950`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 45 行) - css-variable
    ```
    0: #0F172A; /* trust-900 */
  --color-neutral-950: #020617; /* trust-950 */
  --
    ```

### `surface-3`

- **建議替換為**: `trust-950`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 49 行) - css-variable
    ```
    e-2: #FDFBF7; /* sand-50 */
  --color-surface-3: #020617; /* trust-950 */
  --
    ```

### `surface-elevated`

- **建議替換為**: `white`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 50 行) - css-variable
    ```
    3: #020617; /* trust-950 */
  --color-surface-elevated: #fff;
  --color-text: #475569
    ```

### `text-on-dark`

- **建議替換為**: `trust-50`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 54 行) - css-variable
    ```
    e: #64748B; /* slate-500 */
  --color-text-on-dark: #F0F4FF; /* trust-50 */
  --c
    ```

### `text-on-accent`

- **建議替換為**: `white`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 55 行) - css-variable
    ```
    rk: #F0F4FF; /* trust-50 */
  --color-text-on-accent: #fff;
  --color-text-link: #4
    ```

### `text-link`

- **建議替換為**: `trust-600`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 56 行) - css-variable
    ```
    color-text-on-accent: #fff;
  --color-text-link: #4F46E5; /* trust-600 */
  --
    ```

### `text-link-hover`

- **建議替換為**: `trust-800`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 57 行) - css-variable
    ```
    k: #4F46E5; /* trust-600 */
  --color-text-link-hover: #1E3A8A; /* trust-800 */
  --
    ```

### `border-subtle`

- **建議替換為**: `sand-100`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 62 行) - css-variable
    ```
    ng: #D6CCC2; /* sand-300 */
  --color-border-subtle: #F7F4EF; /* sand-100 */
  --c
    ```

### `border-dark`

- **建議替換為**: `trust-900`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 63 行) - css-variable
    ```
    le: #F7F4EF; /* sand-100 */
  --color-border-dark: #0F172A; /* trust-900 */
  --
    ```

### `primary-accent`

- **建議替換為**: `trust-800`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 66 行) - css-variable
    ```
    a: #C7D2FE; /* trust-200 */
  --color-primary-accent: #1E3A8A; /* trust-800 */
  --
    ```

### `gray-bg`

- **建議替換為**: `sand-200`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 67 行) - css-variable
    ```
    t: #1E3A8A; /* trust-800 */
  --color-gray-bg: #C4C7CE;
  --color-light-bg:
    ```

### `light-bg`

- **建議替換為**: `sand-50`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 68 行) - css-variable
    ```
    --color-gray-bg: #C4C7CE;
  --color-light-bg: #FDFBF7; /* sand-50 - updated
    ```

### `text-light`

- **建議替換為**: `trust-50`
- **出現次數**: 1
- **出現位置**:

  - `src/assets/css/main.css` (第 70 行) - css-variable
    ```
    k: #0F172A; /* trust-900 */
  --color-text-light: #F0F4FF; /* trust-50 */
  --c
    ```

---

## 🔘 按鈕 Variant 分析

### Variant 使用統計

- **primary**: 25 處
- **secondary**: 16 處
- **ghost**: 1 處
- **custom**: 16 處

### 最常見的按鈕類名組合（Top 20）

1. `btn-md btn-primary` - 14 次
2. `btn-md btn-secondary` - 13 次
3. `px-8 py-4 rounded-full` - 5 次
4. `btn btn-md btn-primary` - 4 次
5. `btn-primary` - 3 次
6. `group-hover:bg-sand-50 hover:bg-sand-50 px-4 py-2 rounded-full` - 3 次
7. `btn-text` - 2 次
8. `hover:bg-sand-50 px-8 py-4 rounded-full` - 2 次
9. `btn btn-lg btn-primary` - 2 次
10. `hover:bg-sand-100 px-8 py-4 rounded-full` - 2 次
11. `btn btn-md btn-primary py-3.5` - 1 次
12. `btn btn-md btn-secondary` - 1 次
13. `btn btn-ghost btn-md` - 1 次
14. `btn-secondary` - 1 次
15. `btn btn-secondary px-8 py-4` - 1 次
16. `focus-visible:rounded-full hover:bg-sand-50 px-4 py-2 rounded-full` - 1 次
17. `hover:bg-sand-50 px-4 py-2 rounded-full` - 1 次
18. `btn btn-primary px-6 py-2.5` - 1 次

---

## 🃏 卡片 Variant 分析

### Variant 使用統計

- **bento-card**: 31 處
- **custom**: 1 處

### 最常見的卡片類名組合（Top 20）

1. `bento-card` - 8 次
2. `bento-card bg-sand-50 rounded-2xl` - 7 次
3. `bento-card bg-white border-sand-200 rounded-2xl shadow-sm` - 4 次
4. `bento-card bg-slate-50 rounded-2xl` - 3 次
5. `bento-card bg-white border-slate-200 rounded-2xl shadow-sm` - 2 次
6. `bento-card bg-white brand-card` - 1 次
7. `bento-card bg-trust-950 border-trust-900 brand-card` - 1 次
8. `bento-card bg-white` - 1 次
9. `bento-card bg-white border-none shadow-none` - 1 次
10. `bento-card bg-slate-50 border-sand-200` - 1 次
11. `bento-card bg-trust-50/50 border-trust-200` - 1 次
12. `bg-white border-sand-200 hover:border-trust-900 ticket-card` - 1 次
13. `bento-card bg-white border-slate-200 hover:shadow-lg rounded-2xl shadow-sm` - 1 次

---

## ✅ 建議與行動方案

### 1. 清理 Deprecated Token

**步驟**：
1. 掃描所有使用 deprecated token 的位置
2. 逐一替換為新的 token 名稱
3. 更新 tailwind.config.js，移除 deprecated token 定義
4. 更新 main.css，移除 deprecated CSS 變數定義

### 2. 建立元件 Variant 系統

**按鈕 Variant 標準化**：
- 確保所有按鈕使用 `.btn` 基礎類 + variant 類（`.btn-primary`, `.btn-secondary`, `.btn-ghost`）
- 移除自定義的按鈕樣式組合
- 統一按鈕尺寸：`.btn-sm`, `.btn-md`, `.btn-lg`

**卡片 Variant 標準化**：
- 確保所有卡片使用 `.bento-card` 基礎類
- 定義卡片 variant：`.bento-card-default`, `.bento-card-elevated`, `.bento-card-bordered`
- 移除重複的卡片樣式定義

