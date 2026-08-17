import { startTransition, useState } from "react";
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
// shadow — so the host supplies the drawer. These are the classes the Vera
// team's reference app uses (support.bookitall.com), minus its top-16 offset:
// that clears a 64px app header this help center doesn't have, so the drawer
// runs full height instead. Change inset-y-0 to top-[Npx] bottom-0 to tuck it
// under the help center header.
const PANEL_CLASS =
  "fixed inset-y-0 right-0 z-50 flex w-[400px] max-w-[92vw] flex-col " +
  "border-l border-gray-200 bg-white shadow-2xl";

function VeraChat({ config }: { config: VeraChatConfig }) {
  const [open, setOpen] = useState(config.isPanelOpen ?? false);

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
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
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
