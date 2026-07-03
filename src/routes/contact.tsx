import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero } from "@/components/site/PageHero";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — RememFur" },
      { name: "description", content: "Get in touch with RememFur. We're listening." },
    ],
  }),
});

function Contact() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10 pb-32">
        <PageHero
          eyebrow="reach out"
          title="Contact"
          handwritten="we're listening"
          intro="Have a question, a suggestion, or just need to share something? We'd love to hear from you."
        />

        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 text-center soft-shadow">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--cta)_12%,transparent)] text-[var(--cta)]">
            <Mail className="h-5 w-5" />
          </span>
          <p className="mt-4 font-display text-xl text-foreground">hello@rememfur.com</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We read every message and reply as gently as we can.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
