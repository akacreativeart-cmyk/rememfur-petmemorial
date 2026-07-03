import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy — RememFur" },
      { name: "description", content: "How RememFur handles your data." },
    ],
  }),
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background paper-grain">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10 pb-32">
        <PageHero
          eyebrow="your trust"
          title="Privacy"
          handwritten="what we keep, what we don't"
          intro="We built RememFur to hold something precious. That means your data is treated with care."
        />

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-display text-xl text-foreground">What we collect</h2>
            <p className="mt-2">
              When you create an account or a memorial, we store the information you provide — your email, your pet's name and story, and any photos you upload. We also collect anonymous usage data to keep the site running smoothly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">How we use it</h2>
            <p className="mt-2">
              Your data is used only to operate and improve RememFur. We never sell your personal information. We don't use your pet's photos or story to train AI models without your explicit permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Who can see it</h2>
            <p className="mt-2">
              Memorials are public by default so friends and strangers can light candles. You control the visibility of your memorial in its settings. Candles and messages left by visitors are visible to others.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground">Contact us</h2>
            <p className="mt-2">
              If you have questions about your data, email us at{" "}
              <a href="mailto:hello@rememfur.com" className="text-[var(--cta)] hover:underline">
                hello@rememfur.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
