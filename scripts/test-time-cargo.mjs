// Behaviour tests for time-cargo.html / time-cargo-ro.html in real Chromium.
// Run: node scripts/test-time-cargo.mjs   (starts its own static server)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const { chromium } = pw;

// Independent Node-side model, for parity with what the page prints.
const nctx = { console }; nctx.window = nctx; nctx.globalThis = nctx; vm.createContext(nctx);
['time-cargo-data.js', 'time-cargo-copy.en.js', 'time-cargo-copy.ro.js', 'time-cargo-model.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), nctx));
const D = nctx.TIME_CARGO, M = nctx.TimeCargoModel;
const HAS_RO = !!D.copy.ro && fs.existsSync(path.join(root, 'time-cargo-ro.html'));

const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    const ext = path.extname(p);
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'no-cache' });
    fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

let pass = 0, failCount = 0;
const ok = (c, m) => { if (c) pass++; else { failCount++; console.log('  FAIL ' + m); } };
const browser = await chromium.launch();

async function open(opts) {
    const ctx = await browser.newContext({
        viewport: { width: opts.w, height: opts.h }, deviceScaleFactor: opts.mobile ? 2 : 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile,
        colorScheme: opts.theme || 'dark', reducedMotion: opts.reduced ? 'reduce' : 'no-preference', locale: opts.locale || (opts.lang === 'ro' ? 'ro-RO' : 'en-GB')
    });
    if (opts.noStorage) await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(base + (opts.lang === 'ro' ? 'time-cargo-ro.html' : 'time-cargo.html') + (opts.hash || ''));
    await page.waitForSelector('html[data-ready="true"]');
    return { ctx, page, errors };
}
const hidden = (page, sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return getComputedStyle(e).display === 'none' || (r.width === 0 && r.height === 0); });
const visible = async (page, sel) => !(await hidden(page, sel));
const fmtNum = (n, d, lang) => new Intl.NumberFormat(lang === 'ro' ? 'ro-RO' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n).replace(/^-/, '−');

