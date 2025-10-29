/**
 * Vanilla CSS Accordion for Article Pages
 * Transforms .section.accordion.sub-topic elements into pure CSS accordions
 * Replaces Radix UI implementation with a simpler, faster CSS-only solution
 */

/**
 * Transform article sub-topic accordions to CSS-only accordions
 * This function finds existing .section.accordion.sub-topic elements
 * and transforms them into the zd-custom-accordion pattern
 */
export function transformArticleAccordions() {
  try {
    // Check if accordion container already exists - prevent duplicate transformations
    const existingContainer = document.getElementById("article-css-accordions");
    if (existingContainer) {
      console.log(
        "[CSS Article Accordions] Accordion container already exists, skipping transformation"
      );
      return true;
    }

    // Find all sub-topic accordion sections that haven't been transformed yet
    const subTopicSections = document.querySelectorAll(
      ".section.accordion.sub-topic:not([data-transformed-to-css])"
    );

    if (!subTopicSections.length) {
      console.log(
        "[CSS Article Accordions] No accordion sections found on page"
      );
      return false;
    }

    console.log(
      `[CSS Article Accordions] Found ${subTopicSections.length} accordion sections to transform`
    );

    // Create container for the new CSS accordions
    const accordionContainer = document.createElement("div");
    accordionContainer.className = "zd-custom-accordion";
    accordionContainer.id = "article-css-accordions";

    // Process each sub-topic section
    subTopicSections.forEach((section, index) => {
      const panelHeading = section.querySelector(".panel-heading");
      const panelBody = section.querySelector(".panel-body");
      const titleElement = section.querySelector(".title");

      if (!panelHeading || !panelBody || !titleElement) {
        console.warn(
          `[CSS Article Accordions] Section ${index} missing required elements, skipping`
        );
        return;
      }

      // Extract title text
      const title = titleElement.textContent.trim();

      // Extract content HTML
      const content = panelBody.innerHTML;

      // Create accordion item
      const accordionItem = document.createElement("div");
      accordionItem.className = "zd-custom-accordion__item";

      // Create checkbox toggle (hidden)
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `zd-article-accordion-${index}`;
      checkbox.className = "zd-custom-accordion__toggle";

      // Create label/header
      const label = document.createElement("label");
      label.setAttribute("for", `zd-article-accordion-${index}`);
      label.className = "zd-custom-accordion__header";

      // Add title text
      const titleSpan = document.createElement("span");
      titleSpan.textContent = title;
      label.appendChild(titleSpan);

      // Add chevron icon
      const iconSpan = document.createElement("span");
      iconSpan.className = "zd-custom-accordion__icon";
      iconSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;
      label.appendChild(iconSpan);

      // Create content wrapper
      const contentWrapper = document.createElement("div");
      contentWrapper.className = "zd-custom-accordion__content";

      // Create content body
      const contentBody = document.createElement("div");
      contentBody.className = "zd-custom-accordion__body";
      contentBody.innerHTML = content;

      // Assemble the structure
      contentWrapper.appendChild(contentBody);
      accordionItem.appendChild(checkbox);
      accordionItem.appendChild(label);
      accordionItem.appendChild(contentWrapper);

      // Add to container
      accordionContainer.appendChild(accordionItem);

      // Hide the original section
      section.style.display = "none";
      section.setAttribute("data-transformed-to-css", "true");
    });

    // Insert the accordion container before the first sub-topic section
    const firstSection = subTopicSections[0];
    firstSection.parentNode.insertBefore(accordionContainer, firstSection);

    console.log(
      `[CSS Article Accordions] Successfully transformed ${subTopicSections.length} accordion sections`
    );
    return true;
  } catch (error) {
    console.error(
      "[CSS Article Accordions] Error transforming accordions:",
      error
    );

    // On error, show the original sections as fallback
    const subTopicSections = document.querySelectorAll(
      ".section.accordion.sub-topic"
    );
    subTopicSections.forEach((section) => {
      section.style.display = "";
    });

    return false;
  }
}

// Export for use in other modules
if (typeof window !== "undefined") {
  window.transformArticleAccordions = transformArticleAccordions;
}
