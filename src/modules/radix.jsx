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
    <NavigationMenu.Root className="NavigationMenuRoot relative flex justify-center w-full max-w-6xl mx-auto z-10">
      <NavigationMenu.List className="NavigationMenuList flex justify-center p-1 list-none m-0">
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://github.com/radix-ui"
          >
            Book a Service
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        {/* Business Types Menu */}
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E] data-[state=open]:bg-gray-100 data-[state=open]:text-[#D43C2E]">
            Business Types{" "}
            <CaretDownIcon
              className="CaretDown relative text-gray-600 top-px transition-transform duration-250 ease-out data-[state=open]:rotate-180"
              aria-hidden
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content
            className="NavigationMenuContent absolute top-0 w-screen animate-duration-250 ease-out data-[motion=from-start]:animate-[enterFromLeft_250ms_ease] data-[motion=from-end]:animate-[enterFromRight_250ms_ease] data-[motion=to-start]:animate-[exitToLeft_250ms_ease] data-[motion=to-end]:animate-[exitToRight_250ms_ease]"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            {renderBusinessTypes()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Features Menu */}
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E] data-[state=open]:bg-gray-100 data-[state=open]:text-[#D43C2E]">
            Features{" "}
            <CaretDownIcon
              className="CaretDown relative text-gray-600 top-px transition-transform duration-250 ease-out data-[state=open]:rotate-180"
              aria-hidden
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            {renderFeatures()}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://github.com/radix-ui"
          >
            Products
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://github.com/radix-ui"
          >
            Multi-location
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://www.vagaro.com/pro/pricing"
          >
            Pricing
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://github.com/radix-ui"
          >
            Contact Sales
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://github.com/radix-ui"
          >
            Support
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="NavigationMenuLink px-3 py-2 outline-none select-none font-medium leading-none rounded text-gray-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 focus:shadow-[0_0_0_2px_#D43C2E]"
            href="https://github.com/radix-ui"
          >
            Resources
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Indicator className="NavigationMenuIndicator flex items-end justify-center h-2.5 top-full overflow-hidden z-10 transition-all duration-250 ease-out data-[state=visible]:animate-[fadeIn_200ms_ease] data-[state=hidden]:animate-[fadeOut_200ms_ease]">
          <div className="Arrow relative top-[70%] bg-white w-2.5 h-2.5 rotate-45 rounded-tl-sm" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="ViewportPosition" style={{ perspective: "2000px" }}>
        <NavigationMenu.Viewport className="NavigationMenuViewport relative transform-gpu origin-top-center mt-2.5 w-full bg-white rounded-md overflow-hidden shadow-lg transition-all duration-300 ease-out" />
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
          className={classNames(
            "ListItemLink block outline-none no-underline select-none p-3 rounded-md text-sm leading-none hover:bg-gray-50 focus:shadow-[0_0_0_2px_#D43C2E]",
            className
          )}
          {...props}
          ref={forwardedRef}
        >
          <div className="ListItemHeading font-medium leading-tight mb-1.5 text-gray-900">
            {title}
          </div>
          <p className="ListItemText text-gray-500 leading-relaxed font-normal">
            {children}
          </p>
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
