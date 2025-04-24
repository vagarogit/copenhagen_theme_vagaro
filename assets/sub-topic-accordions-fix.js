// Fix for sub-topic accordions
(function() {
  // Run this right after page load to ensure all other scripts have run
  window.addEventListener('load', function() {
    // If there are any accordions with the collapse class already in the HTML
    const subTopicAccordions = document.querySelectorAll('.section.accordion.sub-topic');
    if (!subTopicAccordions.length) return;
    
    console.log('Found sub-topic accordions:', subTopicAccordions.length);
    
    subTopicAccordions.forEach(function(accordion, index) {
      const panelHeading = accordion.querySelector('.panel-heading');
      const panelBody = accordion.querySelector('.panel-body');
      
      if (!panelHeading || !panelBody) return;
      
      // Make sure the heading is clickable
      panelHeading.style.cursor = 'pointer';
      
      // Add transition for smooth animation
      panelBody.style.transition = "height 0.35s ease-in-out";
      
      // Ensure icon rotates on expansion
      const icon = panelHeading.querySelector('.accordion-icon');
      if (icon) {
        icon.style.transition = "transform 0.35s ease-in-out";
      }
      
      // Remove existing click listeners if any
      const newPanelHeading = panelHeading.cloneNode(true);
      panelHeading.parentNode.replaceChild(newPanelHeading, panelHeading);
      
      // Add explicit click handler for panel headings
      newPanelHeading.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Whether the panel is currently expanded
        const isExpanded = panelBody.style.display !== 'none' && 
                           panelBody.offsetHeight > 0;
        
        if (isExpanded) {
          // Close accordion
          newPanelHeading.setAttribute('aria-expanded', 'false');
          
          // First set explicit height
          panelBody.style.height = panelBody.scrollHeight + 'px';
          
          // Force reflow
          panelBody.offsetHeight;
          
          // Start animation
          panelBody.style.height = '0px';
          
          // Update icon
          const icon = newPanelHeading.querySelector('.accordion-icon');
          if (icon) {
            icon.style.transform = '';
          }
          
          // After animation completes, hide completely
          setTimeout(function() {
            if (newPanelHeading.getAttribute('aria-expanded') === 'false') {
              panelBody.style.display = 'none';
            }
          }, 350);
        } else {
          // Open accordion
          newPanelHeading.setAttribute('aria-expanded', 'true');
          
          // Show panel but with 0 height to start animation
          panelBody.style.display = 'block';
          panelBody.style.height = '0px';
          
          // Force reflow to ensure display change is applied
          panelBody.offsetHeight;
          
          // Set height and start animation
          panelBody.style.height = panelBody.scrollHeight + 'px';
          
          // Update icon
          const icon = newPanelHeading.querySelector('.accordion-icon');
          if (icon) {
            icon.style.transform = 'rotate(180deg)';
          }
          
          // Remove fixed height after animation
          setTimeout(function() {
            if (newPanelHeading.getAttribute('aria-expanded') === 'true') {
              panelBody.style.height = 'auto';
            }
          }, 350);
        }
      });
      
      // Make sure the panel is initially collapsed
      panelBody.style.display = 'none';
      panelBody.style.height = '0px';
      newPanelHeading.setAttribute('aria-expanded', 'false');
      
      // Add keyboard accessibility
      newPanelHeading.setAttribute('tabindex', '0');
      newPanelHeading.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          newPanelHeading.click();
        }
      });
      
      // Add icon if it doesn't exist
      if (!newPanelHeading.querySelector('.accordion-icon')) {
        const icon = document.createElement('span');
        icon.className = 'accordion-icon';
        icon.innerHTML = 
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        icon.style.transition = "transform 0.35s ease-in-out";
        newPanelHeading.appendChild(icon);
      }
    });
  });
})();