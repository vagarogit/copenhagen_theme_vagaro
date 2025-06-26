/**
 * Footer Links Utility
 *
 * Fetches and renders footer links from Hygraph CMS endpoint
 */

class FooterLinksManager {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.options = {
      timeout: 10000,
      retries: 3,
      ...options,
    };
  }

  /**
   * GraphQL query for footer links
   */
  getFooterLinksQuery() {
    return {
      query: `
        query GetFooterLinks {
          navigationMenu(
            where: { id: "cm3eu68fras240dn16jbq7bz5" }
          ) {
            id
            getStartedItems {
              id
              name
              link
              externalLink
            }
            companyItems {
              id
              name
              link
              externalLink
            }
            resourcesItems {
              id
              name
              link
              externalLink
            }
          }
        }
      `,
    };
  }

  /**
   * Fetch footer links from Hygraph
   */
  async fetchFooterLinks() {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.getFooterLinksQuery()),
        signal: AbortSignal.timeout(this.options.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data.data.navigationMenu;
    } catch (error) {
      console.error("Failed to fetch footer links:", error);
      throw error;
    }
  }

  /**
   * Render footer section HTML
   */
  renderFooterSection(title, items) {
    const linksHtml = items
      .map(
        (item) => `
      <li>
        <a href="https://www.vagaro.com/${item.link}" 
           class="text-base font-normal text-white/80 hover:text-gray-300"
           ${item.externalLink ? 'target="_blank" rel="noopener"' : ""}>
          ${item.name}
        </a>
      </li>
    `
      )
      .join("");

    return `
      <div class="${title !== "Get Started" ? "mt-10 md:mt-0" : ""}">
        <h3 class="text-base font-semibold text-white">${title}</h3>
        <ul role="list" class="mt-6 space-y-4">
          ${linksHtml}
        </ul>
      </div>
    `;
  }

  /**
   * Update footer links in the DOM
   */
  async updateFooterLinks(containerId = "footer-links-container") {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container with ID '${containerId}' not found`);
        return;
      }

      // Show loading state
      container.innerHTML =
        '<div class="text-gray-400">Loading footer links...</div>';

      const navigationMenu = await this.fetchFooterLinks();

      // Render all sections
      const sectionsHtml = `
        ${this.renderFooterSection(
          "Get Started",
          navigationMenu.getStartedItems || []
        )}
        ${this.renderFooterSection(
          "Company",
          navigationMenu.companyItems || []
        )}
        ${this.renderFooterSection(
          "Resources",
          navigationMenu.resourcesItems || []
        )}
      `;

      container.innerHTML = sectionsHtml;
    } catch (error) {
      console.error("Failed to update footer links:", error);
      // Fallback to static content or show error
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML =
          '<div class="text-gray-400">Failed to load footer links</div>';
      }
    }
  }

  /**
   * Initialize footer links with retry logic
   */
  async init(containerId) {
    let attempts = 0;

    while (attempts < this.options.retries) {
      try {
        await this.updateFooterLinks(containerId);
        return; // Success
      } catch (error) {
        attempts++;
        if (attempts < this.options.retries) {
          console.log(
            `Retrying footer links fetch (${attempts}/${this.options.retries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        } else {
          console.error("Failed to load footer links after all retries");
        }
      }
    }
  }
}

// Make FooterLinksManager globally available
window.FooterLinksManager = FooterLinksManager;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Replace with your actual Hygraph endpoint
  const HYGRAPH_ENDPOINT =
    "https://us-west-2.cdn.hygraph.com/content/cld3gw4bb0hr001ue9afzcunb/master";

  const footerManager = new FooterLinksManager(HYGRAPH_ENDPOINT, {
    timeout: 8000,
    retries: 2,
  });

  // Initialize footer links
  footerManager.init("footer-links-container");
});
