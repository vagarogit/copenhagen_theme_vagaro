/* eslint-disable @shopify/jsx-no-hardcoded-content */
import * as React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
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
        <div className="grid grid-cols-3 gap-4 w-full xl:container mx-auto">
          {/* Beauty Column */}
          <div className="">
            <h3 className="text-lg font-bold text-primary uppercase ">
              {categories.beauty}
            </h3>
            <div className="h-px bg-gray-400 max-w-[90%]" />
            <div className="grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.beauty?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={formatLink(item.link)}
                  title={item.name}
                  icon={item.iconImage?.url}
                />
              ))}
            </div>
          </div>

          {/* Wellness Column */}
          <div>
            <h3 className="text-lg font-bold  text-primary uppercase">
              {categories.wellness}
            </h3>
            <div className="h-px bg-gray-400 max-w-[90%]" />
            <div className=" grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.wellness?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={formatLink(item.link)}
                  title={item.name}
                  icon={item.iconImage?.url}
                />
              ))}
            </div>
          </div>

          {/* Fitness Column */}
          <div>
            <h3 className="text-lg font-bold  text-primary uppercase ">
              {categories.fitness}
            </h3>
            <div className="h-px bg-gray-400 max-w-[90%]" />
            <div className="grid grid-cols-1 col-span-1 md:grid-cols-2 xl:max-w-7xl mx-auto">
              {businessTypes.fitness?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={formatLink(item.link)}
                  title={item.name}
                  icon={item.iconImage?.url}
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
        <div className="grid grid-cols-5 gap-x-5 xl:container mx-auto">
          {categoryOrder.map((categoryTitle) => (
            <div key={categoryTitle} className="space-y-1">
              <h3 className="text-lg font-bold  text-primary uppercase text-nowrap">
                {categoryTitle}
              </h3>
              <div className="h-px w-[90%] bg-gray-400" />
              <div className="space-y-1">
                {categories[categoryTitle].map((item) => (
                  <ListItem
                    key={item.id}
                    href={formatLink(item.link)}
                    title={item.name}
                    icon={item.iconImage?.url}
                    className="hover:bg-gray-50"
                  />
                ))}
              </div>
            </div>
          ))}
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
            href="https://www.vagaro.com/book-service"
            target="_blank"
            rel="noopener noreferrer"
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
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-50 text-nowrap">
            Business Types
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderBusinessTypes()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Features Menu */}
        <NavigationMenu.Item value="features">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-50">
            Features
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderFeatures()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/pro/pos-hardware"
            target="_blank"
            rel="noopener noreferrer"
          >
            Products
          </NavigationMenu.Link>
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
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink text-nowrap"
            href="https://vagaro.zendesk.com/hc/en-us"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </NavigationMenu.Link>
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
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-gray-50 transition-colors">
            <img src={icon} alt={title} className="w-5 h-5 " />
          </div>
        )}
        <span className="text-charcoal font-medium group-hover:text-gray-900 transition-colors text-base">
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
  ({ className, children, title, icon, href, ...props }, forwardedRef) => {
    // All navigation links should open in new tab since they're external to Zendesk
    return (
      <li>
        <NavigationMenu.Link asChild>
          <a
            className={classNames(
              "ListItemLink pr-1 py-2 text-base font-semibold",
              className
            )}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
            ref={forwardedRef}
          >
            <div className="ListItemHeading flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-gray-50 transition-colors">
                {icon && <img src={icon} alt={title} className="w-5 h-5" />}
              </div>
              {title}
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
};

export default NavigationMenuDemo;
