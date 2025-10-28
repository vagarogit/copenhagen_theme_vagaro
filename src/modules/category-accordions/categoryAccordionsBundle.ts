import {
  initVanillaAccordions,
  initSubTopicAccordions,
} from "./vanillaAccordion";
import { loadAllArticles } from "./loadAllArticles";

// Initialize accordions when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initVanillaAccordions();
  initSubTopicAccordions();

  // Add a small delay to ensure accordions are fully rendered
  setTimeout(() => {
    loadAllArticles();
  }, 100);
});
