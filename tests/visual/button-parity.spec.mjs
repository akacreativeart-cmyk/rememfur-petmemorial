// Visual regression: header vs. hero button parity.
// Run: node tests/visual/button-parity.spec.mjs
// Requires the dev server on http://localhost:8080 and playwright installed.
// Writes fresh shots to tests/visual/__actual__/ and compares average RGB
// against the baseline in tests/visual/button-baseline/.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const BASE = path.join(ROOT, "button-baseline");
const OUT = path.join(ROOT, "__actual__");
fs.mkdirSync(OUT, { recursive: true });

const TOLERANCE = 8; // per-channel avg RGB delta

async function shoot(loc, file) {
  try { await loc.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch {}
  await loc.screenshot({ path: file });
}

function avgRGB(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++;
  }
  return [r / n, g / n, b / n];
}

function compare(name) {
  const a = path.join(BASE, name);
  const b = path.join(OUT, name);
  if (!fs.existsSync(a)) return { name, status: "no-baseline" };
  const [ar, ag, ab] = avgRGB(a);
  const [br, bg, bb] = avgRGB(b);
  const d = Math.max(Math.abs(ar - br), Math.abs(ag - bg), Math.abs(ab - bb));
  return { name, status: d <= TOLERANCE ? "pass" : "fail", delta: d.toFixed(1) };
}

const scenarios = [
  { tag: "m390", width: 390 },
  { tag: "d1280", width: 1280 },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const { tag, width } of scenarios) {
    const ctx = await browser.newContext({
      viewport: { width, height: 1800 },
      deviceScaleFactor: 2,
    });
    await ctx.addInitScript(() => {
      try { localStorage.setItem("rememfur.intro.seen.v1", "1"); } catch {}
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    const header = page.locator("header").first();
    await shoot(header, path.join(OUT, `${tag}_header.png`));

    const hero = page.locator(".btn-gold:visible").first();
    if (await hero.count()) await shoot(hero, path.join(OUT, `${tag}_hero_btn.png`));

    if (width >= 768) {
      const head = header.locator(".btn-gold-sm:visible").first();
      if (await head.count()) await shoot(head, path.join(OUT, `${tag}_header_btn.png`));
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

const results = [
  "d1280_header.png",
  "d1280_header_btn.png",
  "d1280_hero_btn.png",
  "m390_header.png",
  "m390_hero_btn.png",
].map(compare);

// Hero and header gold buttons should share the same brand gradient.
const headerBtn = avgRGB(path.join(OUT, "d1280_header_btn.png"));
const heroBtn = avgRGB(path.join(OUT, "d1280_hero_btn.png"));
const paritySkew = Math.max(...headerBtn.map((v, i) => Math.abs(v - heroBtn[i])));
results.push({
  name: "gold-parity(header vs hero @1280)",
  status: paritySkew <= 6 ? "pass" : "fail",
  delta: paritySkew.toFixed(1),
});

let failed = 0;
for (const r of results) {
  const mark = r.status === "pass" ? "✓" : r.status === "no-baseline" ? "?" : "✗";
  if (r.status === "fail") failed++;
  console.log(`${mark} ${r.name}  Δ=${r.delta ?? "-"} (${r.status})`);
}
process.exit(failed ? 1 : 0);
