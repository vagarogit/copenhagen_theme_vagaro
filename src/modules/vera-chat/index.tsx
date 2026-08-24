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
const PANEL_CLASS =
  "fixed z-40 sm:z-50 flex flex-col overflow-hidden overscroll-contain " +
  "bg-white shadow-2xl " +
  "top-[var(--vera-nav-offset,128px)] left-[3px] right-[3px] " +
  "bottom-[calc(3px+var(--vera-bottom-extra,0px)+env(safe-area-inset-bottom,0px))] " +
  "rounded-xl " +
  "sm:top-0 sm:bottom-0 sm:left-auto sm:right-0 sm:w-[400px] " +
  "sm:rounded-none sm:border-l sm:border-gray-200";

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
          className="fixed right-5 bottom-[calc(1.25rem+var(--vera-bottom-extra,0px)+env(safe-area-inset-bottom,0px))] z-40 sm:z-50 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-transparent shadow-lg transition-transform hover:scale-105"
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
