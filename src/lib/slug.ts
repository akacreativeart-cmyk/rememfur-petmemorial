export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function withRandomSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug || "memorial"}-${suffix}`;
}
