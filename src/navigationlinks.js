/**
 * Navigation Links Utility
 *
 * Fetches and renders navigation menu items from Hygraph CMS endpoint
 * Creates dropdown mega menus for Business Types (beauty, wellness, fitness) and Features
 */

class NavigationLinksManager {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.options = {
      timeout: 10000,
      retries: 3,
      ...options,
    };
  }

  /**
   * GraphQL query for navigation menu items
   */
  getNavigationMenuQuery() {
    return {
      query: `
        query GetNavigationMenu {
          navigationMenu(where: { id: "clezyiora1akc0an0g68whmx0" }) {
            beautyItems {
              id
              name
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
            wellnessItems {
              id
              name
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
            fitnessItems {
              id
              name
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
            featuresItems {
              id
              name
              description
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
          }
        }
      `,
    };
  }

  /**
   * Fetch navigation menu items from Hygraph
   */
  async fetchNavigationMenu() {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.getNavigationMenuQuery()),
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
      console.error("Failed to fetch navigation menu:", error);
      throw error;
    }
  }

  /**
   * Render business types mega menu (beauty, wellness, fitness)
   */
  renderBusinessTypesMegaMenu(beautyItems, wellnessItems, fitnessItems) {
    const renderCategory = (items, title) => {
      if (!items || items.length === 0) return "";

      // Split items into two columns
      const mid = Math.ceil(items.length / 2);
      const col1 = items.slice(0, mid);
      const col2 = items.slice(mid);

      const renderCol = (col) =>
        col
          .map(
            (item) => `
            <li class="flex items-center mb-4">
              ${
                item.iconImage?.url
                  ? `<img src="${item.iconImage.url}" alt="${item.name}" class="w-10 h-10 mr-3 rounded-full bg-gray-100" />`
                  : ""
              }
              <span>${item.name}</span>
            </li>
          `
          )
          .join("");

      return `
        <div class="px-4 py-3">
          <h3 class="text-md font-semibold mb-4" style="color:#D43C2E">${title}</h3>
          <div class="flex gap-8">
            <ul class="flex-1">${renderCol(col1)}</ul>
            <ul class="flex-1">${renderCol(col2)}</ul>
          </div>
        </div>
      `;
    };

    return `
      <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-3 max-w-6xl mx-auto">
            ${renderCategory(beautyItems, "BEAUTY")}
            ${renderCategory(wellnessItems, "WELLNESS")}
            ${renderCategory(fitnessItems, "FITNESS")}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render features dropdown menu
   */
  renderFeaturesDropdown(featuresItems) {
    if (!featuresItems || featuresItems.length === 0) return "";

    const itemsHtml = featuresItems
      .map(
        (item) => `
        <li>
          <a href="${
            item.link
          }" class="flex items-start p-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
            ${
              item.iconImage?.url
                ? `<img src="${item.iconImage.url}" alt="${item.name}" class="w-6 h-6 mr-3 mt-0.5" />`
                : ""
            }
            <div>
              <div class="font-medium">${item.name}</div>
              ${
                item.description
                  ? `<div class="text-gray-500 text-xs mt-1">${item.description}</div>`
                  : ""
              }
            </div>
          </a>
        </li>
      `
      )
      .join("");

    return `
      <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0">
        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div class="relative bg-white px-5 py-6 sm:p-8 max-w-4xl mx-auto">
            <ul class="space-y-2">
              ${itemsHtml}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update navigation menu in the header
   */
  async updateNavigationMenu() {
    try {
      const navigationMenu = await this.fetchNavigationMenu();

      // Update Business Types dropdown
      const businessTypesContainer = document.getElementById(
        "business-types-dropdown"
      );
      if (businessTypesContainer) {
        businessTypesContainer.innerHTML = this.renderBusinessTypesMegaMenu(
          navigationMenu.beautyItems || [],
          navigationMenu.wellnessItems || [],
          navigationMenu.fitnessItems || []
        );
      }

      // Update Features dropdown
      const featuresContainer = document.getElementById("features-dropdown");
      if (featuresContainer) {
        featuresContainer.innerHTML = this.renderFeaturesDropdown(
          navigationMenu.featuresItems || []
        );
      }

      // Update mobile menu items
      this.updateMobileMenu(navigationMenu);
    } catch (error) {
      console.error("Failed to update navigation menu:", error);
      // Fallback to static content
      this.showFallbackContent();
    }
  }

  /**
   * Update mobile menu with navigation items
   */
  updateMobileMenu(navigationMenu) {
    const mobileMenuContainer = document.getElementById(
      "mobile-navigation-items"
    );
    if (!mobileMenuContainer) return;

    // Get the existing static navigation items
    const existingItems = mobileMenuContainer.innerHTML;

    const renderMobileItems = (items, title) => {
      if (!items || items.length === 0) return "";

      const itemsHtml = items
        .map(
          (item) => `
          <a href="${item.link}" class="block py-2 pl-6 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-charcoal">
            ${item.name}
          </a>
        `
        )
        .join("");

      return `
        <div class="border-t border-gray-200 my-1"></div>
        <div class="px-3 py-2">
          <h4 class="text-sm font-semibold text-gray-900">${title}</h4>
        </div>
        ${itemsHtml}
      `;
    };

    // Create the dynamic navigation items
    const dynamicItems = `
      ${renderMobileItems(navigationMenu.beautyItems, "Beauty")}
      ${renderMobileItems(navigationMenu.wellnessItems, "Wellness")}
      ${renderMobileItems(navigationMenu.fitnessItems, "Fitness")}
      ${renderMobileItems(navigationMenu.featuresItems, "Features")}
    `;

    // Insert dynamic items after the existing static items but before the auth items
    const authItemsStart = existingItems.indexOf(
      '<div class="border-t border-gray-200 my-1"></div>'
    );

    if (authItemsStart !== -1) {
      // Insert dynamic items before the auth section
      const beforeAuth = existingItems.substring(0, authItemsStart);
      const authSection = existingItems.substring(authItemsStart);
      mobileMenuContainer.innerHTML = beforeAuth + dynamicItems + authSection;
    } else {
      // If no auth section found, append to the end
      mobileMenuContainer.innerHTML = existingItems + dynamicItems;
    }
  }

  /**
   * Show fallback content when API fails
   */
  showFallbackContent() {
    const businessTypesContainer = document.getElementById(
      "business-types-dropdown"
    );
    if (businessTypesContainer) {
      businessTypesContainer.innerHTML = `
        <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
          <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-3 max-w-6xl mx-auto">
              <div class="px-4 py-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Beauty</h3>
                <ul class="space-y-1">
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Hair Salons</a></li>
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Nail Salons</a></li>
                </ul>
              </div>
              <div class="px-4 py-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Wellness</h3>
                <ul class="space-y-1">
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Massage Therapy</a></li>
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Spa Services</a></li>
                </ul>
              </div>
              <div class="px-4 py-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Fitness</h3>
                <ul class="space-y-1">
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Personal Training</a></li>
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Yoga Classes</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const featuresContainer = document.getElementById("features-dropdown");
    if (featuresContainer) {
      featuresContainer.innerHTML = `
        <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0">
          <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="relative bg-white px-5 py-6 sm:p-8 max-w-4xl mx-auto">
              <ul class="space-y-2">
                <li><a href="#" class="flex items-start p-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                  <div>
                    <div class="font-medium">Online Booking</div>
                    <div class="text-gray-500 text-xs mt-1">Easy appointment scheduling</div>
                  </div>
                </a></li>
                <li><a href="#" class="flex items-start p-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                  <div>
                    <div class="font-medium">Payment Processing</div>
                    <div class="text-gray-500 text-xs mt-1">Secure payment handling</div>
                  </div>
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Initialize navigation menu with retry logic
   */
  async init() {
    let attempts = 0;

    while (attempts < this.options.retries) {
      try {
        await this.updateNavigationMenu();
        return; // Success
      } catch (error) {
        attempts++;
        if (attempts < this.options.retries) {
          console.log(
            `Retrying navigation menu fetch (${attempts}/${this.options.retries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        } else {
          console.error("Failed to load navigation menu after all retries");
          this.showFallbackContent();
        }
      }
    }
  }
}

// Make NavigationLinksManager globally available
window.NavigationLinksManager = NavigationLinksManager;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Replace with your actual Hygraph endpoint
  const HYGRAPH_ENDPOINT =
    "https://us-west-2.cdn.hygraph.com/content/cld3gw4bb0hr001ue9afzcunb/master";

  const navigationManager = new NavigationLinksManager(HYGRAPH_ENDPOINT, {
    timeout: 8000,
    retries: 2,
  });

  // Initialize navigation menu
  navigationManager.init();
});
