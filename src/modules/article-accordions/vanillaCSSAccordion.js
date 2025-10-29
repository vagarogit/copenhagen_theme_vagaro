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
    // Prevent multiple simultaneous transformations
    if (window.accordionTransformationInProgress) {
      console.log(
        "[CSS Article Accordions] Transformation already in progress, skipping"
      );
      return false;
    }

    // Mark transformation as in progress
    window.accordionTransformationInProgress = true;

    // Find or get existing accordion container
    let accordionContainer = document.getElementById("article-css-accordions");

    // Find all sub-topic accordion sections that haven't been transformed yet
    // Convert to array and sort by DOM position to ensure consistent order
    const allSections = Array.from(
      document.querySelectorAll(
        ".section.accordion.sub-topic:not([data-transformed-to-css])"
      )
    );

    // Sort by DOM position to ensure consistent order across browsers
    // This ensures sections are processed in the exact order they appear in the DOM
    const subTopicSections = allSections.sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1; // a comes before b
      } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1; // a comes after b
      }
      return 0; // same position
    });

    console.log(
      `[CSS Article Accordions] Processing ${subTopicSections.length} sections in DOM order:`,
      subTopicSections.map(
        (s) => s.querySelector(".title")?.textContent.trim() || "Untitled"
      )
    );

    if (!subTopicSections.length) {
      // If no new sections to transform, check if container exists
      if (accordionContainer) {
        console.log(
          "[CSS Article Accordions] No new accordion sections found, container already exists"
        );
        window.accordionTransformationInProgress = false;
        return true;
      }
      console.log(
        "[CSS Article Accordions] No accordion sections found on page"
      );
      window.accordionTransformationInProgress = false;
      return false;
    }

    console.log(
      `[CSS Article Accordions] Found ${subTopicSections.length} accordion sections to transform`
    );

    // Create container if it doesn't exist
    if (!accordionContainer) {
      accordionContainer = document.createElement("div");
      accordionContainer.className = "zd-custom-accordion";
      accordionContainer.id = "article-css-accordions";
    }

    // Get existing items count for indexing
    const existingItems = accordionContainer.querySelectorAll(
      ".zd-custom-accordion__item"
    );
    let accordionIndex = existingItems.length;

    // If container already has items and we have new sections to add,
    // verify we're not duplicating by checking if all sections are already transformed
    if (existingItems.length > 0 && subTopicSections.length > 0) {
      // Check if any of the sections we're about to process already have corresponding accordion items
      // This prevents duplicate processing
      const alreadyTransformed = subTopicSections.every((section) => {
        const sectionTitle = section
          .querySelector(".title")
          ?.textContent.trim();
        if (!sectionTitle) return true; // Skip if no title

        // Check if an accordion item with this title already exists
        return Array.from(existingItems).some((item) => {
          const itemTitle = item
            .querySelector(".zd-custom-accordion__header span")
            ?.textContent.trim();
          return itemTitle === sectionTitle;
        });
      });

      if (alreadyTransformed) {
        console.log(
          "[CSS Article Accordions] All sections already transformed, skipping"
        );
        window.accordionTransformationInProgress = false;
        return true;
      }
    }

    // Find the best insertion point - prefer the dedicated container in template
    let insertionParent = null;

    // First, try to find the dedicated container from the template
    const dedicatedContainer = document.getElementById(
      "article-css-accordions-container"
    );
    if (dedicatedContainer) {
      insertionParent = dedicatedContainer;
    } else {
      // Fallback: Try to find article-content or article-body
      const articleContent = document.querySelector(".article-content");
      if (articleContent) {
        insertionParent = articleContent;
      } else {
        const articleBody = document.querySelector(".article-body");
        if (articleBody) {
          insertionParent = articleBody.parentNode; // Use article-content as parent
        } else {
          // Final fallback - use first section's parent
          if (subTopicSections.length > 0) {
            insertionParent = subTopicSections[0].parentNode;
          }
        }
      }
    }

    // Process each sub-topic section IN ORDER (as they appear in the DOM)
    // Use for loop to ensure strict order preservation
    for (let i = 0; i < subTopicSections.length; i++) {
      const section = subTopicSections[i];
      const panelHeading = section.querySelector(".panel-heading");
      const panelBody = section.querySelector(".panel-body");
      const titleElement = section.querySelector(".title");

      if (!panelHeading || !panelBody || !titleElement) {
        console.warn(
          `[CSS Article Accordions] Section ${i} missing required elements, skipping`
        );
        continue; // Skip this section but continue processing others
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
      checkbox.id = `zd-article-accordion-${accordionIndex}`;
      checkbox.className = "zd-custom-accordion__toggle";

      // Create label/header
      const label = document.createElement("label");
      label.setAttribute("for", `zd-article-accordion-${accordionIndex}`);
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

      // Hide the original section and mark as transformed
      // Use both display:none and a data attribute to ensure it stays hidden
      section.style.display = "none";
      section.style.visibility = "hidden";
      section.setAttribute("data-transformed-to-css", "true");
      section.setAttribute("aria-hidden", "true");

      // Store original DOM index to preserve order
      section.setAttribute("data-original-index", i.toString());

      accordionIndex++;
    }

    console.log(
      `[CSS Article Accordions] Transformed ${accordionIndex} accordions in order`
    );

    // Verify order was preserved
    const finalItems = accordionContainer.querySelectorAll(
      ".zd-custom-accordion__item"
    );
    console.log(
      `[CSS Article Accordions] Final accordion order:`,
      Array.from(finalItems).map(
        (item) =>
          item
            .querySelector(".zd-custom-accordion__header span")
            ?.textContent.trim() || "Untitled"
      )
    );

    // Lock the container to prevent reordering
    // Add a data attribute to mark it as locked
    accordionContainer.setAttribute("data-accordion-locked", "true");

    // Add a MutationObserver to prevent order changes
    if (typeof MutationObserver !== "undefined") {
      const lockObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          // If items are being reordered, restore original order
          if (
            mutation.type === "childList" &&
            mutation.target === accordionContainer
          ) {
            const currentItems = Array.from(
              accordionContainer.querySelectorAll(".zd-custom-accordion__item")
            );
            const originalOrder = currentItems.map((item) => {
              const title = item
                .querySelector(".zd-custom-accordion__header span")
                ?.textContent.trim();
              return title;
            });

            // Check if order changed by comparing with section order
            const sectionOrder = subTopicSections.map((s) =>
              s.querySelector(".title")?.textContent.trim()
            );
            const orderChanged =
              originalOrder.join("|") !== sectionOrder.join("|");

            if (orderChanged && subTopicSections.length > 0) {
              console.warn(
                "[CSS Article Accordions] Order changed detected, restoring original order"
              );
              // Temporarily disconnect to prevent infinite loop
              lockObserver.disconnect();

              // Re-sort items to match section order
              const sortedItems = currentItems.sort((a, b) => {
                const aTitle = a
                  .querySelector(".zd-custom-accordion__header span")
                  ?.textContent.trim();
                const bTitle = b
                  .querySelector(".zd-custom-accordion__header span")
                  ?.textContent.trim();
                const aIndex = sectionOrder.indexOf(aTitle);
                const bIndex = sectionOrder.indexOf(bTitle);
                return aIndex - bIndex;
              });

              // Re-append in correct order
              sortedItems.forEach((item) =>
                accordionContainer.appendChild(item)
              );

              // Reconnect observer
              setTimeout(() => {
                lockObserver.observe(accordionContainer, { childList: true });
              }, 100);
            }
          }
        });
      });

      // Start observing after a brief delay to avoid observing our own changes
      setTimeout(() => {
        lockObserver.observe(accordionContainer, { childList: true });
      }, 100);
    }

    // Only insert container if it's not already in the DOM
    if (!accordionContainer.parentNode && insertionParent) {
      // If using dedicated container, append accordion to it
      if (insertionParent.id === "article-css-accordions-container") {
        insertionParent.appendChild(accordionContainer);
      } else {
        // Otherwise, try to insert before first accordion section or append
        const firstSection =
          subTopicSections.length > 0 ? subTopicSections[0] : null;
        if (firstSection && insertionParent.contains(firstSection)) {
          insertionParent.insertBefore(accordionContainer, firstSection);
        } else {
          insertionParent.appendChild(accordionContainer);
        }
      }
    }

    console.log(
      `[CSS Article Accordions] Successfully transformed ${subTopicSections.length} accordion sections into grouped container`
    );

    // Clear the in-progress flag
    window.accordionTransformationInProgress = false;
    return true;
  } catch (error) {
    console.error(
      "[CSS Article Accordions] Error transforming accordions:",
      error
    );

    // Clear the in-progress flag on error
    window.accordionTransformationInProgress = false;

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
