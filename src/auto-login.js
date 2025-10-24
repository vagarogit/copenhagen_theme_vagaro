/**
 * Auto-login functionality for Vagaro users
 * Checks if user is logged into Vagaro (via cookies) and automatically
 * redirects them to the Zendesk sign-in page
 */

/**
 * Get cookie value by name
 * @param {string} cookieName - The name of the cookie to retrieve
 * @returns {string} The cookie value or empty string if not found
 */
function getCookie(cookieName) {
  let name = cookieName + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * Initialize auto-login functionality
 * Checks session storage to prevent infinite loops, then checks for Vagaro cookies
 * If found, redirects to Zendesk sign-in
 */
function initAutoLogin() {
  // Check if we've already processed auto-login in this session
  let sessionChecked = sessionStorage.getItem("zds_true");

  if (!sessionChecked) {
    // Check for Vagaro user cookie (eU_2) or business cookie (eB_2)
    let vagaroCookie = getCookie("eU_2");
    if (!vagaroCookie) {
      vagaroCookie = getCookie("eB_2");
    }

    // Set session storage to prevent re-checking on page navigation
    sessionStorage.setItem("zds_true", "true");

    // If Vagaro cookie exists, redirect to sign-in
    if (vagaroCookie) {
      // Construct the sign-in URL with return_to parameter
      const currentUrl = encodeURIComponent(window.location.href);
      const signInUrl = `https://support.vagaro.com/hc/en-us/signin?return_to=${currentUrl}`;

      // Redirect to sign-in page
      window.location.href = signInUrl;
    }
  }
}

// Run auto-login when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAutoLogin);
} else {
  // DOM is already loaded
  initAutoLogin();
}
