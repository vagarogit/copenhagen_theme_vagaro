# Mobile CTA Banner

## Overview

A dynamic, sticky CTA banner that appears on mobile devices, inspired by the MobileCtaBanner component from the Sales_Pages_App. This banner intelligently shows/hides based on user scroll behavior and hero section visibility.

**Implementation**: Pure vanilla JavaScript (no React dependencies) - lightweight and performant.

## Features

- **Scroll-aware**: Shows when user scrolls down past the hero section, hides when scrolling up
- **Smart positioning**: Only appears after scrolling past 100px to avoid interference with initial page view
- **Liquid glass design**: Apple-inspired glass morphism with backdrop blur and subtle animations
- **Smooth transitions**: CSS-based animations for elegant show/hide behavior
- **Responsive**: Only displays on mobile/tablet viewports (< 1024px)
- **Accessibility**: Proper ARIA attributes and semantic HTML

## Files Created

### 1. `/src/modules/mobile-cta-banner.jsx`
A vanilla JavaScript class that creates and manages the sticky CTA banner.

**Options (constructor):**
- `ctaUrl` (string): URL for the CTA button (default: "https://www.vagaro.com/signup-1?licence=1")
- `ctaText` (string): Text displayed in the CTA button (default: "Start Free Trial")
- `heroSelector` (string): CSS selector for the hero section to track (default: "[data-hero-section]")
- `topOffset` (string): Distance from top when visible (default: "60px")

**Methods:**
- `init()`: Creates banner and sets up event listeners
- `createBanner()`: Generates the DOM element for the banner
- `setupScrollListener()`: Tracks scroll direction
- `setupHeroObserver()`: Uses IntersectionObserver for hero section tracking
- `updateBannerVisibility()`: Shows/hides banner based on state
- `destroy()`: Removes banner and cleans up listeners

**Behavior:**
- Uses `IntersectionObserver` to detect when hero section leaves viewport
- Uses scroll event listener to track scroll direction with a 10px threshold
- Automatically hides when near top of page (< 100px)
- Only initializes on mobile viewports (< 1024px)

### 2. `/src/modules/mobile-cta-banner-integration.js`
The integration script that initializes the banner class instance.

**Features:**
- Creates an instance of the MobileCtaBanner class
- Passes configuration options to the banner
- Exposes global functions for manual control if needed
- Handles cleanup on destroy

### 3. `/styles/_banner.scss`
SCSS styles for the liquid glass effect, including:
- Glass morphism background with gradient
- Backdrop blur and saturation filters
- Pseudo-elements for shimmer effects
- Drift animation for subtle movement
- Box shadows for depth

### 4. Updated Files

#### `/templates/header.hbs`
- Removed the static mobile CTA button (lines 80-86)
- Added comment explaining the replacement with dynamic banner

#### `/rollup.config.mjs`
- Added `mobile-cta-banner` entry to the bundling configuration

#### `/src/index.js`
- Added import for the mobile CTA banner integration

#### `/styles/index.scss`
- Added import for `_banner.scss`

#### `/templates/document_head.hbs`
- Import map already includes the mobile-cta-banner bundle

## How It Works

### 1. Initialization Flow
```
DOM Ready → index.js loads → mobile-cta-banner-integration.js executes
  → Creates MobileCtaBanner instance
  → Checks viewport width (< 1024px for mobile)
  → Creates banner DOM element
  → Sets up scroll listener and IntersectionObserver
  → Adds resize listener for viewport changes
```

### 2. Display Logic

The banner becomes visible when **ALL** of these conditions are met:
- Viewport width < 1024px (mobile/tablet)
- User has scrolled past 100px
- Hero section is NOT visible in viewport
- User is scrolling DOWN (not up)

The banner hides when **ANY** of these conditions are met:
- Viewport width >= 1024px (desktop)
- User scrolls back to top (< 100px)
- Hero section comes back into view
- User is scrolling UP

### 3. Technical Implementation

**Scroll Direction Detection:**
```javascript
const SCROLL_THRESHOLD = 10; // Minimum pixels to consider a direction change
// Compares current scroll position with last recorded position
// Only updates direction if delta exceeds threshold (prevents bounce)
```

**Hero Section Detection:**
```javascript
// Uses IntersectionObserver API for efficient viewport tracking
const observer = new IntersectionObserver(
  ([entry]) => {
    setIsHeroVisible(entry.isIntersecting);
  },
  { threshold: 0, rootMargin: "0px" }
);
```

## Manual Usage

If you need to manually create a banner instance (outside of the automatic initialization):

```javascript
// Create a new banner instance
const banner = new MobileCtaBanner({
  ctaUrl: "https://www.vagaro.com/signup-1?licence=1",
  ctaText: "Get Started",
  heroSelector: ".hero-section",
  topOffset: "80px",
});

// Later, destroy it if needed
banner.destroy();
```

## Customization

### Change CTA Text or URL
Edit the options in `/src/modules/mobile-cta-banner-integration.js`:

```javascript
bannerInstance = new MobileCtaBanner({
  ctaUrl: "https://your-custom-url.com",
  ctaText: "Your Custom Text",
  heroSelector: "[data-hero-section]",
  topOffset: "60px",
});
```

