// Builds time-cargo.html (English, root) and time-cargo-ro.html (Romanian) from
// the template, the data files and the shared model. Run: node scripts/build-time-cargo.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
load('time-cargo-data.js');
load('time-cargo-copy.en.js');
if (fs.existsSync(path.join(root, 'time-cargo-copy.ro.js'))) load('time-cargo-copy.ro.js');
load('time-cargo-model.js');
const D = ctx.TIME_CARGO;
const M = ctx.TimeCargoModel;

const BASE = 'https://mariuscomper.github.io/deep-logic-webapp/';
const FILES = { en: 'time-cargo.html', ro: 'time-cargo-ro.html' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = (lang) => new Intl.NumberFormat(D.copy[lang].locale);

function lookup(obj, p) { return p.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
function yearLabel(lang, y) { return y < 0 ? (lang === 'ro' ? (-y) + ' î.Hr.' : (-y) + ' BCE') : String(y); }
function ovl(lang, id) { return lang === 'en' ? null : (D.copy[lang].items || {})[id] || null; }
function tx(lang, it, f) { const o = ovl(lang, it.id); return o && o[f] !== undefined ? o[f] : it[f]; }

function build(lang) {
    const C = D.copy[lang];
    const tpl = fs.readFileSync(path.join(root, 'scripts/templates/time-cargo.template.html'), 'utf8');
    const canonical = BASE + FILES[lang];
    const n = nf(lang);
    const ranking = M.ranking();
    const ssrCards = '<ul class="ssr-list" style="list-style:none;display:contents">' + D.MANIFEST_ORDER.map((id) => {
        const it = M.byId[id];
        return `<li class="cargo" style="cursor:default"><span class="emoji" aria-hidden="true">${it.emoji}</span><span class="nm">${esc(tx(lang, it, 'name'))}</span><span class="sb">${esc(tx(lang, it, 'sub'))}</span><span class="tg">${esc(tx(lang, it, 'tagline'))}</span></li>`;
    }).join('') + '</ul>';
    const ssrRanking = ranking.map((r, i) => {
        const it = M.byId[r.id];
        const b = ovl(lang, it.id) && ovl(lang, it.id).best ? ovl(lang, it.id).best : it.best;
        return `<li class="rank-row" style="padding:.65rem .9rem"><b>${i + 1}. ${it.emoji} ${esc(tx(lang, it, 'name'))}</b> — Delta ${n.format(Math.round(r.delta))}. ${esc(yearLabel(lang, it.best.year))}, ${esc(b.place)} (${esc(C.eras[it.sweet].name)}).</li>`;
    }).join('');
    const ssrMethod = `<p>${esc(C.method.m1.replace(/\{wNeed\}/g, n.format(D.WEIGHTS.need * 100)).replace(/\{wCopy\}/g, n.format(D.WEIGHTS.copy * 100)).replace(/\{wTrust\}/g, n.format(D.WEIGHTS.trust * 100)).replace(/\{wRipple\}/g, n.format(D.WEIGHTS.ripple * 100)))}</p>`;
    const ogImage = BASE + (lang === 'en' ? 'time-cargo-og.png' : 'time-cargo-og-ro.png');
    const jsonld = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article', headline: C.h1, description: C.description,
        inLanguage: lang, datePublished: '2026-10-10', mainEntityOfPage: canonical, image: ogImage
    });
    const vars = {
        lang, title: C.title, description: C.description, canonical,
        urlEn: BASE + FILES.en, urlRo: BASE + FILES.ro, siteName: C.brand,
        ogLocale: lang === 'en' ? 'en_GB' : 'ro_RO', ogImage, ogAlt: C.ogAlt || C.title,
        jsonld, ssrCards, ssrRanking, ssrMethod,
        enHref: lang === 'en' ? '#top' : './' + FILES.en, roHref: lang === 'ro' ? '#top' : './' + FILES.ro,
        enCurrent: lang === 'en' ? 'aria-current="true"' : '', roCurrent: lang === 'ro' ? 'aria-current="true"' : '',
        enIdAttr: lang === 'ro' ? 'id="lang-other" data-base="./' + FILES.en + '"' : '',
        roIdAttr: lang === 'en' ? 'id="lang-other" data-base="./' + FILES.ro + '"' : ''
    };
    let missing = [];
    const out = tpl.replace(/\{\{([\w.]+)\}\}/g, (m, key) => {
        if (key in vars) return key === 'jsonld' || key.startsWith('ssr') || key.endsWith('Attr') || key.endsWith('Current') ? vars[key] : esc(vars[key]);
        const v = lookup(C, key);
        if (v === undefined || typeof v === 'object') { missing.push(key); return m; }
        return esc(v);
    });
    if (missing.length) throw new Error(lang + ': missing copy keys: ' + missing.join(', '));
    // lang switch fix: href of the other-language link carries data-base
    fs.writeFileSync(path.join(root, FILES[lang]), out);
    return FILES[lang];
}

const langs = D.copy.ro ? ['en', 'ro'] : ['en'];
langs.forEach((l) => console.log('built', build(l)));
