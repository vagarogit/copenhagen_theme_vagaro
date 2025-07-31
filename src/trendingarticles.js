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

        // Use the pre-configured arrow SVG path
        var arrowPath = window.arrowUpRightSvg || "/assets/arrow-up-right.svg";
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
