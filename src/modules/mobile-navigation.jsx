/* eslint-disable @shopify/jsx-no-hardcoded-content */
import * as React from "react";
import classNames from "classnames";
import { PropTypes } from "prop-types";

const MobileNavigation = ({
  navigationData = {},
  isOpen,
  onClose,
  userInfo = {},
}) => {
  const { businessTypes, features, isLoaded } = navigationData;
  const { isSignedIn } = userInfo;

  const [expandedSection, setExpandedSection] = React.useState(null);

  // Utility function to format links - convert relative links to absolute Vagaro URLs
  const formatLink = (link) => {
    if (!link) return "#";
    return link.startsWith("http")
      ? link
      : `https://www.vagaro.com/pro/${link}`;
  };

  // Handle escape key to close navigation
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when mobile nav is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click to close navigation
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Toggle expanded sections
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  // Render business types section
  const renderBusinessTypes = () => {
    if (!businessTypes || !isLoaded) {
      return (
        <div className="text-gray-500 text-sm p-4">
          Loading business types...
        </div>
      );
    }

    const categories = {
      beauty: { title: "Beauty", items: businessTypes.beauty || [] },
      wellness: { title: "Wellness", items: businessTypes.wellness || [] },
      fitness: { title: "Fitness", items: businessTypes.fitness || [] },
    };

    return (
      <div className="space-y-4">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key}>
            <h4 className="text-base font-semibold text-primary uppercase mb-2">
              {category.title}
            </h4>
            <div className="space-y-1">
              {category.items.map((item) => (
                <MobileNavItem
                  key={item.id}
                  href={formatLink(item.link)}
                  title={item.name}
                  icon={item.iconImage?.url}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render features section
  const renderFeatures = () => {
    if (!features || !isLoaded) {
      return (
        <div className="text-gray-500 text-base p-4">Loading features...</div>
      );
    }

    // Group features into categories (same logic as desktop)
    const categories = {
      "RUN YOUR BUSINESS": [],
      "GROW YOUR BUSINESS": [],
      "SIMPLIFY PAYMENTS": [],
      "ELEVATE CLIENT EXPERIENCE": [],
      "BUILD YOUR BRAND": [],
    };

    features.forEach((item) => {
      const itemName = item.name.toLowerCase();

      if (
        itemName.includes("calendar") ||
        itemName.includes("payroll") ||
        itemName.includes("e-prescribe") ||
        itemName.includes("reports") ||
        itemName.includes("rent collection") ||
        itemName.includes("vagaro ai") ||
        itemName.includes("forms")
      ) {
        categories["RUN YOUR BUSINESS"].push(item);
      } else if (
        itemName.includes("marketplace") ||
        itemName.includes("online store") ||
        itemName.includes("memberships") ||
        itemName.includes("inventory") ||
        itemName.includes("vagaro capital")
      ) {
        categories["GROW YOUR BUSINESS"].push(item);
      } else if (
        itemName.includes("paypro") ||
        itemName.includes("pos") ||
        itemName.includes("buy now") ||
        itemName.includes("pay later") ||
        itemName.includes("invoices") ||
        itemName.includes("payments")
      ) {
        categories["SIMPLIFY PAYMENTS"].push(item);
      } else if (
        itemName.includes("online booking") ||
        itemName.includes("customer tracking") ||
        itemName.includes("vagaro connect") ||
        itemName.includes("notifications") ||
        itemName.includes("live stream") ||
        itemName.includes("mobile apps")
      ) {
        categories["ELEVATE CLIENT EXPERIENCE"].push(item);
      } else {
        categories["BUILD YOUR BRAND"].push(item);
      }
    });

    return (
      <div className="space-y-4">
        {Object.entries(categories).map(([categoryTitle, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={categoryTitle}>
              <h4 className="text-base font-semibold text-primary uppercase mb-2">
                {categoryTitle}
              </h4>
              <div className="space-y-1">
                {items.map((item) => (
                  <MobileNavItem
                    key={item.id}
                    href={formatLink(item.link)}
                    title={item.name}
                    icon={item.iconImage?.url}
                    onClick={onClose}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="mobile-nav-overlay fixed inset-0 z-50 lg:hidden"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Navigation Drawer */}
      <div className="mobile-nav-drawer absolute right-0 top-0 h-full w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <div className="absolute left-4 flex h-16 items-center">
            <a href="/">
              <svg
                width="80"
                height="40"
                viewBox="0 0 320.06 291.85"
                className="fill-primary"
              >
                <path d="M160.05,291.82c-19.02,0-37.55-9.86-47.72-27.49L7.36,82.52C-7.81,56.26,1.22,22.56,27.49,7.39,40.21,.05,55.03-1.9,69.22,1.9s26.05,12.9,33.4,25.63l65.62,113.66-15.59,9L87.03,36.52c-4.94-8.56-12.92-14.68-22.47-17.24-9.55-2.56-19.52-1.25-28.08,3.7-17.67,10.2-23.74,32.87-13.54,50.54L127.91,255.33c10.2,17.67,32.87,23.74,50.54,13.54l9,15.59c-8.64,4.99-18.08,7.36-27.41,7.36Z"></path>
                <path d="M160.02,291.85c-9.53,0-18.94-2.5-27.41-7.39-26.26-15.16-35.29-48.87-20.13-75.13L217.44,27.52C232.61,1.26,266.31-7.77,292.58,7.39c26.26,15.16,35.29,48.87,20.13,75.13l-104.97,181.81c-7.34,12.72-19.21,21.82-33.4,25.63-4.74,1.27-9.55,1.9-14.32,1.9ZM265.14,18.03c-12.8,0-25.26,6.64-32.11,18.49l-104.96,181.81c-10.2,17.67-4.12,40.34,13.54,50.54,8.56,4.94,18.53,6.25,28.08,3.7,9.55-2.56,17.53-8.68,22.47-17.24l104.97-181.81c10.2-17.67,4.12-40.34-13.54-50.54-5.81-3.36-12.17-4.95-18.44-4.95Z"></path>
                <circle cx="161.58" cy="234.28" r="15.49"></circle>
              </svg>
            </a>
          </div>
          <a
            href="https://www.vagaro.com/pro/pricing"
            className="flex items-center justify-center bg-primary hover:bg-charcoal hover:border-solid text-md text-white font-medium py-2 px-4 rounded-full w-[152px] h-[40px]"
          >
            <span className="text-white font-semibold">Sign Up</span>
          </a>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 rounded-md text-primary hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-label="Close navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* User Section (when signed in) */}
            {isSignedIn && (
              <div className="pb-4 border-b border-gray-200">
                <div className="space-y-2">
                  <a
                    href="/hc/en-us/profiles"
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-900 text-lg font-semibold">
                      My Profile
                    </span>
                  </a>
                  <a
                    href="/hc/en-us/requests"
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-900 text-lg font-semibold">
                      My Requests
                    </span>
                  </a>
                </div>
              </div>
            )}

            {/* Main Navigation Items */}
            <div className="space-y-4">
              {/* Book a Service */}
              <MobileNavItem
                href="https://www.vagaro.com"
                title="Book a Service"
                onClick={onClose}
                className="text-lg font-semibold"
              />

              {/* Business Types */}
              <div>
                <button
                  onClick={() => toggleSection("business-types")}
                  className="flex items-center justify-between w-full p-2 text-left text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors focus:outline-none"
                  aria-expanded={expandedSection === "business-types"}
                >
                  <span>Business Types</span>
                  <svg
                    className={classNames(
                      "w-5 h-5 text-gray-400 transition-transform duration-200",
                      expandedSection === "business-types" ? "rotate-180" : ""
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSection === "business-types" && (
                  <div className="mt-2 max-h-[480px] overflow-y-auto">
                    {renderBusinessTypes()}
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <button
                  onClick={() => toggleSection("features")}
                  className="flex items-center justify-between w-full p-2 text-left text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  aria-expanded={expandedSection === "features"}
                >
                  <span>Features</span>
                  <svg
                    className={classNames(
                      "w-5 h-5 text-gray-400 transition-transform duration-200",
                      expandedSection === "features" ? "rotate-180" : ""
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSection === "features" && (
                  <div className="mt-2 max-h-[480px] overflow-y-auto">
                    {renderFeatures()}
                  </div>
                )}
              </div>

              {/* Other Navigation Items */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/pos-hardware"
                title="Products"
                onClick={onClose}
                className="text-lg font-semibold"
              />

              <MobileNavItem
                href="https://www.vagaro.com/pro/multi-location"
                title="Multi-location"
                onClick={onClose}
                className="text-lg font-semibold"
              />

              <MobileNavItem
                href="https://www.vagaro.com/pro/pricing"
                title="Pricing"
                onClick={onClose}
                className="text-lg font-semibold"
              />

              <MobileNavItem
                href="https://www.vagaro.com/pro/contact-sales-team"
                title="Contact Sales"
                onClick={onClose}
                className="text-lg font-semibold"
              />

              <MobileNavItem
                href="https://vagaro.zendesk.com/hc/en-us"
                title="Support"
                onClick={onClose}
                className="text-lg font-semibold"
              />

              <MobileNavItem
                href="https://www.vagaro.com/pro/resources"
                title="Resources"
                onClick={onClose}
                className="text-lg font-semibold"
              />
            </div>

            {/* Auth Buttons (when not signed in) */}
            {!isSignedIn && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <a
                  href="#"
                  className="block w-full text-center py-2 px-4 text-charcoal font-semibold hover:text-gray-900 transition-colors"
                  onClick={onClose}
                >
                  Log In
                </a>
                <a
                  href="https://www.vagaro.com/pro/pricing"
                  className="block w-full text-center py-3 px-4 bg-primary hover:bg-charcoal text-white font-semibold rounded-full transition-colors"
                  onClick={onClose}
                >
                  Sign Up
                </a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

MobileNavigation.propTypes = {
  navigationData: PropTypes.shape({
    businessTypes: PropTypes.object,
    features: PropTypes.array,
    isLoaded: PropTypes.bool,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({
    isSignedIn: PropTypes.bool,
    userAvatar: PropTypes.string,
    userName: PropTypes.string,
  }),
};

// Mobile Navigation Item Component
const MobileNavItem = ({ href, title, icon, onClick, className = "" }) => (
  <a
    href={href}
    className={classNames(
      "flex items-center text-lg space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-gray-900 hover:text-gray-900",
      className
    )}
    onClick={onClick}
  >
    {icon && (
      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
        <img src={icon} alt={title} className="w-6 h-6" />
      </div>
    )}
    <span className="text-lg font-semibold">{title}</span>
  </a>
);

MobileNavItem.propTypes = {
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default MobileNavigation;
