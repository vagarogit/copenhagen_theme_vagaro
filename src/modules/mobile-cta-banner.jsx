/**
 * MobileCtaBanner - A sticky CTA banner that shows/hides based on scroll behavior
 * Pure vanilla JavaScript implementation
 *
 * Shows when:
 * - User has scrolled past the hero section
 * - User is scrolling down
 *
 * Hides when:
 * - Hero section is visible
 * - User is scrolling up
 * - User is near top of page (< 100px)
 */

class MobileCtaBanner {
  constructor(options = {}) {
    this.options = {
      ctaUrl: options.ctaUrl || "https://www.vagaro.com/signup-1?licence=1",
      ctaText: options.ctaText || "Start Free Trial",
      heroSelector: options.heroSelector || "[data-hero-section]",
      topOffset: options.topOffset || "60px",
    };

    this.state = {
      isHeroVisible: true,
      isScrollingDown: false,
    };

    this.lastScrollY = window.scrollY;
    this.SCROLL_THRESHOLD = 10;
    this.banner = null;
    this.observer = null;

    this.init();
  }

  init() {
    // Check if we're in mobile viewport
    if (window.innerWidth >= 1024) {
      return;
    }

    this.createBanner();
    this.setupScrollListener();
    this.setupHeroObserver();
    this.setupResizeListener();
  }

  createBanner() {
    // Create banner container
    this.banner = document.createElement("div");
    this.banner.id = "mobile-cta-banner";
    this.banner.className =
      "fixed left-0 right-0 z-40 transition-all duration-300 ease-out lg:hidden pointer-events-none -translate-y-full opacity-0";
    this.banner.style.top = this.options.topOffset;
    this.banner.setAttribute("aria-hidden", "true");

    // Create banner content with liquid glass effect
    this.banner.innerHTML = `
      <div class="mobile-cta-banner__glass-container px-3 pb-2.5 pt-3">
        <div class="mobile-cta-banner__content flex items-center justify-center">
          <a
            href="${this.options.ctaUrl}"
            class="flex items-center justify-center bg-primary hover:bg-charcoal text-white font-semibold py-2 px-8 rounded-full w-auto md:w-[152px] h-[40px] transition-colors text-sm md:text-base"
            aria-label="${this.options.ctaText}"
            id="dynamic-cta"
          >
            <span>${this.options.ctaText}</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(this.banner);
  }

  setupScrollListener() {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - this.lastScrollY;

      // Always hide when near the top of the page
      if (currentScrollY < 100) {
        this.state.isScrollingDown = false;
        this.lastScrollY = currentScrollY;
        this.updateBannerVisibility();
        return;
      }

      // Only update direction if scroll delta exceeds threshold
      if (Math.abs(delta) >= this.SCROLL_THRESHOLD) {
        this.state.isScrollingDown = delta > 0;
        this.lastScrollY = currentScrollY;
        this.updateBannerVisibility();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  setupHeroObserver() {
    const heroSection = document.querySelector(this.options.heroSelector);

    if (!heroSection) {
      // Fallback: use scroll position
      const handleHeroFallback = () => {
        this.state.isHeroVisible = window.scrollY < 100;
        this.updateBannerVisibility();
      };
      window.addEventListener("scroll", handleHeroFallback, { passive: true });
      return;
    }

    // Use IntersectionObserver to detect when hero section is out of view
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.state.isHeroVisible = entry.isIntersecting;
        this.updateBannerVisibility();
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    this.observer.observe(heroSection);
  }

  setupResizeListener() {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile && this.banner) {
        this.destroy();
      } else if (isMobile && !this.banner) {
        this.init();
      }
    };

    window.addEventListener("resize", handleResize);
  }

  updateBannerVisibility() {
    if (!this.banner) return;

    // Show banner when hero is NOT visible AND user is scrolling down
    const isVisible = !this.state.isHeroVisible && this.state.isScrollingDown;

    if (isVisible) {
      this.banner.classList.remove(
        "pointer-events-none",
        "-translate-y-full",
        "opacity-0"
      );
      this.banner.classList.add("translate-y-0", "opacity-100");
      this.banner.setAttribute("aria-hidden", "false");
    } else {
      this.banner.classList.add(
        "pointer-events-none",
        "-translate-y-full",
        "opacity-0"
      );
      this.banner.classList.remove("translate-y-0", "opacity-100");
      this.banner.setAttribute("aria-hidden", "true");
    }
  }

  destroy() {
    if (this.banner) {
      this.banner.remove();
      this.banner = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default MobileCtaBanner;
