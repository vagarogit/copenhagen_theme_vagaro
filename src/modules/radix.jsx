/* eslint-disable @shopify/jsx-no-hardcoded-content */
import * as React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { PropTypes } from "prop-types";

const NavigationMenuDemo = ({ navigationData = {} }) => {
  const { businessTypes, features, isLoaded } = navigationData;

  // For development: manually set which menu item should be open
  // Set to "features" or "business-types" to force that menu open for styling
  const [activeMenu, setActiveMenu] = React.useState("features"); // Change this to control which menu is open

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
        <div className="grid grid-cols-3 gap-4">
          {/* Beauty Column */}
          <div className="">
            <h3 className="text-lg font-bold text-primary uppercase ">
              {categories.beauty}
            </h3>
            <div className="h-px bg-gray-400" />
            <div className="grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.beauty?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={item.link}
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
            <div className="h-px bg-gray-400" />
            <div className=" grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.wellness?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={item.link}
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
            <div className="h-px bg-gray-400" />
            <div className="grid grid-cols-1 col-span-1 md:grid-cols-2">
              {businessTypes.fitness?.map((item) => (
                <BusinessTypeItem
                  key={item.id}
                  href={item.link}
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
        <div className="grid grid-cols-5 mx-auto gap-x-5">
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
                    href={item.link}
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
      className="NavigationMenuRoot"
      value={activeMenu}
      onValueChange={setActiveMenu}
    >
      <NavigationMenu.List className="NavigationMenuList">
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://github.com/radix-ui"
          >
            Book a Service
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        {/* Business Types Menu */}
        <NavigationMenu.Item value="business-types">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-50">
            Business Types <CaretDownIcon className="CaretDown" aria-hidden />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderBusinessTypes()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Features Menu */}
        <NavigationMenu.Item value="features">
          <NavigationMenu.Trigger className="NavigationMenuTrigger hover:bg-gray-50">
            Features <CaretDownIcon className="CaretDown" aria-hidden />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderFeatures()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://github.com/radix-ui"
          >
            Products
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/pro/pos-hardware"
          >
            Multi-location
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/pro/pricing"
          >
            Pricing
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/pro/contact-sales-team"
          >
            Contact Sales
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://vagaro.zendesk.com/hc/en-us"
          >
            Support
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://www.vagaro.com/pro/resources"
          >
            Resources
          </NavigationMenu.Link>
        </NavigationMenu.Item>

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
};

const BusinessTypeItem = ({ href, title, icon }) => (
  <NavigationMenu.Link asChild>
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
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

BusinessTypeItem.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
};

const ListItem = React.forwardRef(
  ({ className, children, title, icon, ...props }, forwardedRef) => (
    <li>
      <NavigationMenu.Link asChild>
        <a
          className={classNames(
            "ListItemLink pr-1 py-2 text-base font-semibold",
            className
          )}
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
  )
);

ListItem.displayName = "ListItem";
ListItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.string,
  icon: PropTypes.string,
};

export default NavigationMenuDemo;
