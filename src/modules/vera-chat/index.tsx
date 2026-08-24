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
  // overflow:hidden on the root rather than the usual position:fixed body
  // trick: pinning the body would strand the sticky navbar in
  // templates/header.hbs — with no scroll container left, it stops sticking
  // and slides away with the document, which is exactly the header the panel
  // is offset below on phones. Root overflow keeps it in place.
  //
  // Paired with overscroll-contain on the panel so flicking the message list
  // past its end doesn't chain into the page or trigger pull-to-refresh.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const { body } = document;
    const prev = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    // Hiding overflow reclaims the scrollbar's width, which shifts the page
    // behind the panel on desktop. Pad by exactly what was lost. Always 0 on
    // phones and on overlay-scrollbar setups.
    const gutter = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      root.style.overflow = prev.rootOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPaddingRight;
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
