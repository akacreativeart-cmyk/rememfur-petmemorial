import { Link } from "@tanstack/react-router";

const links = [
  { to: "/about", label: "About" },
  { to: "/grief-support", label: "Grief support" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-md px-5 pb-6 pt-10 text-center text-xs text-muted-foreground md:max-w-[1200px] md:px-8">
      <div className="font-display text-base text-foreground">RememFur</div>
      <p className="mt-1 font-hand text-base text-[var(--terracotta)]">
        a quiet place to remember them.
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
