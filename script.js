(function () {
  'use strict';

  // Key map
  const ENTER = 13;
  const ESCAPE = 27;

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

  const isPrintableChar = (str) => {
    return str.length === 1 && str.match(/^\S$/);
  };

  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains("dropdown-menu-top"),
      end: menu.classList.contains("dropdown-menu-end"),
    };

    this.toggle.addEventListener("click", this.clickHandler.bind(this));
    this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
    this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
    document.body.addEventListener("click", this.outsideClickHandler.bind(this));

    const toggleId = this.toggle.getAttribute("id") || crypto.randomUUID();
    const menuId = this.menu.getAttribute("id") || crypto.randomUUID();

    this.toggle.setAttribute("id", toggleId);
    this.menu.setAttribute("id", menuId);

    this.toggle.setAttribute("aria-controls", menuId);
    this.menu.setAttribute("aria-labelledby", toggleId);

    this.menu.setAttribute("tabindex", -1);
    this.menuItems.forEach((menuItem) => {
      menuItem.tabIndex = -1;
    });

    this.focusedIndex = -1;
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.toggle.getAttribute("aria-expanded") === "true";
    },

    get menuItems() {
      return Array.prototype.slice.call(
        this.menu.querySelectorAll("[role='menuitem'], [role='menuitemradio']")
      );
    },

    dismiss: function () {
      if (!this.isExpanded) return;

      this.toggle.removeAttribute("aria-expanded");
      this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
      this.focusedIndex = -1;
    },

    open: function () {
      if (this.isExpanded) return;

      this.toggle.setAttribute("aria-expanded", true);
      this.handleOverflow();
    },

    handleOverflow: function () {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add("dropdown-menu-end");
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add("dropdown-menu-top");
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove("dropdown-menu-top");
      }
    },

    focusByIndex: function (index) {
      if (!this.menuItems.length) return;

      this.menuItems.forEach((item, itemIndex) => {
        if (itemIndex === index) {
          item.tabIndex = 0;
          item.focus();
        } else {
          item.tabIndex = -1;
        }
      });

      this.focusedIndex = index;
    },

    focusFirstMenuItem: function () {
      this.focusByIndex(0);
    },

    focusLastMenuItem: function () {
      this.focusByIndex(this.menuItems.length - 1);
    },

    focusNextMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      const currentIndex = this.menuItems.indexOf(currentItem);
      const nextIndex = (currentIndex + 1) % this.menuItems.length;

      this.focusByIndex(nextIndex);
    },

    focusPreviousMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      const currentIndex = this.menuItems.indexOf(currentItem);
      const previousIndex =
        currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.focusByIndex(previousIndex);
    },

    focusByChar: function (currentItem, char) {
      char = char.toLowerCase();

      const itemChars = this.menuItems.map((menuItem) =>
        menuItem.textContent.trim()[0].toLowerCase()
      );

      const startIndex =
        (this.menuItems.indexOf(currentItem) + 1) % this.menuItems.length;

      // look up starting from current index
      let index = itemChars.indexOf(char, startIndex);

      // if not found, start from start
      if (index === -1) {
        index = itemChars.indexOf(char, 0);
      }

      if (index > -1) {
        this.focusByIndex(index);
      }
    },

    outsideClickHandler: function (e) {
      if (
        this.isExpanded &&
        !this.toggle.contains(e.target) &&
        !e.composedPath().includes(this.menu)
      ) {
        this.dismiss();
        this.toggle.focus();
      }
    },

    clickHandler: function (event) {
      event.stopPropagation();
      event.preventDefault();

      if (this.isExpanded) {
        this.dismiss();
        this.toggle.focus();
      } else {
        this.open();
        this.focusFirstMenuItem();
      }
    },

    toggleKeyHandler: function (e) {
      const key = e.key;

      switch (key) {
        case "Enter":
        case " ":
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();

          this.open();
          this.focusFirstMenuItem();
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();

          this.open();
          this.focusLastMenuItem();
          break;
        }
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();

          this.dismiss();
          this.toggle.focus();
          break;
        }
      }
    },

    menuKeyHandler: function (e) {
      const key = e.key;
      const currentElement = this.menuItems[this.focusedIndex];

      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      switch (key) {
        case "Esc":
        case "Escape": {
          e.stopPropagation();
          e.preventDefault();

          this.dismiss();
          this.toggle.focus();
          break;
        }
        case "ArrowDown":
        case "Down": {
          e.stopPropagation();
          e.preventDefault();

          this.focusNextMenuItem(currentElement);
          break;
        }
        case "ArrowUp":
        case "Up": {
          e.stopPropagation();
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        }
        case "Home":
        case "PageUp": {
          e.stopPropagation();
          e.preventDefault();
          this.focusFirstMenuItem();
          break;
        }
        case "End":
        case "PageDown": {
          e.stopPropagation();
          e.preventDefault();
          this.focusLastMenuItem();
          break;
        }
        case "Tab": {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            this.toggle.focus();
          } else {
            this.dismiss();
          }
          break;
        }
        default: {
          if (isPrintableChar(key)) {
            e.stopPropagation();
            e.preventDefault();
            this.focusByChar(currentElement, key);
          }
        }
      }
    },
  };

  // Drodowns

  window.addEventListener("DOMContentLoaded", () => {
    const dropdowns = [];
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      const menu = toggle.nextElementSibling;
      if (menu && menu.classList.contains("dropdown-menu")) {
        dropdowns.push(new Dropdown(toggle, menu));
      }
    });
  });

  // Share

  window.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".share a");
    links.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(anchor.href, "", "height = 500, width = 500");
      });
    });
  });

  // Vanilla JS debounce function, by Josh W. Comeau:
  // https://www.joshwcomeau.com/snippets/javascript/debounce/
  function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }

  // Define variables for search field
  let searchFormFilledClassName = "search-has-value";
  let searchFormSelector = "form[role='search']";

  // Clear the search input, and then return focus to it
  function clearSearchInput(event) {
    event.target
      .closest(searchFormSelector)
      .classList.remove(searchFormFilledClassName);

    let input;
    if (event.target.tagName === "INPUT") {
      input = event.target;
    } else if (event.target.tagName === "BUTTON") {
      input = event.target.previousElementSibling;
    } else {
      input = event.target.closest("button").previousElementSibling;
    }
    input.value = "";
    input.focus();
  }

  // Have the search input and clear button respond
  // when someone presses the escape key, per:
  // https://twitter.com/adambsilver/status/1152452833234554880
  function clearSearchInputOnKeypress(event) {
    const searchInputDeleteKeys = ["Delete", "Escape"];
    if (searchInputDeleteKeys.includes(event.key)) {
      clearSearchInput(event);
    }
  }

  // Create an HTML button that all users -- especially keyboard users --
  // can interact with, to clear the search input.
  // To learn more about this, see:
  // https://adrianroselli.com/2019/07/ignore-typesearch.html#Delete
  // https://www.scottohara.me/blog/2022/02/19/custom-clear-buttons.html
  function buildClearSearchButton(inputId) {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("aria-controls", inputId);
    button.classList.add("clear-button");
    const buttonLabel = window.searchClearButtonLabelLocalized;
    const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
    button.innerHTML = icon;
    button.addEventListener("click", clearSearchInput);
    button.addEventListener("keyup", clearSearchInputOnKeypress);
    return button;
  }

  // Append the clear button to the search form
  function appendClearSearchButton(input, form) {
    const searchClearButton = buildClearSearchButton(input.id);
    form.append(searchClearButton);
    if (input.value.length > 0) {
      form.classList.add(searchFormFilledClassName);
    }
  }

  // Add a class to the search form when the input has a value;
  // Remove that class from the search form when the input doesn't have a value.
  // Do this on a delay, rather than on every keystroke.
  const toggleClearSearchButtonAvailability = debounce((event) => {
    const form = event.target.closest(searchFormSelector);
    form.classList.toggle(
      searchFormFilledClassName,
      event.target.value.length > 0
    );
  }, 200);

  // Search

  window.addEventListener("DOMContentLoaded", () => {
    // Set up clear functionality for the search field
    const searchForms = [...document.querySelectorAll(searchFormSelector)];
    const searchInputs = searchForms.map((form) =>
      form.querySelector("input[type='search']")
    );
    searchInputs.forEach((input) => {
      appendClearSearchButton(input, input.closest(searchFormSelector));
      input.addEventListener("keyup", clearSearchInputOnKeypress);
      input.addEventListener("keyup", toggleClearSearchButtonAvailability);
    });
  });

  const key = "returnFocusTo";

  function saveFocus() {
    const activeElementId = document.activeElement.getAttribute("id");
    sessionStorage.setItem(key, "#" + activeElementId);
  }

  function returnFocus() {
    const returnFocusTo = sessionStorage.getItem(key);
    if (returnFocusTo) {
      sessionStorage.removeItem("returnFocusTo");
      const returnFocusToEl = document.querySelector(returnFocusTo);
      returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
    }
  }

  // Forms

  window.addEventListener("DOMContentLoaded", () => {
    // In some cases we should preserve focus after page reload
    returnFocus();

    // show form controls when the textarea receives focus or back button is used and value exists
    const commentContainerTextarea = document.querySelector(
      ".comment-container textarea"
    );
    const commentContainerFormControls = document.querySelector(
      ".comment-form-controls, .comment-ccs"
    );

    if (commentContainerTextarea) {
      commentContainerTextarea.addEventListener(
        "focus",
        function focusCommentContainerTextarea() {
          commentContainerFormControls.style.display = "block";
          commentContainerTextarea.removeEventListener(
            "focus",
            focusCommentContainerTextarea
          );
        }
      );

      if (commentContainerTextarea.value !== "") {
        commentContainerFormControls.style.display = "block";
      }
    }

    // Expand Request comment form when Add to conversation is clicked
    const showRequestCommentContainerTrigger = document.querySelector(
      ".request-container .comment-container .comment-show-container"
    );
    const requestCommentFields = document.querySelectorAll(
      ".request-container .comment-container .comment-fields"
    );
    const requestCommentSubmit = document.querySelector(
      ".request-container .comment-container .request-submit-comment"
    );

    if (showRequestCommentContainerTrigger) {
      showRequestCommentContainerTrigger.addEventListener("click", () => {
        showRequestCommentContainerTrigger.style.display = "none";
        Array.prototype.forEach.call(requestCommentFields, (element) => {
          element.style.display = "block";
        });
        requestCommentSubmit.style.display = "inline-block";

        if (commentContainerTextarea) {
          commentContainerTextarea.focus();
        }
      });
    }

    // Mark as solved button
    const requestMarkAsSolvedButton = document.querySelector(
      ".request-container .mark-as-solved:not([data-disabled])"
    );
    const requestMarkAsSolvedCheckbox = document.querySelector(
      ".request-container .comment-container input[type=checkbox]"
    );
    const requestCommentSubmitButton = document.querySelector(
      ".request-container .comment-container input[type=submit]"
    );

    if (requestMarkAsSolvedButton) {
      requestMarkAsSolvedButton.addEventListener("click", () => {
        requestMarkAsSolvedCheckbox.setAttribute("checked", true);
        requestCommentSubmitButton.disabled = true;
        requestMarkAsSolvedButton.setAttribute("data-disabled", true);
        requestMarkAsSolvedButton.form.submit();
      });
    }

    // Change Mark as solved text according to whether comment is filled
    const requestCommentTextarea = document.querySelector(
      ".request-container .comment-container textarea"
    );

    const usesWysiwyg =
      requestCommentTextarea &&
      requestCommentTextarea.dataset.helper === "wysiwyg";

    function isEmptyPlaintext(s) {
      return s.trim() === "";
    }

    function isEmptyHtml(xml) {
      const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
      const img = doc.querySelector("img");
      return img === null && isEmptyPlaintext(doc.children[0].textContent);
    }

    const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

    if (requestCommentTextarea) {
      requestCommentTextarea.addEventListener("input", () => {
        if (isEmpty(requestCommentTextarea.value)) {
          if (requestMarkAsSolvedButton) {
            requestMarkAsSolvedButton.innerText =
              requestMarkAsSolvedButton.getAttribute("data-solve-translation");
          }
        } else {
          if (requestMarkAsSolvedButton) {
            requestMarkAsSolvedButton.innerText =
              requestMarkAsSolvedButton.getAttribute(
                "data-solve-and-submit-translation"
              );
          }
        }
      });
    }

    const selects = document.querySelectorAll(
      "#request-status-select, #request-organization-select"
    );

    selects.forEach((element) => {
      element.addEventListener("change", (event) => {
        event.stopPropagation();
        saveFocus();
        element.form.submit();
      });
    });

    // Submit requests filter form on search in the request list page
    const quickSearch = document.querySelector("#quick-search");
    if (quickSearch) {
      quickSearch.addEventListener("keyup", (event) => {
        if (event.keyCode === ENTER) {
          event.stopPropagation();
          saveFocus();
          quickSearch.form.submit();
        }
      });
    }

    // Submit organization form in the request page
    const requestOrganisationSelect = document.querySelector(
      "#request-organization select"
    );

    if (requestOrganisationSelect) {
      requestOrganisationSelect.addEventListener("change", () => {
        requestOrganisationSelect.form.submit();
      });

      requestOrganisationSelect.addEventListener("click", (e) => {
        // Prevents Ticket details collapsible-sidebar to close on mobile
        e.stopPropagation();
      });
    }

    // If there are any error notifications below an input field, focus that field
    const notificationElm = document.querySelector(".notification-error");
    if (
      notificationElm &&
      notificationElm.previousElementSibling &&
      typeof notificationElm.previousElementSibling.focus === "function"
    ) {
      notificationElm.previousElementSibling.focus();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    console.log("Trending articles loading");

    // Check if the trending articles container exists
    var trendingContainer = document.getElementById(
      "trending-articles-container"
    );
    var trendingSkeleton = document.getElementById("trending-articles-skeleton");
    var trendingContent = document.getElementById("trending-articles-content");

    // If no container found, don't proceed
    if (!trendingContainer || !trendingSkeleton || !trendingContent) {
      console.error("Trending articles container elements not found");
      return;
    }
    // Define a timeout to handle API failures gracefully
    var loadingTimeout = setTimeout(function () {
      // If loading takes too long (5 seconds), hide the skeleton
      trendingSkeleton.style.display = "none";
      console.error("Trending articles loading timeout");
    }, 5000);

    // Make the API request
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "https://asamplitudearticlepollerwus2.azurewebsites.net/amplitude/ampdatazendesk",
      true
    );
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

    xhr.onload = function () {
      // Clear the timeout as we have a response
      clearTimeout(loadingTimeout);

      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);

        // If we have results, populate the content
        if (response && response.length > 0) {
          // Create articles container
          var articlesContainer = document.createElement("ul");
          articlesContainer.className =
            "trending-articles-api-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full hover:cursor-pointer";

          // Determine arrow image path - using the exposed theme path
          var arrowPath;
          if (window.themePath) {
            // Use the pre-configured theme path
            arrowPath = window.themePath + "arrow-up-right.svg";
          } else {
            // Fallback to the best guess path
            arrowPath = "/assets/arrow-up-right.svg";
          }
          console.log("Using arrow path:", arrowPath);

          // Add articles
          for (var i = 0; i < response.length; i++) {
            var articleItem = document.createElement("li");
            articleItem.className =
              "trending-articles-api-item border-b border-gray-200 group";

            var articleLink = document.createElement("a");
            articleLink.className = "flex items-center p-2";
            articleLink.href = response[i].articleURL;
            articleLink.target = "_blank";

            var titleSpan = document.createElement("span");
            titleSpan.className = "text-gray-900 flex-grow group-hover:text-primary";
            titleSpan.textContent = response[i].articleTitle;

            var arrowImg = document.createElement("img");
            arrowImg.className = "ml-1 w-3 h-3 flex-shrink-0";
            arrowImg.src = arrowPath;
            arrowImg.alt = "Arrow";

            articleLink.appendChild(titleSpan);
            articleLink.appendChild(arrowImg);
            articleItem.appendChild(articleLink);
            articlesContainer.appendChild(articleItem);

            // Add individual hover event listeners
            articleItem.addEventListener("mouseenter", function () {
              this.classList.add("border-primary");
              // Add primary color to the arrow (#CC4744)
              var arrow = this.querySelector("img");
              if (arrow) {
                arrow.style.filter =
                  "invert(37%) sepia(74%) saturate(2790%) hue-rotate(335deg) brightness(96%) contrast(84%)";
              }
            });

            articleItem.addEventListener("mouseleave", function () {
              this.classList.remove("border-primary");
              // Reset arrow color
              var arrow = this.querySelector("img");
              if (arrow) {
                arrow.style.filter = "";
              }
            });
          }

          // Clear any existing content
          trendingContent.innerHTML = "";

          // Add the new content
          trendingContent.appendChild(articlesContainer);

          // Hide the skeleton and show the actual content
          trendingSkeleton.style.display = "none";
          trendingContent.classList.remove("hidden");
        } else {
          // No results, hide the entire section
          trendingContainer.style.display = "none";
        }
      } else {
        // Error response, hide the section
        trendingContainer.style.display = "none";
        console.error("Failed to load trending articles: " + xhr.statusText);
      }
    };

    xhr.onerror = function () {
      // Clear the timeout as we have a response (error)
      clearTimeout(loadingTimeout);

      // Hide the trending section on error
      trendingContainer.style.display = "none";
      console.error("Error fetching trending articles: " + xhr.statusText);
    };

    xhr.send();
  });

  /**
   * Optimize YouTube videos for responsive display
   * Targets videos with the structure:
   * <div class="mediaobject">
   *   <div class="video-container">
   *     <div class="videoobject"><iframe src="..."></iframe></div>
   *   </div>
   * </div>
   */

  function optimizeYouTubeVideos() {
    const mediaObjects = document.querySelectorAll('.mediaobject .video-container .videoobject iframe');
    
    mediaObjects.forEach(iframe => {
      // Ensure parent container has proper styling
      const videoContainer = iframe.closest('.video-container');
      if (videoContainer) {
        // Apply responsive container styles
        videoContainer.style.position = 'relative';
        videoContainer.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
        videoContainer.style.height = '0';
        videoContainer.style.overflow = 'hidden';
        videoContainer.style.maxWidth = '100%';
        
        // Apply iframe styles
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        
        // Remove fixed dimensions if they exist
        if (iframe.hasAttribute('width')) iframe.removeAttribute('width');
        if (iframe.hasAttribute('height')) iframe.removeAttribute('height');
        
        // Make sure our styles override any inline styles
        iframe.setAttribute('style', 
          'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;');
      }
    });
  }

  // Run on DOM load
  window.addEventListener('DOMContentLoaded', optimizeYouTubeVideos);

  // Also run when dynamic content might be loaded
  window.addEventListener('load', optimizeYouTubeVideos);

  /**
   * Footer Links Utility
   *
   * Fetches and renders footer links from Hygraph CMS endpoint
   */

  class FooterLinksManager {
    constructor(endpoint, options = {}) {
      this.endpoint = endpoint;
      this.options = {
        timeout: 10000,
        retries: 3,
        ...options,
      };
    }

    /**
     * GraphQL query for footer links
     */
    getFooterLinksQuery() {
      return {
        query: `
        query GetFooterLinks {
          navigationMenu(
            where: { id: "cm3eu68fras240dn16jbq7bz5" }
          ) {
            id
            getStartedItems {
              id
              name
              link
              externalLink
            }
            companyItems {
              id
              name
              link
              externalLink
            }
            resourcesItems {
              id
              name
              link
              externalLink
            }
          }
        }
      `,
      };
    }

    /**
     * Fetch footer links from Hygraph
     */
    async fetchFooterLinks() {
      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.getFooterLinksQuery()),
          signal: AbortSignal.timeout(this.options.timeout),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        return data.data.navigationMenu;
      } catch (error) {
        console.error("Failed to fetch footer links:", error);
        throw error;
      }
    }

    /**
     * Render footer section HTML
     */
    renderFooterSection(title, items) {
      const linksHtml = items
        .map(
          (item) => `
      <li>
        <a href="${item.link}" 
           class="text-sm/6 text-gray-400 hover:text-gray-300"
           ${item.externalLink ? 'target="_blank" rel="noopener"' : ""}>
          ${item.name}
        </a>
      </li>
    `
        )
        .join("");

      return `
      <div class="${title !== "Get Started" ? "mt-10 md:mt-0" : ""}">
        <h3 class="text-sm/6 font-semibold text-white">${title}</h3>
        <ul role="list" class="mt-6 space-y-4">
          ${linksHtml}
        </ul>
      </div>
    `;
    }

    /**
     * Update footer links in the DOM
     */
    async updateFooterLinks(containerId = "footer-links-container") {
      try {
        const container = document.getElementById(containerId);
        if (!container) {
          console.warn(`Container with ID '${containerId}' not found`);
          return;
        }

        // Show loading state
        container.innerHTML =
          '<div class="text-gray-400">Loading footer links...</div>';

        const navigationMenu = await this.fetchFooterLinks();

        // Render all sections
        const sectionsHtml = `
        ${this.renderFooterSection(
          "Get Started",
          navigationMenu.getStartedItems || []
        )}
        ${this.renderFooterSection(
          "Company",
          navigationMenu.companyItems || []
        )}
        ${this.renderFooterSection(
          "Resources",
          navigationMenu.resourcesItems || []
        )}
      `;

        container.innerHTML = sectionsHtml;
      } catch (error) {
        console.error("Failed to update footer links:", error);
        // Fallback to static content or show error
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML =
            '<div class="text-gray-400">Failed to load footer links</div>';
        }
      }
    }

    /**
     * Initialize footer links with retry logic
     */
    async init(containerId) {
      let attempts = 0;

      while (attempts < this.options.retries) {
        try {
          await this.updateFooterLinks(containerId);
          return; // Success
        } catch (error) {
          attempts++;
          if (attempts < this.options.retries) {
            console.log(
              `Retrying footer links fetch (${attempts}/${this.options.retries})...`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          } else {
            console.error("Failed to load footer links after all retries");
          }
        }
      }
    }
  }

  // Make FooterLinksManager globally available
  window.FooterLinksManager = FooterLinksManager;

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    // Replace with your actual Hygraph endpoint
    const HYGRAPH_ENDPOINT =
      "https://us-west-2.cdn.hygraph.com/content/cld3gw4bb0hr001ue9afzcunb/master";

    const footerManager = new FooterLinksManager(HYGRAPH_ENDPOINT, {
      timeout: 8000,
      retries: 2,
    });

    // Initialize footer links
    footerManager.init("footer-links-container");
  });

})();
