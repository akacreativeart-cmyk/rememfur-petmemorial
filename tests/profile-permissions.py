"""Signed-in regression: own-profile writes work; other profiles and roles stay protected."""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright

async def test_profile_permissions():
    with open(Path.home() / '.cache/lovable-auth/session.json') as f:
        minted = json.load(f)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 1800})
        page = await context.new_page()
        await page.goto('http://localhost:8080')
        await page.evaluate('(s) => { localStorage.setItem(s.key, s.value); localStorage.setItem("rememfur.intro.seen.v1", "1"); localStorage.setItem("rememfur.install.dismissed.v1", "1"); }', {'key': minted['storage_key'], 'value': json.dumps(minted['session'])})
        await page.goto('http://localhost:8080/settings', wait_until='networkidle')
        original = await page.get_by_label('Display name', exact=True).input_value()
        await page.get_by_role('button', name='Save changes', exact=True).click()
        await page.get_by_text('Profile saved.', exact=True).wait_for()
        await page.reload(wait_until='networkidle')
        assert await page.get_by_label('Display name', exact=True).input_value() == original
        result = await page.evaluate('''async () => {
          const { supabase } = await import('/src/integrations/supabase/client.ts');
          const {data: {user}} = await supabase.auth.getUser();
          if (!user) throw new Error('Missing test session');
          const other = await supabase.from('profiles').select('id,display_name').neq('id',user.id).limit(1);
          if (!other.data?.length) throw new Error('Another profile is required for the privacy regression');
          const row = other.data[0];
          const update = await supabase.from('profiles').update({display_name:row.display_name}).eq('id',row.id).select('id');
          const role = await supabase.from('profiles').update({is_admin:true}).eq('id',user.id);
          return {otherRows: update.data?.length ?? 0, roleDenied: !!role.error};
        }''')
        assert result['otherRows'] == 0, 'Another member profile was writable'
        assert result['roleDenied'], 'Protected administrator flag was writable'
        await browser.close()
    print('PASS: own-profile saving; other-profile isolation; protected administrator flag')

if __name__ == '__main__':
    asyncio.run(test_profile_permissions())
