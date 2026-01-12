/* eslint-disable @shopify/jsx-no-hardcoded-content */
import * as React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";

import { PropTypes } from "prop-types";

const NavigationMenuDemo = ({ navigationData = {}, userInfo = {} }) => {
  const { businessTypes, features, isLoaded } = navigationData;
  const { userAvatar, userName } = userInfo;

  // Utility function to format links - convert relative links to absolute Vagaro URLs
  const formatLink = (link) => {
    if (!link) return "#";
    return link.startsWith("http")
      ? link
      : `https://www.vagaro.com/pro/${link}`;
  };

  // For development: manually set which menu item should be open
  // Set to "features" or "business-types" to force that menu open for styling
  const [activeMenu, setActiveMenu] = React.useState(""); // Change this to control which menu is open

  // State for user dropdown menu
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const userDropdownRef = React.useRef(null);

  // Check if Vagaro login cookies exist (eB_2 for business, eU_2 for user)
  const checkForVagaroCookies = () => {
    const cookies = document.cookie.split(";");
    const eB_2Cookie = cookies.find((cookie) =>
      cookie.trim().startsWith("eB_2=")
    );
    const eU_2Cookie = cookies.find((cookie) =>
      cookie.trim().startsWith("eU_2=")
    );
    return !!(eB_2Cookie || eU_2Cookie);
  };

  // For testing: Set to true to always show user dropdown, or use checkForVagaroCookies() for production
  const isLoggedIn = checkForVagaroCookies(); // Change to: true for testing

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Toggle user dropdown
  const toggleUserDropdown = (e) => {
    e.preventDefault();
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Responsive logic - hide desktop navigation on mobile
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Effect to handle blur on main content when navigation is open
  React.useEffect(() => {
    const mainContentElements = [
      document.getElementById("main-content"),
      ...document.querySelectorAll('[id="main-content"]'),
      ...document.querySelectorAll(".container"),
      ...document.querySelectorAll(".section"),
    ].filter(Boolean);

    if (activeMenu) {
      // Navigation is open - add blur
      mainContentElements.forEach((element) => {
        element.classList.add("main-content-blur");
      });
    } else {
      // Navigation is closed - remove blur
      mainContentElements.forEach((element) => {
        element.classList.remove("main-content-blur");
      });
    }

    // Cleanup function
    return () => {
      mainContentElements.forEach((element) => {
        element.classList.remove("main-content-blur");
      });
    };
  }, [activeMenu]);

  // Don't render desktop navigation on mobile
  if (isMobile) {
    return null;
  }

  // Render business types content
  const renderBusinessTypes = () => {
    if (!businessTypes || !isLoaded) {
      return <div className="List one">Loading business types...</div>;
    }

    const categories = {
      beauty: "Beauty",
      wellness: "Wellness",
      fitness: "Fitness",
    };

    return (
      <div className="List bg-white p-8 w-full fullwidth">
        <div className="grid grid-cols-3 gap-4 w-full xl:container mx-auto xl:max-w-7xl">
          {/* Beauty Column */}
          <div className="">
            <a
              href={formatLink("beauty-software")}
              className="flex items-center justify-start text-base font-bold text-primary uppercase hover:text-primary/80 transition-colors mb-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{categories.beauty}</span>
              <ChevronRightIcon className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
            </a>
            <div className="h-px bg-gray-300 max-w-[90%]" />
            <div className="grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.beauty
                ?.filter((item) => item.link !== "beauty-software")
                .map((item) => (
                  <BusinessTypeItem
                    key={item.id}
                    href={formatLink(item.link)}
                    title={item.name}
                    icon={
                      item.iconImage?.url ||
                      (window.beautyIconSvg ? window.beautyIconSvg : null)
                    }
                    category="beauty"
                  />
                ))}
            </div>
          </div>

          {/* Wellness Column */}
          <div>
            <a
              href={formatLink("spa-software")}
              className="flex items-center justify-start text-lg font-bold text-primary uppercase hover:text-primary/80 transition-colors mb-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{categories.wellness}</span>
              <ChevronRightIcon className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
            </a>
            <div className="h-px bg-gray-400 max-w-[90%]" />
            <div className=" grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.wellness?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={formatLink(item.link)}
                  title={item.name}
                  icon={item.iconImage?.url}
                  category="wellness"
                />
              ))}
            </div>
          </div>

          {/* Fitness Column */}
          <div>
            <a
              href={formatLink("fitness-software")}
              className="flex items-center justify-start text-lg font-bold text-primary uppercase hover:text-primary/80 transition-colors mb-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{categories.fitness}</span>
              <ChevronRightIcon className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
            </a>
            <div className="h-px bg-gray-400 max-w-[90%]" />
            <div className="grid grid-cols-1 col-span-1 md:grid-cols-2 xl:max-w-7xl mx-auto">
              {businessTypes.fitness?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={formatLink(item.link)}
                  title={item.name}
                  icon={item.iconImage?.url}
                  category="fitness"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render features content
  const renderFeatures = () => {
    if (!features || !isLoaded) {
      return <div className="List fullwidth">Loading features...</div>;
    }

    // Group features into 5 specific categories in the order they appear in if statements
    const categoryOrder = [
      "RUN YOUR BUSINESS",
      "GROW YOUR BUSINESS",
      "SIMPLIFY PAYMENTS",
      "ELEVATE CLIENT EXPERIENCE",
      "BUILD YOUR BRAND",
    ];

    const categories = {
      "RUN YOUR BUSINESS": [],
      "GROW YOUR BUSINESS": [],
      "SIMPLIFY PAYMENTS": [],
      "ELEVATE CLIENT EXPERIENCE": [],
      "BUILD YOUR BRAND": [],
    };

    // Categorize features based on their names
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
        // Default to BUILD YOUR BRAND for MySite, Marketing, Design Services, Branded App
        categories["BUILD YOUR BRAND"].push(item);
      }
    });

    // Define sorting order for items within each category based on if statement order
    const sortingPriority = {
      "RUN YOUR BUSINESS": [
        "calendar",
        "payroll",
        "e-prescribe",
        "reports",
        "rent collection",
        "vagaro ai",
        "forms",
      ],
      "GROW YOUR BUSINESS": [
        "marketplace",
        "online store",
        "memberships",
        "inventory",
        "vagaro capital",
      ],
      "SIMPLIFY PAYMENTS": [
        "paypro",
        "pos",
        "buy now",
        "pay later",
        "invoices",
        "payments",
      ],
      "ELEVATE CLIENT EXPERIENCE": [
        "online booking",
        "customer tracking",
        "vagaro connect",
        "notifications",
        "live stream",
        "mobile apps",
      ],
      "BUILD YOUR BRAND": [], // No specific order for default category
    };

    // Sort items within each category based on the priority order
    Object.keys(categories).forEach((categoryKey) => {
      const priorities = sortingPriority[categoryKey];
      if (priorities && priorities.length > 0) {
        categories[categoryKey].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          // Find the priority index for each item
          let aPriority = priorities.length; // Default to end if not found
          let bPriority = priorities.length; // Default to end if not found

          for (let i = 0; i < priorities.length; i++) {
            if (aName.includes(priorities[i])) {
              aPriority = i;
              break;
            }
          }

          for (let i = 0; i < priorities.length; i++) {
            if (bName.includes(priorities[i])) {
              bPriority = i;
              break;
            }
          }

          return aPriority - bPriority;
        });
      }
    });

    return (
      <div className="List bg-white w-full fullwidth">
        <div className="grid grid-cols-5 gap-x-5 xl:container xl:max-w-7xl mx-auto">
          {categoryOrder.map((categoryTitle) => (
            <div key={categoryTitle} className="space-y-1">
              <h3 className="text-base font-bold  text-primary uppercase text-nowrap">
                {categoryTitle}
              </h3>
              <div className="h-px w-[85%] bg-gray-300" />
              <div className="space-y-1 mt-2">
                {categories[categoryTitle].map((item) => (
                  <ListItem
                    key={item.id}
                    href={formatLink(item.link)}
                    title={item.name}
                    icon={item.iconImage?.url}
                    className="hover:bg-gray-50"
                    flagAsNew={item.flagAsNew}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render support content
  const renderSupport = () => {
    const supportItems = [
      {
        name: "Call Support",
        description:
          "Our dedicated support team is here to help you with any questions or issues you may have.",
        href: "https://support.vagaro.com/hc/en-us#contact-support",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "Support Articles",
        description:
          "If you're using Vagaro and need assistance, checking out our support article page is highly recommended.",
        href: "https://support.vagaro.com/hc/en-us",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
        ),
      },
      {
        name: "Feature Requests",
        description:
          "Do you have a feature request that would make your life easier? Let us know!",
        href: "https://vagaro.uservoice.com",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
        ),
      },
    ];

    return (
      <div className="List bg-white w-full fullwidth">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2 px-6 py-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0 sm:py-10 lg:grid-cols-2 lg:gap-4 lg:px-8 xl:gap-8">
          {supportItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-6 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50 sm:p-6 transition-colors"
            >
              <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-100 group-hover:bg-white text-gray-700 group-hover:text-primary transition-colors">
                {item.icon}
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {item.name}
                  <span className="absolute inset-0" />
                </span>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
            </a>
          ))}

          {/* System Status Item */}
          <a
            href="https://status.vagaro.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-6 rounded-lg border border-gray-200 bg-white p-3 text-sm hover:bg-gray-50 sm:p-6 transition-colors"
          >
            <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-100 group-hover:bg-white transition-colors">
              <span className="relative flex size-6">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex size-6 rounded-full bg-green-500" />
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                System Status
                <span className="absolute inset-0" />
              </span>
              <p className="mt-1 text-sm text-gray-600">
                All Systems Operational
              </p>
            </div>
          </a>
        </div>
      </div>
    );
  };

  // Render products/hardware content
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
      <div className="List bg-white w-full fullwidth">
        <div className="mx-auto w-full max-w-4xl bg-white p-4">
          <div className="flex items-center justify-between gap-4 px-2">
            <span className="text-base font-semibold uppercase text-primary">
              POS Hardware
            </span>
            <a
              className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-2.5 text-base font-normal text-gray-900 hover:bg-primary hover:text-white transition-colors"
              href="https://www.vagaro.com/pro/pos-hardware"
              target="_blank"
              rel="noopener noreferrer"
            >
              View All
            </a>
          </div>
          <div className="grid grid-cols-4 gap-4 p-4">
            {hardwareItems.map((item) => (
              <a
                key={item.link}
                className="flex h-full flex-col items-center justify-center rounded-xl p-4 text-center hover:bg-gray-50 transition-colors"
                href={`https://www.vagaro.com/pro/pos-hardware/${item.link}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  alt={item.name}
                  className="h-32 w-full object-contain"
                  src={item.image}
                />
                <span className="text-sm font-semibold text-gray-900 mt-2">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <NavigationMenu.Root
      className="NavigationMenuRoot pt-0 md:pt-2"
      value={activeMenu}
      onValueChange={setActiveMenu}
    >
      <NavigationMenu.List className="NavigationMenuList">
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/"
            target="_blank"
            rel="noopener noreferrer"
            id="top-nav-book-a-service"
          >
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold text-nowrap">
                Book a Service
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="ml-1 h-4 w-4 text-primary"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                ></path>
              </svg>
            </div>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        {/* Business Types Menu */}
        <NavigationMenu.Item value="business-types">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-hover text-nowrap">
            Business Types
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderBusinessTypes()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Features Menu */}
        <NavigationMenu.Item value="features">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-hover">
            Features
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderFeatures()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        {/* Products Menu */}
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-hover">
            Products
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderProducts()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink text-nowrap"
            href="https://www.vagaro.com/pro/multi-location"
            target="_blank"
            rel="noopener noreferrer"
          >
            Multi-location
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink text-nowrap"
            href="https://www.vagaro.com/pro/pricing"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pricing
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink text-nowrap"
            href="https://www.vagaro.com/pro/contact-sales-team"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Sales
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        {/* Support Menu */}
        <NavigationMenu.Item value="support">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-hover">
            Support
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderSupport()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/pro/resources"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resources
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink border-primary text-nowrap"
            href={
              isLoggedIn
                ? "https://us04.vagaro.com/merchants/calendar"
                : "https://support.vagaro.com/hc/en-us/signin?return_to=https%3A%2F%2Fsupport.vagaro.com%2Fhc%2Fen-us"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-primary font-semibold">
              {isLoggedIn ? "Go to My Business" : "Sign in"}
            </span>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        {isLoggedIn && (
          <NavigationMenu.Item
            className="user-info dropdown mt-1"
            ref={userDropdownRef}
          >
            <button
              className="dropdown-toggle NavigationMenuLink"
              onClick={toggleUserDropdown}
              aria-haspopup="true"
              aria-expanded={userDropdownOpen}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName || "User profile"}
                  className="user-avatar"
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
              {userName && (
                <span className="text-primary font-semibold">{userName}</span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                focusable="false"
                viewBox="0 0 12 12"
                className="dropdown-chevron-icon"
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  d="M3 4.5l2.6 2.6c.2.2.5.2.7 0L9 4.5"
                />
              </svg>
            </button>
            <div className="dropdown-menu dropdown-menu-end" role="menu">
              <a
                href="/hc/en-us/profile"
                role="menuitem"
                onClick={() => setUserDropdownOpen(false)}
              >
                Profile
              </a>
              <a
                href="/hc/contributions/posts?locale=en-us"
                role="menuitem"
                onClick={() => setUserDropdownOpen(false)}
              >
                My Activities
              </a>
            </div>
          </NavigationMenu.Item>
        )}

        <NavigationMenu.Indicator className="NavigationMenuIndicator">
          <div className="Arrow" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="ViewportPosition">
        <NavigationMenu.Viewport className="NavigationMenuViewport" />
      </div>
    </NavigationMenu.Root>
  );
};

NavigationMenuDemo.propTypes = {
  navigationData: PropTypes.shape({
    businessTypes: PropTypes.object,
    features: PropTypes.array,
    isLoaded: PropTypes.bool,
  }),
  userInfo: PropTypes.shape({
    isSignedIn: PropTypes.bool,
    userAvatar: PropTypes.string,
    userName: PropTypes.string,
  }),
};

const BusinessTypeItem = ({ href, title, icon }) => {
  // All navigation links should open in new tab since they're external to Zendesk
  return (
    <NavigationMenu.Link asChild>
      <a
        href={href}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        target="_blank"
        rel="noopener noreferrer"
      >
        {icon && (
          <div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-gray-50 transition-colors">
            <img src={icon} alt={title} className="w-5 h-5 " />
          </div>
        )}
        <span className="text-charcoal font-semibold group-hover:text-gray-900 transition-colors text-base">
          {title}
        </span>
      </a>
    </NavigationMenu.Link>
  );
};

BusinessTypeItem.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
};

const ListItem = React.forwardRef(
  (
    { className, children, title, icon, href, flagAsNew, ...props },
    forwardedRef
  ) => {
    // All navigation links should open in new tab since they're external to Zendesk
    return (
      <li>
        <NavigationMenu.Link asChild>
          <a
            className={classNames(
              "ListItemLink pr-1 py-[2px] text-base font-semibold",
              className
            )}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
            ref={forwardedRef}
          >
            <div className="ListItemHeading flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-ink-lightest rounded-full group-hover:bg-gray-50 transition-colors">
                {icon && <img src={icon} alt={title} className="w-5 h-5" />}
              </div>
              <span className="flex items-center gap-2 text-base font-semibold">
                {title}
                {flagAsNew && (
                  <span className="rounded-full bg-green px-2 py-0.5 text-xs font-semibold text-white">
                    NEW
                  </span>
                )}
              </span>
            </div>
            <p className="">{children}</p>
          </a>
        </NavigationMenu.Link>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";
ListItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.string,
  icon: PropTypes.string,
  href: PropTypes.string,
  flagAsNew: PropTypes.bool,
};

export default NavigationMenuDemo;
