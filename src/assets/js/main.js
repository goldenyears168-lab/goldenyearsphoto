/* ==================================================
 * Navigation JavaScript - Simplified Version
 * Desktop navigation uses pure CSS :hover
 * Mobile menu uses simple onclick toggle
 * ==================================================
 */

/* ==================================================
 * Navigation JavaScript - From test-homepage-1.html
 * ================================================== */
(function() {
    'use strict';

    // ============================================
    // Desktop Navigation - Now handled by CSS :hover
    // ============================================
    // Desktop mega menus are now controlled by pure CSS hover
    // No JavaScript needed for desktop navigation

    // ============================================
    // Mobile Navigation - Simplified
    // ============================================
    // Mobile menu toggle is now handled by inline onclick
    // No additional JavaScript needed

    // ============================================
    // Set active page indicator
    // ============================================
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a[href]').forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            link.setAttribute('aria-current', 'page');
            link.classList.add('active');
        }
    });

})();