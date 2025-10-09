/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import * as ReactDOM from "react-dom";
import NavigationMenuDemo from "./radix.jsx";

// Global data store for navigation data
window.navigationData = {
  businessTypes: null,
  features: null,
  isLoaded: false,
};

// Event system for data updates
window.updateNavigationData = (data) => {
  window.navigationData = { ...data, isLoaded: true };
  // Re-render Radix component with new data
  mountRadixNavigation();
};

// Function to mount the Radix Navigation Menu
export function mountRadixNavigation() {
  const mountPoint = document.getElementById("radix-navigation-root");
  const fallbackNav = document.getElementById("fallback-navigation");

  if (mountPoint) {
    // Mount the React component with navigation data
    ReactDOM.render(
      <NavigationMenuDemo navigationData={window.navigationData} />,
      mountPoint
    );

    // Hide the fallback navigation
    if (fallbackNav) {
      fallbackNav.style.display = "none";
    }

    console.log(
      "[Radix Navigation] Successfully mounted with data:",
      window.navigationData
    );
    return true;
  }

  console.error("[Radix Navigation] Mount point not found");
  return false;
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountRadixNavigation);
} else {
  // DOM is already ready
  mountRadixNavigation();
}

// Export for use in other modules
window.mountRadixNavigation = mountRadixNavigation;
