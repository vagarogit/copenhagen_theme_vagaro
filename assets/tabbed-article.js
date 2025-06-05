/**
 * Tabbed Article Layout
 * 
 * This script creates a tabbed interface for article content by finding sections with the 
 * "section" class and "sub-topic" class and creating tabs for each section.
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if this is an article with the special tabbed class
  const articleBody = document.querySelector('.article-body.tabbed-layout');
  if (!articleBody) return;

  // Find all section elements with the class "section" and "sub-topic"
  const sections = articleBody.querySelectorAll('.section.sub-topic');
  if (sections.length <= 1) return; // Need at least 2 sections for tabs

  // Create tab container with modern classes
  const tabContainer = document.createElement('div');
  tabContainer.className = 'rounded-lg overflow-hidden shadow-md bg-white mt-6 mb-8';
  
  // Create tab navigation with tailwind classes
  const tabNav = document.createElement('div');
  tabNav.className = 'flex overflow-x-auto border-b border-gray-200';
  tabNav.setAttribute('role', 'tablist');
  
  // Create tab content container
  const tabContent = document.createElement('div');
  tabContent.className = 'p-6';
  
  // Array to store section references
  const tabSections = [];
  
  // Process each section and create tabs
  sections.forEach((section, index) => {
    // Find the heading in the section
    const titlePage = section.querySelector('.titlepage');
    const heading = titlePage ? titlePage.querySelector('h2.title') : null;
    const headingText = heading ? heading.textContent.trim() : `Section ${index + 1}`;
    
    // Create a tab button with tailwind styles
    const tabButton = document.createElement('button');
    tabButton.className = 'px-6 py-3 text-sm font-medium text-gray-600 whitespace-nowrap transition-colors hover:text-primary focus:outline-none';
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tabButton.id = `tab-${index}`;
    tabButton.setAttribute('aria-controls', `tab-panel-${index}`);
    tabButton.textContent = headingText;
    tabNav.appendChild(tabButton);
    
    // Create a content container
    const tabPanel = document.createElement('div');
    tabPanel.className = 'tab-panel';
    tabPanel.id = `tab-panel-${index}`;
    tabPanel.setAttribute('role', 'tabpanel');
    tabPanel.setAttribute('aria-labelledby', `tab-${index}`);
    tabPanel.style.display = index === 0 ? 'block' : 'none';
    
    // Clone the section for the tab panel
    const sectionClone = section.cloneNode(true);
    
    // Hide the original title since it's now in the tab
    const clonedTitlePage = sectionClone.querySelector('.titlepage');
    if (clonedTitlePage) {
      clonedTitlePage.style.display = 'none';
    }
    
    tabPanel.appendChild(sectionClone);
    tabContent.appendChild(tabPanel);
    
    // Store reference to tab and panel
    tabSections.push({ button: tabButton, panel: tabPanel, originalSection: section });
  });
  
  // Add click handlers for tabs
  tabSections.forEach((section, index) => {
    section.button.addEventListener('click', function() {
      // Hide all panels and deselect all tabs
      tabSections.forEach(s => {
        s.panel.style.display = 'none';
        s.button.setAttribute('aria-selected', 'false');
        s.button.classList.remove('border-b-2', 'border-primary', 'text-primary');
      });
      
      // Show selected panel and select tab
      section.panel.style.display = 'block';
      section.button.setAttribute('aria-selected', 'true');
      section.button.classList.add('border-b-2', 'border-primary', 'text-primary');
    });
  });
  
  // Activate first tab
  if (tabSections.length > 0) {
    tabSections[0].button.classList.add('border-b-2', 'border-primary', 'text-primary');
  }
  
  // Insert the tab container before the sections
  tabContainer.appendChild(tabNav);
  tabContainer.appendChild(tabContent);
  
  // Find the first section to insert before it
  const firstSection = sections[0];
  if (firstSection && firstSection.parentNode) {
    firstSection.parentNode.insertBefore(tabContainer, firstSection);
  } else {
    articleBody.prepend(tabContainer);
  }
  
  // Hide the original sections
  sections.forEach(section => {
    section.style.display = 'none';
  });
});