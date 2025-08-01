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

    return (
      <div
        className="List one"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
          padding: "2rem",
        }}
      >
        {/* Beauty Column */}
        <div>
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "var(--violet-11)",
            }}
          >
            Beauty
          </h3>
          {businessTypes.beauty?.map((item) => (
            <ListItem key={item.id} href={item.link} title={item.name}>
              {item.iconImage?.url && (
                <img
                  src={item.iconImage.url}
                  alt={item.name}
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                />
              )}
            </ListItem>
          ))}
        </div>

        {/* Wellness Column */}
        <div>
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "var(--violet-11)",
            }}
          >
            Wellness
          </h3>
          {businessTypes.wellness?.map((item) => (
            <ListItem key={item.id} href={item.link} title={item.name}>
              {item.iconImage?.url && (
                <img
                  src={item.iconImage.url}
                  alt={item.name}
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                />
              )}
            </ListItem>
          ))}
        </div>

        {/* Fitness Column */}
        <div>
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "var(--violet-11)",
            }}
          >
            Fitness
          </h3>
          {businessTypes.fitness?.map((item) => (
            <ListItem key={item.id} href={item.link} title={item.name}>
              {item.iconImage?.url && (
                <img
                  src={item.iconImage.url}
                  alt={item.name}
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                />
              )}
            </ListItem>
          ))}
        </div>
      </div>
    );
  };

  // Render features content
  const renderFeatures = () => {
    if (!features || !isLoaded) {
      return <div className="List two">Loading features...</div>;
    }

    // Group features into columns (5 columns as per original design)
    const columns = Array.from({ length: 5 }, () => []);
    features.forEach((item, index) => {
      columns[index % 5].push(item);
    });

    return (
      <div
        className="List two"
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
    <NavigationMenu.Root className="NavigationMenuRoot mx-auto bg-black">
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
            href="https://github.com/radix-ui"
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
            href="https://github.com/radix-ui"
          >
            Contact Sales
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://github.com/radix-ui"
          >
            Support
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink"
            href="https://github.com/radix-ui"
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
