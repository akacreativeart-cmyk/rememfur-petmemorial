import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "rememfur" },
      { name: "description", content: "A gentle pet memorial for the love that stays." },
    ],
  }),
});

function HomePage() {
  return (
    <iframe
      src="/app.html"
      title="rememfur"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: "calc(72px + env(safe-area-inset-bottom))",
        width: "100vw",
        border: 0,
        zIndex: 40,
        background: "#090d1a",
      }}
    />
  );
}
