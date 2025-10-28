// Article ID redirects - maps old article IDs to new ones
window.addEventListener("DOMContentLoaded", () => {
  const redirectMap = {
    360009654493: "1260806204090",
    204347720: "31275501148699",
    204974584: "18977275541531",
  };

  const currentUrl = window.location.href;

  // Check if current URL contains any old ID and redirect to new one
  for (const [oldId, newId] of Object.entries(redirectMap)) {
    if (currentUrl.includes(oldId)) {
      window.location.href = `https://support.vagaro.com/hc/en-us/articles/${newId}`;
      break; // Exit after first match
    }
  }
});
