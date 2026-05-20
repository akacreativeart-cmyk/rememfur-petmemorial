export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="6" cy="9" rx="1.8" ry="2.4" />
      <ellipse cx="10.5" cy="6" rx="1.8" ry="2.4" />
      <ellipse cx="15.5" cy="6" rx="1.8" ry="2.4" />
      <ellipse cx="20" cy="9" rx="1.8" ry="2.4" />
      <path d="M13 11.5c2.6 0 5.5 2.2 5.5 4.9 0 2-1.6 3.1-3.5 3.1-1.2 0-1.8-.6-3-.6s-1.8.6-3 .6c-1.9 0-3.5-1.1-3.5-3.1 0-2.7 2.9-4.9 5.5-4.9z" />
    </svg>
  );
}
