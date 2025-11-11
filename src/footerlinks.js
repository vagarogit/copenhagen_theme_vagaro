/**
 * Footer Links Utility
 *
 * Renders footer links using static navigation data
 */

class FooterLinksManager {
  constructor(endpoint = null, options = {}) {
    this.endpoint = endpoint; // Keep for backward compatibility but not used
    this.options = {
      timeout: 10000,
      retries: 3,
      ...options,
    };
    // Use global navigation data if available, otherwise fallback
    this.navigationData =
      window.footerNavigationData || this.getDefaultNavigationData();
  }

  /**
   * Get default navigation data as fallback
   */
  getDefaultNavigationData() {
    return {
      findBusinesses: [
        {
          id: "find-salon",
          name: "Salon",
          href: "https://www.vagaro.com/listings/hair/san-francisco--ca",
        },
        {
          id: "find-spa",
          name: "Spa",
          href: "https://www.vagaro.com/listings/spa/san-francisco--ca",
        },
        {
          id: "find-medical-spa",
          name: "Medical Spa",
          href: "https://www.vagaro.com/listings/med-spa/san-francisco--ca",
        },
        {
          id: "find-barber",
          name: "Barber",
          href: "https://www.vagaro.com/listings/barber/san-francisco--ca",
        },
        {
          id: "find-daily-deals",
          name: "Daily Deals",
          href: "https://www.vagaro.com/deals/san-francisco--ca",
        },
      ],
      businessSoftware: [
        {
          id: "booth-renter",
          name: "Booth Renter",
          href: "https://www.vagaro.com/pro/booth-renter",
        },
        {
          id: "salon",
          name: "Salon",
          href: "https://www.vagaro.com/pro/salon-software",
        },
        {
          id: "spa",
          name: "Spa",
          href: "https://www.vagaro.com/pro/spa-software",
        },
        {
          id: "medical-spa",
          name: "Medical Spa",
          href: "https://www.vagaro.com/pro/medical-spa-software",
        },
        {
          id: "barber",
          name: "Barber",
          href: "https://www.vagaro.com/pro/barber-software",
        },
        {
          id: "tanning",
          name: "Tanning",
          href: "https://www.vagaro.com/pro/tanning-salon-software",
        },
        {
          id: "nail",
          name: "Nail",
          href: "https://www.vagaro.com/pro/nail-salon-software",
        },
        {
          id: "pilates",
          name: "Pilates",
          href: "https://www.vagaro.com/pro/pilates-software",
        },
        {
          id: "mental-health",
          name: "Mental Health",
          href: "https://www.vagaro.com/pro/mental-health-software",
        },
      ],
      businessFeatures: [
        {
          id: "online-booking",
          name: "Online Booking",
          href: "https://www.vagaro.com/pro/online-booking",
        },
        {
          id: "calendar",
          name: "Calendar",
          href: "https://www.vagaro.com/pro/calendar",
        },
        {
          id: "pay-later",
          name: "Pay Later",
          href: "https://www.vagaro.com/pro/pay-later",
        },
        {
          id: "mysite",
          name: "MySite",
          href: "https://www.vagaro.com/pro/booking-website-builder",
        },
        {
          id: "forms",
          name: "Forms",
          href: "https://www.vagaro.com/pro/forms",
        },
        {
          id: "reports",
          name: "Reports",
          href: "https://www.vagaro.com/pro/reports",
        },
        {
          id: "vagaro-capital",
          name: "Vagaro Capital",
          href: "https://www.vagaro.com/pro/vagaro-capital",
        },
        {
          id: "branded-app",
          name: "Branded App",
          href: "https://www.vagaro.com/pro/branded-app",
        },
      ],
      businessProducts: [
        {
          id: "paypro",
          name: "PayPro",
          href: "https://www.vagaro.com/pro/pos-hardware/terminal",
        },
        {
          id: "paypro-mini",
          name: "PayPro Mini",
          href: "https://www.vagaro.com/pro/pos-hardware/tablet",
        },
        {
          id: "paypro-duo",
          name: "PayPro Duo",
          href: "https://www.vagaro.com/pro/pos-hardware/terminal-dual-screen",
        },
        {
          id: "card-reader",
          name: "Card Reader",
          href: "https://www.vagaro.com/pro/pos-hardware/credit-card-reader",
        },
        {
          id: "pay-swivel-stand",
          name: "Pay Swivel Stand",
          href: "https://www.vagaro.com/pro/pos-hardware/stand",
        },
        {
          id: "qr-scanner",
          name: "QR Scanner",
          href: "https://www.vagaro.com/pro/pos-hardware/barcode-scanner",
        },
        {
          id: "receipt-printer",
          name: "Receipt Printer",
          href: "https://www.vagaro.com/pro/pos-hardware/thermal-receipt-printer",
        },
        {
          id: "cash-drawer",
          name: "Cash Drawer",
          href: "https://www.vagaro.com/pro/pos-hardware/cash-register",
        },
      ],
      company: [
        {
          id: "about-us",
          name: "About Us",
          href: "https://www.vagaro.com/pro/about-us",
        },
        {
          id: "careers",
          name: "Careers",
          href: "https://www.vagaro.com/pro/careers",
        },
        {
          id: "contact-us",
          name: "Contact Us",
          href: "https://www.vagaro.com/pro/contact",
        },
        {
          id: "vagaro-cares",
          name: "Vagaro Cares",
          href: "https://www.vagaro.com/pro/vagaro-cares",
        },
        {
          id: "updates",
          name: "Updates",
          href: "https://www.vagaro.com/pro/updates",
        },
        {
          id: "partnerships",
          name: "Partnerships",
          href: "https://www.vagaro.com/pro/partners",
        },
        {
          id: "mysite-updates",
          name: "MySite Updates",
          href: "https://www.vagaro.com/pro/mysite-updates",
        },
        {
          id: "iconic-25",
          name: "iconic.25",
          href: "https://mysite.vagaro.com/iconic25",
        },
      ],
      resources: [
        { id: "status", name: "Status", href: "https://status.vagaro.com/" },
        { id: "support", name: "Support", href: "https://support.vagaro.com/" },
        { id: "blog", name: "Blog", href: "https://www.vagaro.com/learn" },
        {
          id: "newsroom",
          name: "Newsroom",
          href: "https://www.vagaro.com/news",
        },
        {
          id: "compare-us",
          name: "Compare Us",
          href: "https://www.vagaro.com/pro/compare",
        },
      ],
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
      .map((item) => {
        if (item.isInteractive && item.onClick) {
          return `
              <li>
                <button onclick="${item.onClick}" 
                       class="text-base text-gray-300 hover:text-white underline bg-transparent border-none cursor-pointer">
                  ${item.name}
                </button>
              </li>
            `;
        }

        const href = item.href.startsWith("http")
          ? item.href
          : `https://www.vagaro.com/pro/${item.href}`;
        const target = item.href.startsWith("http")
          ? 'target="_blank" rel="noopener"'
          : "";

        return `
            <li>
              <a href="${href}" 
                 class="text-base text-white/80 hover:text-white"
                 ${target}>
                ${item.name}
              </a>
            </li>
          `;
      })
      .join("");

    return `
      <div>
        <h3 class="text-left text-base font-semibold text-white mb-4 ">${title}</h3>
        <ul role="list" class="space-y-5">
          ${linksHtml}
        </ul>
      </div>
    `;
  }

  /**
   * Update footer links in the DOM
   */
  updateFooterLinks(containerId = "footer-links-container") {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container with ID '${containerId}' not found`);
        return;
      }

      // Use static navigation data
      const data = this.navigationData;

      // Render all 6 sections
      const sectionsHtml = `
        ${this.renderFooterSection("Find Businesses", data.findBusinesses)}
        ${this.renderFooterSection("Business Software", data.businessSoftware)}
        ${this.renderFooterSection("Business Features", data.businessFeatures)}
        ${this.renderFooterSection("Business Products", data.businessProducts)}
        ${this.renderFooterSection("Company", data.company)}
        ${this.renderFooterSection("Resources", data.resources)}
      `;

      container.innerHTML = sectionsHtml;
    } catch (error) {
      console.error("Failed to update footer links:", error);
      // Fallback to static content
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="col-span-6 text-center text-white/80 text-base">
            <p>Footer links temporarily unavailable</p>
          </div>
        `;
      }
    }
  }

  /**
   * Initialize footer links
   */
  init(containerId) {
    try {
      this.updateFooterLinks(containerId);
    } catch (error) {
      console.error("Failed to initialize footer links:", error);
    }
  }
}

// Make FooterLinksManager globally available
window.FooterLinksManager = FooterLinksManager;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const footerManager = new FooterLinksManager();

  // Initialize footer links
  footerManager.init("footer-links-container");
});
