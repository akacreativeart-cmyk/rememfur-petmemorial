import { Heart, MessageCircle, Flame } from "lucide-react";
import { PawIcon } from "@/components/site/PawIcon";

type Dummy = {
  id: string;
  author: string;
  avatar: string;
  when: string;
  media: { type: "image" | "video"; src: string; poster?: string };
  caption: string;
  paws: number;
  comments: number;
  candles: number;
};

const dummy: Dummy[] = [
  {
    id: "d1",
    author: "Priya & Hazel",
    avatar: "https://i.pravatar.cc/100?img=47",
    when: "2h",
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
    },
    caption:
      "Fourteen winters of warm feet. The bed is so cold now — but I keep finding her fur on every sweater I own, and somehow that helps. 🤍",
    paws: 248,
    comments: 32,
    candles: 124,
  },
  {
    id: "d2",
    author: "Marcus",
    avatar: "https://i.pravatar.cc/100?img=12",
    when: "5h",
    media: {
      type: "video",
      src: "https://cdn.coverr.co/videos/coverr-a-dog-running-on-the-beach-1574/1080p.mp4",
      poster:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
    },
    caption:
      "Biscuit on the beach last summer. Watch how he tries to herd the waves. I will never stop missing this.",
    paws: 412,
    comments: 58,
    candles: 201,
  },
  {
    id: "d3",
    author: "Anya",
    avatar: "https://i.pravatar.cc/100?img=32",
    when: "1d",
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    },
    caption:
      "Three months in and I still buy the wrong treats at the store. Then I cry in the aisle. Then I keep them. Pepper, my queen.",
    paws: 187,
    comments: 21,
    candles: 88,
  },
  {
    id: "d4",
    author: "Theo",
    avatar: "https://i.pravatar.cc/100?img=14",
    when: "1d",
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80",
    },
    caption:
      "Cooper's last morning in the garden. The sun came out for him. He was always lucky like that. ☀️",
    paws: 533,
    comments: 74,
    candles: 312,
  },
];

export function DummyPosts() {
  return (
    <div className="space-y-6">
      <p className="text-center font-hand text-lg text-muted-foreground">
        a few stories from the community ↓
      </p>
      {dummy.map((p) => (
        <article
          key={p.id}
          className="overflow-hidden rounded-2xl border border-border/60 bg-card soft-shadow"
        >
          <header className="flex items-center gap-3 px-4 py-3">
            <img src={p.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <div className="text-sm font-medium text-foreground">{p.author}</div>
              <div className="text-xs text-muted-foreground">{p.when} ago</div>
            </div>
          </header>

          <div className="aspect-square w-full bg-muted">
            {p.media.type === "image" ? (
              <img src={p.media.src} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <video
                src={p.media.src}
                poster={p.media.poster}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                controls
              />
            )}
          </div>

          <div className="space-y-3 px-4 py-3">
            <p className="text-sm leading-relaxed text-foreground">{p.caption}</p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-full bg-terracotta/15 px-3 py-1.5 text-sm text-terracotta">
                <PawIcon className="h-4 w-4 fill-current" /> {p.paws}
              </button>
              <button className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" /> {p.comments}
              </button>
              <button className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-sm text-amber-700">
                <Flame className="h-4 w-4" /> {p.candles}
              </button>
            </div>
            <div className="flex gap-1 pt-1 text-base">
              {["🐾", "🦴", "❤️", "🕯️", "🌈"].map((e) => (
                <button key={e} className="rounded-full px-1.5 py-0.5 hover:bg-muted/60">{e}</button>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
