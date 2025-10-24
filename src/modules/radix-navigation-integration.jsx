/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import * as ReactDOM from "react-dom";
import NavigationMenuDemo from "./radix.jsx";
import MobileNavigation from "./mobile-navigation.jsx";

// Global data store for navigation data
window.navigationData = {
  businessTypes: null,
  features: null,
  isLoaded: false,
};

// Global mobile navigation state
window.mobileNavState = {
  isOpen: false,
  userInfo: {
    isSignedIn: false,
    userAvatar: null,
    userName: null,
  },
};

// Event system for data updates
window.updateNavigationData = (data) => {
  window.navigationData = { ...data, isLoaded: true };
  // Re-render both desktop and mobile components with new data
  mountRadixNavigation();
  mountMobileNavigation();
};

// Function to update user info for both desktop and mobile navigation
window.updateUserInfo = (userInfo) => {
  window.mobileNavState.userInfo = {
    ...window.mobileNavState.userInfo,
    ...userInfo,
  };
  // Re-render both desktop and mobile navigation with new user info
  mountRadixNavigation();
  mountMobileNavigation();
};

// Function to toggle mobile navigation
window.toggleMobileNavigation = () => {
  window.mobileNavState.isOpen = !window.mobileNavState.isOpen;
  mountMobileNavigation();
};

// Function to close mobile navigation
window.closeMobileNavigation = () => {
  window.mobileNavState.isOpen = false;
  mountMobileNavigation();
};

// Function to mount the Desktop Radix Navigation Menu
export function mountRadixNavigation() {
  const mountPoint = document.getElementById("radix-navigation-root");
  const fallbackNav = document.getElementById("fallback-navigation");

  if (mountPoint) {
    // Mount the React component with navigation data and user info
    ReactDOM.render(
      <NavigationMenuDemo
        navigationData={window.navigationData}
        userInfo={window.mobileNavState.userInfo}
      />,
      mountPoint
    );

    // Hide the fallback navigation
    if (fallbackNav) {
      fallbackNav.style.display = "none";
    }

    console.log(
      "[Desktop Navigation] Successfully mounted with data:",
      window.navigationData,
      "and user info:",
      window.mobileNavState.userInfo
    );
    return true;
  }

  console.error("[Desktop Navigation] Mount point not found");
  return false;
}

// Function to mount the Mobile Navigation
export function mountMobileNavigation() {
  let mobileNavContainer = document.getElementById("mobile-navigation-root");

  // Create mobile navigation container if it doesn't exist
  if (!mobileNavContainer) {
    mobileNavContainer = document.createElement("div");
    mobileNavContainer.id = "mobile-navigation-root";
    document.body.appendChild(mobileNavContainer);
  }

  // Mount the mobile navigation component
  ReactDOM.render(
    <MobileNavigation
      navigationData={window.navigationData}
      isOpen={window.mobileNavState.isOpen}
      onClose={window.closeMobileNavigation}
      userInfo={window.mobileNavState.userInfo}
    />,
    mobileNavContainer
  );

  console.log(
    "[Mobile Navigation] Successfully mounted with state:",
    window.mobileNavState
  );
  return true;
}

// Initialize both components when DOM is ready
function initializeNavigation() {
  mountRadixNavigation();
  mountMobileNavigation();

  // Initialize user info from Zendesk helpers if available
  const userAvatar = document.querySelector(".user-avatar")?.src;
  const userName = document.querySelector("#user-name")?.textContent;
  const isSignedIn =
    document.body.classList.contains("signed-in") ||
    document.querySelector(".user-avatar") !== null ||
    window.HelpCenter?.user?.signed_in;

  if (isSignedIn || userAvatar || userName) {
    window.updateUserInfo({
      isSignedIn: !!isSignedIn,
      userAvatar: userAvatar || null,
      userName: userName || null,
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNavigation);
} else {
  // DOM is already ready
  initializeNavigation();
}

// Export functions for use in other modules
window.mountRadixNavigation = mountRadixNavigation;
window.mountMobileNavigation = mountMobileNavigation;