async function scenario(name, opts) {
    console.log('\n' + name);
    const { ctx, page, errors } = await open(opts);
    const lang = opts.lang || 'en';
    const C = D.copy[lang];

    // terrain is painted and sized; sticky in view
    const box = await page.$eval('#terrain', (c) => { const r = c.getBoundingClientRect(); return { w: r.width, h: r.height, top: r.top }; });
    ok(box.w > 250 && box.h > 120, `${name}: terrain too small (${box.w}x${box.h})`);
    const colours = await page.$eval('#terrain', (c) => { const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; const s = new Set(); for (let i = 0; i < d.length; i += 4 * 211) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ',' + d[i + 3]); return s.size; });
    ok(colours > 25, `${name}: terrain canvas looks blank (${colours} colours)`);
    ok(await page.$eval('#terrain-status', (e) => e.textContent.trim().length > 10), `${name}: terrain status empty`);

    // untouched terrain keeps the manifest order and names no row
    ok(await page.evaluate(() => JSON.stringify(window.__TC.terrain.order) === JSON.stringify(window.__TC.D.MANIFEST_ORDER)), `${name}: terrain must start in manifest order`);
    ok(await hidden(page, '#ranking-body'), `${name}: ranking must be hidden before the reader asks`);
    ok(await visible(page, '#ranking-lock'), `${name}: ranking lock must show`);

    // choose WD-40 by keyboard
    await page.focus('.cargo[data-id="wd40"]');
    await page.keyboard.press('Enter');
    await page.waitForSelector('#step-brief:not([hidden])');
    ok(await hidden(page, '#step-choose'), `${name}: choose step must disappear (computed display)`);
    ok(await visible(page, '#step-brief'), `${name}: brief must be visible`);
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 'brief-name'), `${name}: focus should move to the object heading`);
    ok((await page.textContent('#brief-name')).length > 2, `${name}: brief name empty`);
    ok(await page.evaluate(() => location.hash === '#item/wd40'), `${name}: address bar should be #item/wd40`);
    // the picture must not leak the chosen object's best era: its row is masked
    const eraCount = await page.$$eval('#era-list .era', (n) => n.length);
    ok(eraCount === 9, `${name}: nine eras expected`);

    // hint opens
    await page.click('#hint-btn');
    ok(await visible(page, '#hint-text') && await hidden(page, '#hint-btn'), `${name}: hint should show and its button should go`);

    // land in the best era: tunnel, then beats
    await page.click('.era[data-era="w9"]');
    await page.waitForSelector('#warp:not([hidden])', { timeout: 3000 });
    await page.keyboard.press('Escape');
    await page.waitForSelector('#warp', { state: 'hidden', timeout: 3000 });
    await page.waitForSelector('#step-journey:not([hidden])');
    ok(await hidden(page, '#step-brief'), `${name}: brief must disappear`);
    const yr = (await page.textContent('#journey-title')).trim();
    ok(yr === '1862', `${name}: WD-40 lands in 1862 (got ${yr})`);
    ok(await hidden(page, '#result'), `${name}: result must wait for the beats`);
    if (opts.w <= 860) {
        await page.waitForTimeout(1600);
        const g = await page.evaluate(() => ({ t: document.getElementById('journey-title').getBoundingClientRect().top, b: document.querySelector('.terrain-col').getBoundingClientRect().bottom }));
        ok(g.t >= g.b - 2, `${name}: the landing year must sit below the pinned picture (year top ${Math.round(g.t)}, picture bottom ${Math.round(g.b)})`);
    }
    for (let i = 0; i < 3; i++) { await page.click('#next-btn'); }
    await page.click('#next-btn'); // "see your score"
    await page.waitForSelector('#result:not([hidden])');
    const wd = D.ITEMS.find((i) => i.id === 'wd40');
    const expect = Math.round(M.landing(wd, 'w9').score);
    const shown = (await page.textContent('#res-num')).replace(/[^\d]/g, '').slice(0, String(expect).length);
    ok(shown === String(expect), `${name}: score ${shown} should equal model ${expect}`);
    ok((await page.textContent('#res-verdict')) === C.result.verdict.best, `${name}: verdict label`);
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 'res-heading'), `${name}: focus should move to the result`);
    ok(await page.evaluate(() => location.hash === '#land/wd40/w9'), `${name}: address bar should name the landing`);
    // boarding pass
    const passInfo = await page.$eval('#pass', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const s = new Set(); for (let i = 0; i < d.length; i += 4 * 997) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return { w: c.width, h: c.height, colours: s.size }; });
    ok(passInfo.w === 1200 && passInfo.h === 630 && passInfo.colours > 15, `${name}: boarding pass should be 1200x630 and painted`);
    const wa = await page.getAttribute('#sh-wa', 'href');
    const sharePage = `share/${lang}/wd40-w9.html`;
    ok(wa.startsWith('https://api.whatsapp.com/send?text=') && decodeURIComponent(wa).includes(sharePage), `${name}: WhatsApp link should carry the result's preview page`);
    ok((await page.getAttribute('#sh-fb', 'href')).includes(encodeURIComponent(sharePage)), `${name}: Facebook link carries the result's preview page`);
    ok(fs.existsSync(path.join(root, sharePage)) && fs.existsSync(path.join(root, sharePage.replace('.html', '.png'))), `${name}: the preview page and its picture must exist (run scripts/build-time-cargo-cards.mjs)`);
    // language link keeps the hash
    const lh = await page.getAttribute('#lang-other', 'href');
    ok(lh.endsWith('#land/wd40/w9'), `${name}: language link must keep the hash (${lh})`);
    // bars
    ok((await page.$$eval('#era-bars div', (n) => n.length)) === 9 && (await page.$$eval('#era-bars div[data-you="true"]', (n) => n.length)) === 1, `${name}: nine bars, one outlined`);

    // the row is now named and dark except the landing
    ok(await page.evaluate(() => window.__TC.terrain.named('wd40')), `${name}: landed row must be named`);

    // wrong landing
    await page.click('#again-btn');
    await page.waitForSelector('#step-brief:not([hidden])');
    ok(await page.$eval('.era[data-era="w9"]', (e) => e.dataset.visited === 'true'), `${name}: visited era should be marked`);
    await page.click('.era[data-era="w3"]');
    await page.waitForSelector('#warp:not([hidden])');
    await page.click('#warp-skip');
    await page.waitForSelector('#result:not([hidden])');
    const expectWrong = Math.round(M.landing(wd, 'w3').score);
    ok((await page.textContent('#res-num')).replace(/[^\d]/g, '').startsWith(String(expectWrong)), `${name}: wrong-landing score should be ${expectWrong}`);
    ok((await page.textContent('#res-verdict')) === C.result.verdict.lost, `${name}: wrong landing is "lost"`);
    ok(await visible(page, '#best-was'), `${name}: the best landing is revealed after a miss`);
    ok(await hidden(page, '#next-row'), `${name}: no continue button on a miss`);

    // reveal the ranking, then it equals the model
    await page.click('#rank-btn');
    await page.waitForSelector('#ranking-body:not([hidden])');
    await page.waitForTimeout(700);
    const names = await page.$$eval('#rank-list .rank-row .nm', (n) => n.map((x) => x.firstChild.textContent));
    const modelNames = M.ranking().map((r) => (D.copy[lang === 'ro' ? 'ro' : 'en'].items && lang === 'ro' ? D.copy.ro.items[r.id].name : D.ITEMS.find((i) => i.id === r.id).name));
    ok(JSON.stringify(names) === JSON.stringify(modelNames), `${name}: ranking list order must equal the model`);
    const deltas = await page.$$eval('#rank-list .rank-row .dl', (n) => n.map((x) => x.firstChild.textContent));
    ok(JSON.stringify(deltas) === JSON.stringify(M.ranking().map((r) => fmtNum(Math.round(r.delta), 0, lang))), `${name}: printed Deltas must equal the model`);
    ok(await page.evaluate(() => JSON.stringify(window.__TC.terrain.order) === JSON.stringify(window.__TC.M.ranking().map((r) => r.id))), `${name}: terrain re-sorts into the ranking`);
    // printed statistics equal the Node-side recomputation
    const finding = await page.textContent('#finding');
    const pull = M.dimensionPull();
    ok(finding.includes(fmtNum(pull.copy, 2, lang)) && finding.includes(fmtNum(pull.trust, 2, lang)), `${name}: finding must print ρ(Copy) ${fmtNum(pull.copy, 2, lang)} and ρ(Trust) ${fmtNum(pull.trust, 2, lang)}`);
    const ag = D.RATERS.map((r) => M.raterAgreement(r).rho);
    ok(finding.includes(fmtNum(Math.min(...ag), 2, lang)) && finding.includes(fmtNum(Math.max(...ag), 2, lang)), `${name}: finding must print the rater agreement range`);
    // method tables
    ok((await page.$$eval('#method-body table', (n) => n.length)) >= 4, `${name}: method tables`);
    const sv = M.weightSensitivity(D.SENS.draws, D.SENS.seed);
    const t1 = await page.evaluate(() => Array.from(document.querySelectorAll('#method-body table')[0].querySelectorAll('tbody tr')).map((r) => Array.from(r.children).map((c) => c.textContent)));
    ok(t1.length === 20, `${name}: sensitivity table has 20 rows`);
    const potatoRow = t1.find((r) => r[0] === (lang === 'ro' ? D.copy.ro.items.potato.name : D.ITEMS[0].name));
    ok(potatoRow && potatoRow[1] === fmtNum(sv.potato.median, 0, lang) && potatoRow[3] === fmtNum(Math.round(sv.potato.top5 * 100), 0, lang) + '%', `${name}: sensitivity numbers must equal the Node recomputation`);

    // sticky picture while the ranking scrolls
    await page.evaluate(() => document.getElementById('ranking').scrollIntoView());
    await page.waitForTimeout(400);
    const tb = await page.$eval('.terrain-col', (e) => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, vh: innerHeight }; });
    ok(tb.top >= 0 && tb.top < 130 && tb.bottom <= tb.vh, `${name}: the picture must stay in view while the ranking scrolls (top ${Math.round(tb.top)}, bottom ${Math.round(tb.bottom)})`);
    // open a row; the picture follows
    await page.evaluate(() => document.querySelector('#rank-list .rank-row summary').click());
    ok(await page.$eval('#rank-list .rank-row', (d) => d.open), `${name}: a ranking row opens`);
    ok((await page.$$eval('#rank-list .rank-row .src-list a', (n) => n.length)) >= 60, `${name}: every object lists its sources`);
    ok((await page.$$eval('#rank-list .rank-row .src-list a', (n) => n.every((a) => a.target === '_blank' && /noopener/.test(a.rel)))), `${name}: source links open in a new tab`);

    // return paths: top button and clear
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(250);
    ok(await hidden(page, '#to-top'), `${name}: the top button stays out of the way while the reader scrolls down`);
    await page.evaluate(() => window.scrollBy(0, -200));
    await page.waitForTimeout(250);
    ok(await visible(page, '#to-top'), `${name}: the top button appears when the reader scrolls back up`);
    await page.click('#clear-all');
    await page.waitForFunction(() => { const y = window.scrollY; return new Promise((res) => setTimeout(() => res(window.scrollY === y), 150)); }, null, { timeout: 5000 });
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => Object.keys(window.__TC.state.results).length === 0 && window.__TC.state.peek === false), `${name}: clear must empty state`);
    ok(await hidden(page, '#ranking-body') && await visible(page, '#ranking-lock'), `${name}: clear must lock the ranking again`);
    ok(await page.evaluate(() => JSON.stringify(window.__TC.terrain.order) === JSON.stringify(window.__TC.D.MANIFEST_ORDER)), `${name}: clear returns the terrain to manifest order`);
    ok(await page.$eval('#terrain-status', (e) => e.textContent.trim()) === C.terrain.statusStart, `${name}: status back to first-visit text`);
    ok(await hidden(page, '#clear-all'), `${name}: the clear button hides when there is nothing to clear`);
    ok(await page.evaluate(() => !localStorage.getItem('timeCargo.v1') || JSON.parse(localStorage.getItem('timeCargo.v1')).peek === false), `${name}: storage cleared`);
    ok(await page.evaluate(() => location.hash === ''), `${name}: address bar returns to the bare page after clear`);
    ok(errors.length === 0, `${name}: errors: ${errors.join(' | ')}`);
    await ctx.close();
}

