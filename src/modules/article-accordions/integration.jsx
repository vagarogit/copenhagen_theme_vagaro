/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  RadixArticleAccordion,
  extractAccordionSections,
} from "./RadixArticleAccordion.jsx";

/**
 * Mount the Radix Article Accordion
 * This replaces the vanilla JS accordion with a Radix UI implementation
 */
export function mountArticleAccordions() {
  try {
    // Check if we're on a page with accordion sections
    const accordionElements = document.querySelectorAll(
      ".section.accordion.sub-topic"
    );

    if (!accordionElements.length) {
      console.log("[Article Accordions] No accordion sections found on page");
      return false;
    }

    // Extract accordion data from existing DOM
    const sections = extractAccordionSections();

    if (!sections.length) {
      console.log(
        "[Article Accordions] No valid accordion sections to render"
      );
      return false;
    }

    // Create or find mount point
    let mountPoint = document.getElementById("radix-article-accordions-root");

    if (!mountPoint) {
      mountPoint = document.createElement("div");
      mountPoint.id = "radix-article-accordions-root";

      // Insert the mount point before the first accordion
      const firstAccordion = accordionElements[0];
      firstAccordion.parentNode.insertBefore(mountPoint, firstAccordion);
    }

    // Hide original accordion elements
    accordionElements.forEach((accordion) => {
      accordion.style.display = "none";
      accordion.setAttribute("data-replaced-by-radix", "true");
    });

    // Mount the React component
    ReactDOM.render(<RadixArticleAccordion sections={sections} />, mountPoint);

    console.log(
      `[Article Accordions] Successfully mounted ${sections.length} accordion sections with Radix UI`
    );
    return true;
  } catch (error) {
    console.error("[Article Accordions] Error mounting accordions:", error);

    // Show the original accordions as fallback
    const accordionElements = document.querySelectorAll(
      ".section.accordion.sub-topic"
    );
    accordionElements.forEach((accordion) => {
      accordion.style.display = "";
    });

    return false;
  }
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
window.mountArticleAccordions = mountArticleAccordions;
