/**
 * Vanilla JS implementation of accordions for category page
 * This is a fallback implementation that doesn't require React
 */

export function initVanillaAccordions() {
  // Wrap in try/catch to avoid any errors breaking the page
  try {
    // Make sure we're on the category page
    if (!document.querySelector(".category-container")) {
      return;
    }

    // Get the original section tree
    const originalSectionTree = document.querySelector(".section-tree");
    if (!originalSectionTree) {
      return;
    }

    // Find or create container for accordions
    let accordionContainer = document.getElementById(
      "category-accordions-container"
    );
    if (!accordionContainer) {
      accordionContainer = document.createElement("div");
      accordionContainer.id = "category-accordions-container";
      originalSectionTree.parentNode.insertBefore(
        accordionContainer,
        originalSectionTree
      );
    }

    // Get all sections
    const sections = originalSectionTree.querySelectorAll(".section");

    // Create accordion wrapper
    const accordionWrapper = document.createElement("div");
    accordionWrapper.className = "section-tree-accordion";

    // Track currently open accordion
    let currentlyOpenAccordion = null;

    // Function to close an accordion
    const closeAccordion = (header, panel, item) => {
      if (!header || !panel) return;

      header.setAttribute("aria-expanded", "false");

      // Closing animation
      panel.style.height = panel.scrollHeight + "px";
      // Force a reflow to ensure the height is applied before changing it
      panel.offsetHeight;

      // Start animation
      panel.style.height = "0";
      item.classList.remove("expanded");

      // After animation completes, hide completely
      setTimeout(() => {
        if (header.getAttribute("aria-expanded") === "false") {
          panel.style.display = "none";
        }
      }, 350);
    };

    // Process each section
    sections.forEach((section, index) => {
      const sectionTitle = section.querySelector(".section-tree-title a");
      const articlesList = section.querySelector(".article-list");
      const seeAllLink = section.querySelector(".see-all-articles");

      if (!sectionTitle) return;

      // Create accordion item
      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";
      accordionItem.setAttribute("data-section-index", index);

      // Create header
      const accordionHeader = document.createElement("div");
      accordionHeader.className = "accordion-header";
      accordionHeader.setAttribute("role", "button");
      accordionHeader.setAttribute("aria-expanded", "false");
      accordionHeader.setAttribute("aria-controls", `accordion-panel-${index}`);
      accordionHeader.tabIndex = 0;

      // Create title
      const titleElement = document.createElement("h2");
      titleElement.className = "section-tree-title";

      // Extract text from the title link but don't use the actual link
      const titleText = document.createElement("span");
      titleText.className = "accordion-title-text";
      titleText.textContent = sectionTitle.textContent.trim();
      titleElement.appendChild(titleText);

      // Store the original URL as a data attribute for reference
      titleElement.setAttribute(
        "data-section-url",
        sectionTitle.getAttribute("href")
      );

      // Add icon
      const icon = document.createElement("span");
      icon.className = "accordion-icon";
      icon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      // Build header
      accordionHeader.appendChild(titleElement);
      accordionHeader.appendChild(icon);

      // Create panel
      const accordionPanel = document.createElement("div");
      accordionPanel.className = "accordion-panel";
      accordionPanel.id = `accordion-panel-${index}`;
      accordionPanel.setAttribute("role", "region");
      accordionPanel.setAttribute("aria-labelledby", accordionHeader.id);
      accordionPanel.style.display = "none";

      // Add content to panel if available
      if (articlesList) {
        // Clone the articles list
        const articlesListClone = articlesList.cloneNode(true);
        accordionPanel.appendChild(articlesListClone);

        // If there are more articles, fetch them all in the background
        if (seeAllLink) {
          // Add a loading indicator
          const loadingIndicator = document.createElement("div");
          loadingIndicator.className = "loading-more-articles";
          loadingIndicator.textContent = "Loading all articles...";
          accordionPanel.appendChild(loadingIndicator);

          // Get the section URL
          const sectionUrl = sectionTitle.getAttribute("href");

          // Fetch all articles asynchronously (non-blocking, preserves order)
          fetch(sectionUrl)
            .then((response) => response.text())
            .then((html) => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              const fullArticlesList = doc.querySelector(".article-list");

              if (fullArticlesList) {
                // Replace the cloned list with the full list
                const currentArticlesList =
                  accordionPanel.querySelector(".article-list");
                if (currentArticlesList) {
                  currentArticlesList.replaceWith(
                    fullArticlesList.cloneNode(true)
                  );
                }
              }

              // Remove loading indicator
              if (loadingIndicator.parentNode) {
                loadingIndicator.remove();
              }
            })
            .catch((error) => {
              console.error("Error fetching all articles:", error);
              // Keep the see all link as fallback
              const seeAllLinkClone = seeAllLink.cloneNode(true);
              accordionPanel.appendChild(seeAllLinkClone);
              if (loadingIndicator.parentNode) {
                loadingIndicator.remove();
              }
            });
        }
      } else if (seeAllLink) {
        // If no articles list but there's a see all link, keep it
        const seeAllLinkClone = seeAllLink.cloneNode(true);
        accordionPanel.appendChild(seeAllLinkClone);
      }

      // Add event listener to header
      accordionHeader.addEventListener("click", () => {
        const expanded =
          accordionHeader.getAttribute("aria-expanded") === "true";

        // If this accordion is already open, just close it
        if (expanded) {
          closeAccordion(accordionHeader, accordionPanel, accordionItem);
          currentlyOpenAccordion = null;
        } else {
          // Close currently open accordion if any
          if (currentlyOpenAccordion) {
            const { header, panel, item } = currentlyOpenAccordion;
            closeAccordion(header, panel, item);
          }

          // Now open this accordion
          accordionHeader.setAttribute("aria-expanded", "true");

          // Opening animation
          // First make it visible but with height 0
          accordionPanel.style.display = "block";
          accordionPanel.style.height = "0";

          // Force a reflow to ensure the display change is applied
          accordionPanel.offsetHeight;

          // Set the target height and start animation
          accordionPanel.style.height = accordionPanel.scrollHeight + "px";
          accordionItem.classList.add("expanded");

          // Clear height after animation is complete to allow for dynamic content
          setTimeout(() => {
            if (accordionHeader.getAttribute("aria-expanded") === "true") {
              accordionPanel.style.height = "auto";
            }
          }, 350); // Match this with CSS transition duration

          // Update currently open accordion
          currentlyOpenAccordion = {
            header: accordionHeader,
            panel: accordionPanel,
            item: accordionItem,
          };
        }
      });

      // Add keyboard accessibility
      accordionHeader.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          accordionHeader.click();
        }
      });

      // Build accordion item
      accordionItem.appendChild(accordionHeader);
      accordionItem.appendChild(accordionPanel);

      // Add to wrapper
      accordionWrapper.appendChild(accordionItem);
    });

    // Add wrapper to container
    accordionContainer.appendChild(accordionWrapper);

    // Hide original section tree
    originalSectionTree.style.display = "none";
  } catch (error) {
    console.error("Error initializing accordions:", error);
    // Show the original section tree in case of error
    const originalSectionTree = document.querySelector(".section-tree");
    if (originalSectionTree) {
      originalSectionTree.style.display = "block";
    }
  }
}

