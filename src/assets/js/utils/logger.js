/**
 * Environment-aware logger utility
 * Suppresses logs in production, allows debug mode via environment
 * 
 * Usage:
 *   logger.log('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message'); // Always logged
 *   logger.debug('Debug message');
 *   logger.agentLog({ location: 'file.js:123', message: 'Event', data: {...} });
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
    /**
     * Log informational messages (only in development)
     */
    log: function(...args) {
      if (shouldLog) {
        console.log('[LOG]', ...args);
      }
    },
    
    /**
     * Log warning messages (only in development)
     */
    warn: function(...args) {
      if (shouldLog) {
        console.warn('[WARN]', ...args);
      }
    },
    
    /**
     * Log error messages (always logged, even in production)
     */
    error: function(...args) {
      // Always log errors, even in production
      console.error('[ERROR]', ...args);
    },
    
    /**
     * Log debug messages (only in development)
     */
    debug: function(...args) {
      if (shouldLog) {
        console.log('[DEBUG]', ...args);
      }
    },
    
    /**
     * Send debug data to agent endpoint (only if configured and in dev mode)
     * @param {Object} data - Debug data object with location, message, data, etc.
     */
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
