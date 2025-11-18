// Mobile Navigation Integration Script
// This script handles the integration between Zendesk's existing mobile menu button
// and our new React-based mobile navigation component

(function() {
  'use strict';

  // Wait for the navigation integration to be available
  function waitForNavigation() {
    if (window.toggleMobileNavigation && window.updateUserInfo) {
      initializeMobileNavIntegration();
    } else {
      setTimeout(waitForNavigation, 100);
    }
  }

  function initializeMobileNavIntegration() {
    // Update user info from Zendesk context
    updateUserInfoFromZendesk();
    
    // Set up mobile menu button event listeners
    setupMobileMenuButton();
    
    // Listen for Zendesk user state changes
    setupZendeskListeners();
  }

  function updateUserInfoFromZendesk() {
    // Get user info from various Zendesk sources
    const userAvatar = document.querySelector('.user-avatar')?.src || 
                      document.querySelector('[class*="avatar"]')?.src;
    
    const userName = document.querySelector('#user-name')?.textContent?.trim() ||
                    document.querySelector('[data-user-name]')?.textContent?.trim() ||
                    document.querySelector('.user-name')?.textContent?.trim();

    // Check if user is signed in through multiple methods
    const isSignedIn = !!(
      document.body.classList.contains('signed-in') ||
      document.querySelector('.user-avatar') ||
      document.querySelector('#user-name') ||
      window.HelpCenter?.user?.signed_in ||
      // Check for Zendesk's signed_in variable if available
      (typeof signed_in !== 'undefined' && signed_in)
    );

    // Update the mobile navigation with user info
    if (window.updateUserInfo) {
      window.updateUserInfo({
        isSignedIn: isSignedIn,
        userAvatar: userAvatar || null,
        userName: userName || null,
      });
    }
  }

  function setupMobileMenuButton() {
    const mobileMenuButton = document.querySelector('.menu-button-mobile');
    
    if (mobileMenuButton) {
      // Update aria-expanded attribute when mobile nav opens/closes
      const originalToggle = window.toggleMobileNavigation;
      window.toggleMobileNavigation = function() {
        originalToggle();
        
        // Update aria-expanded attribute
        const isOpen = window.mobileNavState?.isOpen;
        mobileMenuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      // Also handle the original navigation.js mobile menu functionality
      // to ensure we don't break existing behavior
      const originalMenuButton = document.querySelector('#user-nav-mobile');
      if (originalMenuButton) {
        // Hide the original mobile menu since we're replacing it
        originalMenuButton.style.display = 'none';
      }
    }
  }

  function setupZendeskListeners() {
    // Listen for Zendesk authentication changes
    if (window.HelpCenter) {
      // Monitor for user state changes
      const originalUserUpdate = window.HelpCenter.user;
      if (originalUserUpdate) {
        // Create a proxy to detect changes
        let userProxy = new Proxy(originalUserUpdate, {
          set: function(target, property, value) {
            target[property] = value;
            if (property === 'signed_in') {
              setTimeout(updateUserInfoFromZendesk, 100);
            }
            return true;
          }
        });
        window.HelpCenter.user = userProxy;
      }
    }

    // Listen for DOM changes that might indicate user state changes
    const observer = new MutationObserver(function(mutations) {
      let shouldUpdate = false;
      
      mutations.forEach(function(mutation) {
        // Check if user-related elements were added/removed
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);
          
          const userRelatedChange = [...addedNodes, ...removedNodes].some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              return node.classList?.contains('user-avatar') ||
                     node.classList?.contains('user-name') ||
                     node.id === 'user-name' ||
                     node.querySelector?.('.user-avatar, .user-name, #user-name');
            }
            return false;
          });
          
          if (userRelatedChange) {
            shouldUpdate = true;
          }
        }
        
        // Check for attribute changes on user elements
        if (mutation.type === 'attributes' && 
            (mutation.target.classList?.contains('user-avatar') ||
             mutation.target.id === 'user-name')) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        setTimeout(updateUserInfoFromZendesk, 100);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class']
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForNavigation);
  } else {
    waitForNavigation();
  }

})();
