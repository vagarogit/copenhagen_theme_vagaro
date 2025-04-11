document.addEventListener("DOMContentLoaded", function () {
  console.log("document recognized");
  var articleContainer = document.querySelector(".promoted-articles");
  articleContainer.innerHTML = "";
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
      for (var i = 0; i < response.length; i++) {
        var addAttribute = document.createElement("li");
        var addElement = document.createElement("a");
        addAttribute.className = "promoted-articles-item";
        addElement.innerHTML = response[i].articleTitle;
        addElement.href = response[i].articleURL;
        addElement.target = "_blank";
        articleContainer.appendChild(addAttribute);
        addAttribute.appendChild(addElement);
      }
    } else {
      console.error(xhr.statusText);
    }
  };
  xhr.onerror = function () {
    console.error(xhr.statusText);
  };
  xhr.send();
});
