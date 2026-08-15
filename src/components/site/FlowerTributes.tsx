import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { format } from "date-fns";
import { Flower2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { leaveFlower } from "@/lib/tributes.functions";
import { useAuth } from "@/hooks/use-auth";

const FLOWERS = [
  { id: "rose", label: "Rose", glyph: "🌹", note: "deep love" },
  { id: "lily", label: "Lily", glyph: "🌷", note: "peace" },
  { id: "daisy", label: "Daisy", glyph: "🌼", note: "innocence" },
  { id: "sunflower", label: "Sunflower", glyph: "🌻", note: "warmth" },
  { id: "tulip", label: "Tulip", glyph: "💐", note: "gratitude" },
] as const;

type FlowerId = (typeof FLOWERS)[number]["id"];

type FlowerRow = {
  id: string;
  flower: string;
  message: string | null;
  left_by_name: string | null;
  created_at: string;
};

export function FlowerTributes({ memorialId, petName }: { memorialId: string; petName: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [choice, setChoice] = useState<FlowerId>("rose");
  const [note, setNote] = useState("");
  const send = useServerFn(leaveFlower);

  const { data: flowers = [] } = useQuery({
    queryKey: ["memorial-flowers", memorialId],
    queryFn: async (): Promise<FlowerRow[]> => {
      const { data, error } = await supabase
        .from("memorial_flowers")
        .select("id, flower, message, left_by_name, created_at")
        .eq("memorial_id", memorialId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw new Error(error.message);
      return (data ?? []) as FlowerRow[];
    },
    staleTime: 30_000,
  });

  const mut = useMutation({
    mutationFn: () => send({ data: { memorial_id: memorialId, flower: choice, message: note.trim() || null } }),
    onSuccess: () => {
      toast.success(`Flowers left for ${petName}.`);
      setNote("");
      qc.invalidateQueries({ queryKey: ["memorial-flowers", memorialId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const glyphFor = (id: string) => FLOWERS.find((f) => f.id === id)?.glyph ?? "🌸";

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-7 soft-shadow">
      <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
        <Flower2 className="h-5 w-5 text-amber-200" /> Leave flowers
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A quiet gesture — lay a flower at {petName}&apos;s memorial.
      </p>

      {user ? (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            {FLOWERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setChoice(f.id)}
                aria-pressed={choice === f.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  choice === f.id
                    ? "border-[var(--cta)]/60 bg-[var(--cta)]/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-[var(--cta)]/40"
                }`}
              >
                <span aria-hidden className="text-base">{f.glyph}</span>
                {f.label}
                <span className="text-[10.5px] uppercase tracking-[0.16em] opacity-60">{f.note}</span>
              </button>
            ))}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A few words with your flowers (optional)"
            rows={2}
            maxLength={300}
          />
          <div className="flex justify-end">
            <button type="button" onClick={() => mut.mutate()} disabled={mut.isPending} className="btn-gold-sm">
              <Flower2 className="h-4 w-4" /> {mut.isPending ? "Laying flowers…" : "Leave flowers"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/login" className="text-amber-200 hover:underline">Sign in</Link> to leave flowers.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {flowers.length === 0 && (
          <li className="text-sm italic text-muted-foreground">No flowers yet — be the first.</li>
        )}
        {flowers.map((f) => (
          <li key={f.id} className="flex gap-3 rounded-2xl bg-white/[0.04] p-4">
            <span aria-hidden className="text-2xl leading-none">{glyphFor(f.flower)}</span>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                {f.left_by_name ?? "A friend"} · {format(new Date(f.created_at), "MMM d, yyyy")}
              </div>
              {f.message && <p className="mt-1 whitespace-pre-line text-sm text-foreground">{f.message}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
