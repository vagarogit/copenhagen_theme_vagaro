// Initialize Radix Navigation Menu
import { mountNavigationMenu } from './navigation-menu';

export async function initRadixNavigation() {
  try {
    // Fetch navigation data (reuse your existing GraphQL query)
    const HYGRAPH_ENDPOINT = "https://us-west-2.cdn.hygraph.com/content/cld3gw4bb0hr001ue9afzcunb/master";
    
    const response = await fetch(HYGRAPH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetNavigationMenu {
            navigationMenu(where: { id: "clezyiora1akc0an0g68whmx0" }) {
              beautyItems {
                id
                name
                link
                iconImage {
                  url
                }
              }
              wellnessItems {
                id
                name
                link
                iconImage {
                  url
                }
              }
              fitnessItems {
                id
                name
                link
                iconImage {
                  url
                }
              }
              featureItems {
                id
                name
                description
                link
                iconImage {
                  url
                }
              }
            }
          }
        `,
      }),
    });

    const data = await response.json();
    
    if (data.data?.navigationMenu) {
      // Mount the React navigation component
      mountNavigationMenu('radix-navigation-mount', data.data.navigationMenu);
      console.log('[Radix Navigation] Successfully mounted');
    }
  } catch (error) {
    console.error('[Radix Navigation] Failed to initialize:', error);
    // You could fall back to your existing navigation here
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initRadixNavigation();
});