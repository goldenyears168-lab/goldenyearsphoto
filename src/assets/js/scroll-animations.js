/* ==================================================
 * Scroll-Triggered Animations Module
 * 
 * GPU-accelerated, Intersection Observer-based animations
 * for smooth, fluid, high-end visual feel.
 * 
 * Features:
 * - Scroll-triggered animations (fade-in, slide-up, etc.)
 * - Lazy-load fade-in for images
 * - Progressive disclosure
 * - Performance-optimized (60 FPS target)
 * ==================================================
 */

(function() {
  'use strict';
  
  // ============================================
  // Configuration
  // ============================================
  
  const CONFIG = {
    // Intersection Observer options
    root: null, // viewport
    rootMargin: '0px 0px -10% 0px', // Trigger when 10% from bottom of viewport
    threshold: 0.1, // Trigger when 10% of element is visible
    
    staggerDelay: 100, // ms between each item in a group
    
    // Reduced motion support
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
  
  // ============================================
  // Intersection Observer Setup
  // ============================================
  
  let observer;
  
  /**
   * Initialize Intersection Observer
   */
  function initObserver() {
    // Respect user's motion preferences
    if (CONFIG.prefersReducedMotion) {
      // Still add is-visible class for layout, but skip animations
      return;
    }
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          handleIntersection(entry.target);
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: CONFIG.root,
      rootMargin: CONFIG.rootMargin,
      threshold: CONFIG.threshold
    });
  }
  
  /**
   * Handle element intersection
   * @param {HTMLElement} element - Element that entered viewport
   */
  function handleIntersection(element) {
    // Add is-visible class to trigger CSS animations
    element.classList.add('is-visible');
    
    // Handle lazy-load images with fade-in
    if (element.classList.contains('lazy-image-container') || 
        element.tagName === 'IMG' && element.loading === 'lazy') {
      handleLazyImage(element);
    }
    
    if (element.dataset.animateStagger) {
      handleStaggeredAnimation(element);
    }
  }
  
  // ============================================
  // Lazy Image Loading with Fade-in
  // ============================================
  
  /**
   * Handle lazy-loaded images with fade-in animation
   * @param {HTMLElement} element - Image or container element
   */
  function handleLazyImage(element) {
    const img = element.tagName === 'IMG' ? element : element.querySelector('img');
    
    if (!img) return;
    
    // If image is already loaded, trigger fade-in immediately
    if (img.complete && img.naturalHeight !== 0) {
      requestAnimationFrame(() => {
        img.classList.add('is-loaded');
      });
    } else {
      // Wait for image to load, then fade in
      img.addEventListener('load', () => {
        requestAnimationFrame(() => {
          img.classList.add('is-loaded');
        });
      }, { once: true });
      
      // Fallback: trigger after delay if image takes too long
      setTimeout(() => {
        if (!img.classList.contains('is-loaded')) {
          img.classList.add('is-loaded');
        }
      }, 1000);
    }
  }
  
  // ============================================
  // Staggered Animations
  // ============================================
  
  /**
   * Handle staggered animations for groups of elements
   * @param {HTMLElement} container - Container with data-animate-stagger
   */
  function handleStaggeredAnimation(container) {
    const children = container.querySelectorAll('[data-animate-item]');
    
    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('is-visible');
      }, index * CONFIG.staggerDelay);
    });
  }
  
  // ============================================
  // Initialize Animations
  // ============================================
  
  /**
   * Setup all scroll-triggered animations
   */
  function initAnimations() {
    if (!observer) return;
    
    // Find all elements with animation classes
    const animatedElements = document.querySelectorAll([
      '.fade-in',
      '.fade-scale',
      '.slide-up',
      '.slide-left',
      '.slide-right',
      '.parallax-layer',
      '[data-animate]',
      '.lazy-image-container'
    ].join(', '));
    
    // Observe each element
    animatedElements.forEach(element => {
      observer.observe(element);
    });
    
    // Handle lazy images separately
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      observer.observe(img);
    });
  }
  
  // ============================================
  // ============================================
  
  /**
   * Initialize parallax effect for elements with .parallax-layer
   * Uses transform for GPU acceleration
   */
  function initParallax() {
    if (CONFIG.prefersReducedMotion) return;
    
    const parallaxElements = document.querySelectorAll('.parallax-layer');
    if (parallaxElements.length === 0) return;
    
    let ticking = false;
    
    function updateParallax() {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
        const offset = scrollY * speed;
        
        // Use transform for GPU acceleration
        element.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  // ============================================
  // Public API
  // ============================================
  
  /**
   * Initialize scroll animations system
   */
  function init() {
    initObserver();
    initAnimations();
    initParallax();
  }
  
  // ============================================
  // Auto-initialize on DOM ready
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready
    init();
  }
  
  // Export for manual initialization if needed
  window.scrollAnimations = {
    init,
    observer
  };
  
})();

