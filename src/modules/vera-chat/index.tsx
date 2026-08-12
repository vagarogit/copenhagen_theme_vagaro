import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { ComponentProps } from "react";
import { VeraChatWidget } from "vera-chat-widget";

type VeraChatConfig = ComponentProps<typeof VeraChatWidget>;

function VeraChat({ config }: { config: VeraChatConfig }) {
  const [open, setOpen] = useState(config.isPanelOpen ?? false);

  return (
    <>
      {/* Keep the widget mounted while closed to avoid re-initialization
          (mirrors the pattern in the vera-chat-widget demo). */}
      <div className={open ? "" : "hidden"}>
        <VeraChatWidget
          {...config}
          mode="minibar"
          isPanelOpen={open}
          onClose={() => setOpen(false)}
        />
      </div>

      {!open && (
        <button
          type="button"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-vera-purple to-vera-blue text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center border-none cursor-pointer"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
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
