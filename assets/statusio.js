// Only run the script if we're on the exact support page path
if (window.location.pathname === '/hc/en-us/' || window.location.pathname === '/hc/en-us') {
  document.addEventListener('DOMContentLoaded', function() {
    const statusBar = document.getElementById('statusio-bar');
    const statusMessage = document.getElementById('statusio-message');
    const statusIcon = document.querySelector('.statusio-icon');
    
    if (!statusBar || !statusMessage) return;
    
    // Status API endpoint and status page URL
    const statusioApiUrl = 'https://status.vagaro.com/api/v2/status.json';
    const statusPageUrl = 'https://status.vagaro.com/';
    
    // Make status bar clickable
    statusBar.addEventListener('click', function() {
      window.open(statusPageUrl, '_blank');
    });
    
    // Add keyboard accessibility
    statusBar.addEventListener('keydown', function(event) {
      // Handle Enter or Space key
      if (event.key === 'Enter' || event.key === ' ' || event.keyCode === 13 || event.keyCode === 32) {
        event.preventDefault();
        window.open(statusPageUrl, '_blank');
      }
    });
    
    const updateStatusIndicator = async () => {
      try {
        const response = await fetch(statusioApiUrl);
        const data = await response.json();
        
        if (!data || !data.status) {
          statusMessage.textContent = 'Status information unavailable';
          return;
        }
        
        // Update the status message
        statusMessage.textContent = data.status.description;
        
        // Reset status bar classes and apply default styling
        statusBar.className = 'statusio-bar w-full z-0';
        statusBar.setAttribute('role', 'button');
        statusBar.setAttribute('tabindex', '0');
        statusBar.setAttribute('aria-label', 'Click to view Vagaro system status page');
        statusBar.setAttribute('title', 'Click to view Vagaro system status page');
        
        // Apply inline styles based on status indicator
        switch (data.status.indicator) {
          case 'minor':
            if (statusIcon) {
              statusIcon.style.backgroundColor = '#f6d644';
            }
            statusBar.style.backgroundColor = '#f6d644';
            break;
          case 'major':
            if (statusIcon) {
              statusIcon.style.backgroundColor = '#d83f34';
            }
            statusBar.style.backgroundColor = '#d83f34';
            break;
          case 'critical':
            if (statusIcon) {
              statusIcon.style.backgroundColor = '#d83f34';
            }
            statusBar.style.backgroundColor = '#d83f34';
            break;
          case 'maintenance':
            if (statusIcon) {
              statusIcon.style.backgroundColor = '#3498db';
            }
            statusBar.style.backgroundColor = '#3498db';
            break;
          case 'none':
          default:
            // Operational status - use default CSS styling
            if (statusIcon) {
              statusIcon.style.backgroundColor = '#379B55';
            }
            statusBar.style.backgroundColor = '#D7EBDD';
            break;
        }
      } catch (error) {
        console.error('Error updating status:', error);
        statusMessage.textContent = 'Status information unavailable';
      }
    };

    // Run the update immediately
    updateStatusIndicator();

    // Update every 5 minutes
    setInterval(updateStatusIndicator, 5 * 60 * 1000);
  });
}

// Export default for ES module
export default {}; 