### Change Styling

The banner uses a combination of custom SCSS (for the glass effect) and Tailwind CSS classes.

**To modify the glass effect**, edit `/styles/_banner.scss`:

```scss
.mobile-cta-banner {
  &__glass-container {
    // Adjust gradient colors, blur amount, shadows, etc.
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.08) 0%,
      rgba(168, 85, 247, 0.06) 50%,
      rgba(236, 72, 153, 0.08) 100%
    );
    backdrop-filter: blur(20px) saturate(180%);
  }
}
```

**To modify the CTA button**, edit the `innerHTML` in `/src/modules/mobile-cta-banner.jsx`:

```javascript
this.banner.innerHTML = `
  <div class="mobile-cta-banner__glass-container px-3 pb-2.5 pt-3">
    <div class="mobile-cta-banner__content flex items-center justify-center">
      <a class="flex items-center justify-center bg-primary hover:bg-charcoal text-white font-semibold py-2 px-8 rounded-full">
        <span>${this.options.ctaText}</span>
      </a>
    </div>
  </div>
`;
```

### Change Scroll Threshold
Edit the `SCROLL_THRESHOLD` constant in `/src/modules/mobile-cta-banner.jsx`:

```javascript
const SCROLL_THRESHOLD = 10; // Change this value (in pixels)
```

### Change Visibility Threshold
Edit the scroll position check in `/src/modules/mobile-cta-banner.jsx`:

```javascript
if (currentScrollY < 100) { // Change 100 to your desired pixel value
  setIsScrollingDown(false);
  lastScrollY = currentScrollY;
  return;
}
```

## Building

After making changes, rebuild the assets:

```bash
# Development build
yarn build

# Production build
NODE_ENV=production yarn build

# Watch mode (auto-rebuild on changes)
yarn watch
```

The bundled file will be generated at:
- `assets/mobile-cta-banner-bundle.js`

## Testing

### Test in Development

1. Start the watch mode: `yarn watch`
2. Test on mobile viewport (< 1024px width)
3. Scroll down past the hero section
4. Verify banner appears when scrolling down
5. Scroll up and verify banner disappears
6. Scroll back to top and verify banner stays hidden

### Test Checklist

- [ ] Banner doesn't show on initial page load
- [ ] Banner appears after scrolling down past hero section
- [ ] Banner disappears when scrolling up
- [ ] Banner hides when reaching top of page
- [ ] Banner doesn't show on desktop (>= 1024px)
- [ ] CTA button links to correct URL
- [ ] Smooth transitions during show/hide
- [ ] No layout shift when banner appears

## Browser Support

- Modern browsers with ES6+ support
- IntersectionObserver API support (all modern browsers)
- Fallback for older browsers that don't support IntersectionObserver

## Performance Considerations

- **Zero React overhead**: Pure vanilla JavaScript - no React library needed
- **Passive scroll listeners**: Scroll events use `{ passive: true }` for better performance
- **Throttled updates**: Scroll direction only updates if delta exceeds threshold
- **IntersectionObserver**: Efficient viewport tracking without continuous checking
- **Conditional initialization**: Only creates banner on mobile viewports
- **CSS transitions**: Hardware-accelerated animations for smooth performance
- **Minimal DOM manipulation**: Banner element created once and toggled with classes

## Comparison to Original

### Similarities to Sales_Pages_App/MobileCtaBanner.tsx
- ✅ Scroll direction detection with threshold
- ✅ IntersectionObserver for hero section tracking
- ✅ Smooth CSS transitions
- ✅ Only shows when scrolling down
- ✅ Hides near top of page

### Differences from Original
- ❌ No excluded paths logic (can be added if needed)
- ❌ Simpler styling (no glass morphism CSS module)
- ✅ Tailwind CSS instead of CSS modules
- ✅ Simpler integration (no Next.js router dependency)
- ✅ Standalone initialization (no need for React app context)

## Troubleshooting

### Banner doesn't appear
1. Check if viewport is < 1024px
2. Verify you've scrolled past 100px
3. Check if hero section selector `[data-hero-section]` exists on the page
4. Open browser console and look for "[Mobile CTA Banner] Successfully mounted"

### Banner appears immediately on load
- This shouldn't happen - check if initial scroll position is being set correctly

### Banner flickers during scroll
- Increase the `SCROLL_THRESHOLD` value to reduce sensitivity

### Banner interferes with other elements
- Adjust the `z-40` z-index value in the component
- Check for conflicting fixed/sticky positioned elements

## Future Enhancements

Potential improvements that could be added:

1. **Excluded paths**: Add logic to hide banner on specific pages
2. **Analytics tracking**: Track CTA button clicks
3. **A/B testing**: Support for multiple CTA variants
4. **Cookie persistence**: Remember if user dismissed the banner
5. **Customizable animations**: Support for different transition styles
6. **Multiple CTAs**: Support for multiple buttons or actions

## Related Files

- Header template: `/templates/header.hbs`
- Mobile navigation: `/src/modules/mobile-navigation.jsx`
- Radix navigation: `/src/modules/radix-navigation-integration.jsx`
- Build config: `/rollup.config.mjs`
