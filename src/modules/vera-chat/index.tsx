import { startTransition, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ComponentProps } from "react";
import { VeraChatWidget } from "vera-chat-widget";
// The toolkit's own compiled Tailwind (1,395 classes, including the vg design
// tokens), injected at runtime so it cascades after the theme's stylesheets.
// dist/index.js already imports it for that side effect, but the package's
// sideEffects glob is "tailwind-inject.js", which doesn't match the actual path
// "dist/tailwind-inject.js" — so rollup treats it as pure and shakes it out.
// Importing it here is what keeps our rendering in step with the Vera team's
// reference app (support.bookitall.com).
import "@vagaro/vagaro-react-toolkit/dist/tailwind-inject.js";

type VeraChatConfig = ComponentProps<typeof VeraChatWidget>;

// Vera launcher avatar. The widget ships no launcher of its own in minibar
// mode — it expects the host to render one — so this is served from the Vera
// team's asset container. The query string is a read-only SAS token valid
// until 2031-03-09; if the image 404s, get a fresh URL from the Vera team.
const VERA_LAUNCHER_AVATAR =
  "https://zendeskchatbot.blob.core.windows.net/assets/Size=120px.png" +
  "?sp=r&st=2025-12-17T17:25:11Z&se=2031-03-09T01:40:11Z&spr=https" +
  "&sv=2024-11-04&sr=c&sig=2zjrNzCgQrmIz7%2FpKmunoA6SVGJpbYROyrfRllWZknc%3D";

// The widget renders no chrome of its own — no panel background, border or
// shadow — so the host supplies the drawer. Based on the classes the Vera
// team's reference app uses (support.bookitall.com), re-cut for two layouts.
//
// Phone (< sm): a floating card inset 3px on every side, rather than the
// right-hand drawer's max-w-[92vw], which left an 8vw strip of the page
// showing down the left edge. The top sits flush at --vera-nav-offset (128px,
// defined in styles/input.css) so the chat opens below the navbar and promo
// banner instead of over them; the bottom clears the iPhone home indicator
// via env(safe-area-inset-bottom) plus --vera-bottom-extra (input.css). env() is 0px until a viewport-fit=cover meta opts in —
// templates/document_head.hbs does — so it stays inert everywhere else.
//
// sm and up: the original full-height right-hand drawer, unchanged.
//
// Only longhand inset utilities here, no inset-y-0 shorthand: Tailwind emits
// shorthands before longhands, so a shorthand at the sm: breakpoint would not
// reliably override the phone rules it is meant to replace.
//
// z-40 on phones so the sticky z-50 header — and the mobile nav drawer inside
// it — stay above the chat even if the header grows (see the promo banners at
// the top of header.hbs). Back to z-50 at sm and up, where the drawer is
// full-height by design and is meant to cover the navbar: leaving it at z-40
// there lets the header paint over the panel's own header and close button.
//
// The drawer starts at --vera-host-chrome-offset rather than 0 at sm and up,
// to clear whatever bar Zendesk has pinned above the theme. Two exist, both
// injected outside the theme and neither reachable on the z axis:
//
//   #preview-bar-container  50px, local preview only. Its container is in flow
//                           but the bar inside it is position:fixed, z-index
//                           2147483634 — it stays pinned at the top forever.
//   #navbar-container       49px, signed-in agents/admins (the Guide nav whose
//                           shadow root holds knowledge-navigation-header).
//                           position:relative and in flow, so it scrolls away.
//
// Those z-indexes are one and thirteen below the 32-bit maximum, so the only
// value that paints over them is 2147483647 itself. Verified on the live site:
// a fixed test element at z-index 60 loses the top 49px and only wins at the
// max. Moving the drawer's top edge down is the one route that isn't a
// stacking-order stunt.
//
// Hence measureHostChrome() below rather than a hardcoded 50px: neither bar
// exists for signed-out end users, who must get 0 and not a strip of dead
// space, and the two differ in whether scrolling makes them go away.
//
// Phones need none of this — the panel already starts at --vera-nav-offset
// (128px), well below either bar — so the offset is applied only at sm and up.
const PANEL_CLASS =
  "fixed z-40 sm:z-50 flex flex-col overflow-hidden overscroll-contain " +
  "bg-white shadow-2xl " +
  "top-[var(--vera-nav-offset,128px)] left-[3px] right-[3px] " +
  "bottom-[calc(3px+var(--vera-bottom-extra,0px)+env(safe-area-inset-bottom,0px))] " +
  "rounded-xl " +
  "sm:top-[var(--vera-host-chrome-offset,0px)] sm:bottom-0 sm:left-auto sm:right-0 sm:w-[400px] " +
  "sm:rounded-none sm:border-l sm:border-gray-200";

// Selectors for the host chrome described above, outermost element each.
const HOST_CHROME_SELECTORS = ["#preview-bar-container", "#navbar-container"];

