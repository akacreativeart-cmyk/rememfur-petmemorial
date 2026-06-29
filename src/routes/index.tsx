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
        inset: 0,
        width: "100vw",
        height: "100dvh",
        border: 0,
        zIndex: 100,
        background: "#090d1a",
      }}
    />
  );
}
