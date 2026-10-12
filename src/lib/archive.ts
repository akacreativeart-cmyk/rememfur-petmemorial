import { z } from "zod";

const date = z.string().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)), "Choose a valid date.");
export const archiveSchema = z.object({
  species: z.enum(["all", "dog", "cat", "other"]).default("all"),
  name: z.string().max(80).default(""),
  from: date.default(""),
  to: date.default(""),
  min: z.number().int().min(0).max(1000000).default(0),
  max: z.number().int().min(0).max(1000000).nullable().default(null),
  sort: z.enum(["newest", "oldest", "passing", "lamps"]).default("newest"),
  page: z.number().int().min(1).max(100000).default(1),
}).refine((v) => !v.from || !v.to || v.from <= v.to, "The end date must follow the start date.")
  .refine((v) => v.max === null || v.max >= v.min, "The maximum paw lamps must be at least the minimum.");

export type ArchiveFilters = z.infer<typeof archiveSchema>;
export const defaultArchiveFilters: ArchiveFilters = archiveSchema.parse({});
export type ArchiveRow = {
  id: string; slug: string; pet_name: string; species: string; birth_date: string | null;
  passing_date: string | null; epitaph: string | null; hero_image_url: string | null; paw_lamp_count: number;
};
export type ArchiveResult = { rows: ArchiveRow[]; total: number };