import { r as reactExports, a7 as Root2, a8 as Item, a9 as Header, aa as Trigger2, ab as Content2, a3 as reactDomExports } from 'shared';

// eslint-disable-next-line no-unused-vars

/**
 * RadixArticleAccordion - Modern accordion component using Radix UI
 * Replaces vanilla JS accordion implementation with better accessibility and smoother animations
 * Uses Radix UI recommended CSS class names for proper styling
 */
// eslint-disable-next-line react/prop-types
const RadixArticleAccordion = ({
  sections = []
}) => {
  if (sections.length === 0) {
    return null;
  }
  const handleValueChange = value => {
    if (value) {
      const sectionIndex = value.replace("section-", "");
      const sectionTitle = sections[parseInt(sectionIndex)]?.title || "Unknown";
      console.log(`[Radix Accordion] ✅ OPENING accordion: "${sectionTitle}" (${value})`);
    } else {
      console.log("[Radix Accordion] ❌ CLOSING accordion");
    }
  };
  return /*#__PURE__*/reactExports.createElement(Root2, {
    type: "single",
    collapsible: true,
    className: "AccordionRoot",
    onValueChange: handleValueChange
  }, sections.map((section, index) => /*#__PURE__*/reactExports.createElement(Item, {
    key: section.id || index,
    value: `section-${index}`,
    className: "AccordionItem"
  }, /*#__PURE__*/reactExports.createElement(Header, {
    className: "AccordionHeader"
  }, /*#__PURE__*/reactExports.createElement(Trigger2, {
    className: "AccordionTrigger"
  }, /*#__PURE__*/reactExports.createElement("span", {
    className: "AccordionTitle"
  }, section.title), /*#__PURE__*/reactExports.createElement("span", {
    className: "AccordionChevron",
    "aria-hidden": "true"
  }, /*#__PURE__*/reactExports.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/reactExports.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))))), /*#__PURE__*/reactExports.createElement(Content2, {
    className: "AccordionContent"
  }, /*#__PURE__*/reactExports.createElement("div", {
    className: "AccordionContentText",
    dangerouslySetInnerHTML: {
      __html: section.content
    }
  })))));
};

/**
 * Extract accordion sections from existing DOM
 * This allows us to transform Zendesk-generated HTML into React components
 */
function extractAccordionSections() {
  const accordionElements = document.querySelectorAll(".section.accordion.sub-topic");
  if (!accordionElements.length) {
    return [];
  }
  const sections = [];
  accordionElements.forEach((accordion, index) => {
    const panelHeading = accordion.querySelector(".panel-heading");
    const panelBody = accordion.querySelector(".panel-body");
    const titleElement = accordion.querySelector(".title");
    if (!panelHeading || !panelBody || !titleElement) {
      return;
    }

    // Extract the title text
    const title = titleElement.textContent.trim();

    // Extract the content HTML
    const content = panelBody.innerHTML;

    // Store reference to original element for hiding
    accordion.setAttribute("data-radix-processed", "true");
    sections.push({
      id: panelBody.id || `accordion-section-${index}`,
      title,
      content,
      originalElement: accordion
    });
  });
  return sections;
}

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Mount the Radix Article Accordion
 * This replaces the vanilla JS accordion with a Radix UI implementation
 */
function mountArticleAccordions() {
  try {
    // Check if we're on a page with accordion sections
    const accordionElements = document.querySelectorAll(".section.accordion.sub-topic");
    if (!accordionElements.length) {
      console.log("[Article Accordions] No accordion sections found on page");
      return false;
    }

    // Extract accordion data from existing DOM
    const sections = extractAccordionSections();
    if (!sections.length) {
      console.log("[Article Accordions] No valid accordion sections to render");
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
    accordionElements.forEach(accordion => {
      accordion.style.display = "none";
      accordion.setAttribute("data-replaced-by-radix", "true");
    });

    // Mount the React component
    reactDomExports.render(/*#__PURE__*/reactExports.createElement(RadixArticleAccordion, {
      sections: sections
    }), mountPoint);
    console.log(`[Article Accordions] Successfully mounted ${sections.length} accordion sections with Radix UI`);
    return true;
  } catch (error) {
    console.error("[Article Accordions] Error mounting accordions:", error);

    // Show the original accordions as fallback
    const accordionElements = document.querySelectorAll(".section.accordion.sub-topic");
    accordionElements.forEach(accordion => {
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

/**
 * Article Accordions Bundle
 * Entry point for Radix UI accordion implementation
 * Replaces vanilla JS accordion with better accessibility and smoother animations
 */
console.log("[Article Accordions Bundle] Loaded successfully");
