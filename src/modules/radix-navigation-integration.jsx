/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { createRoot } from "react-dom/client";
import NavigationMenuDemo from "./radix.jsx";
import MobileNavigation from "./mobile-navigation.jsx";
import UserMenu from "./user-menu.jsx";

// React 18 root instances, reused across re-renders so state/reconciliation
// persists between calls instead of remounting the tree each time.
let radixNavRoot = null;
let radixNavRootContainer = null;
let mobileNavRoot = null;
let mobileNavRootContainer = null;
let userMenuRoot = null;
let userMenuRootContainer = null;

// Development mode: Set to true to keep mobile navigation open during development
const DEV_MODE_MOBILE_NAV_OPEN = false; // Change to true to open mobile nav on load

// Global data store for navigation data
window.navigationData = {
  businessTypes: null,
  features: null,
  trendingPosts: [],
  proPosts: [],
  isLoaded: false,
};

// Global mobile navigation state
window.mobileNavState = {
  isOpen: DEV_MODE_MOBILE_NAV_OPEN,
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
  mountUserMenu();
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
    // Create the root once and reuse it for subsequent re-renders so we
    // don't remount the tree (and lose reconciliation) on every data update.
    if (!radixNavRoot || radixNavRootContainer !== mountPoint) {
      radixNavRoot = createRoot(mountPoint);
      radixNavRootContainer = mountPoint;
    }

    // Mount the React component with navigation data
    radixNavRoot.render(
      <NavigationMenuDemo navigationData={window.navigationData} />
    );

    // Hide the fallback navigation
    if (fallbackNav) {
      fallbackNav.style.display = "none";
    }

    // console.log(
    //   "[Desktop Navigation] Successfully mounted with data:",
    //   window.navigationData,
    //   "and user info:",
    //   window.mobileNavState.userInfo
    // );
    return true;
  }

  // console.error("[Desktop Navigation] Mount point not found");
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

  // In dev mode, override isOpen state if flag is set
  const isOpen = DEV_MODE_MOBILE_NAV_OPEN ? true : window.mobileNavState.isOpen;

  // Create the root once and reuse it for subsequent re-renders. If the
  // container was ever removed from the DOM and recreated (not currently
  // done anywhere in this codebase, but guarded defensively), the stale
  // root is discarded and a fresh one is created for the new container.
  if (
    !mobileNavRoot ||
    mobileNavRootContainer !== mobileNavContainer ||
    !mobileNavContainer.isConnected
  ) {
    mobileNavRoot = createRoot(mobileNavContainer);
    mobileNavRootContainer = mobileNavContainer;
  }

  // Mount the mobile navigation component
  mobileNavRoot.render(
    <MobileNavigation
      navigationData={window.navigationData}
      isOpen={isOpen}
      onClose={window.closeMobileNavigation}
      userInfo={window.mobileNavState.userInfo}
    />
  );

  return true;
}

// Read the signed-in user from Zendesk. `window.HelpCenter.user` is the only
// place the name lives — the templates render an avatar (header.hbs, gated on
// `signed_in`) but never the name — so DOM lookups only serve as a fallback for
// the avatar.
export function resolveUserInfo() {
  const hcUser = window.HelpCenter?.user;
  const domAvatar = document.querySelector(".user-avatar");

  const isSignedIn = !!(
    hcUser?.signed_in ||
    (hcUser?.role && hcUser.role !== "anonymous") ||
    document.body.classList.contains("signed-in") ||
    domAvatar
  );

  return {
    isSignedIn,
    userAvatar: hcUser?.avatar_url || domAvatar?.src || null,
    userName: hcUser?.name || null,
  };
}

window.resolveUserInfo = resolveUserInfo;

// Function to mount the signed-in user menu into the header's top row. It
// lives beside the locale flag instead of inside the nav list so a long
// display name can't push the nav items off the right edge of the viewport.
export function mountUserMenu() {
  const mountPoint = document.getElementById("header-user-menu-root");

  if (!mountPoint) return false;

  if (!userMenuRoot || userMenuRootContainer !== mountPoint) {
    userMenuRoot = createRoot(mountPoint);
    userMenuRootContainer = mountPoint;
  }

  userMenuRoot.render(<UserMenu userInfo={window.mobileNavState.userInfo} />);

  return true;
}

// Initialize both components when DOM is ready
function initializeNavigation() {
  mountRadixNavigation();
  mountMobileNavigation();
  mountUserMenu();

  // Initialize user info from Zendesk helpers if available
  const userInfo = resolveUserInfo();

  if (userInfo.isSignedIn || userInfo.userAvatar || userInfo.userName) {
    window.updateUserInfo(userInfo);
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
window.mountUserMenu = mountUserMenu;
