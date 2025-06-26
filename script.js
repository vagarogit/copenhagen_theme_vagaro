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
        <a href="https://www.vagaro.com/${item.link}" 
           class="text-base font-normal text-white/80 hover:text-gray-300"
           ${item.externalLink ? 'target="_blank" rel="noopener"' : ""}>
          ${item.name}
        </a>
      </li>
    `
        )
        .join("");

      return `
      <div class="${title !== "Get Started" ? "mt-10 md:mt-0" : ""}">
        <h3 class="text-base font-semibold text-white">${title}</h3>
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

  /**
   * Navigation Links Utility
   *
   * Fetches and renders navigation menu items from Hygraph CMS endpoint
   * Creates dropdown mega menus for Business Types (beauty, wellness, fitness) and Features
   */

  class NavigationLinksManager {
    constructor(endpoint, options = {}) {
      this.endpoint = endpoint;
      this.options = {
        timeout: 10000,
        retries: 3,
        ...options,
      };
    }

    /**
     * GraphQL query for navigation menu items
     */
    getNavigationMenuQuery() {
      return {
        query: `
        query GetNavigationMenu {
          navigationMenu(where: { id: "clezyiora1akc0an0g68whmx0" }) {
            beautyItems {
              id
              name
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
            wellnessItems {
              id
              name
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
            fitnessItems {
              id
              name
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
            featureItems {
              id
              name
              description
              link
              showInHomeTabs
              iconImage {
                id
                url
              }
            }
          }
        }
      `,
      };
    }

    /**
     * Fetch navigation menu items from Hygraph
     */
    async fetchNavigationMenu() {
      console.log("[NavigationLinks] Starting to fetch navigation menu...");
      console.log("[NavigationLinks] Endpoint:", this.endpoint);
      console.log("[NavigationLinks] Query:", this.getNavigationMenuQuery());

      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.getNavigationMenuQuery()),
          signal: AbortSignal.timeout(this.options.timeout),
        });

        console.log("[NavigationLinks] Response status:", response.status);
        console.log("[NavigationLinks] Response ok:", response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[NavigationLinks] Received data:", data);

        if (data.errors) {
          console.error("[NavigationLinks] GraphQL errors:", data.errors);
          throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        console.log(
          "[NavigationLinks] Navigation menu data:",
          data.data.navigationMenu
        );
        return data.data.navigationMenu;
      } catch (error) {
        console.error(
          "[NavigationLinks] Failed to fetch navigation menu:",
          error
        );
        throw error;
      }
    }

    /**
     * Render business types mega menu (beauty, wellness, fitness)
     */
    renderBusinessTypesMegaMenu(beautyItems, wellnessItems, fitnessItems) {
      console.log("[NavigationLinks] Rendering business types mega menu");
      console.log("[NavigationLinks] Beauty items:", beautyItems);
      console.log("[NavigationLinks] Wellness items:", wellnessItems);
      console.log("[NavigationLinks] Fitness items:", fitnessItems);

      const renderCategory = (items, title) => {
        console.log(
          `[NavigationLinks] Rendering category ${title} with ${
          items?.length || 0
        } items`
        );
        if (!items || items.length === 0) return "";

        // Split items into two columns
        const mid = Math.ceil(items.length / 2);
        const col1 = items.slice(0, mid);
        const col2 = items.slice(mid);

        const renderColumn = (columnItems) => {
          return columnItems
            .map(
              (item) => `
            <div class="flex items-center py-1 hover:bg-gray-50 rounded px-2">
              ${
                item.iconImage?.url
                  ? `<img src="${item.iconImage.url}" alt="${item.name}" class="w-6 h-6 mr-3" />`
                  : `<div class="w-6 h-6 mr-3"></div>`
              }
              <a href="${
                item.link
              }" class="text-sm text-gray-600 hover:text-gray-900">
                ${item.name}
              </a>
            </div>
          `
            )
            .join("");
        };

        return `
        <div class="px-0">
          <h3 class="text-sm font-semibold mb-6" style="color:#D43C2E">${title}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              ${renderColumn(col1)}
            </div>
            <div class="space-y-3">
              ${renderColumn(col2)}
            </div>
          </div>
        </div>
      `;
      };

      // Calculate position of the navigation bar
      const navBar = document.getElementById("navigation-menu");
      const navBarRect = navBar?.getBoundingClientRect();
      const navBarBottom = navBarRect ? navBarRect.bottom + window.scrollY : 64;

      return `
      <div class="absolute bg-white shadow-lg border-b border-gray-200" style="
        top: ${navBarBottom}px; 
        left: 0; 
        right: 0; 
        width: 100vw;
        min-height: 300px;
        z-index: 50;
        position: fixed;
      ">
        <div class="max-w-6xl mx-auto px-8 py-12">
          <div class="grid grid-cols-3 gap-16">
            ${renderCategory(beautyItems, "BEAUTY")}
            ${renderCategory(wellnessItems, "WELLNESS")}
            ${renderCategory(fitnessItems, "FITNESS")}
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Render features mega menu
     */
    renderFeatureItemsMegaMenu(featureItems) {
      console.log("[NavigationLinks] Rendering features mega menu");
      console.log("[NavigationLinks] Feature items:", featureItems);
      console.log(
        "[NavigationLinks] Number of features:",
        featureItems?.length || 0
      );

      if (!featureItems || featureItems.length === 0) return "";

      // Group items into categories based on their position
      const categories = {
        "RUN YOUR BUSINESS": [],
        "ELEVATE CLIENT EXPERIENCE": [],
        "GROW YOUR BUSINESS": [],
        "SIMPLIFY PAYMENTS": [],
        "BUILD YOUR BRAND": [],
      };

      // You can customize this mapping based on your actual feature names
      featureItems.forEach((item) => {
        if (
          item.name.includes("Calendar") ||
          item.name.includes("Payroll") ||
          item.name.includes("Reports") ||
          item.name.includes("Rent") ||
          item.name.includes("Forms")
        ) {
          categories["RUN YOUR BUSINESS"].push(item);
        } else if (
          item.name.includes("Booking") ||
          item.name.includes("Connect") ||
          item.name.includes("Notifications") ||
          item.name.includes("Stream") ||
          item.name.includes("Apps")
        ) {
          categories["ELEVATE CLIENT EXPERIENCE"].push(item);
        } else if (
          item.name.includes("Marketplace") ||
          item.name.includes("Store") ||
          item.name.includes("Memberships") ||
          item.name.includes("Inventory") ||
          item.name.includes("Capital")
        ) {
          categories["GROW YOUR BUSINESS"].push(item);
        } else if (
          item.name.includes("PayPro") ||
          item.name.includes("Pay Later") ||
          item.name.includes("Invoices") ||
          item.name.includes("Payments")
        ) {
          categories["SIMPLIFY PAYMENTS"].push(item);
        } else {
          categories["BUILD YOUR BRAND"].push(item);
        }
      });

      const renderCategory = (title, items) => {
        if (items.length === 0) return "";

        const itemsHtml = items
          .map(
            (item) => `
          <div class="flex items-start p-2 hover:bg-gray-50 rounded">
            ${
              item.iconImage?.url
                ? `<img src="${item.iconImage.url}" alt="${item.name}" class="w-5 h-5 mr-3 mt-0.5" />`
                : `<div class="w-5 h-5 mr-3 mt-0.5"></div>`
            }
            <a href="${
              item.link
            }" class="text-sm text-gray-700 hover:text-gray-900">
              ${item.name}
            </a>
          </div>
        `
          )
          .join("");

        return `
        <div>
          <h4 class="text-xs font-semibold mb-4" style="color:#D43C2E">${title}</h4>
          <div class="space-y-2">
            ${itemsHtml}
          </div>
        </div>
      `;
      };

      // Calculate position of the navigation bar
      const navBar = document.getElementById("navigation-menu");
      const navBarRect = navBar?.getBoundingClientRect();
      const navBarBottom = navBarRect ? navBarRect.bottom + window.scrollY : 64;

      return `
      <div class="absolute bg-white shadow-lg border-b border-gray-200" style="
        top: ${navBarBottom}px; 
        left: 0; 
        right: 0; 
        width: 100vw;
        min-height: 300px;
        z-index: 50;
        position: fixed;
      ">
        <div class="max-w-6xl mx-auto px-8 py-12">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            ${Object.entries(categories)
              .map(([title, items]) => renderCategory(title, items))
              .join("")}
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Render features dropdown menu (simple dropdown version)
     */
    renderFeaturesDropdown(featuresItems) {
      console.log("[NavigationLinks] Rendering features dropdown");
      console.log("[NavigationLinks] Features items:", featuresItems);
      console.log(
        "[NavigationLinks] Number of features:",
        featuresItems?.length || 0
      );

      if (!featuresItems || featuresItems.length === 0) return "";

      const itemsHtml = featuresItems
        .map(
          (item) => `
        <li>
          <a href="${
            item.link
          }" class="flex items-start p-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
            ${
              item.iconImage?.url
                ? `<img src="${item.iconImage.url}" alt="${item.name}" class="w-6 h-6 mr-3 mt-0.5" />`
                : ""
            }
            <div>
              <div class="font-medium">${item.name}</div>
              ${
                item.description
                  ? `<div class="text-gray-500 text-xs mt-1">${item.description}</div>`
                  : ""
              }
            </div>
          </a>
        </li>
      `
        )
        .join("");

      return `
      <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0">
        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div class="relative bg-white px-5 py-6 sm:p-8 max-w-4xl mx-auto">
            <ul class="space-y-2">
              ${itemsHtml}
            </ul>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Update navigation menu in the header
     */
    async updateNavigationMenu() {
      console.log("[NavigationLinks] Starting updateNavigationMenu...");
      try {
        const navigationMenu = await this.fetchNavigationMenu();
        console.log("[NavigationLinks] Fetched navigation menu:", navigationMenu);

        // Validate navigation menu data
        if (!navigationMenu) {
          console.error("[NavigationLinks] No navigation menu data received!");
          this.showFallbackContent();
          return;
        }

        // Log what data we actually have
        console.log("[NavigationLinks] Data structure check:");
        console.log(
          "  - beautyItems:",
          navigationMenu.beautyItems?.length || 0,
          "items"
        );
        console.log(
          "  - wellnessItems:",
          navigationMenu.wellnessItems?.length || 0,
          "items"
        );
        console.log(
          "  - fitnessItems:",
          navigationMenu.fitnessItems?.length || 0,
          "items"
        );
        console.log(
          "  - featureItems:",
          navigationMenu.featureItems?.length || 0,
          "items"
        );

        // Update Business Types dropdown
        const businessTypesContainer = document.getElementById(
          "business-types-dropdown"
        );
        console.log(
          "[NavigationLinks] Business types container found:",
          !!businessTypesContainer
        );
        if (businessTypesContainer) {
          const businessTypesHTML = this.renderBusinessTypesMegaMenu(
            navigationMenu.beautyItems || [],
            navigationMenu.wellnessItems || [],
            navigationMenu.fitnessItems || []
          );
          console.log(
            "[NavigationLinks] Business types HTML length:",
            businessTypesHTML.length
          );

          // Clear existing content
          businessTypesContainer.innerHTML = "";

          // Create the mega menu and append to body for true full width
          const businessMegaMenuWrapper = document.createElement("div");
          businessMegaMenuWrapper.id = "business-types-mega-menu-wrapper";
          businessMegaMenuWrapper.innerHTML = businessTypesHTML;

          // Remove any existing mega menu
          const existingBusinessMegaMenu = document.getElementById(
            "business-types-mega-menu-wrapper"
          );
          if (existingBusinessMegaMenu) {
            existingBusinessMegaMenu.remove();
          }

          // Append to body for true full viewport width
          document.body.appendChild(businessMegaMenuWrapper);

          // Add hover behavior for Business Types button and mega menu
          this.setupBusinessTypesMegaMenuBehavior();

          // Add a placeholder div to the original container to maintain hover behavior
          businessTypesContainer.innerHTML = `<div id="business-types-placeholder" style="position: absolute; top: 100%; left: 0; width: 1px; height: 1px;"></div>`;
        }

        // Update Features dropdown
        const featuresContainer = document.getElementById("features-dropdown");
        console.log(
          "[NavigationLinks] Features container found:",
          !!featuresContainer
        );
        if (featuresContainer) {
          const featuresHTML = this.renderFeatureItemsMegaMenu(
            navigationMenu.featureItems || []
          );
          console.log(
            "[NavigationLinks] Features HTML length:",
            featuresHTML.length
          );

          // Clear existing content
          featuresContainer.innerHTML = "";

          // Create the mega menu and append to body for true full width
          const megaMenuWrapper = document.createElement("div");
          megaMenuWrapper.id = "features-mega-menu-wrapper";
          megaMenuWrapper.innerHTML = featuresHTML;

          // Remove any existing mega menu
          const existingMegaMenu = document.getElementById(
            "features-mega-menu-wrapper"
          );
          if (existingMegaMenu) {
            existingMegaMenu.remove();
          }

          // Append to body for true full viewport width
          document.body.appendChild(megaMenuWrapper);

          // Add hover behavior for Features button and mega menu
          this.setupFeaturesMegaMenuBehavior();

          // Add a placeholder div to the original container to maintain hover behavior
          featuresContainer.innerHTML = `<div id="features-placeholder" style="position: absolute; top: 100%; left: 0; width: 1px; height: 1px;"></div>`;
        }

        // Update mobile menu items
        this.updateMobileMenu(navigationMenu);
      } catch (error) {
        console.error(
          "[NavigationLinks] Failed to update navigation menu:",
          error
        );
        // Fallback to static content
        this.showFallbackContent();
      }
    }

    /**
     * Update mobile menu with navigation items
     */
    updateMobileMenu(navigationMenu) {
      console.log("[NavigationLinks] Updating mobile menu");
      console.log(
        "[NavigationLinks] Mobile navigation menu data:",
        navigationMenu
      );

      const mobileMenuContainer = document.getElementById(
        "mobile-navigation-items"
      );
      console.log(
        "[NavigationLinks] Mobile menu container found:",
        !!mobileMenuContainer
      );
      if (!mobileMenuContainer) return;

      const renderMobileItems = (items, title) => {
        if (!items || items.length === 0) {
          console.log(`[NavigationLinks] No items for ${title}`);
          return "";
        }

        console.log(
          `[NavigationLinks] Rendering ${items.length} items for ${title}`
        );
        const itemsHtml = items
          .map(
            (item) => `
          <a href="${item.link}" class="block py-2 pl-6 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-charcoal">
            ${item.name}
          </a>
        `
          )
          .join("");

        return `
        <div class="border-t border-gray-200 my-1"></div>
        <div class="px-3 py-2">
          <h4 class="text-sm font-semibold text-gray-900">${title}</h4>
        </div>
        ${itemsHtml}
      `;
      };

      // Find the last static menu item (Resources) to insert dynamic content after it
      const allLinks = mobileMenuContainer.querySelectorAll("a");
      let resourcesLink = null;

      allLinks.forEach((link) => {
        if (link.textContent.trim() === "Resources") {
          resourcesLink = link;
        }
      });

      if (resourcesLink) {
        // Create a container for dynamic items
        const dynamicContainer = document.createElement("div");
        dynamicContainer.id = "dynamic-mobile-menu-items";
        dynamicContainer.innerHTML = `
        ${renderMobileItems(navigationMenu.beautyItems, "Beauty")}
        ${renderMobileItems(navigationMenu.wellnessItems, "Wellness")}
        ${renderMobileItems(navigationMenu.fitnessItems, "Fitness")}
        ${renderMobileItems(navigationMenu.featureItems, "Features")}
      `;

        // Remove any existing dynamic container
        const existingDynamic = document.getElementById(
          "dynamic-mobile-menu-items"
        );
        if (existingDynamic) {
          existingDynamic.remove();
        }

        // Insert after Resources link
        resourcesLink.insertAdjacentElement("afterend", dynamicContainer);
        console.log(
          "[NavigationLinks] Dynamic mobile menu items inserted successfully"
        );
      } else {
        console.warn(
          "[NavigationLinks] Could not find Resources link to insert dynamic items after"
        );
      }
    }

    /**
     * Setup hover behavior for Business Types mega menu
     */
    setupBusinessTypesMegaMenuBehavior() {
      // Find the Business Types button specifically
      const businessTypesButton =
        document.querySelector("button:has(+ #business-types-dropdown)") ||
        Array.from(document.querySelectorAll(".dropdown-toggle")).find((btn) =>
          btn.textContent.trim().includes("Business Types")
        );
      const megaMenu = document.getElementById(
        "business-types-mega-menu-wrapper"
      );

      if (!businessTypesButton || !megaMenu) return;

      let showTimeout;
      let hideTimeout;

      const showMegaMenu = () => {
        clearTimeout(hideTimeout);
        showTimeout = setTimeout(() => {
          megaMenu.style.display = "block";
          businessTypesButton.style.backgroundColor = "#f3f4f6";
          businessTypesButton.style.color = "#D43C2E";
          console.log("[NavigationLinks] Business Types mega menu shown");
        }, 100);
      };

      const hideMegaMenu = () => {
        clearTimeout(showTimeout);
        hideTimeout = setTimeout(() => {
          megaMenu.style.display = "none";
          businessTypesButton.style.backgroundColor = "";
          businessTypesButton.style.color = "";
          console.log("[NavigationLinks] Business Types mega menu hidden");
        }, 300);
      };

      // Show on hover over Business Types button
      businessTypesButton.addEventListener("mouseenter", showMegaMenu);
      businessTypesButton.addEventListener("mouseleave", hideMegaMenu);

      // Keep visible when hovering over mega menu
      megaMenu.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
      });
      megaMenu.addEventListener("mouseleave", hideMegaMenu);

      // Initially hide the mega menu
      megaMenu.style.display = "none";
    }

    /**
     * Setup hover behavior for Features mega menu
     */
    setupFeaturesMegaMenuBehavior() {
      // Find the Features button specifically (not Business Types)
      const featuresButton =
        document.querySelector("button:has(+ #features-dropdown)") ||
        Array.from(document.querySelectorAll(".dropdown-toggle")).find((btn) =>
          btn.textContent.trim().includes("Features")
        );
      const megaMenu = document.getElementById("features-mega-menu-wrapper");

      if (!featuresButton || !megaMenu) return;

      let showTimeout;
      let hideTimeout;

      const showMegaMenu = () => {
        clearTimeout(hideTimeout);
        showTimeout = setTimeout(() => {
          megaMenu.style.display = "block";
          featuresButton.style.backgroundColor = "#f3f4f6";
          featuresButton.style.color = "#D43C2E";
          console.log("[NavigationLinks] Features mega menu shown");
        }, 100);
      };

      const hideMegaMenu = () => {
        clearTimeout(showTimeout);
        hideTimeout = setTimeout(() => {
          megaMenu.style.display = "none";
          featuresButton.style.backgroundColor = "";
          featuresButton.style.color = "";
          console.log("[NavigationLinks] Features mega menu hidden");
        }, 300);
      };

      // Show on hover over Features button
      featuresButton.addEventListener("mouseenter", showMegaMenu);
      featuresButton.addEventListener("mouseleave", hideMegaMenu);

      // Keep visible when hovering over mega menu
      megaMenu.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
      });
      megaMenu.addEventListener("mouseleave", hideMegaMenu);

      // Initially hide the mega menu
      megaMenu.style.display = "none";
    }

    /**
     * Show fallback content when API fails
     */
    showFallbackContent() {
      const businessTypesContainer = document.getElementById(
        "business-types-dropdown"
      );
      if (businessTypesContainer) {
        businessTypesContainer.innerHTML = `
        <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 bg-white">
          <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-3 max-w-6xl mx-auto">
              <div class="px-4 py-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Beauty</h3>
                <ul class="space-y-1">
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Hair Salons</a></li>
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Nail Salons</a></li>
                </ul>
              </div>
              <div class="px-4 py-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Wellness</h3>
                <ul class="space-y-1">
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Massage Therapy</a></li>
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Spa Services</a></li>
                </ul>
              </div>
              <div class="px-4 py-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Fitness</h3>
                <ul class="space-y-1">
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Personal Training</a></li>
                  <li><a href="#" class="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">Yoga Classes</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
      }

      const featuresContainer = document.getElementById("features-dropdown");
      if (featuresContainer) {
        featuresContainer.innerHTML = `
        <div class="absolute left-0 z-10 mt-2 w-screen transform px-2 sm:px-0">
          <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div class="relative bg-white px-5 py-6 sm:p-8 max-w-4xl mx-auto">
              <ul class="space-y-2">
                <li><a href="#" class="flex items-start p-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                  <div>
                    <div class="font-medium">Online Booking</div>
                    <div class="text-gray-500 text-xs mt-1">Easy appointment scheduling</div>
                  </div>
                </a></li>
                <li><a href="#" class="flex items-start p-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                  <div>
                    <div class="font-medium">Payment Processing</div>
                    <div class="text-gray-500 text-xs mt-1">Secure payment handling</div>
                  </div>
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      `;
      }
    }

    /**
     * Initialize navigation menu with retry logic
     */
    async init() {
      let attempts = 0;

      while (attempts < this.options.retries) {
        try {
          await this.updateNavigationMenu();
          return; // Success
        } catch (error) {
          attempts++;
          if (attempts < this.options.retries) {
            console.log(
              `Retrying navigation menu fetch (${attempts}/${this.options.retries})...`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          } else {
            console.error("Failed to load navigation menu after all retries");
            this.showFallbackContent();
          }
        }
      }
    }

    /**
     * Debug method to test navigation menu fetching
     */
    async debugFetch() {
      console.log("[NavigationLinks DEBUG] Testing navigation menu fetch...");
      try {
        const menu = await this.fetchNavigationMenu();
        console.log("[NavigationLinks DEBUG] Successfully fetched menu:", menu);

        if (menu) {
          console.log("[NavigationLinks DEBUG] Menu structure:");
          Object.keys(menu).forEach((key) => {
            const items = menu[key];
            console.log(
              `  - ${key}:`,
              Array.isArray(items) ? `${items.length} items` : "not an array"
            );
            if (Array.isArray(items) && items.length > 0) {
              console.log(`    Sample item:`, items[0]);
            }
          });
        }
        return menu;
      } catch (error) {
        console.error("[NavigationLinks DEBUG] Failed to fetch:", error);
        throw error;
      }
    }
  }

  // Make NavigationLinksManager globally available
  window.NavigationLinksManager = NavigationLinksManager;

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    console.log(
      "[NavigationLinks] DOM Content Loaded - Initializing navigation links..."
    );

    // Replace with your actual Hygraph endpoint
    const HYGRAPH_ENDPOINT =
      "https://us-west-2.cdn.hygraph.com/content/cld3gw4bb0hr001ue9afzcunb/master";

    const navigationManager = new NavigationLinksManager(HYGRAPH_ENDPOINT, {
      timeout: 8000,
      retries: 2,
    });

    // Make navigation manager globally available for debugging
    window.navigationManager = navigationManager;

    // Debug functions for mega menus
    window.showBusinessTypesMenu = function () {
      const megaMenu = document.getElementById(
        "business-types-mega-menu-wrapper"
      );
      if (megaMenu) {
        megaMenu.style.display = "block";
        console.log("[DEBUG] Business Types mega menu forced to show");
      } else {
        console.log("[DEBUG] Business Types mega menu not found");
      }
    };

    window.hideBusinessTypesMenu = function () {
      const megaMenu = document.getElementById(
        "business-types-mega-menu-wrapper"
      );
      if (megaMenu) {
        megaMenu.style.display = "none";
        console.log("[DEBUG] Business Types mega menu hidden");
      } else {
        console.log("[DEBUG] Business Types mega menu not found");
      }
    };

    window.showFeaturesMenu = function () {
      const megaMenu = document.getElementById("features-mega-menu-wrapper");
      if (megaMenu) {
        megaMenu.style.display = "block";
        console.log("[DEBUG] Features mega menu forced to show");
      } else {
        console.log("[DEBUG] Features mega menu not found");
      }
    };

    window.hideFeaturesMenu = function () {
      const megaMenu = document.getElementById("features-mega-menu-wrapper");
      if (megaMenu) {
        megaMenu.style.display = "none";
        console.log("[DEBUG] Features mega menu hidden");
      } else {
        console.log("[DEBUG] Features mega menu not found");
      }
    };

    console.log(
      "[NavigationLinks] Navigation manager created, starting initialization..."
    );
    console.log(
      "[NavigationLinks] For debugging, use: window.navigationManager.debugFetch()"
    );
    console.log("[NavigationLinks] Debug commands available:");
    console.log(
      "  - Business Types: window.showBusinessTypesMenu() / window.hideBusinessTypesMenu()"
    );
    console.log(
      "  - Features: window.showFeaturesMenu() / window.hideFeaturesMenu()"
    );

    // Initialize navigation menu
    navigationManager.init();
  });

})();
