import { ESCAPE } from "./Keys";

function toggleNavigation(toggle, menu) {
  const isExpanded = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", !isExpanded);
  toggle.setAttribute("aria-expanded", !isExpanded);

  // Toggle the hidden class
  if (isExpanded) {
    menu.classList.add("hidden");
  } else {
    menu.classList.remove("hidden");
  }
}

function closeNavigation(toggle, menu) {
  menu.setAttribute("aria-expanded", false);
  toggle.setAttribute("aria-expanded", false);
  menu.classList.add("hidden");
  toggle.focus();
}

// Handle dropdown toggles
function setupDropdowns() {
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach((toggle) => {
    const menu = toggle.nextElementSibling;
    if (!menu || !menu.classList.contains("dropdown-menu")) return;

    // Initially hide the dropdown menu
    menu.style.display = "none";

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();

      // Toggle visibility
      if (menu.style.display === "none") {
        menu.style.display = "block";
        menu.classList.add("opacity-100", "scale-100");
        menu.classList.remove("opacity-0", "scale-95");
      } else {
        menu.classList.add("opacity-0", "scale-95");
        menu.classList.remove("opacity-100", "scale-100");
        setTimeout(() => {
          menu.style.display = "none";
        }, 200);
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.add("opacity-0", "scale-95");
      menu.classList.remove("opacity-100", "scale-100");
      setTimeout(() => {
        menu.style.display = "none";
      }, 200);
    });
  });
}

// Navigation
window.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button-mobile");
  const menuList = document.querySelector("#user-nav-mobile");

  if (menuButton && menuList) {
    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleNavigation(menuButton, menuList);
    });

    menuList.addEventListener("keyup", (event) => {
      if (event.keyCode === ESCAPE) {
        event.stopPropagation();
        closeNavigation(menuButton, menuList);
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !menuList.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        if (menuList.getAttribute("aria-expanded") === "true") {
          closeNavigation(menuButton, menuList);
        }
      }
    });
  }

  // Setup dropdown menus
  setupDropdowns();

  // Toggles expanded aria to collapsible elements
  const collapsible = document.querySelectorAll(
    ".collapsible-nav, .collapsible-sidebar"
  );

  collapsible.forEach((element) => {
    const toggle = element.querySelector(
      ".collapsible-nav-toggle, .collapsible-sidebar-toggle"
    );

    if (toggle) {
      element.addEventListener("click", () => {
        toggleNavigation(toggle, element);
      });

      element.addEventListener("keyup", (event) => {
        if (event.keyCode === ESCAPE) {
          closeNavigation(toggle, element);
        }
      });
    }
  });

  // If multibrand search has more than 5 help centers or categories collapse the list
  const multibrandFilterLists = document.querySelectorAll(
    ".multibrand-filter-list"
  );
  multibrandFilterLists.forEach((filter) => {
    if (filter.children.length > 6) {
      // Display the show more button
      const trigger = filter.querySelector(".see-all-filters");
      if (trigger) {
        trigger.setAttribute("aria-hidden", false);

        // Add event handler for click
        trigger.addEventListener("click", (event) => {
          event.stopPropagation();
          trigger.parentNode.removeChild(trigger);
          filter.classList.remove("multibrand-filter-list--collapsed");
        });
      }
    }
  });
});
