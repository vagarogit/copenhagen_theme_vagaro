import Dropdown from "./Dropdown";

// Drodowns

window.addEventListener("DOMContentLoaded", () => {
  const dropdowns = [];
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach((toggle) => {
    // React-rendered dropdowns manage their own open state; wiring this
    // handler to them would swallow the click before React ever sees it.
    if (toggle.hasAttribute("data-react-dropdown")) return;

    const menu = toggle.nextElementSibling;
    if (menu && menu.classList.contains("dropdown-menu")) {
      dropdowns.push(new Dropdown(toggle, menu));
    }
  });
});
