#!/usr/bin/env python3
"""Visual regression: header vs. hero button parity.

Run against the dev server (http://localhost:8080):

    python3 tests/visual/button_parity.py

Captures fresh screenshots of the header and hero gold buttons at 390px
and 1280px, then compares each shot's average RGB against the baseline
in tests/visual/button-baseline/. Also asserts that the desktop header
gold pill (btn-gold-sm) matches the hero gold pill (btn-gold) in hue —
they must render the same brand gradient.

Update the baseline by copying tests/visual/__actual__/*.png over
tests/visual/button-baseline/*.png after an intentional design change.
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).parent
BASE = ROOT / "button-baseline"
OUT = ROOT / "__actual__"
OUT.mkdir(parents=True, exist_ok=True)

TOLERANCE = 8          # per-channel avg-RGB delta vs. baseline
PARITY_TOLERANCE = 6   # header pill vs. hero pill hue skew


def avg_rgb(path: Path) -> tuple[float, float, float]:
    im = Image.open(path).convert("RGB").resize((64, 64))
    px = list(im.getdata())
    n = len(px)
    return tuple(sum(c) / n for c in zip(*px))  # type: ignore[return-value]


def max_delta(a: tuple[float, float, float], b: tuple[float, float, float]) -> float:
    return max(abs(a[i] - b[i]) for i in range(3))


async def shoot(locator, path: Path) -> None:
    try:
        await locator.scroll_into_view_if_needed(timeout=2000)
    except Exception:
        pass
    await locator.screenshot(path=str(path))


async def capture(pw, tag: str, width: int) -> None:
    browser = await pw.chromium.launch(headless=True)
    ctx = await browser.new_context(
        viewport={"width": width, "height": 1800},
        device_scale_factor=2,
    )
    # Skip the intro sequence so the hero button is on-screen.
    await ctx.add_init_script(
        "try { localStorage.setItem('rememfur.intro.seen.v1', '1'); } catch(e){}"
    )
    page = await ctx.new_page()
    await page.goto("http://localhost:8080/", wait_until="domcontentloaded")
    await page.wait_for_timeout(1200)

    header = page.locator("header").first
    await shoot(header, OUT / f"{tag}_header.png")

    hero = page.locator(".btn-gold:visible").first
    if await hero.count():
        await shoot(hero, OUT / f"{tag}_hero_btn.png")

    if width >= 768:
        head_btn = header.locator(".btn-gold-sm:visible").first
        if await head_btn.count():
            await shoot(head_btn, OUT / f"{tag}_header_btn.png")

    await browser.close()


async def main() -> int:
    async with async_playwright() as pw:
        await capture(pw, "m390", 390)
        await capture(pw, "d1280", 1280)

    checks = [
        "d1280_header.png",
        "d1280_header_btn.png",
        "d1280_hero_btn.png",
        "m390_header.png",
        "m390_hero_btn.png",
    ]

    failed = 0
    for name in checks:
        actual = OUT / name
        baseline = BASE / name
        if not actual.exists():
            print(f"?  {name}  (no actual capture)")
            failed += 1
            continue
        if not baseline.exists():
            print(f"?  {name}  (no baseline)")
            continue
        delta = max_delta(avg_rgb(actual), avg_rgb(baseline))
        mark = "✓" if delta <= TOLERANCE else "✗"
        if delta > TOLERANCE:
            failed += 1
        print(f"{mark}  {name:26} Δ={delta:.1f} (tol {TOLERANCE})")

    header_btn = OUT / "d1280_header_btn.png"
    hero_btn = OUT / "d1280_hero_btn.png"
    if header_btn.exists() and hero_btn.exists():
        skew = max_delta(avg_rgb(header_btn), avg_rgb(hero_btn))
        mark = "✓" if skew <= PARITY_TOLERANCE else "✗"
        if skew > PARITY_TOLERANCE:
            failed += 1
        print(f"{mark}  gold-parity(header vs hero @1280)  Δ={skew:.1f} (tol {PARITY_TOLERANCE})")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