// How far down the viewport the host's own top chrome currently reaches.
//
// Returns the lowest bottom edge of anything still on screen, so it is correct
// whether the bars stack (in preview as an agent, both are present and the
// lower one wins) or scroll away (an in-flow bar's bottom goes negative and the
// clamp takes it to 0). Absent chrome contributes nothing, which is what makes
// this safe to ship: for a signed-out end user every selector misses and the
// drawer keeps its original top: 0.
//
// A bar's own container may be in flow while the bar inside it is fixed —
// #preview-bar-container is exactly that, and measuring only the container
// reports 0 as soon as the page scrolls while the bar is still sitting over
// the panel. So each root is measured together with any fixed descendant.
function measureHostChrome(): number {
  let bottom = 0;

  for (const selector of HOST_CHROME_SELECTORS) {
    const root = document.querySelector(selector);
    if (!root) continue;

    bottom = Math.max(bottom, root.getBoundingClientRect().bottom);

    for (const el of root.querySelectorAll("*")) {
      if (getComputedStyle(el).position !== "fixed") continue;
      bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
    }
  }

  return Math.max(0, bottom);
}

function VeraChat({ config }: { config: VeraChatConfig }) {
  const [open, setOpen] = useState(config.isPanelOpen ?? false);

  // Freeze the page behind the panel while it's open.
  //
  // <body> only — NOT documentElement. body's overflow propagates to the
  // viewport, so the page stops scrolling, while <html> keeps overflow:visible
  // and stays the scrollport that position:sticky resolves against. Hiding
  // overflow on the root instead destroys that scrollport, and the sticky
  // navbar in templates/header.hbs falls back to its *static* position at the
  // top of the document — so opening the chat mid-page made the mobile nav
  // vanish. Measured on a repro of the real markup: root+body gives the header
  // top: -1000px at scrollY 1000, body alone keeps it at 0, and both stop the
  // page scrolling.
  //
  // Paired with overscroll-contain on the message list (styles/input.css) so
  // flicking past the end of the conversation doesn't chain into the page or
  // trigger pull-to-refresh.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const prev = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    // Clear the host's top chrome (see the note above PANEL_CLASS).
    //
    // Measured once, on open, rather than tracked on scroll: opening the panel
    // locks body scroll a few lines down, so the page cannot move underneath it
    // and this value cannot go stale while the panel is up. Read before the
    // lock is applied, since the lock reclaims the scrollbar gutter and reflows
    // the page. A resize or orientation change while the panel is open could
    // still restyle a bar; that is not worth a listener for chrome only staff
    // and local preview ever show.
    const { style: rootStyle } = document.documentElement;
    rootStyle.setProperty(
      "--vera-host-chrome-offset",
      `${measureHostChrome()}px`
    );

    // Locking reclaims the scrollbar's width, which shifts the page behind the
    // panel. Only worth compensating at sm and up, where the panel is a 400px
    // side drawer and the page beside it stays in view. On phones the panel
    // covers everything but a 3px frame, so there is nothing to hold still —
    // and padding the body there narrows the sticky navbar enough to overflow
    // it. Same 40rem breakpoint the panel's own layout switches on.
    const gutter = window.matchMedia("(min-width: 40rem)").matches
      ? window.innerWidth - document.documentElement.clientWidth
      : 0;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      rootStyle.removeProperty("--vera-host-chrome-offset");
    };
  }, [open]);

  return (
    <>
      {/* Keep the widget mounted while closed to avoid re-initialization
          (mirrors the pattern in the vera-chat-widget demo). */}
      <div className={open ? PANEL_CLASS : "hidden"}>
        <VeraChatWidget
          {...config}
          mode="minibar"
          isPanelOpen={open}
          onClose={() => setOpen(false)}
          className={[config.className, "flex-1 min-h-0 w-full"]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      {!open && (
        <button
          type="button"
          aria-label="Open chat"
          // Opening pulls in the widget's lazy chunks. Without a transition
          // React treats that as a component suspending on synchronous input
          // (error #426), the widget's error boundary catches it and the panel
          // renders empty. Not an issue when isPanelOpen starts true, because
          // the suspense happens during the initial mount instead.
          onClick={() => startTransition(() => setOpen(true))}
          // Same home-indicator clearance and the same z-40/sm:z-50 pairing as
          // the panel, so the launcher never sits above the mobile nav drawer.
          //
          // No bg-primary here: the avatar PNG is itself a full circle, and
          // the theme's primary is the Vagaro red (#cc4744), which showed
          // through the PNG's transparency as a red ring around the face.
          className="fixed right-5 bottom-[calc(1.25rem+var(--vera-bottom-extra,0px)+env(safe-area-inset-bottom,0px))] z-40 sm:z-50 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-transparent shadow-lg transition-transform hover:scale-105"
        >
          <img
            alt="Vera"
            className="vera-avatar__img w-full h-full rounded-full object-cover"
            src={VERA_LAUNCHER_AVATAR}
          />
        </button>
      )}
    </>
  );
}

export function renderVeraChat(config: VeraChatConfig) {
  const container = document.createElement("div");
  container.id = "vera-chat-root";
  document.body.appendChild(container);

  createRoot(container).render(<VeraChat config={config} />);
}