async function deepLinks(lang) {
    console.log('\nDeep links (' + lang + ')');
    let t = await open({ w: 1280, h: 800, lang, hash: '#land/stamps/w4' });
    ok(await visible(t.page, '#result') && (await t.page.textContent('#journey-title')).trim() === '1285', 'a shared landing opens on its result, in 1285');
    ok((await t.page.textContent('#res-num')).replace(/[^\d]/g, '').startsWith(String(Math.round(M.delta(D.ITEMS.find((i) => i.id === 'stamps'))))), 'stamps best landing scores ' + Math.round(M.delta(D.ITEMS.find((i) => i.id === 'stamps'))));
    ok(t.errors.length === 0, 'deep link errors: ' + t.errors.join('|'));
    await t.ctx.close();
    t = await open({ w: 1280, h: 800, lang, hash: '#item/potato' });
    ok(await visible(t.page, '#step-brief') && await hidden(t.page, '#step-choose'), '#item/potato opens the brief');
    await t.ctx.close();
    t = await open({ w: 1280, h: 800, lang, hash: '#rank/stamps' });
    await t.page.waitForTimeout(300);
    ok(await t.page.$eval('#rank-stamps', (d) => d.open), '#rank/stamps opens that row');
    await t.ctx.close();
    t = await open({ w: 1280, h: 800, lang, hash: '#land/nonsense/w1' });
    ok(await visible(t.page, '#step-choose'), 'a malformed hash falls back to the first step');
    await t.ctx.close();
}

