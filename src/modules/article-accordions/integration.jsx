/**
 * CSS Accordion Integration for Article Pages
 * Uses pure CSS accordions instead of Radix UI
 */
import { transformArticleAccordions } from './vanillaCSSAccordion.js';

/**
 * Mount the CSS Article Accordions
 * This replaces the Radix UI accordion with a pure CSS implementation
 */
export function mountArticleAccordions() {
  return transformArticleAccordions();
}

/**
 * Initialize article accordions when DOM is ready
 */
function initializeArticleAccordions() {
  // Wait a bit to ensure the DOM is fully loaded and other scripts have run
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(mountArticleAccordions, 100);
    });
  } else {
    // DOM is already ready
    setTimeout(mountArticleAccordions, 100);
  }
}

// Initialize on load
initializeArticleAccordions();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.mountArticleAccordions = mountArticleAccordions;
}
