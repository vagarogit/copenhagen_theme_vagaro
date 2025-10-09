/* eslint-disable @shopify/jsx-no-hardcoded-content */
import * as React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { PropTypes } from "prop-types";

const NavigationMenuDemo = ({ navigationData = {} }) => {
  const { businessTypes, features, isLoaded } = navigationData;

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

    // Group features into columns (5 columns as per original design)
    const columns = Array.from({ length: 5 }, () => []);
    features.forEach((item, index) => {
      columns[index % 5].push(item);
    });

    return (
      <div
        className="List fullwidth"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        {columns.map((column, columnIndex) => (
          <div key={columnIndex}>
            {column.map((item) => (
              <ListItem key={item.id} href={item.link} title={item.name}>
                {item.iconImage?.url && (
                  <img
                    src={item.iconImage.url}
                    alt={item.name}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "8px",
                    }}
                  />
                )}
              </ListItem>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <NavigationMenu.Root className="NavigationMenuRoot">
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
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger">
            Business Types <CaretDownIcon className="CaretDown" aria-hidden />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderBusinessTypes()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Features Menu */}
        <NavigationMenu.Item>
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
  ({ className, children, title, ...props }, forwardedRef) => (
    <li>
      <NavigationMenu.Link asChild>
        <a
          className={classNames("ListItemLink", className)}
          {...props}
          ref={forwardedRef}
        >
          <div className="ListItemHeading">{title}</div>
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
};

export default NavigationMenuDemo;