async function suggestion() {
    console.log('\nLanguage suggestion');
    let t = await open({ w: 1280, h: 800, lang: 'en', locale: 'ro-RO' });
    ok(await visible(t.page, '#lang-suggest'), 'a Romanian browser is offered the Romanian edition');
    ok((await t.page.evaluate(() => document.documentElement.lang)) === 'en', 'the page itself is not redirected');
    ok((await t.page.getAttribute('#suggest-open', 'href')).includes('time-cargo-ro.html'), 'the suggestion links to the Romanian page');
    await t.page.click('#suggest-close');
    ok(await hidden(t.page, '#lang-suggest'), 'the suggestion can be dismissed');
    await t.page.reload(); await t.page.waitForSelector('html[data-ready="true"]');
    ok(await hidden(t.page, '#lang-suggest'), 'a dismissed suggestion stays dismissed');
    await t.ctx.close();
    t = await open({ w: 1280, h: 800, lang: 'en', locale: 'en-GB' });
    ok(await hidden(t.page, '#lang-suggest'), 'an English browser sees no suggestion on the English page');
    await t.ctx.close();
}

async function resilience() {
    console.log('\nResilience');
    let t = await open({ w: 375, h: 812, mobile: true, noStorage: true });
    await t.page.click('.cargo[data-id="potato"]');
    await t.page.click('.era[data-era="w4"]');
    await t.page.waitForSelector('#warp:not([hidden])');
    await t.page.click('#warp-skip');
    await t.page.waitForSelector('#step-journey:not([hidden])');
    ok((await t.page.textContent('#journey-title')).trim() === '1314', 'works with storage blocked');
    ok(t.errors.length === 0, 'storage-blocked errors: ' + t.errors.join('|'));
    await t.ctx.close();
    t = await open({ w: 1280, h: 800, reduced: true });
    await t.page.click('.cargo[data-id="ors"]');
    await t.page.click('.era[data-era="w8"]');
    const t0 = Date.now();
    await t.page.waitForSelector('#step-journey:not([hidden])', { timeout: 4000 });
    ok(Date.now() - t0 < 2500, 'reduced motion: the tunnel resolves quickly (' + (Date.now() - t0) + ' ms)');
    ok(t.errors.length === 0, 'reduced-motion errors: ' + t.errors.join('|'));
    await t.ctx.close();
}

