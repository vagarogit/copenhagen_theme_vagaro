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
      
      // Make sure content is visible when opened (fixing the key issue)
      panelBody.style.overflow = 'visible';
      
      // Remove the 'collapse' class which might be causing styling issues
      // but keep the panel hidden initially
      panelBody.classList.remove('collapse');
      panelBody.style.display = 'none';
      panelBody.style.height = '0px';
      
      // Add transition for smooth animation
      panelBody.style.transition = "height 0.35s ease-in-out";
      
      // Reset any problematic styles - ensure content is visible when expanded
      panelBody.style.paddingTop = '1rem';
      panelBody.style.paddingBottom = '1rem';
      
      // Force display for all child elements - comprehensive approach
      // Block elements
      const blockElements = panelBody.querySelectorAll('p, div, section, article, header, footer, aside, blockquote');
      blockElements.forEach(el => el.style.display = 'block');
      
      // Ordered lists with proper list style
      const orderedLists = panelBody.querySelectorAll('ol, ol.procedure');
      orderedLists.forEach(list => {
        list.style.display = 'block';
        list.style.listStyleType = 'decimal';
        list.style.paddingLeft = '1.5rem';
        list.style.marginBottom = '1rem';
        
        const items = list.querySelectorAll('li, li.step');
        items.forEach(item => {
          item.style.display = 'list-item';
          item.style.marginBottom = '0.5rem';
        });
      });
      
      // Unordered lists with proper list style
      const unorderedLists = panelBody.querySelectorAll('ul, ul.itemizedlist');
      unorderedLists.forEach(list => {
        list.style.display = 'block';
        list.style.listStyleType = 'disc';
        list.style.paddingLeft = '1.5rem';
        list.style.marginBottom = '1rem';
        
        const items = list.querySelectorAll('li, li.listitem');
        items.forEach(item => {
          item.style.display = 'list-item';
          item.style.marginBottom = '0.5rem';
        });
      });
      
      // Simplified tip handling - we're using CSS custom properties now
      const tips = panelBody.querySelectorAll('.tip');
      tips.forEach(tip => {
        // Just make sure tips are visible, the CSS handles the styling
        tip.style.display = 'block';
      });
      
      // Ensure links are visible
      const links = panelBody.querySelectorAll('a, a.link');
      links.forEach(link => {
        link.style.color = '#2563eb';
        link.style.textDecoration = 'none';
      });
      
      // Bold elements
      const boldElements = panelBody.querySelectorAll('.bold, strong, b');
      boldElements.forEach(el => {
        el.style.fontWeight = '700';
      });
      
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
          panelBody.style.overflow = 'hidden'; // hide overflow during animation
          panelBody.classList.remove('panel-body-expanded'); // remove expanded class
          
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
          panelBody.style.overflow = 'hidden'; // hide overflow during animation
          
          // Force reflow to ensure display change is applied
          panelBody.offsetHeight;
          
          // Set height and start animation
          const height = panelBody.scrollHeight;
          panelBody.style.height = height + 'px';
          
          // Update icon
          const icon = newPanelHeading.querySelector('.accordion-icon');
          if (icon) {
            icon.style.transform = 'rotate(180deg)';
          }
          
          // After animation completes, remove fixed height and show content
          setTimeout(function() {
            if (newPanelHeading.getAttribute('aria-expanded') === 'true') {
              panelBody.style.height = 'auto';
              panelBody.style.overflow = 'visible'; // ensure content is visible
              panelBody.classList.add('panel-body-expanded'); // add special class for expanded state
              
              // Re-apply styles to ensure visibility after animation completes
              const contentElements = panelBody.querySelectorAll('*');
              contentElements.forEach(el => {
                // Remove any styles that might hide content
                if (el.style.display === 'none') {
                  el.style.display = '';
                }
                if (el.style.visibility === 'hidden') {
                  el.style.visibility = 'visible';
                }
                if (el.style.opacity === '0') {
                  el.style.opacity = '1';
                }
              });
              
              // Ensure list items display correctly
              const listItems = panelBody.querySelectorAll('li, li.step, li.listitem');
              listItems.forEach(item => {
                item.style.display = 'list-item';
              });
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