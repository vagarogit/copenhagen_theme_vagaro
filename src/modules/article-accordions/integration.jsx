/**
 * Vanilla JavaScript Accordion Integration for Article Pages
 * Uses vanilla JS accordions instead of CSS-only accordions
 */
import { initSubTopicAccordions } from "../category-accordions/vanillaAccordion.js";

// Track if we've already initialized to prevent duplicate calls
let hasInitialized = false;

/**
 * Initialize vanilla JS accordions for article pages
 */
function initializeArticleAccordions() {
  // Run initialization
  const runInitialization = () => {
    // Prevent duplicate initialization
    if (hasInitialized) {
      return;
    }

    try {
      initSubTopicAccordions();
      hasInitialized = true;
    } catch (error) {
      console.error("[Article Accordions] Error during initialization:", error);
    }
  };

  // Wait for DOM to be ready and article body to be loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Wait a bit for article body content to be fully rendered
      setTimeout(() => {
        runInitialization();
      }, 300);
    });
  } else if (document.readyState === "interactive") {
    // DOM is ready but resources might still be loading
    setTimeout(() => {
      runInitialization();
    }, 300);
  } else {
    // Already loaded
    setTimeout(() => {
      runInitialization();
    }, 300);
  }

  // Also try after window load to catch any dynamically loaded content
  window.addEventListener("load", () => {
    setTimeout(() => {
      runInitialization();
    }, 500);
  });
}

// Initialize on load
initializeArticleAccordions();

// Export for use in other modules
if (typeof window !== "undefined") {
  window.initArticleAccordions = initializeArticleAccordions;
}
