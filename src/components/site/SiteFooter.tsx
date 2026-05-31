import { Link } from "@tanstack/react-router";

const links = [
  { to: "/garden", label: "Memory Garden" },
  { to: "/community", label: "Community" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/adoption", label: "Adoption" },
  { to: "/grief-support", label: "Grief Support" },
  { to: "/medical", label: "Medical" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-md px-5 pb-6 pt-10 text-center text-xs text-muted-foreground">
      <div className="font-display text-base text-foreground">Rememfur</div>
      <p className="mt-1 font-hand text-base text-[var(--terracotta)]">
        Love leaves paw prints on the heart.
      </p>
      <div className="chapter-rule mt-4" aria-hidden />
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
