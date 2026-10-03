import { createFileRoute, Link } from "@tanstack/react-router";
import { Feather, Home, PawPrint } from "lucide-react";
import { PawLamp } from "@/components/site/PawLamp";

export const Route = createFileRoute("/_authenticated/welcome")({
  component: WelcomePage,
  head: () => ({
    meta: [
      { title: "Welcome to Rememfur — Begin Their Memorial" },
      { name: "description", content: "Begin a lasting memorial for the pet you love, one gentle step at a time." },
      { property: "og:title", content: "Welcome to Rememfur — Begin Their Memorial" },
      { property: "og:description", content: "Begin a lasting memorial for the pet you love, one gentle step at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function WelcomePage() {
  return (
    <section className="mx-auto max-w-2xl py-6 text-center md:py-12">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-card shadow-[0_18px_50px_-28px_rgba(77,45,68,0.5)]">
        <PawLamp size={48} />
      </div>

      <p className="mt-8 font-hand text-2xl text-primary">welcome to your memory keeper</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-foreground md:text-5xl">
        Let’s make their first page.
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">
        Start with their name and one favourite photograph. You can add every story, date, and small detail later.
      </p>

      <div className="mx-auto mt-9 max-w-lg border-y border-border py-6 text-left">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            ["01", "Their name"],
            ["02", "A photograph"],
            ["03", "A few words"],
          ].map(([number, label]) => (
            <div key={number} className="flex items-center gap-3 sm:block sm:text-center">
              <span className="font-display text-sm italic text-primary">{number}</span>
              <p className="font-display text-lg text-foreground sm:mt-2">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/create/memorial" className="btn-gold w-full sm:w-auto">
          <Feather className="h-4 w-4" />
          Write your first memorial
        </Link>
        <Link to="/" className="btn-quiet w-full sm:w-auto">
          <Home className="h-4 w-4" />
          Visit home
        </Link>
      </div>

      <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <PawPrint className="h-4 w-4 text-primary" />
        Everything is saved to your private space as you go.
      </p>
    </section>
  );
}