/**
 * Initialize sub-topic accordions for article pages
 * This handles the section accordion sub-topic pattern
 */
export function initSubTopicAccordions() {
  try {
    // Find all sub-topic accordions
    const subTopicAccordions = document.querySelectorAll(
      ".section.accordion.sub-topic"
    );

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
      panelBody.style.transition = "height 0.35s ease-in-out";

      // Add click functionality
      panelHeading.addEventListener("click", () => {
        const expanded = panelHeading.getAttribute("aria-expanded") === "true";

        if (expanded) {
          // Close accordion
          panelHeading.setAttribute("aria-expanded", "false");

          // First set explicit height before animating
          panelBody.style.height = panelBody.scrollHeight + "px";

          // Force reflow to ensure the browser applies the height
          panelBody.offsetHeight;

          // Trigger animation to close
          panelBody.style.height = "0px";

          // After animation completes, hide the panel completely
          setTimeout(() => {
            if (panelHeading.getAttribute("aria-expanded") === "false") {
              panelBody.style.display = "none";
            }
          }, 350);
        } else {
          // Open accordion
          panelHeading.setAttribute("aria-expanded", "true");

          // Make sure panel is visible but with zero height to start animation
          panelBody.style.display = "block";
          panelBody.style.height = "0px";

          // Force reflow to ensure display change is applied
          panelBody.offsetHeight;

          // Set target height to trigger animation
          panelBody.style.height = panelBody.scrollHeight + "px";

          // Clear height after animation completes
          setTimeout(() => {
            if (panelHeading.getAttribute("aria-expanded") === "true") {
              panelBody.style.height = "auto";
            }
          }, 350);
        }
      });

      // Add keyboard accessibility
      panelHeading.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          panelHeading.click();
        }
      });

      // Add icon to header if not already present
      if (!panelHeading.querySelector(".accordion-icon")) {
        const icon = document.createElement("span");
        icon.className = "accordion-icon";
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        panelHeading.appendChild(icon);
      }

      // Ensure panel is properly collapsed initially
      // Keep the existing collapse class which is part of the HTML structure
      panelBody.style.display = "none";
      panelBody.style.height = "0px";
    });
  } catch (error) {
    console.error("Error initializing sub-topic accordions:", error);
  }
}
