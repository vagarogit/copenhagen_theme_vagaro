import { loadAllArticles } from "./loadAllArticles.js";

// Load all articles when the DOM is ready (works with CSS-only accordions)
document.addEventListener("DOMContentLoaded", () => {
  loadAllArticles();
});
