"""Signed-in regression: garden Love leaves one account-owned rose, not a lamp."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright


async def test_garden_love():
    with open(Path.home() / '.cache/lovable-auth/session.json') as f:
        minted = json.load(f)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 1800})
        page = await context.new_page()
        await page.goto('http://localhost:8080')
        await page.evaluate('([k,v]) => {localStorage.setItem(k,v); localStorage.setItem("rememfur.intro.seen.v1","1");}', [minted['storage_key'], json.dumps(minted['session'])])
        await page.goto('http://localhost:8080', wait_until='networkidle')
        card = page.locator('article.garden-polaroid').first
        await card.wait_for()
        slug = (await card.locator('a').first.get_attribute('href')).split('/')[-1]
        snapshot = '''async (slug) => {
          const {supabase} = await import('/src/integrations/supabase/client.ts');
          const {data:{user}} = await supabase.auth.getUser();
          if (!user) throw new Error('Missing member session');
          const m = await supabase.from('memorials').select('id').eq('slug',slug).single();
          if (m.error) throw m.error;
          const flowers = await supabase.from('memorial_flowers').select('id,flower,left_by').eq('memorial_id',m.data.id);
          const lamps = await supabase.from('candles').select('id').eq('memorial_id',m.data.id);
          if (flowers.error || lamps.error) throw new Error('Tribute reads failed');
          return {userId:user.id, flowers:flowers.data, lamps:lamps.data};
        }'''
        before = await page.evaluate(snapshot, slug)
        await card.get_by_role('button', name='Send love to').click()
        after = before
        for _ in range(30):
            await page.wait_for_timeout(500)
            after = await page.evaluate(snapshot, slug)
            if len(after['flowers']) > len(before['flowers']):
                break
        old_ids = {r['id'] for r in before['flowers']}
        added = [r for r in after['flowers'] if r['id'] not in old_ids]
        try:
            assert len(added) == 1, 'Love must leave exactly one flower'
            assert added[0]['flower'] == 'rose', 'Love must leave a rose'
            assert added[0]['left_by'] == before['userId'], 'Flower must belong to the signed-in member'
            assert {r['id'] for r in after['lamps']} == {r['id'] for r in before['lamps']}, 'Love must not light a lamp'
            await page.goto('http://localhost:8080/memorial/' + slug, wait_until='networkidle')
            flowers = page.locator('section').filter(has=page.get_by_role('heading', name='Leave flowers', exact=True))
            await flowers.locator('li').filter(has_text='🌹').first.wait_for()
            Path('/tmp/browser/love').mkdir(parents=True, exist_ok=True)
            await flowers.screenshot(path='/tmp/browser/love/flowers.png')
        finally:
            if added:
                await page.evaluate('''async ids => {
                  const {supabase} = await import('/src/integrations/supabase/client.ts');
                  const {error} = await supabase.from('memorial_flowers').delete().in('id',ids);
                  if (error) throw error;
                }''', [r['id'] for r in added])
            await browser.close()
    print('PASS: Love leaves one member-owned rose, appears on the memorial, and leaves lamps unchanged; test flower removed.')


if __name__ == '__main__':
    asyncio.run(test_garden_love())