// Builds the social images and the per-result share pages for the time-cargo piece.
//   - time-cargo-og.png, time-cargo-og-ro.png: the poster for each edition
//   - share/<lang>/<item>-<era>.png and .html: one preview page per landing
// A link to a result must preview that result, and WhatsApp/Facebook read og:image from static
// HTML only (they ignore #hash and run no script). Each share page therefore carries its own
// og tags and image, then sends the reader on to the main page with the landing selected.
// The picture is the boarding pass the reader sees, drawn by the page's own code.
// Run: node scripts/build-time-cargo.mjs && node scripts/build-time-cargo-cards.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['time-cargo-data.js', 'time-cargo-copy.en.js', 'time-cargo-copy.ro.js', 'time-cargo-model.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx));
const D = ctx.TIME_CARGO, M = ctx.TimeCargoModel;
const BASE = 'https://mariuscomper.github.io/deep-logic-webapp/';
const FILES = { en: 'time-cargo.html', ro: 'time-cargo-ro.html' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const yearLabel = (lang, y) => (y < 0 ? (lang === 'ro' ? -y + ' î.Hr.' : -y + ' BCE') : String(y));

const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
    res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}/`;
const browser = await pw.chromium.launch();

const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'tc-cards-'));
const quantList = [];

for (const lang of ['en', 'ro']) {
    const C = D.copy[lang];
    const items = lang === 'ro' ? (id) => D.copy.ro.items[id] : (id) => D.ITEMS.find((i) => i.id === id);
    const dir = path.join(root, 'share', lang);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark', locale: lang === 'ro' ? 'ro-RO' : 'en-GB' });
    const page = await context.newPage();
    await page.goto(origin + FILES[lang]);
    await page.waitForSelector('html[data-ready="true"]');

    for (const it of D.ITEMS) {
        for (const era of D.ERAS) {
            await page.evaluate(({ id, e }) => window.__TC.go({ step: 'journey', itemId: id, eraId: e }, false), { id: it.id, e: era.id });
            const dataUrl = await page.$eval('#pass', (c) => c.toDataURL('image/png'));
            const name = `${it.id}-${era.id}`;
            const raw = path.join(tmp, `${lang}-${name}.png`);
            fs.writeFileSync(raw, Buffer.from(dataUrl.split(',')[1], 'base64'));
            quantList.push([raw, path.join(dir, name + '.png')]);

            const L = M.landing(it, era.id);
            const isBest = era.id === it.sweet;
            const year = isBest ? it.best.year : era.year;
            const nameText = items(it.id).name;
            const eraName = C.eras[era.id].name;
            const title = fill(C.result.shareText, { item: nameText, era: eraName, year: yearLabel(lang, year), n: Math.round(L.score) });
            const main = BASE + FILES[lang];
            const target = `../../${FILES[lang]}#land/${it.id}/${era.id}`;
            const selfUrl = `${BASE}share/${lang}/${name}.html`;
            const img = `${BASE}share/${lang}/${name}.png`;
            const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${main}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(C.brand)}">
<meta property="og:locale" content="${lang === 'en' ? 'en_GB' : 'ro_RO'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(C.description)}">
<meta property="og:url" content="${selfUrl}">
<meta property="og:image" content="${img}">
<meta property="og:image:secure_url" content="${img}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(C.description)}">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<p><a href="${target}">${esc(title)}</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>
`;
            fs.writeFileSync(path.join(dir, name + '.html'), html);
        }
    }
    await context.close();

    // the poster for the whole piece
    const poster = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await poster.setContent('<!DOCTYPE html><meta charset="utf-8"><body style="margin:0"><canvas id="c" width="1200" height="630"></canvas>');
    await poster.addScriptTag({ path: path.join(root, 'time-cargo-data.js') });
    await poster.addScriptTag({ path: path.join(root, 'time-cargo-model.js') });
    const ranking = M.ranking().map((r) => r.id);
    const line = fill(C.ogLine, { n: D.ITEMS.length, m: D.ERAS.length, r: D.RATERS.length });
    const dataUrl = await poster.evaluate(({ ranking, h1, kicker, line }) => {
        const D = window.TIME_CARGO, M = window.TimeCargoModel;
        const c = document.getElementById('c'), x = c.getContext('2d');
        const W = 1200, H = 630;
        const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b1220'); g.addColorStop(1, '#16254a');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        const RAMP = [[22, 35, 63], [29, 95, 124], [59, 169, 162], [220, 194, 90], [255, 243, 196]];
        const col = (v) => { const t = Math.max(0, Math.min(100, v)) / 100 * 4, i = Math.min(3, Math.floor(t)), f = t - i, a = RAMP[i], b = RAMP[i + 1]; return 'rgb(' + [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f)).join(',') + ')'; };
        // the surface, sorted by Delta, on the right
        const gx = 660, gy = 60, cw = 56, ch = 24;
        ranking.forEach((id, r) => {
            D.ERAS.forEach((e, k) => {
                const v = M.landing(M.byId[id], e.id).score;
                const cc = col(v);
                if (v > 55) { x.shadowColor = cc; x.shadowBlur = 8 + (v - 55) / 4; }
                x.fillStyle = cc;
                x.beginPath(); x.roundRect(gx + k * cw, gy + r * ch, cw - 4, ch - 4, 4); x.fill();
                x.shadowBlur = 0; x.shadowColor = 'transparent';
            });
        });
        // text
        x.fillStyle = '#86d6e3'; x.font = '700 22px system-ui, sans-serif';
        x.fillText(kicker.toUpperCase(), 60, 90);
        x.fillStyle = '#f1f4f9'; x.font = '700 54px Georgia, "Iowan Old Style", serif';
        const words = h1.split(' '); let lineT = '', y = 170; const lines = [];
        words.forEach((w) => { const t = lineT ? lineT + ' ' + w : w; if (x.measureText(t).width > 540 && lineT) { lines.push(lineT); lineT = w; } else lineT = t; });
        lines.push(lineT);
        lines.forEach((l, i) => x.fillText(l, 60, y + i * 66));
        x.fillStyle = '#f0c35a'; x.font = '700 28px system-ui, sans-serif';
        x.fillText(line, 60, 560);
        return c.toDataURL('image/png');
    }, { ranking, h1: C.h1, kicker: C.kicker, line });
    const out = path.join(tmp, `og-${lang}.png`);
    fs.writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
    quantList.push([out, path.join(root, lang === 'en' ? 'time-cargo-og.png' : 'time-cargo-og-ro.png')]);
    await poster.close();
}
await browser.close();
server.close();

// quantise every PNG to a small palette (about a third of the size, no visible loss on flat art)
const py = `
import sys, json
from PIL import Image
pairs = json.load(open(sys.argv[1]))
for src, dst in pairs:
    im = Image.open(src).convert('RGB')
    q = im.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    q.save(dst, optimize=True)
`;
const listFile = path.join(tmp, 'pairs.json');
fs.writeFileSync(listFile, JSON.stringify(quantList));
fs.writeFileSync(path.join(tmp, 'q.py'), py);
execFileSync('python3', ['-I', path.join(tmp, 'q.py'), listFile], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
const total = quantList.reduce((s, [, d]) => s + fs.statSync(d).size, 0);
console.log(`wrote ${quantList.length} images, ${(total / 1e6).toFixed(1)} MB, and ${quantList.length - 2} share pages`);
