/**
 * Article Table of Contents
 * 
 * This script creates a table of contents sidebar for article content by finding
 * heading elements (h1, h2, h3, h4, h5, h6) and creating navigation links.
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if this is an article page
  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  // Find the TOC containers
  const tocContainer = document.querySelector('#article-toc');
  const tocMobileContainer = document.querySelector('#article-toc-mobile');
  if (!tocContainer && !tocMobileContainer) return;

  // Define excluded IDs
  const excludedIds = ['important', 'note', 'notice', 'tip', 'warning'];
  
  // Find only top-level headings in the article body
  const allHeadings = articleBody.querySelectorAll('h2');
  
  // Filter out headings with excluded IDs
  const headings = Array.from(allHeadings).filter(heading => {
    return !excludedIds.includes(heading.id);
  });
  
  if (headings.length === 0) {
    // Hide TOC if no headings found
    if (tocContainer) tocContainer.style.display = 'none';
    if (tocMobileContainer) tocMobileContainer.style.display = 'none';
    return;
  }

  // Generate unique IDs for headings that don't have them
  const headingData = [];
  headings.forEach((heading) => {
    let id = heading.id;
    if (!id) {
      // Create a slug from the heading text
      const text = heading.textContent.trim();
      id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      // Ensure uniqueness
      let uniqueId = id;
      let counter = 1;
      while (document.getElementById(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      
      heading.id = uniqueId;
      id = uniqueId;
    }

    // Skip headings with excluded IDs
    if (excludedIds.includes(id)) {
      return;
    }

    headingData.push({
      element: heading,
      id: id,
      text: heading.textContent.trim(),
      level: parseInt(heading.tagName.charAt(1))
    });
  });

  // Create TOC HTML
  const tocList = document.createElement('ul');
  tocList.className = 'space-y-2';

  headingData.forEach(heading => {
    const listItem = document.createElement('li');
    listItem.className = 'mb-3';

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.text;
    link.className = 'block py-1 text-black hover:text-gray-900 transition-colors border-l-2 border-transparent pl-3 -ml-3 font-normal text-base';
    
    // Add click handler for smooth scrolling
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById(heading.id);
      if (target) {
        // Smooth scroll to the target
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL hash
        history.pushState(null, null, `#${heading.id}`);
        
        // Update active state
        updateActiveLink(link);
      }
    });

    listItem.appendChild(link);
    tocList.appendChild(listItem);
  });

  // Create TOC content function
  function createTOCContent(container, isMobile = false) {
    const tocTitle = document.createElement('h3');
    tocTitle.textContent = 'What’s in this article?';
    tocTitle.className = isMobile 
      ? 'text-2xl font-semibold text-gray-700 mb-4'
      : 'text-2xl font-semibold text-black tracking-normal mb-6 sticky top-0 bg-white py-2';

    const tocListClone = tocList.cloneNode(true);
    
    container.appendChild(tocTitle);
    container.appendChild(tocListClone);
  }

  // Add TOC to both containers
  if (tocContainer) createTOCContent(tocContainer, false);
  if (tocMobileContainer) createTOCContent(tocMobileContainer, true);

  // Function to update active link based on scroll position
  function updateActiveLink(activeLink = null) {
    // Update links in both containers
    const allContainers = [tocContainer, tocMobileContainer].filter(Boolean);
    
    allContainers.forEach(container => {
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        link.classList.remove('text-primary', 'border-primary', 'font-normal');
        link.classList.add('text-gray-600', 'border-transparent');
      });
    });
    
    if (activeLink) {
      activeLink.classList.remove('text-gray-600', 'border-transparent');
      activeLink.classList.add('text-primary', 'border-primary', 'font-normal');
      return;
    }

    // Find the currently visible heading
    let currentHeading = null;
    const scrollPosition = window.scrollY + 100; // Offset for header

    for (let i = headingData.length - 1; i >= 0; i--) {
      const heading = headingData[i];
      const headingElement = heading.element;
      const headingTop = headingElement.offsetTop;
      
      if (scrollPosition >= headingTop) {
        currentHeading = heading;
        break;
      }
    }

    if (currentHeading) {
      allContainers.forEach(container => {
        const activeLink = container.querySelector(`a[href="#${currentHeading.id}"]`);
        if (activeLink) {
          activeLink.classList.remove('text-gray-600', 'border-transparent');
          activeLink.classList.add('text-primary', 'border-primary', 'font-medium');
        }
      });
    }
  }

  // Update active link on scroll
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Set initial active state
  updateActiveLink();

  // Handle direct hash links on page load
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const allContainers = [tocContainer, tocMobileContainer].filter(Boolean);
        allContainers.forEach(container => {
          const activeLink = container.querySelector(`a[href="#${targetId}"]`);
          if (activeLink) {
            updateActiveLink(activeLink);
          }
        });
      }, 100);
    }
  }
});