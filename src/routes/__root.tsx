import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { SkyBackground } from "@/components/site/SkyBackground";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-7xl text-foreground">404</div>
        <h2 className="mt-4 font-display text-2xl text-foreground">This path doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for has wandered off into the meadow.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Something didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Please try again in a moment."}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-input bg-background px-5 py-2 text-sm hover:bg-accent/10">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rememfur — A gentle pet memorial for the love that stays" },
      { name: "description", content: "Honor, remember, and celebrate your pet with a beautiful AI-illustrated memorial, a candle wall, and a community that understands." },
      { name: "theme-color", content: "#090d1a" },
      { property: "og:title", content: "Rememfur — A gentle pet memorial for the love that stays" },
      { property: "og:description", content: "Honor, remember, and celebrate your pet with a beautiful AI-illustrated memorial, a candle wall, and a community that understands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Rememfur — A gentle pet memorial for the love that stays" },
      { name: "twitter:description", content: "Honor, remember, and celebrate your pet with a beautiful AI-illustrated memorial, a candle wall, and a community that understands." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/f9ef67d1-9549-46f4-b7a7-f649489a4eb4" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/f9ef67d1-9549-46f4-b7a7-f649489a4eb4" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@200;300;400;500;600&family=Caveat:wght@400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthInvalidator() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInvalidator />
        <SkyBackground />
        <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">
          <Outlet />
        </div>
        <MobileTabBar />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
