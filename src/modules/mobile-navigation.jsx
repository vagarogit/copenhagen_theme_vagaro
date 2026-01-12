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
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
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
                    className="w-6 h-6 text-charcoal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
                    className="w-6 h-6 text-charcoal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
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
                icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' /%3E%3C/svg%3E"
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Pricing */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/pricing"
                title="Pricing"
                onClick={onClose}
                className="text-lg font-semibold"
                icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' /%3E%3C/svg%3E"
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Contact Sales */}
              <MobileNavItem
                href="https://www.vagaro.com/pro/contact-sales-team"
                title="Contact Sales"
                onClick={onClose}
                className="text-lg font-semibold"
                icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' /%3E%3C/svg%3E"
              />
              <div className="h-[1px] bg-[#cccccc] border-0" />

              {/* Support */}
              <NavButton
                onClick={() => openPanel("support")}
                title="Support"
                icon={
                  <svg
                    className="w-6 h-6 text-charcoal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
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
                icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /%3E%3C/svg%3E"
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
