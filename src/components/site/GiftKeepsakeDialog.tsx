import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestBetaInvite } from "@/lib/beta.functions";
import keychainImg from "@/assets/keepsake-keychain.jpg";
import stoneImg from "@/assets/keepsake-stone.jpg";

const u = (id: string) => `https://images.unsplash.com/${id}?w=400&h=400&q=70&auto=format&fit=crop`;

export const KEEPSAKES = [
  { id: "frame", name: "Photo frame", price: "$48", img: u("photo-1513519245088-0e12902e5a38") },
  { id: "keychain", name: "Paw key chain", price: "$18", img: keychainImg },
  { id: "mug", name: "Memory mug", price: "$22", img: u("photo-1514228742587-6b1558fcca3d") },
  { id: "tshirt", name: "Printed T-shirt", price: "$32", img: u("photo-1521572163474-6864f9cf17ab") },
  { id: "card", name: "Sympathy card", price: "$8", img: u("photo-1607344645866-009c320b63e0") },
  { id: "flowers", name: "Fresh flowers", price: "$45", img: u("photo-1487070183336-b863922373d4") },
  { id: "candle", name: "Real candle", price: "$26", img: u("photo-1602874801007-bd458bb1b8b6") },
  { id: "stone", name: "Garden stone", price: "$39", img: stoneImg },
  { id: "pillow", name: "Photo cushion", price: "$36", img: u("photo-1584100936595-c0654b55a2e2") },
] as const;

export function GiftKeepsakeDialog({ trigger, petName, source = "gift-keepsake" }: { trigger: ReactNode; petName?: string; source?: string }) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<string>("frame");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const send = useServerFn(requestBetaInvite);
  const item = KEEPSAKES.find((k) => k.id === pick)!;
  const mut = useMutation({
    mutationFn: () => send({ data: { email, source: source.slice(0, 80), note: `${item.name}${petName ? ` · for ${petName}` : ""}${note ? ` · ${note}` : ""}`.slice(0, 500) } }),
    onSuccess: () => { toast.success("Request sent. We'll be in touch."); setOpen(false); setNote(""); },
    onError: () => toast.error("Please check the email and try again."),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Send a keepsake</DialogTitle>
          <DialogDescription>{petName ? `Something to hold, for ${petName}.` : "Something to hold."}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          {KEEPSAKES.map((k) => (
            <button key={k.id} type="button" onClick={() => setPick(k.id)} aria-pressed={pick === k.id}
              className={`group relative overflow-hidden rounded-xl border text-left transition ${pick === k.id ? "border-primary ring-2 ring-primary" : "border-border"}`}>
              <img src={k.img} alt={k.name} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="bg-card p-1.5">
                <div className="text-[12px] font-semibold leading-tight text-card-foreground">{k.name}</div>
                <div className="text-[11px] text-muted-foreground">{k.price}</div>
              </div>
              {pick === k.id && <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground"><Check className="h-3 w-3" /></span>}
            </button>
          ))}
        </div>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
          <Input type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Textarea rows={2} maxLength={300} placeholder="A short note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" disabled={mut.isPending} className="btn-gold w-full">{mut.isPending ? "Sending…" : `Request ${item.name}`}</button>
          <p className="text-center text-xs text-muted-foreground">Checkout is coming soon. We'll email you to complete it.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
