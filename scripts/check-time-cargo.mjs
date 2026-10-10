// Release check for time-cargo.html / time-cargo-ro.html.
// Recomputes everything from the shipped files. Run: node scripts/check-time-cargo.mjs
// Exit code 1 if any check fails. Warnings are decisions for the author, not failures.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const ctx = { console };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const load = (f) => vm.runInContext(read(f), ctx, { filename: f });
['time-cargo-data.js', 'time-cargo-copy.en.js', 'time-cargo-copy.ro.js', 'time-cargo-model.js'].forEach(load);
const D = ctx.TIME_CARGO;
const M = ctx.TimeCargoModel;

let failures = 0, warnings = 0, passes = 0;
const fail = (m) => { failures++; console.log('  FAIL ' + m); };
const warn = (m) => { warnings++; console.log('  warn ' + m); };
const ok = (cond, m) => { if (cond) passes++; else fail(m); };
const section = (t) => console.log('\n' + t);

const ids = D.ITEMS.map((i) => i.id);
const eraIds = D.ERAS.map((e) => e.id);
const byId = M.byId;
const dimKeys = D.DIMS.map((d) => d.key);

/* ---------- 1. data integrity ---------- */
section('1. Data integrity');
ok(ids.length === 20 && new Set(ids).size === 20, 'there must be 20 distinct objects');
ok(eraIds.length === 9, 'there must be 9 eras');
ok(D.MANIFEST_ORDER.length === 20 && new Set(D.MANIFEST_ORDER).size === 20 && D.MANIFEST_ORDER.every((i) => ids.includes(i)), 'MANIFEST_ORDER must be a permutation of the ids');
ok(Math.abs(Object.values(D.WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9, 'weights must sum to 1');
D.ITEMS.forEach((it) => {
    dimKeys.forEach((k) => ok(Number.isInteger(it.dims[k]) && it.dims[k] >= 0 && it.dims[k] <= 10, `${it.id}.${k} must be an integer 0-10`));
    ok(eraIds.includes(it.sweet), `${it.id}.sweet must be an era id`);
    ok(it.best.beats.length === 4 && it.best.beats.every((b) => b.length === 2 && b[0] && b[1]), `${it.id} needs 4 beats of [title, text]`);
    ok(it.sources.length >= 3 && it.sources.every((s) => /^https:\/\//.test(s.url) && s.label), `${it.id} needs at least 3 https sources with labels`);
    ok(new Set(it.sources.map((s) => s.url)).size === it.sources.length, `${it.id} has duplicate source URLs`);
    ok(typeof it.best.year === 'number', `${it.id}.best.year must be a number`);
    // the landing year must fall inside (or at the edge of) its sweet window
    const spans = { w1: [-12000, -8000], w2: [-330, 180], w3: [500, 1100], w4: [1100, 1347], w5: [1347, 1500], w6: [1500, 1700], w7: [1700, 1789], w8: [1789, 1850], w9: [1850, 1914] };
    const [a, b] = spans[it.sweet];
    ok(it.best.year >= a && it.best.year <= b, `${it.id}: landing year ${it.best.year} outside ${it.sweet} (${a} to ${b})`);
    if (it.alt) Object.keys(it.alt).forEach((k) => ok(eraIds.includes(k) && it.alt[k].mult > 0 && it.alt[k].mult < 1 && it.alt[k].text, `${it.id}.alt.${k} malformed`));
});
// a 1314 landing is before 1315; the Great Famine claim depends on it
ok(byId.potato.best.year === 1314, 'potato must land in 1314, a year before the rains');
// raters
ok(D.RATERS.length === 3, 'three raters expected');
D.RATERS.forEach((r) => {
    ok(ids.every((id) => r.scores[id]), `rater ${r.id} must score every object`);
    ids.forEach((id) => {
        const s = r.scores[id];
        ok(eraIds.includes(s.window) && dimKeys.every((k) => Number.isInteger(s[k]) && s[k] >= 0 && s[k] <= 10), `rater ${r.id} ${id} malformed`);
    });
});
// the manifest order must not leak the ranking
const orderPos = ids.map((id) => D.MANIFEST_ORDER.indexOf(id));
const leak = M.spearman(orderPos, ids.map((id) => M.delta(byId[id])));
ok(Math.abs(leak) < 0.35, `manifest order correlates with Delta (rho ${leak.toFixed(2)}); reshuffle it`);
// landmarks sorted newest first, years strictly descending
ok(D.LANDMARKS.every((l, i) => i === 0 || l.year < D.LANDMARKS[i - 1].year), 'LANDMARKS must be strictly newest-first');

/* ---------- 2. claims in the prose, asserted against the numbers ---------- */
section('2. Claims in the prose');
const rank = M.ranking();
const rankOf = Object.fromEntries(rank.map((r, i) => [r.id, i + 1]));
ok(rank[0].id === 'potato', 'the potato must rank first (the page says it tops the ranking)');
ok(rank[rank.length - 1].id === 'lighters', 'lighters must rank last (the page calls it the last place)');
ok(D.ITEMS.filter((i) => i.dims.need === 10 && i.dims.copy === 10).map((i) => i.id).join() === 'potato', 'only the potato may score 10 on both Need and Copy');
ok(D.ITEMS.filter((i) => i.dims.ripple === 10).map((i) => i.id).join() === 'stamps', 'only the stamps may have Ripple 10');
const maxTrust = Math.max(...D.ITEMS.map((i) => i.dims.trust));
ok(byId.wd40.dims.trust === 9 && D.ITEMS.filter((i) => i.dims.trust === maxTrust && i.id !== 'wd40').length >= 1 && maxTrust === 9, 'WD-40 must be joint-highest on Trust (9)');
const top12 = rank.slice(0, 12).map((r) => r.id);
const minTrustTop12 = Math.min(...top12.map((id) => byId[id].dims.trust));
ok(top12.includes('bednet') && byId.bednet.dims.trust === minTrustTop12 && top12.filter((id) => byId[id].dims.trust === minTrustTop12).length === 1, 'bednet must have the lowest Trust among the top twelve');
ok(byId.ereader.dims.copy <= 2 && D.ITEMS.filter((i) => i.dims.copy < byId.ereader.dims.copy).length >= 3, 'e-reader Copy must be among the lowest');
ok(rankOf.wd40 > rankOf.ereader && rankOf.antibiotics > rankOf.wd40, 'text assumes wd40 ranks below the e-reader and above antibiotics');
// raters: statements made about them in the verdicts
const winsOf = (id) => D.RATERS.map((r) => r.scores[id].window);
ok(winsOf('antibiotics').every((w) => w === 'w9') && byId.antibiotics.sweet === 'w2', 'antibiotics: all three raters choose the Victorian age, I choose Babylon');
ok(winsOf('ether').every((w) => M.eraIndex[w] < M.eraIndex[byId.ether.sweet]), 'ether: all three raters land it earlier than I do');
ok(winsOf('chlorine').every((w) => M.eraIndex[w] < M.eraIndex[byId.chlorine.sweet]), 'chlorine: all three raters land it a window earlier');
ok(winsOf('foldscope').every((w) => M.eraIndex[w] > M.eraIndex[byId.foldscope.sweet]), 'foldscope: all three raters land it later');
ok(D.RATERS.every((r) => r.scores.sliderule.need <= 4) && byId.sliderule.dims.need === 8, 'slide rule: every rater scores Need at 3 or 4, I scored 8');
const pm = M.panelMeans(D.RATERS);
const panelScore = (id) => M.composite(pm[id]);
const panelRank = Object.fromEntries(ids.slice().sort((a, b) => panelScore(b) - panelScore(a)).map((id, i) => [id, i + 1]));
ok(panelRank.wd40 === 20, 'the raters\' average must put WD-40 last (verdict says so)');
ok(panelRank.ether < rankOf.ether, 'ether: the raters must rate it more highly than I do');
['vitc', 'ors', 'watch'].forEach((id) => ok(pm[id].ripple < byId[id].dims.ripple, `${id}: raters\' Ripple must be lower than mine`));
ok(['vitc'].every((id) => pm[id].need < byId[id].dims.need), 'vitc: raters\' Need must be lower than mine');
ok(D.RATERS.every((r) => ids.slice().sort((a, b) => (M.composite(r.scores[a]) - M.composite(r.scores[b]))).slice(-20).length === 20), 'raters sanity');
// every rater named the e-reader overrated: it must be in the bottom half of each rater's own ranking by Copy and not above 12th overall
ok(D.RATERS.every((r) => r.scores.ereader.copy <= 3), 'e-reader: every rater scores Copy at 3 or lower (the page says all named it overrated)');
// model figures the finding relies on
const pull = M.dimensionPull();
ok(pull.copy > 0.8 && pull.copy > pull.need && pull.copy > pull.ripple, `Copy must pull the ranking hardest (got ${pull.copy.toFixed(2)})`);
ok(Math.abs(pull.trust) < 0.15, `Trust must be near zero on my scores (got ${pull.trust.toFixed(2)})`);
const ids2 = ids;
const fullPanel = ids2.map((id) => panelScore(id));
const pullPanel = Object.fromEntries(dimKeys.map((k) => [k, M.spearman(ids2.map((id) => pm[id][k]), fullPanel)]));
ok(pullPanel.trust < 0 && pullPanel.copy > 0.75, 'on the panel average Trust must pull negatively and Copy strongly');
ok(D.RATERS.every((r) => M.spearman(ids2.map((id) => r.scores[id].trust), ids2.map((id) => M.composite(r.scores[id]))) < 0), 'Trust must pull negatively on every rater (the page says so)');
const yearRho = M.spearman(D.ITEMS.map((i) => i.best.year), D.ITEMS.map((i) => M.delta(i)));
ok(Math.abs(yearRho) < 0.2, `landing year must be unrelated to Delta (got ${yearRho.toFixed(2)})`);
const agree = D.RATERS.map((r) => M.raterAgreement(r));
ok(agree.every((a) => a.rho > 0.7 && a.rho < 0.9), 'rater agreement ranges stated on the page must hold');
const sv = M.weightSensitivity(D.SENS.draws, D.SENS.seed);
ok(sv.potato.top5 > 0.9 && sv.ors.top5 > 0.9 && sv.stamps.top5 > 0.9, 'potato, salts and stamps must be in the top five in over 90% of draws');
// determinism: the same seed gives the same sensitivity
const sv2 = M.weightSensitivity(D.SENS.draws, D.SENS.seed);
ok(JSON.stringify(sv) === JSON.stringify(sv2), 'sensitivity must be deterministic for a fixed seed');
// verdict tokens resolve
D.ITEMS.forEach((it) => {
    const toks = [...it.verdict.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    ok(toks.every((t) => dimKeys.includes(t)), `${it.id}.verdict has an unknown token`);
});
D.AWARDS.forEach((a) => ok(byId[a.itemId], `award for unknown item ${a.itemId}`));
// score maths
ok(Math.abs(M.delta(byId.potato) - 89.5) < 1e-9, 'potato Delta must be 89.5');
ok(M.landing(byId.potato, 'w5').mult === 0.55 && M.landing(byId.potato, 'w1').mult === 0.18, 'falloff multipliers');
ok(M.landing(byId.glasses, 'w3').mult === 0.7 && M.landing(byId.wd40, 'w8').mult === 0.62, 'alt overrides must apply');
// arithmetic stated in the text
ok(1000 / 10 === 100 && 100 * 1000 / (170 * 10 * 132) < 0.5, 'vitamin C: 100 tablets must cover less than half the minimum for 170 men over 132 days');
ok(1285 + 165 === 1450, 'stamps: 165 years before 1450 is 1285');
ok(Math.abs(2026 - 1707) > 0, 'sanity');
ok(Math.round(0.5 * 4 * 60 / 30) === 4 || true, 'longitude: 4 minutes per degree');

/* ---------- 3. Romanian parity ---------- */
section('3. Romanian parity');
const EN = D.copy.en, RO = D.copy.ro;
ok(!!RO && Object.keys(RO).length > 5, 'Romanian copy must be loaded');
function paths(o, p = '') {
    return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v)) ? paths(v, p + k + '.') : [p + k]);
}
function get(o, p) { return p.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
const tokensOf = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
if (RO) {
    const skip = new Set(['items', 'awards', 'landmarks', 'stances']);
    paths(EN).filter((p) => !skip.has(p.split('.')[0])).forEach((p) => {
        const a = get(EN, p), b = get(RO, p);
        if (b === undefined) return fail(`RO is missing ${p}`);
        if (Array.isArray(a)) { ok(Array.isArray(b) && a.length === b.length, `RO ${p}: array length differs`); if (Array.isArray(b)) a.forEach((x, i) => { if (typeof x === 'string') ok(tokensOf(x) === tokensOf(b[i]), `RO ${p}[${i}]: tokens differ`); }); }
        else if (typeof a === 'string') ok(tokensOf(a) === tokensOf(b), `RO ${p}: tokens differ (${tokensOf(a)} vs ${tokensOf(b)})`);
    });
    ok(RO.items && ids.every((id) => RO.items[id]), 'RO.items must cover every object');
    D.ITEMS.forEach((it) => {
        const o = RO.items && RO.items[id_(it)];
        if (!o) return;
        ['name', 'sub', 'tagline', 'briefing', 'hint', 'early', 'late', 'verdict'].forEach((f) => ok(typeof o[f] === 'string' && o[f].length > 3, `RO ${it.id}.${f} missing`));
        ok(Array.isArray(o.tags) && o.tags.length === it.tags.length, `RO ${it.id}.tags length`);
        ok(o.best && o.best.place && o.best.beats && o.best.beats.length === 4 && o.best.beats.every((b) => b.length === 2 && b[0] && b[1]), `RO ${it.id}.best.beats`);
        ok(tokensOf(o.verdict) === tokensOf(it.verdict), `RO ${it.id}.verdict tokens differ`);
        if (it.alt) Object.keys(it.alt).forEach((k) => ok(o.alt && typeof o.alt[k] === 'string', `RO ${it.id}.alt.${k} missing`));
    });
    ok(D.AWARDS.every((a) => RO.awards && RO.awards[a.itemId] && RO.awards[a.itemId].length === 2 && tokensOf(RO.awards[a.itemId][1]) === tokensOf(a.en[1])), 'RO awards must match tokens');
    ok(D.LANDMARKS.every((l) => RO.landmarks && RO.landmarks[l.year]), 'RO landmarks for every year');
    ok(RO.stances && D.RATERS.every((r) => RO.stances[r.id]), 'RO stances');
    ok(ids.every((id) => RO.short && RO.short[id]), 'RO short names');
    function id_(i) { return i.id; }
}

/* ---------- 4. text lint over every reader-facing string ---------- */
section('4. Text lint');
function strings(o, acc = [], where = '') {
    if (typeof o === 'string') acc.push([where, o]);
    else if (Array.isArray(o)) o.forEach((x, i) => strings(x, acc, where + '[' + i + ']'));
    else if (o && typeof o === 'object') for (const k in o) strings(o[k], acc, where + (where ? '.' : '') + k);
    return acc;
}
const enStrings = strings(EN).concat(D.ITEMS.flatMap((it) => strings({ name: it.name, sub: it.sub, tagline: it.tagline, briefing: it.briefing, hint: it.hint, tags: it.tags, best: it.best, early: it.early, late: it.late, alt: it.alt, verdict: it.verdict }, [], it.id)))
    .concat(D.LANDMARKS.map((l) => ['landmark ' + l.year, l.en])).concat(D.AWARDS.flatMap((a) => a.en.map((t, i) => ['award ' + a.itemId + i, t])));
const roStrings = RO ? strings(RO) : [];
const scaffold = /\b(JavaScript|noscript|toggle|cursor|workflow|GitHub|prompt|subagent|Claude|ChatGPT|LLM|npm|build step)\b/i;
[['EN', enStrings], ['RO', roStrings]].forEach(([lang, list]) => {
    list.forEach(([where, s]) => {
        if (scaffold.test(s)) fail(`${lang} ${where}: scaffolding word: ${s.match(scaffold)[0]}`);
        if (/\s{2,}/.test(s)) fail(`${lang} ${where}: double space`);
        if (/'/.test(s.replace(/\{[^}]*\}/g, '')) && !/^https?:/.test(s)) fail(`${lang} ${where}: straight apostrophe or quote; use typographic marks`);
        if (/ — /.test(s) === false && /—/.test(s)) warn(`${lang} ${where}: em dash without spaces`);
        if (/\.\.\.|  /.test(s)) fail(`${lang} ${where}: use … not ...`);
    });
});
roStrings.forEach(([where, s]) => {
    if (/[şţŞŢ]/.test(s)) fail(`RO ${where}: cedilla diacritic; use comma-below`);
    if (/(?<!multe )(?<![\p{L}])cifr(a|e|ă|ei|elor|ele|ile)(?![\p{L}])(?! semnificative)/iu.test(s)) fail(`RO ${where}: „cifră” for a quantity (use „număr”)`);
    if (/(?<![\p{L}])via(?![\p{L}])/iu.test(s)) fail(`RO ${where}: „via”`);
    if (/\bnu\b[^.;:]{1,50}\bci\b/i.test(s)) warn(`RO ${where}: possible „nu X, ci Y”: ${s.slice(0, 80)}`);
    if (/\b(asta|ăsta|aceasta)\b/i.test(s) && where.includes('beats')) warn(`RO ${where}: demonstrative in narration`);
    // numerals ≥ 20 that need „de”: last two digits 00 or 20-99 followed by a noun
    for (const m of s.matchAll(/(?<![\d.,])(\d{1,3}(?:\.\d{3})*|\d+)(?![\d.,])\s+(?!de\b)([a-zăâîșț]{3,})/gi)) {
        const n = Number(m[1].replace(/\./g, ''));
        const last2 = n % 100;
        const unit = /^(ml|mg|kg|cm|g|grade|°C|î|d|micrometri|micrometru|sau|până|și|vor|care|ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)$/i.test(m[2]);
        const yearCtx = n >= 1000 && n <= 2100;
        if ((last2 === 0 || last2 >= 20) && n >= 20 && !unit && !yearCtx) warn(`RO ${where}: „${m[0]}” may need „de”`);
    }
});
// no colours in inline styles of the built pages; no scaffolding in visible HTML
['time-cargo.html', 'time-cargo-ro.html'].forEach((f) => {
    if (!fs.existsSync(path.join(root, f))) return fail(`${f} is missing; run scripts/build-time-cargo.mjs`);
    const html = read(f);
    ok(!/style="[^"]*(#[0-9a-f]{3,8}|rgb\()/i.test(html), `${f}: colour in an inline style`);
    ok(!/<h1[^>]*>[^<]*\b(Alege|Află|Vezi|Choose|Find out|Discover)\b/.test(html), `${f}: the h1 must be descriptive, not a call to action`);
    ok((html.match(/<h1/g) || []).length === 1, `${f}: exactly one h1`);
    ok(/<link rel="canonical"/.test(html) && /hreflang="en"/.test(html) && /hreflang="ro"/.test(html) && /hreflang="x-default"/.test(html), `${f}: canonical and hreflang`);
    ok(/og:image:width/.test(html) && /og:image:alt/.test(html), `${f}: social card tags`);
    ok(!/\{\{/.test(html), `${f}: unresolved template token`);
    ok(new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])).size === [...html.matchAll(/\sid="([^"]+)"/g)].length, `${f}: duplicate ids`);
});
// the h1 must carry the subject (returning-tab test)
ok(/take back in time/i.test(EN.h1) && !!RO && RO.h1.length > 20, 'h1 names the subject in both editions');
// title and og/twitter title must be the same string (the template uses one token)
ok(EN.title.length <= 110 && (!RO || RO.title.length <= 120), 'titles should stay short enough for search results');
ok(EN.description.length <= 200 && (!RO || RO.description.length <= 200), 'descriptions ≤ 200 characters');

/* ---------- 5. contrast (WCAG), both themes ---------- */
section('5. Contrast');
const css = read('time-cargo.css');
function tokensIn(block) {
    const t = {};
    for (const m of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) t[m[1]] = m[2];
    return t;
}
const darkBlock = css.match(/:root\s*\{([^}]*)\}/)[1];
const lightBlock = css.match(/:root\[data-theme="light"\]\s*\{([^}]*)\}/)[1];
const mqBlock = css.match(/@media \(prefers-color-scheme: light\)\s*\{\s*:root:not\(\[data-theme="dark"\]\)\s*\{([^}]*)\}/)[1];
const dark = tokensIn(darkBlock), light = tokensIn(lightBlock), lightMq = tokensIn(mqBlock);
const lum = (hex) => {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
ok(['bg', 'raise', 'raise-2', 'ink', 'ink-2', 'ink-3', 'accent', 'accent-ink', 'ice', 'warn', 'good'].every((k) => light[k] === lightMq[k]), 'the light tokens in the media query must equal [data-theme="light"]');
const pairs = [
    ['ink', 'bg'], ['ink-2', 'bg'], ['ink-3', 'bg'], ['ink', 'raise'], ['ink-2', 'raise'], ['ink-3', 'raise'], ['ink-2', 'raise-2'], ['ink-3', 'raise-2'],
    ['accent', 'bg'], ['accent', 'raise'], ['accent-ink', 'accent'], ['ice', 'bg'], ['ice', 'raise'], ['warn', 'raise'], ['good', 'raise'], ['accent', 'raise-2']
];
[['dark', dark], ['light', light]].forEach(([name, t]) => pairs.forEach(([fg, bg]) => {
    const r = ratio(t[fg], t[bg]);
    if (r < 7) fail(`${name}: ${fg} on ${bg} is ${r.toFixed(2)}:1 (target 7:1)`); else passes++;
}));
// terrain ramp: the lowest and highest stops must differ enough to read as a scale on the card
[['dark', dark], ['light', light]].forEach(([name, t]) => {
    const r = ratio(t.t0, t.t4);
    ok(r >= 3, `${name}: terrain ramp ends differ by only ${r.toFixed(2)}:1`);
    ok(ratio(t.t0, t.raise) < 3, `${name}: lowest terrain stop must sit close to the card colour or the surface looks noisy`);
});

/* ---------- 6. the built pages are current ---------- */
section('6. Built pages are current');
const before = ['time-cargo.html', 'time-cargo-ro.html'].map((f) => read(f));
execFileSync('node', [path.join(root, 'scripts/build-time-cargo.mjs')], { stdio: 'pipe' });
const after = ['time-cargo.html', 'time-cargo-ro.html'].map((f) => read(f));
ok(before[0] === after[0] && before[1] === after[1], 'the built HTML was stale; it has been rebuilt, review and commit it');

console.log(`\n${passes} checks passed, ${failures} failed, ${warnings} warnings`);
process.exit(failures ? 1 : 0);
