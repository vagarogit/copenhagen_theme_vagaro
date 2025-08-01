/* eslint-disable */
// Debug: Log when script loads
console.log('[StatusIO] Script loaded, waiting for DOM...');

// Wait for DOM to be ready, then check for statusio-bar
document.addEventListener('DOMContentLoaded', function() {
  console.log('[StatusIO] DOM loaded, checking for statusio-bar element');

  const statusBar = document.getElementById('statusio-bar');
  const statusMessage = document.getElementById('statusio-message');
  const statusIcon = document.querySelector('.statusio-icon');

  // Only run the script if statusio-bar exists on this page
  if (!statusBar || !statusMessage) {
    console.log('[StatusIO] StatusIO elements not found on this page, skipping initialization');
    return;
  }

  console.log('[StatusIO] StatusIO elements found, initializing status checker');

    // Status API endpoint and status page URL
    const statusioApiUrl = 'https://status.vagaro.com/api/v2/status.json';
    const statusPageUrl = 'https://status.vagaro.com/';

    // Configuration
    const CONFIG = {
      timeout: 10000, // 10 seconds
      maxRetries: 3,
      retryDelay: 1000, // Start with 1 second
      loadingTimeout: 15000, // 15 seconds before showing fallback
      updateInterval: 5 * 60 * 1000, // 5 minutes
    };

    // State management
    let retryCount = 0;
    let isLoading = false;
    let loadingTimeoutId = null;
    let updateIntervalId = null;

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

    // Utility function to sleep/delay
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Set loading state
    const setLoadingState = () => {
      if (isLoading) return;

      isLoading = true;
      statusMessage.textContent = 'Checking system status...';

      // Add loading class for visual feedback
      statusBar.className = 'statusio-bar w-full z-0 loading';
      if (statusIcon) {
        statusIcon.style.backgroundColor = '#6c757d';
      }

      // Set a timeout to show fallback message if loading takes too long
      loadingTimeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn('[StatusIO] Loading timeout reached, showing fallback');
          setFallbackState();
        }
      }, CONFIG.loadingTimeout);
    };

    // Clear loading state
    const clearLoadingState = () => {
      isLoading = false;
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        loadingTimeoutId = null;
      }
    };

    // Set error state
    const setErrorState = (error) => {
      clearLoadingState();
      console.error('[StatusIO] Error updating status:', error);
      statusMessage.textContent = 'Status information unavailable';

      // Apply error class and styling
      statusBar.className = 'statusio-bar w-full z-0 error';
      statusBar.setAttribute('role', 'button');
      statusBar.setAttribute('tabindex', '0');
      statusBar.setAttribute('aria-label', 'Click to view Vagaro system status page');
      statusBar.setAttribute('title', 'Click to view Vagaro system status page');

      if (statusIcon) {
        statusIcon.style.backgroundColor = '#6c757d'; // Gray for unknown
      }
      statusBar.style.backgroundColor = '#f8f9fa'; // Light gray background
    };

    // Set fallback state when API is consistently unavailable
    const setFallbackState = () => {
      clearLoadingState();
      console.warn('[StatusIO] Using fallback state');
      statusMessage.textContent = 'Visit status page for latest updates';

      // Apply fallback styling (similar to error but different message)
      statusBar.className = 'statusio-bar w-full z-0 error';
      statusBar.setAttribute('role', 'button');
      statusBar.setAttribute('tabindex', '0');
      statusBar.setAttribute('aria-label', 'Click to view Vagaro system status page');
      statusBar.setAttribute('title', 'Click to view Vagaro system status page');

      if (statusIcon) {
        statusIcon.style.backgroundColor = '#6c757d';
      }
      statusBar.style.backgroundColor = '#f8f9fa';
    };

    // Apply status styling based on indicator
    const applyStatusStyling = (indicator) => {
      // Reset status bar classes and apply default styling
      statusBar.className = 'statusio-bar w-full z-0';
      statusBar.setAttribute('role', 'button');
      statusBar.setAttribute('tabindex', '0');
      statusBar.setAttribute('aria-label', 'Click to view Vagaro system status page');
      statusBar.setAttribute('title', 'Click to view Vagaro system status page');

      // Apply inline styles based on status indicator
      switch (indicator) {
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
    };

    // Fetch status with timeout and retry logic
    const fetchStatusWithRetry = async (attempt = 1) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

      try {
        console.log(`[StatusIO] Fetching status (attempt ${attempt}/${CONFIG.maxRetries})`);
        console.log(`[StatusIO] Fetching from URL: ${statusioApiUrl}`);

        const response = await fetch(statusioApiUrl, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        console.log(`[StatusIO] Response received:`, response.status, response.statusText);

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[StatusIO] Response data:`, data);

        if (!data || !data.status) {
          console.error('[StatusIO] Invalid response format:', data);
          throw new Error('Invalid response format: missing status data');
        }

        console.log(`[StatusIO] Status data:`, data.status);
        return data;

      } catch (error) {
        clearTimeout(timeoutId);

        // Handle different types of errors
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${CONFIG.timeout}ms`);
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to status API');
        }

        throw error;
      }
    };

    // Main update function with retry logic
    const updateStatusIndicator = async () => {
      // Don't start a new update if one is already in progress
      if (isLoading) {
        console.log('[StatusIO] Update already in progress, skipping');
        return;
      }

      setLoadingState();
      retryCount = 0;

      while (retryCount < CONFIG.maxRetries) {
        try {
          const data = await fetchStatusWithRetry(retryCount + 1);

          // Success! Update the UI
          clearLoadingState();
          retryCount = 0; // Reset retry count on success

          statusMessage.textContent = data.status.description;
          applyStatusStyling(data.status.indicator);

          console.log('[StatusIO] Status updated successfully:', data.status.description);
          return;

        } catch (error) {
          retryCount++;
          console.warn(`[StatusIO] Attempt ${retryCount} failed:`, error.message);

          if (retryCount < CONFIG.maxRetries) {
            // Calculate exponential backoff delay
            const delay = CONFIG.retryDelay * Math.pow(2, retryCount - 1);
            console.log(`[StatusIO] Retrying in ${delay}ms...`);
            await sleep(delay);
          } else {
            // All retries exhausted
            console.error('[StatusIO] All retry attempts failed');
            setErrorState(error);
            return;
          }
        }
      }
    };

    // Initialize status checking
    const initializeStatusChecker = () => {
      console.log('[StatusIO] Initializing status checker');
      console.log('[StatusIO] API URL:', statusioApiUrl);
      console.log('[StatusIO] Current pathname:', window.location.pathname);

      // Run the update immediately
      updateStatusIndicator();

      // Set up periodic updates
      updateIntervalId = setInterval(() => {
        console.log('[StatusIO] Running scheduled update');
        updateStatusIndicator();
      }, CONFIG.updateInterval);
    };

    // Cleanup function
    const cleanup = () => {
      console.log('[StatusIO] Cleaning up status checker');

      if (updateIntervalId) {
        clearInterval(updateIntervalId);
        updateIntervalId = null;
      }

      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        loadingTimeoutId = null;
      }

      isLoading = false;
      retryCount = 0;
    };

    // Handle page visibility changes to pause/resume updates
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[StatusIO] Page hidden, pausing updates');
        if (updateIntervalId) {
          clearInterval(updateIntervalId);
          updateIntervalId = null;
        }
      } else {
        console.log('[StatusIO] Page visible, resuming updates');
        if (!updateIntervalId) {
          // Resume periodic updates
          updateIntervalId = setInterval(() => {
            console.log('[StatusIO] Running scheduled update');
            updateStatusIndicator();
          }, CONFIG.updateInterval);

          // Also run an immediate update if it's been a while
          updateStatusIndicator();
        }
      }
    };

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up on page unload
    window.addEventListener('beforeunload', cleanup);

    // Initialize the status checker
    initializeStatusChecker();
  });
