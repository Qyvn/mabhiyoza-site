// Headless browser checks (Playwright/Chromium) against `vite preview`, or BASE_URL for the live site.
// Usage: npm run build && npm run e2e
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = 4183;
const live = process.env.BASE_URL;
const URL = live ?? `http://localhost:${PORT}/`;
const server = live ? null : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
if (server) await new Promise((r) => { server.stdout.on('data', (d) => String(d).includes('localhost') && r()); setTimeout(r, 8000); });

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${info}`); };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const status = (p) => p.getByTestId('status').textContent();
const shot = (p, n) => p.screenshot({ path: `screenshots/redesign-${n}.png` });

async function dragArmOn(page) {
  const plinth = await page.locator('.plinth').boundingBox();
  const head = await page.locator('.arm-head').boundingBox();
  await page.mouse.move(head.x + head.width / 2, head.y + head.height / 2);
  await page.mouse.down();
  // move stylus toward the outer groove (record sits left of the pivot)
  await page.mouse.move(plinth.x + plinth.width * 0.70, plinth.y + plinth.height * 0.74, { steps: 10 });
  await page.mouse.up();
}

try {
  for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    const page = await ctx.newPage();
    const errors = [], bad = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    const res = await page.goto(URL, { waitUntil: 'networkidle' });
    check(`${vp.name}: HTTP 200`, res.status() === 200);
    await page.waitForTimeout(1600);
    await shot(page, `${vp.name}-intro`);
    check(`${vp.name}: no horizontal overflow`, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
    check(`${vp.name}: no old CD wheel / cassette`, (await page.locator('.wheel-stage, .cassette').count()) === 0);
    check(`${vp.name}: generative labels rendered`, (await page.locator('.sleeve .bead-label').count()) >= 6);
    const seeds = await page.locator('.sleeve .bead-label').evaluateAll((els) => els.map((e) => e.getAttribute('data-seed')));
    check(`${vp.name}: each record has unique label art`, new Set(seeds).size === seeds.length);

    // crate flip
    await page.locator('#a1').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Flip to next record' }).click();
    check(`${vp.name}: crate flips`, /Impatha Yasemakhaya/.test(await page.locator('.crate-now').textContent()));
    await page.getByRole('button', { name: 'Flip to previous record' }).click();
    await page.getByRole('button', { name: /^Put Nkri Nkri Nkri on the turntable/ }).click();
    await page.waitForTimeout(300);
    check(`${vp.name}: loading a record does not autoplay`, (await status(page)) === 'Needle up', await status(page));

    // tonearm drag -> real playback
    await page.locator('.plinth').scrollIntoViewIfNeeded();
    if (vp.isMobile) await page.getByRole('button', { name: 'Drop the needle' }).click(); else await dragArmOn(page);
    await page.waitForTimeout(1500);
    check(`${vp.name}: needle drop plays (real audio)`, (await status(page)) === 'Playing', await status(page));
    check(`${vp.name}: tonearm is on the record`, Number(await page.getByTestId('tonearm').getAttribute('data-angle')) >= -4);
    await shot(page, `${vp.name}-deck-playing`);
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Lift the needle' }).click();
    await page.waitForTimeout(300);
    check(`${vp.name}: lift needle pauses`, (await status(page)) === 'Needle up');
    // scratch (needle up so time only moves via the gesture)
    const now = () => page.evaluate(() => Number(document.querySelector('[role=progressbar]').getAttribute('aria-valuenow')));
    const t0 = await now();
    await page.getByTestId('platter').evaluate((e) => e.scrollIntoView({ block: 'center' }));
    const pb = await page.getByTestId('platter').boundingBox();
    const cx = pb.x + pb.width / 2, cy = pb.y + pb.height / 2, r = pb.width * 0.4;
    const pl = page.getByTestId('platter');
    if (vp.isMobile) {
      const ev = (type, a) => pl.dispatchEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, clientX: cx + r * Math.cos(a), clientY: cy + r * Math.sin(a) });
      await ev('pointerdown', 0);
      for (let i = 1; i <= 24; i++) await ev('pointermove', -(i / 24) * Math.PI * 1.9);
      await ev('pointerup', -Math.PI * 1.9);
    } else {
      await page.mouse.move(cx + r, cy); await page.mouse.down();
      for (let i = 1; i <= 24; i++) { const a = -(i / 24) * Math.PI * 1.9; await page.mouse.move(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
      await page.mouse.up();
    }
    const t1 = await now();
    check(`${vp.name}: scratch scrubs the preview backwards`, t1 < t0, `${t0} -> ${t1}`);
    // unavailable song
    await page.locator('.crate-ctrl').evaluate((e) => e.scrollIntoView({ block: 'center' }));
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Flip to next record' }).click();
    await page.getByRole('button', { name: /^Put Ubambo Lwakho on the turntable/ }).click();
    check(`${vp.name}: unavailable preview message`, await page.getByText(/No preview is available/).isVisible());

    // side flip
    await page.getByRole('button', { name: 'Side B' }).click();
    await page.waitForTimeout(1200);
    check(`${vp.name}: side B toggle`, (await page.getByRole('button', { name: 'Side B' }).getAttribute('aria-pressed')) === 'true');
    await shot(page, `${vp.name}-side-b`);
    // vault + tour
    check(`${vp.name}: vault locked with countdown + EXAMPLE`, (await page.getByRole('timer').count()) === 1 && await page.getByText(/EXAMPLE placeholder/).isVisible());
    await page.locator('#b3').scrollIntoViewIfNeeded();
    check(`${vp.name}: tickets coming soon, no Paystack`, (await page.getByTestId('tickets-soon').isDisabled()) && !(await page.evaluate(() => !!document.querySelector('script[src*="paystack"]'))));
    await shot(page, `${vp.name}-live`);
    // crate builder
    await page.locator('#a2').scrollIntoViewIfNeeded();
    for (const t of ['Abo Dr Love', 'Nkri Nkri Nkri', 'Asanda']) await page.getByRole('button', { name: `Add ${t} to crate` }).click();
    await page.getByRole('button', { name: 'Move Nkri Nkri Nkri up' }).click();
    await page.getByLabel('Name your crate').fill('Sunday drive');
    const link = await page.getByTestId('mixtape-link').getAttribute('href');
    check(`${vp.name}: crate share link`, /s=nkri-nkri-nkri%2Cabo-dr-love%2Casanda/.test(link) && /t=Sunday\+drive/.test(link), link);
    await page.locator('.mix-tape-area').scrollIntoViewIfNeeded();
    await shot(page, `${vp.name}-crate`);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src));
    check(`${vp.name}: no broken images`, broken.length === 0, broken.join(','));
    check(`${vp.name}: no 4xx/5xx`, bad.length === 0, bad.join(', '));
    check(`${vp.name}: no overflow after interaction`, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
    check(`${vp.name}: no page errors`, errors.length === 0, errors.join('; '));
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/redesign-${vp.name}-full.png`, fullPage: true });
    if (vp.name === 'mobile') {
      await page.goto(link); await page.waitForSelector('[data-testid="shared-mixtape"]');
      await page.getByRole('button', { name: /Play mixtape/ }).click(); await page.waitForTimeout(2000);
      check('shared crate plays first track', /1\. Nkri Nkri Nkri: playing/.test(await page.getByTestId('mix-status').textContent()));
    }
    await ctx.close();
  }
  const rctx = await browser.newContext({ viewport: { width: 1024, height: 800 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage(); await rp.goto(URL);
  await rp.getByRole('button', { name: /^Put Nkri Nkri Nkri/ }).click();
  await rp.getByRole('button', { name: 'Drop the needle' }).click(); await rp.waitForTimeout(800);
  check('reduced motion: record does not spin, still plays', (await rp.locator('.vinyl.spinning').count()) === 0 && (await status(rp)) === 'Playing');
  await rctx.close();
} finally { await browser.close(); server?.kill(); }
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
