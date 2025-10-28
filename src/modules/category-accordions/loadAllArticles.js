/**
 * Load all articles for category page accordions
 * This overcomes Zendesk's default 6-article limit per section
 */

export function loadAllArticles() {
  try {
    // Only run on category pages
    if (!document.querySelector(".category-container")) {
      console.log("Not on category page, skipping loadAllArticles");
      return;
    }

    // Find all accordion items
    const accordionItems = document.querySelectorAll(
      ".zd-custom-accordion__item"
    );

    console.log(`Found ${accordionItems.length} accordion items`);

    accordionItems.forEach((item) => {
      const body = item.querySelector(".zd-custom-accordion__body");
      const seeAllLink = body?.querySelector(".see-all-articles");

      console.log("Checking accordion item:", {
        hasBody: !!body,
        hasSeeAllLink: !!seeAllLink,
      });

      if (!seeAllLink || !body) {
        return;
      }

      // Get the section URL from the "see all" link
      const sectionUrl = seeAllLink.getAttribute("href");

      if (!sectionUrl) {
        return;
      }

      // Create a loading indicator
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "loading-more-articles";
      loadingIndicator.style.cssText =
        "margin-top: 0.5rem; color: #6b7280; font-size: 0.875rem;";
      loadingIndicator.textContent = "Loading all articles...";

      // Replace the "see all" link with loading indicator
      seeAllLink.style.display = "none";
      body.appendChild(loadingIndicator);

      console.log(`Fetching all articles from: ${sectionUrl}`);

      // Fetch the full section page
      fetch(sectionUrl)
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Find the article list in the fetched page
          const fullArticlesList = doc.querySelector(".article-list");

          if (fullArticlesList) {
            // Replace the limited article list with the full one
            const currentArticlesList = body.querySelector(".article-list");
            if (currentArticlesList) {
              // Clone all articles from the full list
              const newArticlesList = fullArticlesList.cloneNode(true);
              const articleCount =
                newArticlesList.querySelectorAll(".article-list-item").length;
              console.log(
                `Replaced article list with ${articleCount} articles`
              );
              currentArticlesList.replaceWith(newArticlesList);
            }
          } else {
            console.warn("Could not find article list in fetched page");
          }

          // Remove the loading indicator and "see all" link
          loadingIndicator.remove();
          seeAllLink.remove();
        })
        .catch((error) => {
          console.error("Error loading all articles:", error);

          // On error, show the "see all" link again
          loadingIndicator.remove();
          seeAllLink.style.display = "";
        });
    });
  } catch (error) {
    console.error("Error in loadAllArticles:", error);
  }
}
