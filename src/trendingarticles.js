document.addEventListener("DOMContentLoaded", function () {
  console.log("Trending articles loading");
  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "https://asamplitudearticlepollerwus2.azurewebsites.net/amplitude/ampdatazendesk",
    true
  );
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);

      // Create new section for trending articles
      var trendingSection = document.createElement("section");
      trendingSection.className = "trending-articles-api section";

      // Create header
      var header = document.createElement("h2");
      header.className = "text-2xl font-semibold text-gray-900 mb-4";
      header.textContent = "Trending Articles";
      trendingSection.appendChild(header);

      // Create articles container
      var articlesContainer = document.createElement("ul");
      articlesContainer.className =
        "trending-articles-api-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full";

      // Determine arrow image path - using the exposed theme path
      var arrowPath;
      
      if (window.themePath) {
        // Use the pre-configured theme path
        arrowPath = window.themePath + 'arrow-up-right.svg';
      } else {
        // Fallback to the best guess path
        arrowPath = '/assets/arrow-up-right.svg';
      }
      
      console.log("Using arrow path:", arrowPath);

      // Add articles
      for (var i = 0; i < response.length; i++) {
        var articleItem = document.createElement("li");
        articleItem.className =
          "trending-articles-api-item py-2 border border-gray-200 rounded-lg";

        var articleLink = document.createElement("a");
        articleLink.className = "flex items-center p-4";
        articleLink.href = response[i].articleURL;
        articleLink.target = "_blank";

        var titleSpan = document.createElement("span");
        titleSpan.className = "text-gray-900 flex-grow";
        titleSpan.textContent = response[i].articleTitle;

        var arrowImg = document.createElement("img");
        arrowImg.className = "w-3 h-3 flex-shrink-0";
        arrowImg.src = arrowPath;
        arrowImg.alt = "Arrow";

        articleLink.appendChild(titleSpan);
        articleLink.appendChild(arrowImg);
        articleItem.appendChild(articleLink);
        articlesContainer.appendChild(articleItem);
      }

      trendingSection.appendChild(articlesContainer);

      // Insert the new section in the appropriate location
      var categoriesSection = document.getElementById("categories-section");
      if (categoriesSection) {
        var knowledgeBaseSection = categoriesSection.closest(".knowledge-base");
        if (knowledgeBaseSection) {
          knowledgeBaseSection.parentNode.insertBefore(
            trendingSection,
            knowledgeBaseSection.nextSibling
          );
        } else {
          // Fallback - insert before the video section
          var videoSection = document.querySelector(".video-section");
          if (videoSection) {
            videoSection.parentNode.insertBefore(trendingSection, videoSection);
          } else {
            // Last resort - append to the main container
            var container = document.querySelector(".container");
            if (container) {
              container.appendChild(trendingSection);
            }
          }
        }
      }
    } else {
      console.error("Failed to load trending articles: " + xhr.statusText);
    }
  };
  xhr.onerror = function () {
    console.error("Error fetching trending articles: " + xhr.statusText);
  };
  xhr.send();
});
