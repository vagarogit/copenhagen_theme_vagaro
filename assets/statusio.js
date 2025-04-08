document.addEventListener('DOMContentLoaded', function() {
  const statusBar = document.getElementById('statusio-bar');
  const statusMessage = document.getElementById('statusio-message');
  
  if (!statusBar || !statusMessage) return;
  
  // Status API endpoint
  const statusioApiUrl = 'https://status.vagaro.com/api/v2/status.json';
  
  fetchStatusIoData();
  
  // Fetch status every 5 minutes (300000 ms)
  setInterval(fetchStatusIoData, 300000);
  
  function fetchStatusIoData() {
    fetch(statusioApiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        updateStatusBar(data);
      })
      .catch(error => {
        console.error('Error fetching status data:', error);
        // Set default fallback state if API call fails
        statusBar.className = 'statusio-bar';
        statusMessage.textContent = 'Status information unavailable';
      });
  }
  
  function updateStatusBar(data) {
    // Reset classes
    statusBar.className = 'statusio-bar';
    
    // Check if we have valid data
    if (!data || !data.status) {
      statusMessage.textContent = 'Status information unavailable';
      return;
    }
    
    // Map the status indicator to class names
    let statusClass = '';
    let statusText = data.status.description || 'Status: Unknown';
    
    switch (data.status.indicator) {
      case 'none':
        statusClass = 'operational';
        break;
      case 'minor':
        statusClass = 'degraded';
        break;
      case 'major':
        statusClass = 'partial-outage';
        break;
      case 'critical':
        statusClass = 'major-outage';
        break;
      case 'maintenance':
        statusClass = 'maintenance';
        break;
      default:
        // Keep the default empty class
    }
    
    // Apply the class and text
    if (statusClass) {
      statusBar.classList.add(statusClass);
    }
    
    statusMessage.textContent = statusText;
  }
}); 