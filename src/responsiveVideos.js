/**
 * Optimize YouTube videos for responsive display
 * Targets videos with the structure:
 * <div class="mediaobject">
 *   <div class="video-container">
 *     <div class="videoobject"><iframe src="..."></iframe></div>
 *   </div>
 * </div>
 */

function optimizeYouTubeVideos() {
  const mediaObjects = document.querySelectorAll('.mediaobject .video-container .videoobject iframe');
  
  mediaObjects.forEach(iframe => {
    // Ensure parent container has proper styling
    const videoContainer = iframe.closest('.video-container');
    if (videoContainer) {
      // Apply responsive container styles
      videoContainer.style.position = 'relative';
      videoContainer.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
      videoContainer.style.height = '0';
      videoContainer.style.overflow = 'hidden';
      videoContainer.style.maxWidth = '100%';
      
      // Apply iframe styles
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      
      // Remove fixed dimensions if they exist
      if (iframe.hasAttribute('width')) iframe.removeAttribute('width');
      if (iframe.hasAttribute('height')) iframe.removeAttribute('height');
      
      // Make sure our styles override any inline styles
      iframe.setAttribute('style', 
        'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;');
    }
  });
}

// Run on DOM load
window.addEventListener('DOMContentLoaded', optimizeYouTubeVideos);

// Also run when dynamic content might be loaded
window.addEventListener('load', optimizeYouTubeVideos);

export default optimizeYouTubeVideos;