async function layout(lang) {
    console.log('\nLayout and targets (' + lang + ')');
    for (const [w, h, mobile] of [[320, 640, true], [375, 812, true], [390, 844, true], [768, 1024, true], [1280, 800, false], [1440, 900, false]]) {
        for (const theme of ['dark', 'light']) {
            const t = await open({ w, h, mobile, theme, lang });
            const label = `${lang} ${w}px ${theme}`;
            const check = async (where) => {
                const o = await t.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
                ok(o.sw <= o.iw + 1, `${label} ${where}: horizontal overflow (${o.sw} > ${o.iw})`);
            };
            await check('first screen');
            await t.page.click('.cargo[data-id="vitc"]');
            await check('brief');
            await t.page.click('.era[data-era="w5"]');
            await t.page.waitForSelector('#warp:not([hidden])');
            await t.page.click('#warp-skip');
            await t.page.waitForSelector('#step-journey:not([hidden])');
            for (let i = 0; i < 4; i++) { const b = await t.page.$('#next-btn'); if (b && await b.isVisible()) await b.click(); }
            await t.page.waitForSelector('#result:not([hidden])');
            await check('result');
            if (mobile) {
                const small = await t.page.$$eval('button, .btn, .icon-btn, .era, .cargo, summary, .lang-switch a, .nav-link', (nodes) => nodes.filter((n) => { const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && (r.height < 43.5 || r.width < 43.5) && !n.closest('.era-list') ; }).map((n) => (n.id || n.className || n.tagName) + ':' + Math.round(n.getBoundingClientRect().width) + 'x' + Math.round(n.getBoundingClientRect().height)));
                ok(small.length === 0, `${label}: touch targets under 44px: ${small.slice(0, 6).join(', ')}`);
            }
            await t.page.click('#rank-btn');
            await t.page.waitForSelector('#ranking-body:not([hidden])');
            await t.page.evaluate(() => document.querySelectorAll('#rank-list details').forEach((d) => { d.open = true; }));
            await check('ranking open');
            ok(errorsFree(t.errors), `${label}: errors ${t.errors.join('|')}`);
            // text must not be cut: no element inside the content column wider than the viewport
            const wide = await t.page.$$eval('.content-col *', (nodes) => nodes.filter((n) => n.getBoundingClientRect().right > innerWidth + 2 && !n.closest('.tablewrap')).slice(0, 3).map((n) => n.tagName + '.' + n.className));
            ok(wide.length === 0, `${label}: elements beyond the viewport: ${wide.join(', ')}`);
            await t.ctx.close();
        }
    }
}
const errorsFree = (e) => e.length === 0;

async function themeSwitch() {
    console.log('\nTheme');
    const t = await open({ w: 1280, h: 800, theme: 'dark' });
    const sample = () => t.page.$eval('#terrain', (c) => { const d = c.getContext('2d').getImageData(Math.round(c.width * 0.5), Math.round(c.height * 0.5), 1, 1).data; return Array.from(d).join(','); });
    const before = await sample();
    const bgBefore = await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await t.page.click('#theme-btn');
    await t.page.waitForTimeout(300);
    const after = await sample();
    const bgAfter = await t.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(bgBefore !== bgAfter, 'the page background changes with the theme');
    ok(before !== after, 'the terrain canvas is redrawn with the new theme');
    ok(await t.page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'light'), 'data-theme is set to light');
    ok(t.errors.length === 0, 'theme errors: ' + t.errors.join('|'));
    await t.ctx.close();
}

await scenario('EN desktop dark', { w: 1280, h: 800, theme: 'dark', lang: 'en' });
await scenario('EN phone light', { w: 375, h: 812, mobile: true, theme: 'light', lang: 'en' });
await deepLinks('en');
await suggestion();
await resilience();
await themeSwitch();
await layout('en');
if (HAS_RO) {
    await scenario('RO desktop dark', { w: 1280, h: 800, theme: 'dark', lang: 'ro' });
    await scenario('RO phone dark', { w: 375, h: 812, mobile: true, theme: 'dark', lang: 'ro' });
    await deepLinks('ro');
    await layout('ro');
} else console.log('\n(Romanian edition not built yet; skipped)');

await browser.close();
server.close();
console.log(`\n${pass} checks passed, ${failCount} failed`);
process.exit(failCount ? 1 : 0);
