// Mobile CTA Banner Integration Script
// Pure vanilla JavaScript implementation - no React needed

import MobileCtaBanner from "./mobile-cta-banner.jsx";

(function () {
  "use strict";

  let bannerInstance = null;

  /**
   * Initialize the mobile CTA banner
   */
  function initMobileCtaBanner() {
    // Don't initialize if already exists
    if (bannerInstance) {
      return;
    }

    try {
      bannerInstance = new MobileCtaBanner({
        ctaUrl: "https://www.vagaro.com/signup-1?licence=1",
        ctaText: "Start Free Trial",
        heroSelector: "[data-hero-section]",
        topOffset: "60px",
      });

      console.log("[Mobile CTA Banner] Successfully initialized");
    } catch (error) {
      console.error("[Mobile CTA Banner] Failed to initialize:", error);
    }
  }

  /**
   * Cleanup function to remove the banner
   */
  function cleanupMobileCtaBanner() {
    if (bannerInstance) {
      bannerInstance.destroy();
      bannerInstance = null;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileCtaBanner);
  } else {
    initMobileCtaBanner();
  }

  // Expose functions globally if needed
  window.initMobileCtaBanner = initMobileCtaBanner;
  window.cleanupMobileCtaBanner = cleanupMobileCtaBanner;
})();
