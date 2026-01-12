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

    // Global state management for smooth navigation
    this.activeMenu = null;
    this.menuStates = new Map();
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
              flagAsNew
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
              flagAsNew
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
              flagAsNew
              iconImage {
                id
                url
              }
            }
            featureItems {
              id
              name
              description
              link
              showInHomeTabs
              flagAsNew
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

      const renderColumn = (columnItems) => {
        return columnItems
          .map((item) => {
            // Determine icon URL with fallback for beauty category
            let iconUrl = item.iconImage?.url;
            if (!iconUrl && title === "BEAUTY" && window.beautyIconSvg) {
              iconUrl = window.beautyIconSvg;
            }

            return `
            <div class="mega-menu-item flex items-center py-1 hover:bg-gray-50 rounded px-2">
              ${
                iconUrl
                  ? `<img src="${iconUrl}" alt="${item.name}" class="w-6 h-6 mr-3" />`
                  : `<div class="w-6 h-6 mr-3"></div>`
              }
              <a href="${
                item.link
              }" class="text-sm text-gray-600 hover:text-gray-900">
                ${item.name}
              </a>
            </div>
          `;
          })
          .join("");
      };

      return `
        <div class="px-0">
          <h3 class="mega-menu-category-heading text-sm font-semibold mb-6" style="color:#D43C2E">${title}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              ${renderColumn(col1)}
            </div>
            <div class="space-y-3">
              ${renderColumn(col2)}
            </div>
          </div>
        </div>
      `;
    };

    // Calculate position of the navigation bar
    const navBar = document.getElementById("navigation-menu");
    const navBarRect = navBar?.getBoundingClientRect();
    const navBarBottom = navBarRect ? navBarRect.bottom + window.scrollY : 64;

    return `
      <div class="mega-menu-full-width" style="
        top: ${navBarBottom}px; 
        min-height: 300px;
      " data-state="closed">
        <div class="mega-menu-content" data-state="closed">
          <div class="max-w-6xl mx-auto px-8 py-12">
            <div class="grid grid-cols-3 gap-16">
              ${renderCategory(beautyItems, "BEAUTY")}
              ${renderCategory(wellnessItems, "WELLNESS")}
              ${renderCategory(fitnessItems, "FITNESS")}
            </div>
          </div>
          <div class="mega-menu-arrow"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render features mega menu
   */
  renderFeatureItemsMegaMenu(featureItems) {
    if (!featureItems || featureItems.length === 0) return "";

    // Group items into categories based on their position
    const categories = {
      "RUN YOUR BUSINESS": [],
      "ELEVATE CLIENT EXPERIENCE": [],
      "GROW YOUR BUSINESS": [],
      "SIMPLIFY PAYMENTS": [],
      "BUILD YOUR BRAND": [],
    };

    // You can customize this mapping based on your actual feature names
    featureItems.forEach((item) => {
      if (
        item.name.includes("Calendar") ||
        item.name.includes("Payroll") ||
        item.name.includes("Reports") ||
        item.name.includes("Rent") ||
        item.name.includes("Forms")
      ) {
        categories["RUN YOUR BUSINESS"].push(item);
      } else if (
        item.name.includes("Booking") ||
        item.name.includes("Connect") ||
        item.name.includes("Notifications") ||
        item.name.includes("Stream") ||
        item.name.includes("Apps")
      ) {
        categories["ELEVATE CLIENT EXPERIENCE"].push(item);
      } else if (
        item.name.includes("Marketplace") ||
        item.name.includes("Store") ||
        item.name.includes("Memberships") ||
        item.name.includes("Inventory") ||
        item.name.includes("Capital")
      ) {
        categories["GROW YOUR BUSINESS"].push(item);
      } else if (
        item.name.includes("PayPro") ||
        item.name.includes("Pay Later") ||
        item.name.includes("Invoices") ||
        item.name.includes("Payments")
      ) {
        categories["SIMPLIFY PAYMENTS"].push(item);
      } else {
        categories["BUILD YOUR BRAND"].push(item);
      }
    });

    const renderCategory = (title, items) => {
      if (items.length === 0) return "";

      const itemsHtml = items
        .map(
          (item) => `
          <div class="mega-menu-item flex items-start p-2 hover:bg-gray-50 rounded">
            ${
              item.iconImage?.url
                ? `<img src="${item.iconImage.url}" alt="${item.name}" class="w-5 h-5 mr-3 mt-0.5" />`
                : `<div class="w-5 h-5 mr-3 mt-0.5"></div>`
            }
            <a href="${
              item.link
            }" class="text-sm text-gray-700 hover:text-gray-900">
              ${item.name}
            </a>
          </div>
        `
        )
        .join("");

      return `
        <div>
          <h4 class="mega-menu-category-heading text-xs font-semibold mb-4" style="color:#D43C2E">${title}</h4>
          <div class="space-y-2">
            ${itemsHtml}
          </div>
        </div>
      `;
    };

    // Calculate position of the navigation bar
    const navBar = document.getElementById("navigation-menu");
    const navBarRect = navBar?.getBoundingClientRect();
    const navBarBottom = navBarRect ? navBarRect.bottom + window.scrollY : 64;

    return `
      <div class="mega-menu-full-width" style="
        top: ${navBarBottom}px; 
        min-height: 300px;
      " data-state="closed">
        <div class="mega-menu-content" data-state="closed">
          <div class="max-w-6xl mx-auto px-8 py-12">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              ${Object.entries(categories)
                .map(([title, items]) => renderCategory(title, items))
                .join("")}
            </div>
          </div>
          <div class="mega-menu-arrow"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render support mega menu (2x2 grid with icons and descriptions)
   * Matches styling from SupportDropdownMenu.tsx
   */
  renderSupportMegaMenu() {
    const supportItems = [
      {
        title: "Call Support",
        description:
          "Our dedicated support team is here to help you with any questions or issues you may have.",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6">
          <path fill-rule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clip-rule="evenodd" />
        </svg>`,
        link: "https://support.vagaro.com/hc/en-us#contact-support",
      },
      {
        title: "Support Articles",
        description:
          "If you're using Vagaro and need assistance, checking out our support article page is highly recommended.",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>`,
        link: "https://support.vagaro.com/hc/en-us",
      },
      {
        title: "Feature Requests",
        description:
          "Do you have a feature request that would make your life easier? Let us know!",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>`,
        link: "https://vagaro.uservoice.com",
      },
    ];

    const renderSupportItem = (item) => {
      return `
        <a href="${item.link}" target="_blank" rel="noopener noreferrer"
           class="support-menu-item group relative flex items-center gap-6 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50 sm:p-6 transition-colors">
          <div class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-100 group-hover:bg-white text-gray-700 group-hover:text-primary transition-colors">
            ${item.icon}
          </div>
          <div>
            <span class="font-semibold text-gray-900">
              ${item.title}
              <span class="absolute inset-0"></span>
            </span>
            <p class="mt-1 text-sm text-gray-600">${item.description}</p>
          </div>
        </a>
      `;
    };

    const renderSystemStatusItem = () => {
      return `
        <a href="https://status.vagaro.com/" target="_blank" rel="noopener noreferrer"
           class="support-menu-item group relative flex items-center gap-6 rounded-lg border border-gray-200 bg-white p-3 text-sm hover:bg-gray-50 sm:p-6 transition-colors">
          <div class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-100 group-hover:bg-white transition-colors">
            <span class="relative flex size-6">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span class="relative inline-flex size-6 rounded-full bg-green-500"></span>
            </span>
          </div>
          <div>
            <span class="font-semibold text-gray-900">
              System Status
              <span class="absolute inset-0"></span>
            </span>
            <p class="mt-1 text-sm text-gray-600">All Systems Operational</p>
          </div>
        </a>
      `;
    };

    // Calculate position of the navigation bar
    const navBar = document.getElementById("navigation-menu");
    const navBarRect = navBar?.getBoundingClientRect();
    const navBarBottom = navBarRect ? navBarRect.bottom + window.scrollY : 64;

    return `
      <div class="mega-menu-full-width" style="
        top: ${navBarBottom}px;
        min-height: 200px;
      " data-state="closed">
        <div class="mega-menu-content" data-state="closed">
          <div class="w-full bg-white">
            <div class="mx-auto grid max-w-4xl grid-cols-1 gap-2 px-6 py-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0 sm:py-10 lg:grid-cols-2 lg:gap-4 lg:px-8 xl:gap-8">
              ${supportItems.map((item) => renderSupportItem(item)).join("")}
              ${renderSystemStatusItem()}
            </div>
          </div>
          <div class="mega-menu-arrow"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render features dropdown menu (simple dropdown version)
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

      // Validate navigation menu data
      if (!navigationMenu) {
        this.showFallbackContent();
        return;
      }

      // Update Business Types dropdown
      const businessTypesContainer = document.getElementById(
        "business-types-dropdown"
      );
      if (businessTypesContainer) {
        const businessTypesHTML = this.renderBusinessTypesMegaMenu(
          navigationMenu.beautyItems || [],
          navigationMenu.wellnessItems || [],
          navigationMenu.fitnessItems || []
        );

        // Clear existing content
        businessTypesContainer.innerHTML = "";

        // Create the mega menu and append to body for true full width
        const businessMegaMenuWrapper = document.createElement("div");
        businessMegaMenuWrapper.id = "business-types-mega-menu-wrapper";
        businessMegaMenuWrapper.className = "mega-menu-full-width";
        businessMegaMenuWrapper.innerHTML = businessTypesHTML;

        // Ensure the wrapper itself has full viewport width styles
        businessMegaMenuWrapper.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100vw !important;
          z-index: 50 !important;
          display: none;
        `;

        // Remove any existing mega menu
        const existingBusinessMegaMenu = document.getElementById(
          "business-types-mega-menu-wrapper"
        );
        if (existingBusinessMegaMenu) {
          existingBusinessMegaMenu.remove();
        }

        // Append to body for true full viewport width
        document.body.appendChild(businessMegaMenuWrapper);

        // Add hover behavior for Business Types button and mega menu
        this.setupBusinessTypesMegaMenuBehavior();

        // Add a placeholder div to the original container to maintain hover behavior
        businessTypesContainer.innerHTML = `<div id="business-types-placeholder" style="position: absolute; top: 100%; left: 0; width: 1px; height: 1px;"></div>`;
      }

      // Update Features dropdown
      const featuresContainer = document.getElementById("features-dropdown");
      if (featuresContainer) {
        const featuresHTML = this.renderFeatureItemsMegaMenu(
          navigationMenu.featureItems || []
        );

        // Clear existing content
        featuresContainer.innerHTML = "";

        // Create the mega menu and append to body for true full width
        const megaMenuWrapper = document.createElement("div");
        megaMenuWrapper.id = "features-mega-menu-wrapper";
        megaMenuWrapper.innerHTML = featuresHTML;

        // Remove any existing mega menu
        const existingMegaMenu = document.getElementById(
          "features-mega-menu-wrapper"
        );
        if (existingMegaMenu) {
          existingMegaMenu.remove();
        }

        // Append to body for true full viewport width
        document.body.appendChild(megaMenuWrapper);

        // Add hover behavior for Features button and mega menu
        this.setupFeaturesMegaMenuBehavior();

        // Add a placeholder div to the original container to maintain hover behavior
        featuresContainer.innerHTML = `<div id="features-placeholder" style="position: absolute; top: 100%; left: 0; width: 1px; height: 1px;"></div>`;
      }

      // Setup Support dropdown (static content, no CMS data needed)
      const supportHTML = this.renderSupportMegaMenu();

      // Create the support mega menu and append to body for true full width
      const supportMegaMenuWrapper = document.createElement("div");
      supportMegaMenuWrapper.id = "support-mega-menu-wrapper";
      supportMegaMenuWrapper.innerHTML = supportHTML;

      // Initially hide the menu
      supportMegaMenuWrapper.style.display = "none";

      // Remove any existing support mega menu
      const existingSupportMegaMenu = document.getElementById(
        "support-mega-menu-wrapper"
      );
      if (existingSupportMegaMenu) {
        existingSupportMegaMenu.remove();
      }

      // Append to body for true full viewport width
      document.body.appendChild(supportMegaMenuWrapper);

      // Add hover behavior for Support button and mega menu
      this.setupSupportMegaMenuBehavior();

      // Update mobile menu items
      this.updateMobileMenu(navigationMenu);

      // Send data to Radix Navigation component
      this.updateRadixNavigation(navigationMenu);
    } catch (error) {
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

    const renderMobileItems = (items, title) => {
      if (!items || items.length === 0) {
        return "";
      }
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

    // Find the last static menu item (Resources) to insert dynamic content after it
    const allLinks = mobileMenuContainer.querySelectorAll("a");
    let resourcesLink = null;

    allLinks.forEach((link) => {
      if (link.textContent.trim() === "Resources") {
        resourcesLink = link;
      }
    });

    if (resourcesLink) {
      // Create a container for dynamic items
      const dynamicContainer = document.createElement("div");
      dynamicContainer.id = "dynamic-mobile-menu-items";
      dynamicContainer.innerHTML = `
        ${renderMobileItems(navigationMenu.beautyItems, "Beauty")}
        ${renderMobileItems(navigationMenu.wellnessItems, "Wellness")}
        ${renderMobileItems(navigationMenu.fitnessItems, "Fitness")}
        ${renderMobileItems(navigationMenu.featureItems, "Features")}
      `;

      // Remove any existing dynamic container
      const existingDynamic = document.getElementById(
        "dynamic-mobile-menu-items"
      );
      if (existingDynamic) {
        existingDynamic.remove();
      }

      // Insert after Resources link
      resourcesLink.insertAdjacentElement("afterend", dynamicContainer);
    }
  }

  /**
   * Setup hover behavior for Business Types mega menu
   */
  setupBusinessTypesMegaMenuBehavior() {
    // Find the Business Types button specifically
    const businessTypesButton =
      document.querySelector("button:has(+ #business-types-dropdown)") ||
      Array.from(document.querySelectorAll(".dropdown-toggle")).find((btn) =>
        btn.textContent.trim().includes("Business Types")
      );
    const megaMenu = document.getElementById(
      "business-types-mega-menu-wrapper"
    );

    if (!businessTypesButton || !megaMenu) return;

    // Add mega-menu-trigger class to button
    businessTypesButton.classList.add("mega-menu-trigger");

    let showTimeout;
    let hideTimeout;
    let isVisible = false;

    const showMegaMenu = () => {
      clearTimeout(hideTimeout);

      if (isVisible) return; // Already visible, don't re-trigger animation

      showTimeout = setTimeout(() => {
        // Show the menu first
        megaMenu.style.display = "block";

        // Use the transition utility for smooth animation
        this.handleMegaMenuTransition(megaMenu, "from-start");

        // Update button state
        businessTypesButton.setAttribute("data-state", "open");

        isVisible = true;
      }, 50); // Reduced from 100ms for faster response
    };

    const hideMegaMenu = () => {
      clearTimeout(showTimeout);

      if (!isVisible) return; // Already hidden, don't re-trigger animation

      hideTimeout = setTimeout(() => {
        // Use the exit transition utility for smooth animation
        this.handleMegaMenuExit(megaMenu, "to-start");

        // Update button state
        businessTypesButton.setAttribute("data-state", "closed");

        // Hide the menu after animation completes
        setTimeout(() => {
          megaMenu.style.display = "none";
          isVisible = false;
        }, 150); // Reduced from 200ms for faster response
      }, 100); // Reduced from 300ms for faster response
    };

    // Show on hover over Business Types button
    businessTypesButton.addEventListener("mouseenter", showMegaMenu);
    businessTypesButton.addEventListener("mouseleave", hideMegaMenu);

    // Keep visible when hovering over mega menu
    megaMenu.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
    });
    megaMenu.addEventListener("mouseleave", hideMegaMenu);

    // Initially hide the mega menu
    megaMenu.style.display = "none";
    megaMenu.setAttribute("data-state", "closed");
    const content = megaMenu.querySelector(".mega-menu-content");
    if (content) {
      content.setAttribute("data-state", "closed");
    }
    businessTypesButton.setAttribute("data-state", "closed");
    isVisible = false;
  }

  /**
   * Setup hover behavior for Features mega menu
   */
  setupFeaturesMegaMenuBehavior() {
    // Find the Features button specifically (not Business Types)
    const featuresButton =
      document.querySelector("button:has(+ #features-dropdown)") ||
      Array.from(document.querySelectorAll(".dropdown-toggle")).find((btn) =>
        btn.textContent.trim().includes("Features")
      );
    const megaMenu = document.getElementById("features-mega-menu-wrapper");

    if (!featuresButton || !megaMenu) return;

    // Add mega-menu-trigger class to button
    featuresButton.classList.add("mega-menu-trigger");

    let showTimeout;
    let hideTimeout;
    let isVisible = false;

    const showMegaMenu = () => {
      clearTimeout(hideTimeout);

      if (isVisible) return; // Already visible, don't re-trigger animation

      showTimeout = setTimeout(() => {
        // Show the menu first
        megaMenu.style.display = "block";

        // Use the transition utility for smooth animation
        this.handleMegaMenuTransition(megaMenu, "from-end");

        // Update button state
        featuresButton.setAttribute("data-state", "open");

        isVisible = true;
      }, 50); // Reduced from 100ms for faster response
    };

    const hideMegaMenu = () => {
      clearTimeout(showTimeout);

      if (!isVisible) return; // Already hidden, don't re-trigger animation

      hideTimeout = setTimeout(() => {
        // Use the exit transition utility for smooth animation
        this.handleMegaMenuExit(megaMenu, "to-end");

        // Update button state
        featuresButton.setAttribute("data-state", "closed");

        // Hide the menu after animation completes
        setTimeout(() => {
          megaMenu.style.display = "none";
          isVisible = false;
        }, 150); // Reduced from 200ms for faster response
      }, 100); // Reduced from 300ms for faster response
    };

    // Show on hover over Features button
    featuresButton.addEventListener("mouseenter", showMegaMenu);
    featuresButton.addEventListener("mouseleave", hideMegaMenu);

    // Keep visible when hovering over mega menu
    megaMenu.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
    });
    megaMenu.addEventListener("mouseleave", hideMegaMenu);

    // Initially hide the mega menu
    megaMenu.style.display = "none";
    megaMenu.setAttribute("data-state", "closed");
    const content = megaMenu.querySelector(".mega-menu-content");
    if (content) {
      content.setAttribute("data-state", "closed");
    }
    featuresButton.setAttribute("data-state", "closed");
    isVisible = false;
  }

  /**
   * Setup hover behavior for Support mega menu
   */
  setupSupportMegaMenuBehavior() {
    // Find the Support button specifically
    const supportButton =
      document.querySelector("button:has(+ #support-dropdown)") ||
      Array.from(document.querySelectorAll(".dropdown-toggle")).find((btn) =>
        btn.textContent.trim().includes("Support")
      );
    const megaMenu = document.getElementById("support-mega-menu-wrapper");

    if (!supportButton || !megaMenu) return;

    // Add mega-menu-trigger class to button
    supportButton.classList.add("mega-menu-trigger");

    let showTimeout;
    let hideTimeout;
    let isVisible = false;

    const showMegaMenu = () => {
      clearTimeout(hideTimeout);

      if (isVisible) return; // Already visible, don't re-trigger animation

      showTimeout = setTimeout(() => {
        // Show the menu first
        megaMenu.style.display = "block";

        // Use the transition utility for smooth animation
        this.handleMegaMenuTransition(megaMenu, "from-end");

        // Update button state
        supportButton.setAttribute("data-state", "open");

        isVisible = true;
      }, 50);
    };

    const hideMegaMenu = () => {
      clearTimeout(showTimeout);

      if (!isVisible) return; // Already hidden, don't re-trigger animation

      hideTimeout = setTimeout(() => {
        // Use the exit transition utility for smooth animation
        this.handleMegaMenuExit(megaMenu, "to-end");

        // Update button state
        supportButton.setAttribute("data-state", "closed");

        // Hide the menu after animation completes
        setTimeout(() => {
          megaMenu.style.display = "none";
          isVisible = false;
        }, 150);
      }, 100);
    };

    // Show on hover over Support button
    supportButton.addEventListener("mouseenter", showMegaMenu);
    supportButton.addEventListener("mouseleave", hideMegaMenu);

    // Keep visible when hovering over mega menu
    megaMenu.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
    });
    megaMenu.addEventListener("mouseleave", hideMegaMenu);

    // Initially hide the mega menu
    megaMenu.style.display = "none";
    megaMenu.setAttribute("data-state", "closed");
    const content = megaMenu.querySelector(".mega-menu-content");
    if (content) {
      content.setAttribute("data-state", "closed");
    }
    supportButton.setAttribute("data-state", "closed");
    isVisible = false;
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
        <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 bg-white">
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
          // console.log(
          //   `Retrying navigation menu fetch (${attempts}/${this.options.retries})...`
          // );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        } else {
          // console.error("Failed to load navigation menu after all retries");
          this.showFallbackContent();
        }
      }
    }
  }

  /**
   * Utility method to handle smooth transitions with direction detection
   */
  handleMegaMenuTransition(megaMenu, direction = "from-start") {
    if (!megaMenu) return;

    const content = megaMenu.querySelector(".mega-menu-content");
    if (!content) return;

    // If there's an active menu that's different, hide it quickly
    if (this.activeMenu && this.activeMenu !== megaMenu) {
      this.activeMenu.style.display = "none";
      this.activeMenu.setAttribute("data-state", "closed");
      const activeContent = this.activeMenu.querySelector(".mega-menu-content");
      if (activeContent) {
        activeContent.setAttribute("data-state", "closed");
      }
    }

    // Set this as the active menu
    this.activeMenu = megaMenu;

    // Cancel any ongoing animations
    content.style.animation = "none";
    content.offsetHeight; // Force reflow

    // Set motion direction for animation
    content.setAttribute("data-motion", direction);

    // Set state to trigger animation
    megaMenu.setAttribute("data-state", "open");
    content.setAttribute("data-state", "open");

    // Restore animation
    content.style.animation = "";
  }

  /**
   * Utility method to handle smooth exit transitions
   */
  handleMegaMenuExit(megaMenu, direction = "to-start") {
    if (!megaMenu) return;

    const content = megaMenu.querySelector(".mega-menu-content");
    if (!content) return;

    // Clear active menu if this is the active one
    if (this.activeMenu === megaMenu) {
      this.activeMenu = null;
    }

    // Cancel any ongoing animations
    content.style.animation = "none";
    content.offsetHeight; // Force reflow

    // Set motion direction for exit animation
    content.setAttribute("data-motion", direction);

    // Set state to trigger exit animation
    megaMenu.setAttribute("data-state", "closed");
    content.setAttribute("data-state", "closed");

    // Restore animation
    content.style.animation = "";
  }

  /**
   * Utility method to handle rapid navigation between menu items
   */
  handleRapidNavigation(fromMenu, toMenu, direction = "from-start") {
    if (!fromMenu || !toMenu) return;

    // Quickly hide the previous menu without animation
    fromMenu.style.display = "none";
    fromMenu.setAttribute("data-state", "closed");
    const fromContent = fromMenu.querySelector(".mega-menu-content");
    if (fromContent) {
      fromContent.setAttribute("data-state", "closed");
    }

    // Show the new menu with smooth animation
    toMenu.style.display = "block";
    this.handleMegaMenuTransition(toMenu, direction);
  }

  /**
   * Update Radix Navigation component with data
   */
  updateRadixNavigation(navigationMenu) {
    // Format data for Radix component
    const businessTypes = {
      beauty: navigationMenu.beautyItems || [],
      wellness: navigationMenu.wellnessItems || [],
      fitness: navigationMenu.fitnessItems || [],
    };

    const features = navigationMenu.featureItems || [];

    // Send data to global bridge
    if (typeof window.updateNavigationData === "function") {
      window.updateNavigationData({
        businessTypes,
        features,
      });
    }
  }

  /**
   * Debug method to test navigation menu fetching
   */
  async debugFetch() {
    const menu = await this.fetchNavigationMenu();
    return menu;
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

  // Make navigation manager globally available for debugging
  window.navigationManager = navigationManager;

  // Debug functions for mega menus
  window.showBusinessTypesMenu = function () {
    const megaMenu = document.getElementById(
      "business-types-mega-menu-wrapper"
    );
    if (megaMenu) {
      megaMenu.setAttribute("data-state", "open");
      const content = megaMenu.querySelector(".mega-menu-content");
      if (content) {
        content.setAttribute("data-state", "open");
      }
      megaMenu.style.display = "block";
      // console.log("[DEBUG] Business Types mega menu forced to show");
    } else {
      // console.log("[DEBUG] Business Types mega menu not found");
    }
  };

  window.hideBusinessTypesMenu = function () {
    const megaMenu = document.getElementById(
      "business-types-mega-menu-wrapper"
    );
    if (megaMenu) {
      megaMenu.setAttribute("data-state", "closed");
      const content = megaMenu.querySelector(".mega-menu-content");
      if (content) {
        content.setAttribute("data-state", "closed");
      }
      setTimeout(() => {
        megaMenu.style.display = "none";
      }, 200);
      // console.log("[DEBUG] Business Types mega menu hidden");
    } else {
      // console.log("[DEBUG] Business Types mega menu not found");
    }
  };

  window.showFeaturesMenu = function () {
    const megaMenu = document.getElementById("features-mega-menu-wrapper");
    if (megaMenu) {
      megaMenu.setAttribute("data-state", "open");
      const content = megaMenu.querySelector(".mega-menu-content");
      if (content) {
        content.setAttribute("data-state", "open");
      }
      megaMenu.style.display = "block";
      // console.log("[DEBUG] Features mega menu forced to show");
    } else {
      // console.log("[DEBUG] Features mega menu not found");
    }
  };

  window.hideFeaturesMenu = function () {
    const megaMenu = document.getElementById("features-mega-menu-wrapper");
    if (megaMenu) {
      megaMenu.setAttribute("data-state", "closed");
      const content = megaMenu.querySelector(".mega-menu-content");
      if (content) {
        content.setAttribute("data-state", "closed");
      }
      setTimeout(() => {
        megaMenu.style.display = "none";
      }, 200);
      // console.log("[DEBUG] Features mega menu hidden");
    } else {
      // console.log("[DEBUG] Features mega menu not found");
    }
  };

  window.showSupportMenu = function () {
    const megaMenu = document.getElementById("support-mega-menu-wrapper");
    if (megaMenu) {
      megaMenu.setAttribute("data-state", "open");
      const content = megaMenu.querySelector(".mega-menu-content");
      if (content) {
        content.setAttribute("data-state", "open");
      }
      megaMenu.style.display = "block";
    }
  };

  window.hideSupportMenu = function () {
    const megaMenu = document.getElementById("support-mega-menu-wrapper");
    if (megaMenu) {
      megaMenu.setAttribute("data-state", "closed");
      const content = megaMenu.querySelector(".mega-menu-content");
      if (content) {
        content.setAttribute("data-state", "closed");
      }
      setTimeout(() => {
        megaMenu.style.display = "none";
      }, 200);
    }
  };

  // Initialize navigation menu
  navigationManager.init();
});
