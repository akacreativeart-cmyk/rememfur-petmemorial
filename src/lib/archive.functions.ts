import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { archiveSchema, type ArchiveFilters, type ArchiveResult } from "./archive";

export const browseArchive = createServerFn({ method: "GET" })
  .inputValidator((input: ArchiveFilters) => archiveSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("The memorial archive is temporarily unavailable.");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { data: result, error } = await client.rpc("browse_memorial_archive", {
      _species: data.species === "all" ? undefined : data.species,
      _name: data.name.trim(), _from: data.from || undefined, _to: data.to || undefined,
      _min_lamps: data.min, _max_lamps: data.max ?? undefined, _sort: data.sort, _page: data.page,
    });
    if (error) throw new Error("Couldn't load memorials. Please try again.");
    return result as unknown as ArchiveResult;
  });