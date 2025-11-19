# Scroll-Triggered Animations Usage Guide

## Overview

This system provides GPU-accelerated, scroll-triggered animations for smooth, fluid, high-end visual experiences. All animations are performance-optimized and respect user motion preferences.

## Quick Start

### 1. Basic Fade-in

```html
<section class="module fade-in">
  <div class="container">
    <h2>Section Title</h2>
    <p>Content that fades in when scrolled into view</p>
  </div>
</section>
```

### 2. Slide-up Animation

```html
<div class="card slide-up">
  <h3>Card Title</h3>
  <p>This card slides up from below when visible</p>
</div>
```

### 3. Slide-left / Slide-right

```html
<!-- Content slides in from the right -->
<div class="hero-copy slide-right">
  <h1>Title</h1>
  <p>Description</p>
</div>

<!-- Content slides in from the left -->
<div class="hero-image slide-left">
  <img src="..." alt="...">
</div>
```

## Advanced Usage

### Staggered Animations (Progressive Reveal)

For groups of items that should animate one after another:

```html
<div class="portfolio-gallery" data-animate-stagger>
  <div class="gallery-item" data-animate-item>Item 1</div>
  <div class="gallery-item" data-animate-item>Item 2</div>
  <div class="gallery-item" data-animate-item>Item 3</div>
  <div class="gallery-item" data-animate-item>Item 4</div>
</div>
```

Each item will fade in with a 100ms delay between them.

### Lazy Image Fade-in

Images with `loading="lazy"` automatically get fade-in animation:

```html
<img 
  src="image.jpg" 
  alt="Description" 
  loading="lazy"
  decoding="async"
/>
```

Or use a container:

```html
<div class="lazy-image-container">
  <img src="image.jpg" alt="Description" loading="lazy">
</div>
```

### Parallax Effect (Optional)

For subtle parallax scrolling:

```html
<div class="parallax-layer" data-parallax-speed="0.5">
  <img src="background.jpg" alt="Background">
</div>
```

Speed options:
- `data-parallax-speed="0.3"` - Slow
- `data-parallax-speed="0.5"` - Medium (default)
- `data-parallax-speed="0.7"` - Fast

### Custom Animation Delays

Add delay classes for progressive reveal:

```html
<div class="fade-in animate-delay-1">First item</div>
<div class="fade-in animate-delay-2">Second item</div>
<div class="fade-in animate-delay-3">Third item</div>
```

### Custom Animation Durations

```html
<div class="slide-up animate-fast">Fast animation (0.4s)</div>
<div class="slide-up animate-normal">Normal animation (0.8s)</div>
<div class="slide-up animate-slow">Slow animation (1.2s)</div>
```

## Example: Homepage Sections

### Hero Section

```html
<section class="module module-dark page-hero">
  <div class="container">
    <div class="hero-layout">
      <div class="hero-copy slide-right">
        <h1>好時有影</h1>
        <p>讓每一個「好時」，都有你我的「身影」</p>
      </div>
      <div class="hero-image slide-left">
        <img src="hero.jpg" alt="Hero image">
      </div>
    </div>
  </div>
</section>
```

### Portfolio Gallery Section

```html
<div class="module">
  <div class="container">
    <h2 class="text-align-center fade-in">找到你的專屬風格</h2>
    
    <div class="portfolio-gallery" data-animate-stagger>
      <div class="gallery-item fade-in" data-animate-item>
        <img src="..." alt="..." loading="lazy">
      </div>
      <div class="gallery-item fade-in" data-animate-item>
        <img src="..." alt="..." loading="lazy">
      </div>
      <!-- More items... -->
    </div>
  </div>
</div>
```

### Content Sections

```html
<section class="module fade-in">
  <div class="container">
    <div class="content-intro slide-up">
      <h2>Section Title</h2>
      <p>Introduction text</p>
    </div>
    
    <div class="layout-split">
      <div class="layout-split-text slide-right">
        <h3>Content Title</h3>
        <p>Content description</p>
      </div>
      <div class="layout-split-image slide-left">
        <img src="..." alt="..." loading="lazy">
      </div>
    </div>
  </div>
</section>
```

## Animation Classes Reference

| Class | Effect | Use Case |
|-------|--------|----------|
| `.fade-in` | Fade in from transparent | General content reveal |
| `.slide-up` | Slide up from below | Cards, sections |
| `.slide-left` | Slide in from right | Text content, images |
| `.slide-right` | Slide in from left | Text content, images |
| `.parallax-layer` | Parallax scroll effect | Backgrounds, hero sections |

## Data Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-animate-stagger` | Enable staggered animations for children | `<div data-animate-stagger>` |
| `data-animate-item` | Mark item for staggered animation | `<div data-animate-item>` |
| `data-parallax-speed` | Set parallax speed (0.3-0.7) | `data-parallax-speed="0.5"` |

## Performance Notes

- All animations use `transform` and `opacity` for GPU acceleration
- No layout/reflow properties are animated (no `top`, `height`, `margin`)
- Intersection Observer avoids scroll event listeners
- Animations respect `prefers-reduced-motion`
- 60 FPS target maintained

## Accessibility

- Animations automatically disabled for users with `prefers-reduced-motion: reduce`
- Content remains accessible even if animations don't load
- No content is hidden from screen readers

## Browser Support

- Modern browsers with Intersection Observer support
- Graceful degradation for older browsers (content still visible)
- CSS transforms supported in all modern browsers

