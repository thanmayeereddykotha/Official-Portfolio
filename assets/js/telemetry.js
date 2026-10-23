/**
 * Privacy-Conscious Telemetry & Interaction Analytics
 * Dispatches standard CustomEvents for application observability.
 */

(function () {
  'use strict';

  function trackEvent(name, payload = {}) {
    window.dispatchEvent(
      new CustomEvent('portfolio:telemetry', {
        detail: {
          name,
          payload,
          timestamp: Date.now()
        }
      })
    );
  }

  // Track initial session view
  trackEvent('session_init', {
    referrer: document.referrer || 'direct',
    screen: `${window.innerWidth}x${window.innerHeight}`
  });

  // Export helper
  window.PortfolioTelemetry = { track: trackEvent };
})();
