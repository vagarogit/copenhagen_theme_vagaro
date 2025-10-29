/**
 * Vanilla JS implementation of accordions for category page
 * This is a fallback implementation that doesn't require React
 */

/**
 * Initialize sub-topic accordions for article pages
 * This handles the section accordion sub-topic pattern
 */
function initSubTopicAccordions() {
  try {
    // Find all sub-topic accordions
    const subTopicAccordions = document.querySelectorAll(".section.accordion.sub-topic");
    if (!subTopicAccordions.length) {
      return;
    }
    subTopicAccordions.forEach((accordion, index) => {
      const panelHeading = accordion.querySelector(".panel-heading");
      const panelBody = accordion.querySelector(".panel-body");
      const titleElement = accordion.querySelector(".title");
      if (!panelHeading || !panelBody || !titleElement) return;

      // Extract the panel ID from the existing structure or create a new one
      const panelId = panelBody.id || `sub-topic-panel-${index}`;
      panelBody.id = panelId;

      // Setup ARIA attributes - match initial collapsed state
      panelHeading.setAttribute("role", "button");
      panelHeading.setAttribute("aria-expanded", "false");
      panelHeading.setAttribute("aria-controls", panelId);
      panelHeading.tabIndex = 0;

      // Add transition for smooth animation - must do this programmatically
      // because we don't want transitions before JS loads
      // Using max-height instead of height to avoid compositing warnings
      panelBody.style.transition = "max-height 0.35s ease-in-out, padding-top 0.35s ease-in-out, padding-bottom 0.35s ease-in-out";
      panelBody.style.overflow = "hidden";

      // Add click functionality
      panelHeading.addEventListener("click", () => {
        const expanded = panelHeading.getAttribute("aria-expanded") === "true";
        if (expanded) {
          // Close accordion
          panelHeading.setAttribute("aria-expanded", "false");
          panelBody.classList.remove("panel-body-expanded");

          // Set overflow to hidden for smooth animation
          panelBody.style.overflow = "hidden";

          // Set explicit max-height to current scroll height
          panelBody.style.maxHeight = panelBody.scrollHeight + "px";

          // Use requestAnimationFrame to ensure the browser has painted the max-height change
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Trigger animation to close - animate both max-height and padding
              panelBody.style.maxHeight = "0px";
              panelBody.style.paddingTop = "0px";
              panelBody.style.paddingBottom = "0px";
            });
          });

          // After animation completes, hide the panel completely
          setTimeout(() => {
            if (panelHeading.getAttribute("aria-expanded") === "false") {
              panelBody.style.display = "none";
            }
          }, 350);
        } else {
          // Open accordion
          panelHeading.setAttribute("aria-expanded", "true");

          // Make sure panel is visible but with zero max-height to start animation
          panelBody.style.display = "block";
          panelBody.style.overflow = "hidden";
          panelBody.style.maxHeight = "0px";
          panelBody.style.paddingTop = "0px";
          panelBody.style.paddingBottom = "0px";

          // Use requestAnimationFrame to ensure the browser has painted the initial state
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Get the target height with padding
              const targetHeight = panelBody.scrollHeight;

              // Set target max-height and padding to trigger animation
              panelBody.style.maxHeight = targetHeight + "px";
              panelBody.style.paddingTop = "1rem";
              panelBody.style.paddingBottom = "1rem";
            });
          });

          // Clear max-height after animation completes and set overflow to visible
          setTimeout(() => {
            if (panelHeading.getAttribute("aria-expanded") === "true") {
              panelBody.style.maxHeight = "none";
              panelBody.style.overflow = "visible";
              panelBody.classList.add("panel-body-expanded");
            }
          }, 350);
        }
      });

      // Add keyboard accessibility
      panelHeading.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          panelHeading.click();
        }
      });

      // Add icon to header if not already present
      if (!panelHeading.querySelector(".accordion-icon")) {
        const icon = document.createElement("span");
        icon.className = "accordion-icon";
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        panelHeading.appendChild(icon);
      }

      // Ensure panel is properly collapsed initially
      // Keep the existing collapse class which is part of the HTML structure
      panelBody.style.display = "none";
      panelBody.style.maxHeight = "0px";
    });
  } catch (error) {
    console.error("Error initializing sub-topic accordions:", error);
  }
}

/**
 * Vanilla JavaScript Accordion Integration for Article Pages
 * Uses vanilla JS accordions instead of CSS-only accordions
 */

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

/**
 * Article Accordions Bundle
 * Entry point for CSS-only accordion implementation
 * Uses pure CSS accordions for better performance and simpler implementation
 */
console.log("[Article Accordions Bundle] Loaded successfully");
