/**
 * Vanilla JavaScript Accordion Integration for Article Pages
 * Uses vanilla JS accordions instead of CSS-only accordions
 */
import { initSubTopicAccordions } from "../category-accordions/vanillaAccordion.js";

/**
 * Initialize vanilla JS accordions for article pages
 */
function initializeArticleAccordions() {
  // Wait for DOM to be ready and all scripts loaded
  const runInitialization = () => {
    setTimeout(() => {
      initSubTopicAccordions();
    }, 100);
  };

  // Wait for window load to ensure all scripts have finished
  if (document.readyState === "loading") {
    window.addEventListener("load", () => {
      setTimeout(() => {
        runInitialization();
      }, 200);
    });
  } else if (document.readyState === "interactive") {
    // DOM is ready but resources might still be loading
    window.addEventListener("load", () => {
      setTimeout(() => {
        runInitialization();
      }, 200);
    });
  } else {
    // Already loaded
    setTimeout(() => {
      runInitialization();
    }, 200);
  }
}

// Initialize on load
initializeArticleAccordions();

// Export for use in other modules
if (typeof window !== "undefined") {
  window.initArticleAccordions = initializeArticleAccordions;
}
