// Initialize Radix Navigation Menu
// Navigation data is fetched at build time by `bin/fetch-nav-data.js` and
// served as a static asset, so the Hygraph endpoint is never shipped to the client.
// eslint-disable-next-line check-file/filename-naming-convention
import { mountRadixNavigation } from "./radix-navigation-integration";

export async function initRadixNavigation() {
  try {
    const root = document.getElementById("radix-navigation-root");
    const navDataUrl = root?.dataset.navdataUrl;

    if (!navDataUrl) {
      console.warn(
        "[Radix Navigation] No data-navdata-url on #radix-navigation-root"
      );
      return;
    }

    const response = await fetch(navDataUrl);
    if (!response.ok) {
      throw new Error(`Failed to load nav data: ${response.status}`);
    }

    const data = await response.json();
    const navigationMenu = data.navigationMenu || data.data?.navigationMenu;

    if (!navigationMenu) return;

    // Re-render the already-mounted Radix navigation (navigationlinks.js
    // seeds window.navigationData; this call just ensures a render pass).
    mountRadixNavigation();
    console.log("[Radix Navigation] Successfully mounted");
  } catch (error) {
    console.error("[Radix Navigation] Failed to initialize:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRadixNavigation();
});
