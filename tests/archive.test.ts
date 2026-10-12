import { expect, test } from "bun:test";
import { archiveSchema } from "../src/lib/archive";
test("pet filters include dogs, cats and other companions", () => {
  for (const species of ["dog", "cat", "other"]) expect(archiveSchema.parse({ species }).species).toBe(species);
});
test("date filters preserve the inclusive passing-date range", () => {
  const filters = archiveSchema.parse({ from: "2026-01-01", to: "2026-10-12" });
  expect(filters.from).toBe("2026-01-01"); expect(filters.to).toBe("2026-10-12");
  expect(archiveSchema.safeParse({ from: "2026-10-12", to: "2026-01-01" }).success).toBe(false);
});
test("paw lamp ranges allow zero and reject reversed ranges", () => {
  expect(archiveSchema.parse({ min: 0, max: 0 }).max).toBe(0);
  expect(archiveSchema.parse({ min: 3, max: 8 }).min).toBe(3);
  expect(archiveSchema.safeParse({ min: 8, max: 3 }).success).toBe(false);
});