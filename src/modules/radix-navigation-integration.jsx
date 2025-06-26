import React from 'react';
import ReactDOM from 'react-dom';
import NavigationMenuDemo from './radix.jsx';

// Function to mount the Radix Navigation Menu
export function mountRadixNavigation() {
  const mountPoint = document.getElementById('radix-navigation-root');
  const fallbackNav = document.getElementById('fallback-navigation');
  
  if (mountPoint) {
    // Mount the React component
    ReactDOM.render(<NavigationMenuDemo />, mountPoint);
    
    // Hide the fallback navigation
    if (fallbackNav) {
      fallbackNav.style.display = 'none';
    }
    
    console.log('[Radix Navigation] Successfully mounted');
    return true;
  }
  
  console.error('[Radix Navigation] Mount point not found');
  return false;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountRadixNavigation);
} else {
  // DOM is already ready
  mountRadixNavigation();
}

// Export for use in other modules
window.mountRadixNavigation = mountRadixNavigation;