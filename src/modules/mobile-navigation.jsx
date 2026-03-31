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

  const [activePanel, setActivePanel] = React.useState(null);

  // Utility function to format links - convert relative links to absolute Vagaro URLs
  const formatLink = (link) => {
    if (!link) return "#";
    return link.startsWith("http")
      ? link
      : `https://www.vagaro.com/pro/${link}`;
  };

  // Handle escape key to close panel or navigation
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        if (activePanel) {
          setActivePanel(null);
        } else {
          onClose();
        }
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
  }, [isOpen, onClose, activePanel]);

  // Handle backdrop click to close navigation
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Open a sliding panel
  const openPanel = (panelName) => {
    setActivePanel(panelName);
  };

  // Close the active panel
  const closePanel = () => {
    setActivePanel(null);
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
      <div className="space-y-3">
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
                  icon={
                    item.iconImage?.url ||
                    (key === "beauty" && window.beautyIconSvg
                      ? window.beautyIconSvg
                      : null)
                  }
                  onClick={onClose}
                  flagAsNew={item.flagAsNew}
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
      <div className="space-y-3">
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
                    flagAsNew={item.flagAsNew}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render support section (2x2 grid)
  const renderSupport = () => {
    const supportItems = [
      {
        name: "Call Support",
        href: "https://support.vagaro.com/hc/en-us#contact-support",
      },
      {
        name: "Support Articles",
        href: "https://support.vagaro.com/hc/en-us",
      },
      {
        name: "Feature Requests",
        href: "https://vagaro.uservoice.com",
      },
      {
        name: "System Status",
        href: "https://status.vagaro.com/",
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 p-2">
        {supportItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-40 rounded-lg border border-gray-200 bg-white text-center hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            <span className="text-base font-semibold text-gray-900">
              {item.name}
            </span>
          </a>
        ))}
      </div>
    );
  };

  // Render products section (2-column grid with images)
  const renderProducts = () => {
    const hardwareItems = [
      {
        name: "PayPro",
        link: "terminal",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/psvr1YnATyc5qhFhnA2C",
      },
      {
        name: "PayPro Duo",
        link: "terminal-dual-screen",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/HmnLuvFRvysMT651PfNA",
      },
      {
        name: "PayPro Mini",
        link: "tablet",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/EF6KDxjtS0KB25tz56QC",
      },
      {
        name: "Credit Card Reader",
        link: "credit-card-reader",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/i1Oc6AyARBqCxTLW8O3j",
      },
      {
        name: "Pay Swivel Stand",
        link: "stand",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/x8n2rFC6RxYCBMoAqRYh",
      },
      {
        name: "QR Scanner",
        link: "barcode-scanner",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/ZTBXIbbjRLyyWhTF7wrC",
      },
      {
        name: "Vagaro Printer",
        link: "thermal-receipt-printer",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/TMW9IaXLQj6Uq8WrAir7",
      },
      {
        name: "Cash Drawer",
        link: "cash-register",
        image:
          "https://us-west-2.graphassets.com/AalLHDRueT6SDLkGLppQVz/mYof6RfARfKM5OJBozSE",
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 p-2">
        {/* View All Card */}
        <a
          href="https://www.vagaro.com/pro/pos-hardware"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-40 rounded-lg border border-gray-200 bg-white text-center hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <span className="text-base font-semibold text-gray-900">
            View All
          </span>
        </a>

        {/* Hardware Items */}
        {hardwareItems.map((item) => (
          <a
            key={item.link}
            href={`https://www.vagaro.com/pro/pos-hardware/${item.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center h-40 rounded-lg border border-gray-200 bg-white text-center hover:bg-gray-50 transition-colors p-3"
            onClick={onClose}
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-20 w-full object-contain mb-2"
            />
            <span className="text-sm font-semibold text-gray-900">
              {item.name}
            </span>
          </a>
        ))}
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
        <div className="relative flex items-center justify-center py-4 px-1 border-b border-gray-200">
          <div className="absolute left-0 flex h-16 items-center">
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
            href="https://www.vagaro.com/signup-1?licence=1"
            className="flex items-center justify-center bg-primary hover:bg-charcoal hover:border-solid text-md text-white font-medium py-2 px-4 rounded-full w-[152px] h-[40px]"
          >
            <span className="text-white font-semibold">Start Free Trial</span>
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
        <div className="flex-1 overflow-y-auto flex flex-col">
          <nav className="p-4 space-y-6 flex-1">
            {/* User Section (when signed in) */}
            {isSignedIn && (
              <div className="pb-4 border-b border-gray-200">
                <div className="space-y-2">
                  <a
                    href="/hc/en-us/profile"
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
            <div className="space-y-3">
              {/* Business Types */}
              <NavButton
                onClick={() => openPanel("business-types")}
                title="Business Types"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 18 17"
                    fill="currentColor"
                    stroke="none"
                    className="h-6 w-6 text-charcoal dark:text-charcoal"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15.75 3.375C16.9805 3.375 18 4.39453 18 5.625V14.625C18 15.8906 16.9805 16.875 15.75 16.875H2.25C0.984375 16.875 0 15.8906 0 14.625V5.625C0 4.39453 0.984375 3.375 2.25 3.375H4.5V1.6875C4.5 0.773438 5.23828 0 6.1875 0H11.8125C12.7266 0 13.5 0.773438 13.5 1.6875V3.375H15.75ZM5.625 1.6875V3.375H12.375V1.6875C12.375 1.40625 12.0938 1.125 11.8125 1.125H6.1875C5.87109 1.125 5.625 1.40625 5.625 1.6875ZM16.875 14.625V10.125H11.8125V12.375C11.8125 12.6914 11.5312 12.9375 11.25 12.9375H6.75C6.43359 12.9375 6.1875 12.6914 6.1875 12.375V10.125H1.125V14.625C1.125 15.2578 1.61719 15.75 2.25 15.75H15.75C16.3477 15.75 16.875 15.2578 16.875 14.625ZM7.3125 11.8125H10.6875V10.125H7.3125V11.8125ZM16.875 9V5.625C16.875 5.02734 16.3477 4.5 15.75 4.5H2.25C1.61719 4.5 1.125 5.02734 1.125 5.625V9H16.875Z"></path>
                  </svg>
                }
                showChevron={true}
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Features */}
              <NavButton
                onClick={() => openPanel("features")}
                title="Features"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 21 16"
                    fill="currentColor"
                    stroke="none"
                    className="h-6 w-6 text-charcoal dark:text-charcoal"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.4805 3.62109C12.6562 3.375 13.0078 3.30469 13.2539 3.51562C13.5 3.69141 13.5703 4.04297 13.3594 4.28906L9.91406 8.78906C9.84375 8.92969 9.70312 9 9.52734 9C9.52734 9.03516 9.49219 9 9.49219 9C9.35156 9 9.21094 8.96484 9.10547 8.85938L6.92578 6.96094C6.67969 6.75 6.67969 6.39844 6.89062 6.15234C7.06641 5.90625 7.41797 5.90625 7.66406 6.11719L9.38672 7.62891L12.4805 3.62109ZM18.5625 10.125C19.4766 10.125 20.25 10.8984 20.25 11.8125V14.0625C20.25 15.0117 19.4766 15.75 18.5625 15.75H1.6875C0.738281 15.75 0 15.0117 0 14.0625V11.8125C0 10.8984 0.738281 10.125 1.6875 10.125C1.96875 10.125 2.25 10.4062 2.25 10.6875C2.25 11.0039 1.96875 11.25 1.6875 11.25C1.37109 11.25 1.125 11.5312 1.125 11.8125V14.0625C1.125 14.3789 1.37109 14.625 1.6875 14.625H18.5625C18.8438 14.625 19.125 14.3789 19.125 14.0625V11.8125C19.125 11.5312 18.8438 11.25 18.5625 11.25C18.2461 11.25 18 11.0039 18 10.6875C18 10.4062 18.2461 10.125 18.5625 10.125ZM2.8125 13.5C2.49609 13.5 2.25 13.2539 2.25 12.9375C2.25 12.6562 2.49609 12.375 2.8125 12.375H3.375V1.6875C3.375 0.773438 4.11328 0 5.0625 0H15.1875C16.1016 0 16.875 0.773438 16.875 1.6875V12.375H17.4375C17.7188 12.375 18 12.6562 18 12.9375C18 13.2539 17.7188 13.5 17.4375 13.5H2.8125ZM4.5 1.6875V12.375H15.75V1.6875C15.75 1.40625 15.4688 1.125 15.1875 1.125H5.0625C4.74609 1.125 4.5 1.40625 4.5 1.6875Z"></path>
                  </svg>
                }
                showChevron={true}
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Products */}
              <NavButton
                onClick={() => openPanel("products")}
                title="Products"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 21 18"
                    fill="currentColor"
                    stroke="none"
                    className="h-6 w-6 text-charcoal dark:text-charcoal"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18 0C19.2305 0 20.25 1.01953 20.25 2.25V12.375C20.25 13.6406 19.2305 14.625 18 14.625H12.7266L13.3945 16.875H15.1875C15.4688 16.875 15.75 17.1562 15.75 17.4375C15.75 17.7539 15.4688 18 15.1875 18H5.0625C4.74609 18 4.5 17.7539 4.5 17.4375C4.5 17.1562 4.74609 16.875 5.0625 16.875H6.82031L7.48828 14.625H2.25C0.984375 14.625 0 13.6406 0 12.375V2.25C0 1.01953 0.984375 0 2.25 0H18ZM7.98047 16.875H12.2344L11.5312 14.625H8.68359L7.98047 16.875ZM19.125 12.375V10.125H1.125V12.375C1.125 13.0078 1.61719 13.5 2.25 13.5H18C18.5977 13.5 19.125 13.0078 19.125 12.375ZM19.125 9V2.25C19.125 1.65234 18.5977 1.125 18 1.125H2.25C1.61719 1.125 1.125 1.65234 1.125 2.25V9H19.125Z"></path>
                  </svg>
                }
                showChevron={true}
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Multi-location */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/multi-location"
                title="Multi-location"
                onClick={onClose}
                className="text-lg font-semibold"
                icon="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 23 18' fill='currentColor' stroke='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11.2148 11.25C9.21094 11.25 7.55859 9.63281 7.59375 7.59375C7.59375 5.58984 9.21094 3.9375 11.2148 3.9375C13.2188 3.9375 14.8711 5.58984 14.8711 7.59375C14.8711 9.63281 13.2539 11.25 11.2148 11.25ZM11.2148 5.0625C9.84375 5.0625 8.68359 6.22266 8.68359 7.59375C8.68359 9 9.84375 10.125 11.2148 10.125C12.6211 10.125 13.7461 9 13.7461 7.59375C13.7461 6.22266 12.6211 5.0625 11.2148 5.0625ZM12.9727 12.375C15.75 12.375 18 14.4844 18 17.0859C18 17.6133 17.543 18 16.9805 18H5.48438C4.92188 18 4.5 17.6133 4.5 17.0859C4.5 14.4844 6.71484 12.375 9.49219 12.375H12.9727ZM5.625 16.875H16.8398C16.7344 15.0117 15.0469 13.5 12.9727 13.5H9.45703C7.41797 13.5 5.73047 15.0117 5.625 16.875ZM18 5.625C16.418 5.625 15.1875 4.39453 15.1875 2.8125C15.1875 1.26562 16.418 0 18 0C19.5469 0 20.8125 1.26562 20.8125 2.8125C20.8125 4.39453 19.5469 5.625 18 5.625ZM18 1.125C17.0508 1.125 16.3125 1.89844 16.3125 2.8125C16.3125 3.76172 17.0508 4.5 18 4.5C18.9141 4.5 19.6875 3.76172 19.6875 2.8125C19.6875 1.89844 18.9141 1.125 18 1.125ZM4.5 5.625C2.91797 5.625 1.6875 4.39453 1.6875 2.8125C1.6875 1.26562 2.91797 0 4.5 0C6.04688 0 7.3125 1.26562 7.3125 2.8125C7.3125 4.39453 6.04688 5.625 4.5 5.625ZM4.5 1.125C3.55078 1.125 2.8125 1.89844 2.8125 2.8125C2.8125 3.76172 3.55078 4.5 4.5 4.5C5.41406 4.5 6.1875 3.76172 6.1875 2.8125C6.1875 1.89844 5.41406 1.125 4.5 1.125ZM19.7227 6.75C21.2344 6.75 22.5 8.08594 22.5 9.66797V10.125C22.5 10.4414 22.2188 10.6875 21.9375 10.6875C21.6211 10.6875 21.375 10.4414 21.375 10.125V9.66797C21.375 8.68359 20.6016 7.875 19.7227 7.875H17.4375C17.1914 7.875 16.9805 7.94531 16.7695 8.05078C16.4883 8.19141 16.1367 8.05078 15.9961 7.76953C15.8906 7.48828 15.9961 7.17188 16.2773 7.03125C16.6289 6.85547 17.0156 6.75 17.4375 6.75H19.7227ZM5.69531 8.05078C5.48438 7.94531 5.27344 7.875 5.0625 7.875H2.74219C1.86328 7.875 1.125 8.68359 1.125 9.66797V10.125C1.125 10.4414 0.84375 10.6875 0.5625 10.6875C0.246094 10.6875 0 10.4414 0 10.125V9.66797C0 8.08594 1.23047 6.75 2.74219 6.75H5.0625C5.44922 6.75 5.83594 6.85547 6.1875 7.03125C6.46875 7.17188 6.57422 7.48828 6.46875 7.76953C6.32812 8.05078 5.97656 8.19141 5.69531 8.05078Z'/%3E%3C/svg%3E"
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Pricing */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/pricing"
                title="Pricing"
                onClick={onClose}
                className="text-lg font-semibold"
                icon="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 16 16' fill='currentColor' stroke='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.09375 3.9375C3.09375 3.48047 3.44531 3.09375 3.9375 3.09375C4.39453 3.09375 4.78125 3.48047 4.78125 3.9375C4.78125 4.42969 4.39453 4.78125 3.9375 4.78125C3.44531 4.78125 3.09375 4.42969 3.09375 3.9375ZM0 1.6875C0 0.773438 0.738281 0 1.6875 0H6.92578C7.52344 0 8.08594 0.246094 8.50781 0.667969L14.6953 6.85547C15.5742 7.73438 15.5742 9.17578 14.6953 10.0547L10.0195 14.7305C9.14062 15.6094 7.69922 15.6094 6.82031 14.7305L0.632812 8.54297C0.210938 8.12109 0 7.55859 0 6.96094V1.6875ZM1.44141 7.76953L7.62891 13.957C8.05078 14.3789 8.78906 14.3789 9.21094 13.957L13.9219 9.24609C14.3438 8.82422 14.3438 8.08594 13.9219 7.66406L7.73438 1.47656C7.52344 1.26562 7.20703 1.125 6.92578 1.125H1.6875C1.37109 1.125 1.125 1.40625 1.125 1.6875V6.96094C1.125 7.24219 1.23047 7.55859 1.44141 7.76953ZM1.44141 7.76953L0.632812 8.54297L1.44141 7.76953Z'/%3E%3C/svg%3E"
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Contact Sales */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/contact-sales-team"
                title="Contact Sales"
                onClick={onClose}
                className="text-lg font-semibold"
                icon="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 18 18' fill='currentColor' stroke='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.0156 11.6086C17.7188 11.925 18.1055 12.6984 17.9297 13.4367L17.1914 16.7414C17.0156 17.4797 16.3828 17.9719 15.6094 17.9719C6.99609 17.9719 0 10.9758 0 2.3625C0 1.58906 0.492188 0.956252 1.23047 0.815627L4.53516 0.0421892C5.27344 -0.133592 6.04688 0.253127 6.36328 0.956252L7.875 4.54219C8.15625 5.175 7.98047 5.94844 7.45312 6.40547L6.01172 7.56563C7.03125 9.39375 8.57812 10.9406 10.4062 11.9602L11.6016 10.5539C12.0234 9.99141 12.7969 9.81563 13.4297 10.0617L17.0156 11.6086ZM16.0664 16.4953L16.8398 13.1906C16.9102 12.9445 16.7695 12.7336 16.5586 12.6281L13.0078 11.1164C12.7969 11.0461 12.5859 11.0813 12.4453 11.257L11.0039 13.0148C10.8281 13.2258 10.5469 13.2961 10.3359 13.1555C7.94531 11.9953 5.97656 10.0266 4.81641 7.6711C4.67578 7.425 4.74609 7.14375 4.95703 6.96797L6.71484 5.52656C6.89062 5.38594 6.92578 5.175 6.85547 4.96406L5.34375 1.41328C5.23828 1.2375 5.0625 1.09688 4.88672 1.09688C4.85156 1.09688 4.81641 1.13203 4.78125 1.13203L1.47656 1.90547C1.26562 1.94063 1.125 2.11641 1.125 2.3625C1.125 10.343 7.62891 16.882 15.6094 16.882C15.8555 16.882 16.0312 16.7063 16.0664 16.4953Z'/%3E%3C/svg%3E"
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Support */}
              <NavButton
                onClick={() => openPanel("support")}
                title="Contact Support"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 18 18"
                    fill="currentColor"
                    stroke="none"
                    className="h-6 w-6 text-charcoal dark:text-charcoal"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8.7002 0C13.5472 0 17.2297 4.07155 17.4004 8.71094V13.7627C17.4004 15.3175 16.1305 16.5566 14.6064 16.5566H10.5244L10.4395 16.7148C10.2137 17.1381 9.75694 17.4004 9.2627 17.4004H8.10254C7.35828 17.4004 6.75 16.8004 6.75 16.0127C6.75 15.2602 7.35822 14.625 8.1377 14.625H9.2627C9.74703 14.625 10.2127 14.914 10.4434 15.3174L10.5303 15.4688H14.6064C15.5406 15.4688 16.3125 14.7419 16.3125 13.7627V12.627L15.9072 12.7783C15.6725 12.8664 15.3959 12.9004 15.0986 12.9004H14.4658C13.9337 12.9004 13.5 12.4774 13.5 11.8994V7.22363C13.5 6.63496 13.944 6.1875 14.4658 6.1875H15.0986C15.1444 6.1875 15.1867 6.19362 15.2422 6.20215C15.291 6.20967 15.3695 6.22266 15.4502 6.22266H15.8984L15.7275 5.80859C14.5925 3.06248 11.8481 1.12305 8.7002 1.12305C5.51741 1.12305 2.77274 3.06218 1.6377 5.84473L1.39062 6.44922L2.00977 6.24219C2.11512 6.20707 2.17949 6.1875 2.2666 6.1875H2.89941C3.43169 6.1875 3.90039 6.64582 3.90039 7.22363V11.8994C3.90039 12.4667 3.44216 12.9004 2.89941 12.9004H2.2666C0.996192 12.9004 0 11.8797 0 10.5986V8.70898C0.136384 4.07243 3.81692 0 8.7002 0ZM2.2666 7.27539C1.59063 7.27539 1.13331 7.81132 1.08887 8.43262L1.08789 8.44336V10.5986C1.08789 11.241 1.59365 11.8125 2.2666 11.8125H2.8125V7.27539H2.2666ZM14.5879 7.27539V11.8125H15.0986C15.7565 11.8125 16.3125 11.2565 16.3125 10.5986V8.7002C16.3125 8.65806 16.3078 8.6207 16.3027 8.59277C16.2981 8.5673 16.2913 8.53987 16.2881 8.52539C16.2804 8.49076 16.2773 8.47285 16.2773 8.4541V8.44238L16.2764 8.43066C16.2319 7.8547 15.7822 7.27539 15.0986 7.27539H14.5879Z"></path>
                  </svg>
                }
                showChevron={true}
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Resources */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/resources"
                title="Resources"
                onClick={onClose}
                className="text-lg font-semibold"
                icon="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 18 18' fill='currentColor' stroke='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0C13.957 0 18 4.04297 18 9C18 13.9922 13.957 18 9 18C4.00781 18 0 13.9922 0 9C0 4.04297 4.00781 0 9 0ZM9 16.875C13.3242 16.875 16.875 13.3594 16.875 9C16.875 4.67578 13.3242 1.125 9 1.125C4.64062 1.125 1.125 4.67578 1.125 9C1.125 13.3594 4.64062 16.875 9 16.875ZM9 6.46875C8.50781 6.46875 8.15625 6.11719 8.15625 5.625C8.15625 5.16797 8.50781 4.78125 9 4.78125C9.45703 4.78125 9.84375 5.16797 9.84375 5.625C9.84375 6.11719 9.45703 6.46875 9 6.46875ZM10.6875 12.375C10.9688 12.375 11.25 12.6562 11.25 12.9375C11.25 13.2539 10.9688 13.5 10.6875 13.5H7.3125C6.99609 13.5 6.75 13.2539 6.75 12.9375C6.75 12.6562 6.99609 12.375 7.3125 12.375H8.4375V9H7.875C7.55859 9 7.3125 8.75391 7.3125 8.4375C7.3125 8.15625 7.55859 7.875 7.875 7.875H9C9.28125 7.875 9.5625 8.15625 9.5625 8.4375V12.375H10.6875Z'/%3E%3C/svg%3E"
                showChevron={true}
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* United States */}
              <div className="flex items-center justify-between w-full p-2 text-left text-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                <div className="">
                  <span>United States</span>
                </div>
                {window.usaflagSvg && (
                  <img
                    src={window.usaflagSvg}
                    alt="United States flag"
                    className="w-6 h-6 flex-shrink-0"
                    onError={(e) => {
                      // Fallback if flag image doesn't exist
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>
            </div>
            <div className="h-[1px] bg-[#cccccc] border-0" />
            {/* Book a Service */}
            <MobileNavItem
              href="https://www.vagaro.com"
              title="Book a Service"
              onClick={onClose}
              className="text-lg font-semibold"
              isRedText={true}
              showExternalIcon={true}
            />
            <div className="h-[1px] bg-[#cccccc] border-0" />

            {/* Go to My Business / Sign In */}
            <MobileNavItem
              href={
                isSignedIn
                  ? "https://us04.vagaro.com/merchants/calendar"
                  : "https://support.vagaro.com/hc/en-us/signin?return_to=https%3A%2F%2Fsupport.vagaro.com%2Fhc%2Fen-us"
              }
              title={isSignedIn ? "Go to My Business" : "Sign in"}
              onClick={onClose}
              className="text-lg font-semibold"
              showExternalIcon={true}
            />

            {/* Auth Buttons (when not signed in) */}
            {!isSignedIn && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <a
                  href="https://support.vagaro.com/hc/en-us/signin?return_to=https%3A%2F%2Fsupport.vagaro.com%2Fhc%2Fen-us"
                  className="block w-full text-center py-2 px-4 text-charcoal font-semibold hover:text-gray-900 transition-colors"
                  onClick={onClose}
                >
                  Log In
                </a>
              </div>
            )}
          </nav>

          {/* Start Free Trial Button */}
          <div className="p-4 border-t border-gray-200">
            <a
              href="https://www.vagaro.com/signup-1?licence=1"
              className="mx-auto my-4 block w-1/2 rounded-full bg-primary px-3 py-4 text-center text-base font-semibold text-white hover:bg-primary/90"
              onClick={onClose}
            >
              Start Free Trial
            </a>
          </div>
        </div>

        {/* Sliding Panels */}
        {/* Business Types Panel */}
        <div
          className={classNames(
            "absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out",
            activePanel === "business-types"
              ? "translate-x-0"
              : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="relative flex items-center justify-center h-16 border-b border-gray-200 px-4">
              <h2 className="text-lg font-semibold text-primary leading-none m-0">
                Business Types
              </h2>
              <button
                onClick={closePanel}
                className="absolute right-4 p-2 rounded-md text-primary hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-label="Close panel"
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
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderBusinessTypes()}
            </div>
          </div>
        </div>

        {/* Features Panel */}
        <div
          className={classNames(
            "absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out",
            activePanel === "features" ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="relative flex items-center justify-center h-16 border-b border-gray-200 px-4">
              <h2 className="text-lg font-semibold text-primary leading-none m-0">
                Features
              </h2>
              <button
                onClick={closePanel}
                className="absolute right-4 p-2 rounded-md text-primary hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-label="Close panel"
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
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">{renderFeatures()}</div>
          </div>
        </div>

        {/* Support Panel */}
        <div
          className={classNames(
            "absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out",
            activePanel === "support" ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="relative flex items-center justify-center py-4 px-1 border-b border-gray-200">
              <button
                onClick={closePanel}
                className="absolute left-4 flex items-center p-2 text-gray-900 hover:text-gray-600 focus:outline-none"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-base font-medium">Back</span>
              </button>
              <a
                href="https://www.vagaro.com/signup-1?licence=1"
                className="flex items-center justify-center bg-primary hover:bg-charcoal text-md text-white font-medium py-2 px-4 rounded-full w-[152px] h-[40px]"
              >
                <span className="text-white font-semibold">
                  Start Free Trial
                </span>
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
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">{renderSupport()}</div>
          </div>
        </div>

        {/* Products Panel */}
        <div
          className={classNames(
            "absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out",
            activePanel === "products" ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="relative flex items-center justify-center py-4 px-1 border-b border-gray-200">
              <button
                onClick={closePanel}
                className="absolute left-4 flex items-center p-2 text-gray-900 hover:text-gray-600 focus:outline-none"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-base font-medium">Back</span>
              </button>
              <a
                href="https://www.vagaro.com/signup-1?licence=1"
                className="flex items-center justify-center bg-primary hover:bg-charcoal text-md text-white font-medium py-2 px-4 rounded-full w-[152px] h-[40px]"
              >
                <span className="text-white font-semibold">
                  Start Free Trial
                </span>
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
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">{renderProducts()}</div>
          </div>
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

// Chevron Icon Component
const ChevronIcon = () => (
  <svg
    className="h-6 w-6 text-gray-800 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// Navigation Button Component (for buttons that open panels)
const NavButton = ({ onClick, title, icon, showChevron = false }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full p-2 text-left text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors focus:outline-none"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
        {icon}
      </div>
      <span>{title}</span>
    </div>
    {showChevron && <ChevronIcon />}
  </button>
);

NavButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  showChevron: PropTypes.bool,
};

// Mobile Navigation Item Component
const MobileNavItem = ({
  href,
  title,
  icon,
  onClick,
  className = "",
  showChevron = false,
  showExternalIcon = false,
  isRedText = false,
  flagAsNew = false,
}) => (
  <a
    href={href}
    className={classNames(
      "flex items-center justify-between w-full p-2 text-left rounded-md hover:bg-gray-50 transition-colors",
      isRedText ? "text-primary" : "text-gray-900",
      className
    )}
    onClick={onClick}
    target={showExternalIcon ? "_blank" : undefined}
    rel={showExternalIcon ? "noopener noreferrer" : undefined}
  >
    <div className="flex items-center space-x-3">
      {icon && (
        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
          <img src={icon} alt={title} className="w-6 h-6" />
        </div>
      )}
      <span className="flex items-center gap-2">
        <span
          className={classNames(
            "text-lg font-semibold",
            isRedText && "text-primary"
          )}
        >
          {title}
        </span>
        {flagAsNew && (
          <span className="rounded-full bg-green px-2 py-0.5 text-xs font-semibold text-white">
            NEW
          </span>
        )}
      </span>
    </div>
    {showChevron && <ChevronIcon />}
    {showExternalIcon && (
      <svg
        className="w-5 h-5 text-charcoal flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    )}
  </a>
);

MobileNavItem.propTypes = {
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  showChevron: PropTypes.bool,
  showExternalIcon: PropTypes.bool,
  isRedText: PropTypes.bool,
  flagAsNew: PropTypes.bool,
};

export default MobileNavigation;
