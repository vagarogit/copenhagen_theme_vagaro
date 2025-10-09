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
        <div className="grid grid-cols-3 gap-12">
          {/* Beauty Column */}
          <div className="">
            <h3 className="text-lg font-bold mb-6 text-primary uppercase tracking-wide">
              {categories.beauty}
            </h3>
            <div className="space-y-4 grid grid-cols-1 col-span-1 md:grid-cols-2">
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
            <h3 className="text-lg font-bold mb-6 text-primary uppercase tracking-wide">
              {categories.wellness}
            </h3>
            <div className="space-y-4 grid grid-cols-1 col-span-1 md:grid-cols-2">
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
            <h3 className="text-lg font-bold mb-6 text-primary uppercase tracking-wide">
              {categories.fitness}
            </h3>
            <div className="space-y-4 grid grid-cols-1 col-span-1 md:grid-cols-2">
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

    // Group features into 5 specific categories based on the screenshot
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

    return (
      <div className="List bg-white p-8 w-full fullwidth">
        <div className="grid grid-cols-5 gap-8">
          {Object.entries(categories).map(([categoryTitle, categoryItems]) => (
            <div key={categoryTitle} className="space-y-4">
              <h3 className="text-lg font-bold mb-4 text-primary uppercase text-nowrap">
                {categoryTitle}
              </h3>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <ListItem
                    key={item.id}
                    href={item.link}
                    title={item.name}
                    icon={item.iconImage?.url}
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
          <NavigationMenu.Trigger className="NavigationMenuTrigger">
            Business Types <CaretDownIcon className="CaretDown" aria-hidden />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderBusinessTypes()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Features Menu */}
        <NavigationMenu.Item value="features">
          <NavigationMenu.Trigger className="NavigationMenuTrigger">
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
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
          <img src={icon} alt={title} className="w-5 h-5 object-contain" />
        </div>
      )}
      <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
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
          className={classNames("ListItemLink", className)}
          {...props}
          ref={forwardedRef}
        >
          <div className="ListItemHeading flex items-center gap-2">
            {icon && (
              <img
                src={icon}
                alt={title}
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
            )}
            {title}
          </div>
          <p className="ListItemText">{children}</p>
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
