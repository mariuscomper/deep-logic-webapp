/*
 * Application for time-cargo.html and time-cargo-ro.html.
 * All figures come from TIME_CARGO (data) through TimeCargoModel.
 */
(function () {
    'use strict';

    const D = window.TIME_CARGO;
    const M = window.TimeCargoModel;
    const LANG = document.documentElement.lang === 'ro' ? 'ro' : 'en';
    const C = D.copy[LANG];
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ERA_BY_ID = Object.fromEntries(D.ERAS.map((e) => [e.id, e]));
    const ITEM = M.byId;
    const STORE_KEY = 'timeCargo.v1';
    const N_ITEMS = D.ITEMS.length;
    const N_ERAS = D.ERAS.length;
    const TOTAL = N_ITEMS * N_ERAS;

    /* ---------- small helpers ---------- */
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const numFmt = {};
    function fmt(n, d) {
        const k = d || 0;
        if (!numFmt[k]) numFmt[k] = new Intl.NumberFormat(C.locale, { minimumFractionDigits: k, maximumFractionDigits: k });
        return numFmt[k].format(n).replace(/^-/, '\u2212');
    }
    function fill(str, vars) {
        return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    }
    function el(tag, attrs, kids) {
        const n = document.createElement(tag);
        if (attrs) for (const k in attrs) {
            if (k === 'class') n.className = attrs[k];
            else if (k === 'text') n.textContent = attrs[k];
            else if (k === 'html') n.innerHTML = attrs[k];
            else if (attrs[k] === true) n.setAttribute(k, '');
            else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
        }
        (kids || []).forEach((c) => { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
        return n;
    }
    function listJoin(arr) {
        if (arr.length <= 1) return arr.join('');
        return arr.slice(0, -1).join(C.list.comma) + C.list.and + arr[arr.length - 1];
    }
    function fmtYear(y) {
        if (y < 0) return LANG === 'ro' ? (-y) + ' î.Hr.' : (-y) + ' BCE';
        return String(y);
    }
    function ovl(id) { return (LANG !== 'en' && C.items && C.items[id]) || null; }
    function tx(item, field) {
        const o = ovl(item.id);
        return o && o[field] !== undefined ? o[field] : item[field];
    }
    function bestOf(item) {
        const o = ovl(item.id);
        const b = item.best;
        return {
            year: b.year,
            place: o && o.best ? o.best.place : b.place,
            beats: o && o.best ? o.best.beats : b.beats
        };
    }
    function altText(item, eraId) {
        const o = ovl(item.id);
        if (o && o.alt && o.alt[eraId]) return o.alt[eraId];
        return item.alt && item.alt[eraId] ? item.alt[eraId].text : null;
    }
    function shortName(id) { return C.short[id]; }
    function verdictText(item) {
        const d = item.dims;
        return fill(tx(item, 'verdict'), { need: d.need, copy: d.copy, trust: d.trust, ripple: d.ripple });
    }
    function eraName(id) { return C.eras[id].name; }
    function safe(fn, fallback) { try { return fn(); } catch (e) { return fallback; } }
    function scrollToEl(node, opts) {
        const top = node.getBoundingClientRect().top + window.scrollY - (opts && opts.offset != null ? opts.offset : 70);
        window.scrollTo({ top: Math.max(0, top), behavior: REDUCED.matches ? 'auto' : 'smooth' });
    }

    /* ---------- state + storage ---------- */
    const state = { step: 'choose', itemId: null, eraId: null, results: {}, peek: false, scorer: 'mine', beat: 0, running: false };

    function loadStore() {
        const raw = safe(() => localStorage.getItem(STORE_KEY), null);
        if (!raw) return;
        const v = safe(() => JSON.parse(raw), null);
        if (v && typeof v === 'object') {
            if (v.results && typeof v.results === 'object') {
                for (const k in v.results) {
                    const [i, e] = k.split('|');
                    if (ITEM[i] && ERA_BY_ID[e] && typeof v.results[k] === 'number') state.results[k] = v.results[k];
                }
            }
            state.peek = !!v.peek;
        }
    }
    function saveStore() {
        safe(() => localStorage.setItem(STORE_KEY, JSON.stringify({ results: state.results, peek: state.peek })));
    }
    const resultKey = (i, e) => i + '|' + e;
    const landedCount = () => Object.keys(state.results).length;
    const unlocked = () => state.peek;
    function bestFor(itemId) {
        let b = null;
        D.ERAS.forEach((e) => { const v = state.results[resultKey(itemId, e.id)]; if (v != null && (b == null || v > b)) b = v; });
        return b;
    }

    /* ---------- colour ramp (read from CSS tokens) ---------- */
    let ramp = [];
    function hexToRgb(h) {
        const s = h.trim();
        if (s.startsWith('#')) {
            const v = s.length === 4 ? s.slice(1).split('').map((c) => c + c).join('') : s.slice(1);
            return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
        }
        const m = s.match(/\d+(\.\d+)?/g);
        return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
    }
    function readTheme() {
        const cs = getComputedStyle(document.documentElement);
        ramp = ['--t0', '--t1', '--t2', '--t3', '--t4'].map((k) => hexToRgb(cs.getPropertyValue(k)));
        return {
            ink: cs.getPropertyValue('--ink').trim(), ink2: cs.getPropertyValue('--ink-2').trim(),
            ink3: cs.getPropertyValue('--ink-3').trim(), line: cs.getPropertyValue('--line').trim(),
            accent: cs.getPropertyValue('--accent').trim(), unseen: cs.getPropertyValue('--unseen').trim(),
            bg: cs.getPropertyValue('--bg').trim(), raise: cs.getPropertyValue('--raise').trim()
        };
    }
    function rampColor(v, stops) {
        const s = stops || ramp;
        const x = Math.max(0, Math.min(100, v)) / 100 * (s.length - 1);
        const i = Math.min(s.length - 2, Math.floor(x));
        const f = x - i;
        const a = s[i], b = s[i + 1];
        return 'rgb(' + [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f)).join(',') + ')';
    }
    const DARK_RAMP = [[22, 35, 63], [29, 95, 124], [59, 169, 162], [220, 194, 90], [255, 243, 196]];

    /* ---------- terrain canvas ---------- */
    const terrain = (function () {
        const canvas = $('#terrain');
        const tip = $('#terrain-tip');
        const stage = $('.terrain-stage');
        const ctx = canvas.getContext('2d');
        let theme = readTheme();
        let W = 0, H = 0, dpr = 1;
        let order = D.MANIFEST_ORDER.slice();
        const pos = {};
        order.forEach((id, i) => { pos[id] = i; });
        let target = Object.assign({}, pos);
        let selected = null;
        let maskItem = null;
        let touched = new Set();
        let hover = null;
        let raf = 0;
        const L = {};

        function layout() {
            const rect = canvas.getBoundingClientRect();
            W = Math.max(120, Math.round(rect.width));
            H = Math.max(100, Math.round(rect.height));
            dpr = Math.min(2.5, window.devicePixelRatio || 1);
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            const wide = W >= 380;
            L.wide = wide;
            L.left = wide ? 124 : 24;
            L.top = wide ? 80 : 16;
            L.right = 4;
            L.bottom = 2;
            L.cw = (W - L.left - L.right) / N_ERAS;
            L.rh = (H - L.top - L.bottom) / N_ITEMS;
        }
        function refreshTouched() {
            touched = new Set(Object.keys(state.results).map((k) => k.split('|')[0]));
        }
        // A cell is lit when the reader has landed there, or when its row has not been
        // touched. A row the reader has touched goes dark except where they have landed,
        // so that trying another era is still a guess.
        function lit(itemId, eraIdx) {
            if (state.peek) return true;
            if (state.results[resultKey(itemId, D.ERAS[eraIdx].id)] != null) return true;
            if (maskItem === itemId) return false;
            return !touched.has(itemId);
        }
        function named(itemId) { return state.peek || touched.has(itemId); }
        function roundRect(c, x, y, w, h, r) {
            const rr = Math.min(r, w / 2, h / 2);
            c.beginPath();
            c.moveTo(x + rr, y);
            c.arcTo(x + w, y, x + w, y + h, rr);
            c.arcTo(x + w, y + h, x, y + h, rr);
            c.arcTo(x, y + h, x, y, rr);
            c.arcTo(x, y, x + w, y, rr);
            c.closePath();
        }
        function cellValue(itemId, eraIdx) {
            return M.landing(ITEM[itemId], D.ERAS[eraIdx].id).score;
        }
        function draw() {
            refreshTouched();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);
            const th = theme;
            // era labels
            ctx.fillStyle = th.ink3;
            ctx.font = (L.wide ? 11 : 8) + 'px system-ui, sans-serif';
            ctx.textBaseline = 'middle';
            D.ERAS.forEach((e, c) => {
                const cx = L.left + c * L.cw + L.cw / 2;
                if (L.wide) {
                    ctx.save();
                    ctx.translate(cx, L.top - 6);
                    ctx.rotate(-Math.PI / 2);
                    ctx.textAlign = 'left';
                    ctx.fillText(e.short.replace('BCE', LANG === 'ro' ? 'î.Hr.' : 'BCE'), 0, 0);
                    ctx.restore();
                } else {
                    ctx.textAlign = 'center';
                    ctx.fillText(String(c + 1), cx, L.top - 7);
                }
            });
            // rows
            order.forEach((id) => {
                const y = L.top + pos[id] * L.rh;
                const isSel = selected === id;
                const gap = L.rh > 12 ? 2 : 1;
                // label
                if (isSel) {
                    ctx.fillStyle = th.accent;
                    ctx.globalAlpha = 0.18;
                    ctx.fillRect(0, y, W, L.rh);
                    ctx.globalAlpha = 1;
                }
                ctx.textAlign = 'left';
                ctx.fillStyle = isSel ? th.accent : th.ink2;
                if (named(id)) {
                    if (L.wide) {
                        ctx.font = '13px system-ui, sans-serif';
                        ctx.fillText(ITEM[id].emoji, 4, y + L.rh / 2 + 1);
                        ctx.font = (isSel ? '700 ' : '') + '11px system-ui, sans-serif';
                        const nm = tx(ITEM[id], 'name');
                        ctx.fillText(clip(ctx, nm, L.left - 30), 24, y + L.rh / 2 + 1);
                    } else {
                        ctx.font = Math.min(11, L.rh) + 'px system-ui, sans-serif';
                        ctx.fillText(ITEM[id].emoji, 2, y + L.rh / 2 + 1);
                    }
                } else {
                    ctx.fillStyle = th.ink3;
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(L.wide ? 8 : 5, y + L.rh / 2 - 1, L.wide ? 10 : 8, 2);
                    ctx.globalAlpha = 1;
                }
                // cells
                for (let c = 0; c < N_ERAS; c++) {
                    const x = L.left + c * L.cw;
                    const w = L.cw - gap, h = L.rh - gap;
                    if (lit(id, c)) {
                        const v = cellValue(id, c);
                        const col = rampColor(v, ramp);
                        if (v > 55 && L.rh > 9) { ctx.shadowColor = col; ctx.shadowBlur = 4 + (v - 55) / 5; }
                        ctx.fillStyle = col;
                        roundRect(ctx, x, y, w, h, 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        ctx.shadowColor = 'transparent';
                    } else {
                        ctx.fillStyle = th.unseen;
                        roundRect(ctx, x, y, w, h, 2);
                        ctx.fill();
                        if (L.rh > 9) {
                            ctx.strokeStyle = th.line;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(x + 1, y + h - 1);
                            ctx.lineTo(x + w - 1, y + 1);
                            ctx.stroke();
                        }
                    }
                }
                if (isSel) {
                    ctx.strokeStyle = th.accent;
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(L.left - 0.5, y - 0.5, L.cw * N_ERAS - gap + 1, L.rh - gap + 1);
                }
            });
            if (hover) {
                const y = L.top + pos[hover.id] * L.rh;
                const x = L.left + hover.c * L.cw;
                ctx.strokeStyle = th.ink;
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, L.cw - 1, L.rh - 1);
            }
        }
        function clip(c, text, maxW) {
            if (c.measureText(text).width <= maxW) return text;
            let t = text;
            while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1);
            return t + '…';
        }
        function tick() {
            raf = 0;
            let moving = false;
            order.forEach((id) => {
                const d = target[id] - pos[id];
                if (Math.abs(d) > 0.005) { pos[id] += d * 0.18; moving = true; } else pos[id] = target[id];
            });
            draw();
            if (moving) raf = requestAnimationFrame(tick);
        }
        function redraw() { if (!raf) raf = requestAnimationFrame(tick); }
        function setOrder(ids, animate) {
            order = ids.slice();
            ids.forEach((id, i) => { target[id] = i; if (!animate || REDUCED.matches) pos[id] = i; });
            redraw();
        }
        function setSelected(id) { if (selected !== id) { selected = id; redraw(); } }
        function setMask(id) { if (maskItem !== id) { maskItem = id; redraw(); } }
        function cellAt(ev) {
            const r = canvas.getBoundingClientRect();
            const x = ev.clientX - r.left, y = ev.clientY - r.top;
            if (y < L.top) return null;
            const row = Math.floor((y - L.top) / L.rh);
            const id = order.find((i) => Math.round(target[i]) === row);
            if (!id) return null;
            const c = Math.floor((x - L.left) / L.cw);
            return { id, c: c >= 0 && c < N_ERAS ? c : -1, x, y };
        }
        function showTip(h) {
            if (!h || h.c < 0) { tip.hidden = true; hover = null; redraw(); return; }
            hover = h;
            const era = D.ERAS[h.c];
            const explored = state.results[resultKey(h.id, era.id)] != null;
            const text = !named(h.id)
                ? fill(C.terrain.tipUnknownRow, { era: eraName(era.id) })
                : (state.peek || explored
                    ? fill(C.terrain.tipShown, { item: tx(ITEM[h.id], 'name'), era: eraName(era.id), delta: fmt(Math.round(cellValue(h.id, h.c))) })
                    : fill(C.terrain.tipHidden, { item: tx(ITEM[h.id], 'name'), era: eraName(era.id) }));
            tip.textContent = text;
            tip.hidden = false;
            const sw = stage.getBoundingClientRect().width;
            const tw = tip.offsetWidth;
            tip.style.left = Math.max(0, Math.min(sw - tw, h.x - tw / 2)) + 'px';
            tip.style.top = Math.max(0, h.y - tip.offsetHeight - 10) + 'px';
            redraw();
        }
        canvas.addEventListener('pointermove', (ev) => showTip(cellAt(ev)));
        canvas.addEventListener('pointerleave', () => showTip(null));
        canvas.addEventListener('click', (ev) => {
            const h = cellAt(ev);
            if (h && api.onPick) api.onPick(h.id, h.c);
        });
        const ro = new ResizeObserver(() => { layout(); redraw(); });
        ro.observe(canvas);
        layout();
        const api = {
            setOrder, setSelected, setMask, named, redraw, onPick: null,
            refreshTheme() { theme = readTheme(); redraw(); },
            get order() { return order.slice(); }
        };
        return api;
    })();

    function updateTerrainStatus() {
        const node = $('#terrain-status');
        const n = landedCount();
        node.textContent = state.peek
            ? fill(C.terrain.statusAll, { total: fmt(TOTAL) })
            : (n === 0 ? C.terrain.statusStart : fill(C.terrain.status, { n: fmt(n), total: fmt(TOTAL) }));
        $('#terrain').setAttribute('aria-label', fill(state.peek ? C.terrain.ariaAll : C.terrain.aria, { n: fmt(N_ITEMS), m: fmt(N_ERAS) }));
        $('#clear-all').hidden = n === 0 && !state.peek;
    }

    /* ---------- routing ---------- */
    function hashFor() {
        if (state.step === 'brief' && state.itemId) return '#item/' + state.itemId;
        if (state.step === 'journey' && state.itemId && state.eraId) return '#land/' + state.itemId + '/' + state.eraId;
        return '';
    }
    function pushRoute(replace) {
        const h = hashFor();
        const url = location.pathname + location.search + h;
        if (location.hash === h || (!h && !location.hash)) return;
        safe(() => (replace ? history.replaceState : history.pushState).call(history, null, '', url));
        updateLangLink();
    }
    function updateLangLink() {
        const a = $('#lang-other');
        if (a) a.href = a.getAttribute('data-base') + location.hash;
    }
    function parseHash() {
        const h = location.hash.replace(/^#/, '');
        let m;
        if ((m = h.match(/^item\/(\w+)$/)) && ITEM[m[1]]) return { step: 'brief', itemId: m[1] };
        if ((m = h.match(/^land\/(\w+)\/(w\d)$/)) && ITEM[m[1]] && ERA_BY_ID[m[2]]) return { step: 'journey', itemId: m[1], eraId: m[2] };
        if ((m = h.match(/^rank\/(\w+)$/)) && ITEM[m[1]]) return { step: 'choose', rank: m[1] };
        if (h === 'ranking' || h === 'method') return { step: 'choose', section: h };
        return { step: 'choose' };
    }

    /* ---------- step: choose ---------- */
    function renderChoose() {
        const grid = $('#cargo-grid');
        grid.textContent = '';
        D.MANIFEST_ORDER.forEach((id) => {
            const it = ITEM[id];
            const best = bestFor(id);
            const b = el('button', { type: 'button', class: 'cargo', 'data-id': id });
            b.appendChild(el('span', { class: 'emoji', text: it.emoji, 'aria-hidden': 'true' }));
            if (best != null) {
                b.appendChild(el('span', { class: 'done', text: fill(C.choose.delta, { n: fmt(Math.round(best)) }), 'aria-label': fill(C.choose.doneAria, { n: fmt(Math.round(best)) }) }));
            }
            b.appendChild(el('span', { class: 'nm', text: tx(it, 'name') }));
            b.appendChild(el('span', { class: 'sb', text: tx(it, 'sub') }));
            b.appendChild(el('span', { class: 'tg', text: tx(it, 'tagline') }));
            b.addEventListener('click', () => openItem(id, true));
            grid.appendChild(b);
        });
    }

    /* ---------- step: brief (item + eras) ---------- */
    function renderBrief() {
        const it = ITEM[state.itemId];
        $('#brief-emoji').textContent = it.emoji;
        $('#brief-name').textContent = tx(it, 'name');
        $('#brief-sub').textContent = tx(it, 'sub');
        $('#brief-text').textContent = tx(it, 'briefing');
        const tags = $('#brief-tags');
        tags.textContent = '';
        (tx(it, 'tags') || []).forEach((t) => tags.appendChild(el('span', { class: 'tag', text: t })));
        const hint = $('#hint-text');
        hint.hidden = true;
        hint.textContent = tx(it, 'hint');
        const hb = $('#hint-btn');
        hb.hidden = false;
        const list = $('#era-list');
        list.textContent = '';
        D.ERAS.forEach((e) => {
            const info = C.eras[e.id];
            const v = state.results[resultKey(it.id, e.id)];
            const b = el('button', { type: 'button', class: 'era', 'data-era': e.id, 'data-visited': v != null ? 'true' : 'false' }, [
                el('span', { class: 'yrs', text: info.span }),
                el('span', { class: 'en', text: info.name }),
                el('span', { class: 'go', text: v != null ? fill(C.brief.visited, { n: fmt(Math.round(v)) }) : C.brief.go }),
                el('span', { class: 'pl', text: info.place }),
                el('span', { class: 'cr', text: info.crisis })
            ]);
            b.addEventListener('click', () => land(it.id, e.id));
            list.appendChild(el('li', null, [b]));
        });
        terrain.setSelected(it.id);
        terrain.setMask(it.id);
    }

    /* ---------- time tunnel ---------- */
    function warp(targetYear, place, done) {
        const overlay = $('#warp');
        const cv = $('#warp-canvas');
        const yearEl = $('#warp-year');
        const subEl = $('#warp-sub');
        const skipBtn = $('#warp-skip');
        const FROM = 2026;
        const age = FROM - targetYear;
        const dur = REDUCED.matches ? 900 : Math.round(2000 + 1400 * Math.min(1, Math.log10(Math.max(10, age)) / 4));
        const ctx = cv.getContext('2d');
        let finished = false;
        let start = 0;
        let raf = 0;
        const prevFocus = document.activeElement;
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(window.innerWidth * dpr);
        cv.height = Math.round(window.innerHeight * dpr);
        subEl.textContent = fill(C.warp.sub, { place });
        yearEl.textContent = fmtYear(FROM);
        skipBtn.focus();
        const stars = Array.from({ length: 150 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.9 + 0.05, s: Math.random() * 0.6 + 0.4 }));
        const marks = D.LANDMARKS.filter((m) => m.year < FROM && m.year >= targetYear - 1);
        let lastMark = -1;
        let markUntil = 0;
        let prevE = 0;
        function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
        function finish() {
            if (finished) return;
            finished = true;
            cancelAnimationFrame(raf);
            document.removeEventListener('keydown', onKey, true);
            overlay.hidden = true;
            document.body.style.overflow = '';
            if (prevFocus && prevFocus.focus && document.contains(prevFocus)) safe(() => prevFocus.focus({ preventScroll: true }));
            done();
        }
        function onKey(ev) { if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); finish(); } }
        document.addEventListener('keydown', onKey, true);
        skipBtn.onclick = finish;
        function frame(ts) {
            if (!start) start = ts;
            const p = Math.min(1, (ts - start) / dur);
            const e = REDUCED.matches ? 1 : ease(p);
            const year = Math.round(FROM - age * e);
            yearEl.textContent = fmtYear(p >= 1 ? targetYear : year);
            if (!REDUCED.matches) {
                const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
                ctx.fillStyle = 'rgba(4,7,14,0.35)';
                ctx.fillRect(0, 0, w, h);
                const speed = Math.max(0, e - prevE) * 4 + 0.003;
                prevE = e;
                const maxR = Math.hypot(cx, cy);
                stars.forEach((s) => {
                    const r0 = s.r;
                    s.r += speed * s.s * (0.4 + s.r);
                    if (s.r > 1.1) { s.r = 0.03 + Math.random() * 0.1; s.a = Math.random() * Math.PI * 2; return; }
                    const x0 = cx + Math.cos(s.a) * r0 * maxR, y0 = cy + Math.sin(s.a) * r0 * maxR;
                    const x1 = cx + Math.cos(s.a) * s.r * maxR, y1 = cy + Math.sin(s.a) * s.r * maxR;
                    ctx.strokeStyle = 'rgba(240,195,90,' + Math.min(1, 0.25 + s.r) + ')';
                    ctx.lineWidth = (0.5 + s.r * 2) * dpr;
                    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                });
                // landmarks passed
                for (let i = 0; i < marks.length; i++) {
                    if (marks[i].year >= year && i > lastMark) { lastMark = i; markUntil = ts + 420; subEl.textContent = fmtYear(marks[i].year) + ' · ' + landmarkLabel(marks[i]); }
                }
                if (markUntil && ts > markUntil) { markUntil = 0; subEl.textContent = fill(C.warp.sub, { place }); }
            }
            if (p >= 1) { subEl.textContent = fill(C.warp.sub, { place }); raf = setTimeout(finish, REDUCED.matches ? 250 : 450); return; }
            raf = requestAnimationFrame(frame);
        }
        raf = requestAnimationFrame(frame);
    }
    function landmarkLabel(m) { return (LANG !== 'en' && C.landmarks && C.landmarks[m.year]) || m.en; }

    /* ---------- landing: journey + result ---------- */
    function land(itemId, eraId, opts) {
        const it = ITEM[itemId];
        const L = M.landing(it, eraId);
        const b = bestOf(it);
        const year = eraId === it.sweet ? b.year : ERA_BY_ID[eraId].year;
        const place = eraId === it.sweet ? b.place : C.eras[eraId].place;
        state.itemId = itemId;
        state.eraId = eraId;
        const go = () => {
            state.step = 'journey';
            state.beat = 0;
            const key = resultKey(itemId, eraId);
            const isNew = state.results[key] == null;
            state.results[key] = L.score;
            saveStore();
            renderJourney();
            showStep('journey');
            pushRoute(false);
            terrain.setSelected(itemId);
            terrain.setMask(null);
            updateTerrainStatus();
            terrain.redraw();
            const h = $('#journey-title');
            h.focus({ preventScroll: true });
            scrollToEl($('#play'), { offset: 70 });
            if (isNew) renderChoose();
        };
        if (opts && opts.instant) go(); else warp(year, place, go);
    }

    function leadFor(L) {
        if (L.dist === 0) return C.journey.bestLand;
        const lead = L.alt ? (L.mult >= 0.5 ? C.journey.leadNear : C.journey.leadMid)
            : (L.dist === 1 ? C.journey.leadNear : (L.dist === 2 ? C.journey.leadMid : C.journey.leadFar));
        return lead;
    }
    function verdictClass(L) {
        const r = L.score / L.full;
        if (r >= 0.999) return 'best';
        if (r >= 0.5) return 'near';
        if (r >= 0.28) return 'off';
        return 'lost';
    }

    function renderJourney() {
        const it = ITEM[state.itemId];
        const eraId = state.eraId;
        const L = M.landing(it, eraId);
        const b = bestOf(it);
        const isBest = eraId === it.sweet;
        const year = isBest ? b.year : ERA_BY_ID[eraId].year;
        const place = isBest ? b.place : C.eras[eraId].place;
        $('#journey-title').textContent = fmtYear(year);
        $('#journey-where').textContent = place + ' · ' + eraName(eraId);
        $('#journey-item').textContent = it.emoji + ' ' + tx(it, 'name');
        const beats = $('#beats');
        beats.textContent = '';
        $('#result').hidden = true;
        const nextRow = $('#next-row');
        nextRow.hidden = true;

        if (isBest) {
            const total = b.beats.length;
            let shown = 0;
            const showBeat = (i) => {
                const [h, p] = b.beats[i];
                beats.appendChild(el('div', { class: 'beat' }, [el('h3', { text: h }), el('p', { text: p })]));
            };
            const cont = $('#next-btn');
            const rest = $('#rest-btn');
            const refresh = () => {
                cont.textContent = shown >= total ? C.journey.seeScore : C.journey.next;
                rest.textContent = C.journey.rest;
                rest.hidden = shown >= total - 1;
            };
            const finishBeats = () => { nextRow.hidden = true; renderResult(); const rh = $('#res-heading'); rh.focus({ preventScroll: true }); };
            cont.onclick = () => { if (shown < total) { showBeat(shown++); refresh(); } else finishBeats(); };
            rest.onclick = () => { while (shown < total) showBeat(shown++); finishBeats(); };
            showBeat(shown++);
            refresh();
            nextRow.hidden = false;
            if (opts_instantAll) rest.onclick();
        } else {
            const text = altText(it, eraId) || (L.side === 'early' ? tx(it, 'early') : tx(it, 'late'));
            const sideNote = altText(it, eraId) ? '' : ' ' + (L.side === 'early' ? C.journey.tooEarly : C.journey.tooLate);
            beats.appendChild(el('div', { class: 'beat' }, [
                el('p', { class: 'outcome-lead', text: leadFor(L) + sideNote }),
                el('p', { text: text })
            ]));
            renderResult();
        }
    }
    let opts_instantAll = false;

    function renderResult() {
        const it = ITEM[state.itemId];
        const eraId = state.eraId;
        const L = M.landing(it, eraId);
        const b = bestOf(it);
        const vc = verdictClass(L);
        const res = $('#result');
        res.hidden = false;
        const score = Math.round(L.score);
        const full = Math.round(L.full);
        $('#res-num').firstChild.nodeValue = fmt(score);
        $('#res-of').textContent = fill(C.result.of, { best: fmt(full) });
        $('#res-verdict').textContent = C.result.verdict[vc];
        const fillBar = $('#meter-fill');
        fillBar.style.width = '0%';
        requestAnimationFrame(() => requestAnimationFrame(() => { fillBar.style.width = Math.max(1, L.score) + '%'; }));
        $('#meter-mark').style.left = 'calc(' + L.full + '% - 1.5px)';
        const bestEra = it.sweet;
        $('#meter-key').textContent = fill(C.result.meterKey, { era: eraName(bestEra), year: fmtYear(b.year) });
        const bw = $('#best-was');
        bw.hidden = vc === 'best';
        bw.textContent = fill(C.result.bestWas, { era: eraName(bestEra), place: b.place, year: fmtYear(b.year) });
        // bars
        const bars = $('#era-bars');
        const labs = $('#era-bars-lab');
        bars.textContent = '';
        labs.textContent = '';
        D.ERAS.forEach((e) => {
            const v = M.landing(it, e.id).score;
            const bar = el('div', { 'data-you': e.id === eraId ? 'true' : 'false', title: eraName(e.id) + ': ' + fmt(Math.round(v)) });
            bar.style.height = Math.max(4, v / 100 * 92) + 'px';
            bar.style.background = rampColor(v, ramp);
            bars.appendChild(bar);
            labs.appendChild(el('span', { text: C.eras[e.id].span.split(' – ')[0] }));
        });
        drawPass();
        updateShareLinks();
        $('#share-status').textContent = '';
        terrain.redraw();
        if (unlocked()) renderRanking();
    }

    /* ---------- boarding pass + share ---------- */
    function wrapText(ctx, text, x, y, maxW, lh, maxLines) {
        const words = text.split(' ');
        let line = '', lines = [];
        words.forEach((w) => {
            const t = line ? line + ' ' + w : w;
            if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
        });
        if (line) lines.push(line);
        lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l + (i === maxLines - 1 && lines.length > maxLines ? '…' : ''), x, y + i * lh));
        return Math.min(lines.length, maxLines) * lh;
    }
    function passInfo() {
        const it = ITEM[state.itemId];
        const eraId = state.eraId;
        const L = M.landing(it, eraId);
        const b = bestOf(it);
        const isBest = eraId === it.sweet;
        return { it, eraId, L, year: isBest ? b.year : ERA_BY_ID[eraId].year, place: isBest ? b.place : C.eras[eraId].place };
    }
    function drawPass() {
        const cv = $('#pass');
        const ctx = cv.getContext('2d');
        const W = 1200, H = 630;
        const { it, eraId, L, year, place } = passInfo();
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#0b1220'); g.addColorStop(1, '#17264a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(240,195,90,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
        ctx.strokeRect(24, 24, W - 48, H - 48); ctx.setLineDash([]);
        // perforation
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([4, 10]);
        ctx.beginPath(); ctx.moveTo(700, 40); ctx.lineTo(700, H - 40); ctx.stroke(); ctx.setLineDash([]);
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#86d6e3'; ctx.font = '700 22px system-ui, sans-serif';
        ctx.fillText(C.pass.head, 60, 80);
        ctx.font = '120px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.fillStyle = '#f1f4f9';
        ctx.fillText(it.emoji, 56, 215);
        ctx.font = '700 22px system-ui, sans-serif'; ctx.fillStyle = '#a3b3ca';
        ctx.fillText(C.pass.carrying, 60, 275);
        ctx.font = '700 40px Georgia, "Iowan Old Style", serif'; ctx.fillStyle = '#f1f4f9';
        const nh = wrapText(ctx, tx(it, 'name'), 60, 322, 600, 46, 2);
        const y2 = 322 + nh + 30;
        ctx.font = '700 22px system-ui, sans-serif'; ctx.fillStyle = '#a3b3ca';
        ctx.fillText(C.pass.landed, 60, y2);
        ctx.font = '700 92px Georgia, "Iowan Old Style", serif'; ctx.fillStyle = '#f0c35a';
        ctx.fillText(fmtYear(year), 56, y2 + 90);
        ctx.font = '26px system-ui, sans-serif'; ctx.fillStyle = '#c9d3e2';
        wrapText(ctx, place + ' · ' + eraName(eraId), 60, y2 + 132, 600, 32, 2);
        // right side
        ctx.font = '700 22px system-ui, sans-serif'; ctx.fillStyle = '#a3b3ca';
        ctx.fillText(C.pass.delta, 740, 100);
        ctx.font = '700 170px Georgia, "Iowan Old Style", serif'; ctx.fillStyle = '#f0c35a';
        ctx.fillText(fmt(Math.round(L.score)), 730, 255);
        ctx.font = '24px system-ui, sans-serif'; ctx.fillStyle = '#c9d3e2';
        ctx.fillText(fill(C.pass.best, { n: fmt(Math.round(L.full)) }), 740, 300);
        // bars
        ctx.font = '700 18px system-ui, sans-serif'; ctx.fillStyle = '#a3b3ca';
        ctx.fillText(C.pass.by, 740, 365);
        const bx = 740, bw = 36, gapx = 8, by = 540, bh = 130;
        D.ERAS.forEach((e, i) => {
            const v = M.landing(it, e.id).score;
            const h = Math.max(4, v / 100 * bh);
            ctx.fillStyle = rampColor(v, DARK_RAMP);
            ctx.fillRect(bx + i * (bw + gapx), by - h, bw, h);
            if (e.id === eraId) { ctx.strokeStyle = '#f1f4f9'; ctx.lineWidth = 3; ctx.strokeRect(bx + i * (bw + gapx) - 2, by - h - 2, bw + 4, h + 4); }
        });
        ctx.font = '18px system-ui, sans-serif'; ctx.fillStyle = '#a3b3ca';
        ctx.fillText(location.host + location.pathname.replace(/\/$/, ''), 60, H - 52);
        cv.setAttribute('aria-label', fill(C.result.shareText, { item: tx(it, 'name'), era: eraName(eraId), year: fmtYear(year), n: fmt(Math.round(L.score)) }));
    }
    // The link people send is the landing's own preview page (share/<lang>/<item>-<era>.html):
    // chat apps read og:image from static HTML and ignore the #hash, and the page then
    // sends the reader on to the main page with this landing selected.
    function shareUrl() {
        return new URL('share/' + LANG + '/' + state.itemId + '-' + state.eraId + '.html', location.href).href;
    }
    function shareText() {
        const { it, eraId, L, year } = passInfo();
        return fill(C.result.shareText, { item: tx(it, 'name'), era: eraName(eraId), year: fmtYear(year), n: fmt(Math.round(L.score)) });
    }
    function updateShareLinks() {
        const u = encodeURIComponent(shareUrl());
        const t = encodeURIComponent(shareText());
        $('#sh-wa').href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText() + ' ' + shareUrl());
        $('#sh-fb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
        $('#sh-x').href = 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u;
        $('#sh-native').hidden = !(navigator.share);
    }
    function status(msg) { $('#share-status').textContent = msg; }
    function copyLink() {
        const url = shareUrl();
        const ok = () => status(C.result.copied);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, () => fallbackCopy(url, ok));
        else fallbackCopy(url, ok);
    }
    function fallbackCopy(text, ok) {
        const ta = el('textarea', { readonly: true, 'aria-hidden': 'true' });
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        safe(() => document.execCommand('copy'));
        ta.remove(); ok();
    }
    function canvasBlob() { return new Promise((res) => $('#pass').toBlob(res, 'image/png')); }
    async function nativeShare() {
        const { it, eraId } = passInfo();
        try {
            const blob = await canvasBlob();
            const file = new File([blob], 'time-cargo-' + it.id + '-' + eraId + '.png', { type: 'image/png' });
            const data = { title: C.title, text: shareText(), url: shareUrl() };
            if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
            await navigator.share(data);
        } catch (e) {
            if (e && e.name === 'AbortError') return;
            copyLink(); status(C.result.shareFailed);
        }
    }
    async function savePass() {
        const { it, eraId } = passInfo();
        const blob = await canvasBlob();
        const a = el('a', { href: URL.createObjectURL(blob), download: 'time-cargo-' + it.id + '-' + eraId + '.png' });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        status(C.result.saved);
    }

    /* ---------- ranking ---------- */
    let sensCache = null;
    function sens() {
        if (!sensCache) sensCache = M.weightSensitivity(D.SENS.draws, D.SENS.seed);
        return sensCache;
    }
    function scoreFor(item, mode) {
        if (mode === 'mine') return M.delta(item);
        const pm = M.panelMeans(D.RATERS)[item.id];
        if (mode === 'panel') return M.composite(pm);
        const all = {};
        D.DIMS.forEach((d) => { all[d.key] = (item.dims[d.key] + pm[d.key] * 3) / 4; });
        return M.composite(all);
    }
    function ranked(mode) {
        return D.ITEMS.map((i) => ({ id: i.id, score: scoreFor(i, mode) }))
            .sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
    }
    function stats() {
        const mineR = M.ranksOf();
        const pm = M.panelMeans(D.RATERS);
        const panelScores = D.ITEMS.map((i) => ({ id: i.id, s: M.composite(pm[i.id]) })).sort((a, b) => b.s - a.s);
        const panelRank = {};
        panelScores.forEach((x, i) => { panelRank[x.id] = i + 1; });
        const mine = D.ITEMS.map((i) => M.delta(i));
        const pan = D.ITEMS.map((i) => M.composite(pm[i.id]));
        const agreements = D.RATERS.map((r) => M.raterAgreement(r));
        const rhos = agreements.map((a) => a.rho);
        const ids = D.ITEMS.map((i) => i.id);
        const dimPullMine = M.dimensionPull();
        const full = ids.map((id) => M.composite(pm[id]));
        const dimPullPanel = {};
        D.DIMS.forEach((d) => { dimPullPanel[d.key] = M.spearman(ids.map((id) => pm[id][d.key]), full); });
        const raterPairs = [];
        for (let a = 0; a < D.RATERS.length; a++) for (let b = a + 1; b < D.RATERS.length; b++) {
            raterPairs.push(M.spearman(ids.map((id) => M.composite(D.RATERS[a].scores[id])), ids.map((id) => M.composite(D.RATERS[b].scores[id]))));
        }
        const myTop = ranked('mine').slice(0, 3).map((x) => x.id);
        const panTop = panelScores.slice(0, 3).map((x) => x.id);
        const myBot = ranked('mine').slice(-5).map((x) => x.id);
        const panBot = panelScores.slice(-5).map((x) => x.id);
        const gaps = ids.map((id) => ({ id, gap: Math.abs(mineR[id] - panelRank[id]) })).sort((a, b) => b.gap - a.gap || (a.id < b.id ? -1 : 1));
        const yearRho = M.spearman(D.ITEMS.map((i) => i.best.year), mine);
        return {
            mineR, panelRank, panelMeans: pm,
            rhoPanel: M.spearman(mine, pan), rhos, agreements,
            rhoMin: Math.min.apply(null, rhos), rhoMax: Math.max.apply(null, rhos),
            dimPullMine, dimPullPanel,
            rrMin: Math.min.apply(null, raterPairs), rrMax: Math.max.apply(null, raterPairs),
            topShared: myTop.filter((x) => panTop.includes(x)),
            bottomShared: myBot.filter((x) => panBot.includes(x)).length,
            gaps: gaps.slice(0, 3).map((g) => g.id), yearRho
        };
    }

    function renderRanking() {
        const root = $('#ranking-body');
        const lock = $('#ranking-lock');
        if (!unlocked()) { lock.hidden = false; root.hidden = true; return; }
        lock.hidden = true;
        root.hidden = false;
        const S = stats();
        // finding
        const fnode = $('#finding');
        fnode.textContent = '';
        fnode.appendChild(el('p', { text: fill(C.ranking.f1, { copyPull: fmt(S.dimPullMine.copy, 2), trustPull: fmt(S.dimPullMine.trust, 2) }) }));
        fnode.appendChild(el('p', { text: fill(C.ranking.f2, { rhoMin: fmt(S.rhoMin, 2), rhoMax: fmt(S.rhoMax, 2), panelCopy: fmt(S.dimPullPanel.copy, 2), panelTrust: fmt(S.dimPullPanel.trust, 2) }) }));
        fnode.appendChild(el('p', { text: fill(C.ranking.f3, { topShared: listJoin(S.topShared.map(shortName)), bottomShared: S.bottomShared, gaps: listJoin(S.gaps.map(shortName)) }) }));
        // awards
        const aw = $('#awards');
        aw.textContent = '';
        D.AWARDS.forEach((a) => {
            const it = ITEM[a.itemId];
            const [t, n] = (LANG === 'en' ? a.en : C.awards[a.itemId]);
            aw.appendChild(el('div', { class: 'award' }, [
                el('span', { class: 'ic', text: a.icon, 'aria-hidden': 'true' }),
                el('b', { text: t }),
                el('span', { class: 'aw-item', text: it.emoji + ' ' + shortCap(a.itemId) }),
                el('span', { text: fill(n, it.dims) })
            ]));
        });
        // scorer toggle
        $$('#scorer button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.scorer)));
        $('#scorer-note').textContent = C.ranking.scorerNote[state.scorer];
        // list
        const list = $('#rank-list');
        const openIds = new Set($$('#rank-list details[open]').map((d) => d.dataset.id));
        list.textContent = '';
        const rows = ranked(state.scorer);
        rows.forEach((r, i) => {
            const it = ITEM[r.id];
            const li = el('li');
            const det = el('details', { class: 'rank-row', id: 'rank-' + r.id, 'data-id': r.id });
            if (openIds.has(r.id)) det.open = true;
            const sum = el('summary', null, [
                el('span', { class: 'pos', text: fmt(i + 1) }),
                el('span', { class: 'em', text: it.emoji, 'aria-hidden': 'true' }),
                el('span', { class: 'nm' }, [tx(it, 'name'), el('small', { text: tx(it, 'tagline') })]),
                el('span', { class: 'dl' }, [fmt(Math.round(r.score)), el('small', { text: C.ranking.deltaLab })])
            ]);
            det.appendChild(sum);
            det.appendChild(rankBody(it, S));
            det.addEventListener('toggle', () => { if (det.open) terrain.setSelected(r.id); });
            li.appendChild(det);
            list.appendChild(li);
        });
        terrain.setOrder(rows.map((r) => r.id), true);
        renderMethod(S);
    }
    function shortCap(id) { const s = shortName(id); return s.charAt(0).toUpperCase() + s.slice(1); }

    function rankBody(it, S) {
        const body = el('div', { class: 'rank-body' });
        const b = bestOf(it);
        body.appendChild(el('h4', { text: C.ranking.bestLanding }));
        body.appendChild(el('p', { text: fmtYear(b.year) + ' · ' + b.place + ' · ' + eraName(it.sweet) }));
        body.appendChild(el('h4', { text: C.ranking.dimsH }));
        const grid = el('div', { class: 'dimgrid' });
        const pm = S.panelMeans[it.id];
        D.DIMS.forEach((d) => {
            const bar = el('span', { class: 'dimbar' });
            const i = el('i'); i.style.width = it.dims[d.key] * 10 + '%';
            const u = el('u'); u.style.left = 'calc(' + pm[d.key] * 10 + '% - 1.5px)';
            bar.appendChild(i); bar.appendChild(u);
            grid.appendChild(el('div', { class: 'dimrow' }, [
                el('span', { text: C.dims[d.key][0], title: C.dims[d.key][1] }), bar,
                el('span', { text: fmt(it.dims[d.key]) + ' · ' + fmt(pm[d.key], 1) })
            ]));
        });
        body.appendChild(grid);
        body.appendChild(el('p', { class: 'panelline', text: C.ranking.dimsNote }));
        body.appendChild(el('h4', { text: C.ranking.whyH }));
        body.appendChild(el('p', { text: verdictText(it) }));
        // panel
        const pr = S.panelRank[it.id];
        const wins = D.RATERS.map((r) => r.scores[it.id].window);
        const pl = el('p', { class: 'panelline' });
        pl.appendChild(el('b', { text: C.ranking.panelH + '. ' }));
        pl.appendChild(document.createTextNode(fill(C.ranking.panelRank, { rank: fmt(pr), total: fmt(N_ITEMS) }) + ' ' +
            fill(C.ranking.panelWindows, { w: wins.map((w) => eraName(w)).join(' / ') })));
        const gap = Math.abs(S.mineR[it.id] - pr);
        if (gap >= 5) pl.appendChild(el('span', { class: 'flag', text: ' ' + fill(C.ranking.flagRank, { n: fmt(gap) }) }));
        if (wins.every((w) => w === wins[0]) && wins[0] !== it.sweet) {
            pl.appendChild(el('span', { class: 'flag', text: ' ' + fill(C.ranking.flagWindow, { era: eraName(wins[0]), mine: eraName(it.sweet) }) }));
        }
        body.appendChild(pl);
        // visits
        D.ERAS.forEach((e) => {
            const v = state.results[resultKey(it.id, e.id)];
            if (v != null) body.appendChild(el('p', { class: 'visit-line', text: fill(C.ranking.yours, { era: eraName(e.id), n: fmt(Math.round(v)) }) }));
        });
        body.appendChild(el('h4', { text: C.ranking.sourcesH }));
        const ul = el('ul', { class: 'src-list' });
        it.sources.forEach((s) => ul.appendChild(el('li', null, [el('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.label })])));
        body.appendChild(ul);
        return body;
    }

    /* ---------- method ---------- */
    function table(cols, rows, label) {
        const wrap = el('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': label });
        const t = el('table', { class: 'mini' });
        t.appendChild(el('thead', null, [el('tr', null, cols.map((c) => el('th', { scope: 'col', text: c })))]));
        const tb = el('tbody');
        rows.forEach((r) => tb.appendChild(el('tr', null, r.map((c) => el('td', { text: c })))));
        t.appendChild(tb);
        wrap.appendChild(t);
        return wrap;
    }
    function renderMethod(S) {
        const root = $('#method-body');
        root.textContent = '';
        const m = C.method;
        const W = D.WEIGHTS;
        const sv = sens();
        const rank = M.ranking();
        const firstId = rank[0].id;
        const ROBUST = 0.7;
        const topRobust = D.ITEMS.filter((i) => sv[i.id].top5 >= ROBUST).map((i) => i.id);
        const soft = D.ITEMS.filter((i) => sv[i.id].p95 - sv[i.id].p5 >= 8).map((i) => i.id);
        root.appendChild(el('h3', { text: m.deltaH }));
        root.appendChild(el('p', { text: fill(m.m1, { wNeed: fmt(W.need * 100), wCopy: fmt(W.copy * 100), wTrust: fmt(W.trust * 100), wRipple: fmt(W.ripple * 100) }) }));
        root.appendChild(el('p', { text: fill(m.m2, { f1: '×' + fmt(D.FALLOFF[1], 2), f2: '×' + fmt(D.FALLOFF[2], 2), f3: '×' + fmt(D.FALLOFF[3], 2), f4: '×' + fmt(D.FALLOFF[4], 2) }) }));

        root.appendChild(el('h3', { text: m.t1H }));
        root.appendChild(el('p', { text: fill(m.t1, {
            draws: fmt(D.SENS.draws), first: shortCap(firstId), firstPct: fmt(Math.round(sv[firstId].top3 * 100)),
            robust: shortCap(topRobust[0]) + (topRobust.length > 1 ? C.list.comma + listJoin(topRobust.slice(1).map(shortName)) : ''),
            robustPct: fmt(ROBUST * 100), soft: listJoin(soft.map(shortName))
        }) }));
        root.appendChild(table(m.t1Cols, D.ITEMS.slice().sort((a, b) => sv[a.id].median - sv[b.id].median || (a.id < b.id ? -1 : 1)).map((i) => [
            tx(i, 'name'), fmt(sv[i.id].median), fmt(sv[i.id].p5) + ' – ' + fmt(sv[i.id].p95), fmt(Math.round(sv[i.id].top5 * 100)) + '%'
        ]), m.t1H));

        root.appendChild(el('h3', { text: m.t2H }));
        root.appendChild(el('p', { text: m.t2 }));
        root.appendChild(table(m.t2Cols, D.RATERS.map((r, i) => [
            r.id + ' · ' + (C.stances ? C.stances[r.id] : r.stance), fmt(S.agreements[i].rho, 2), fmt(S.agreements[i].meanAbsDiff, 1), fmt(S.agreements[i].windowHits) + ' / ' + fmt(N_ITEMS)
        ]), m.t2H));
        root.appendChild(el('p', { text: fill(m.t2Panel, { rhoPanel: fmt(S.rhoPanel, 2) }) }));
        const rows = [];
        D.ITEMS.forEach((i) => D.DIMS.forEach((d) => rows.push({ id: i.id, d: d.key, mine: i.dims[d.key], pan: S.panelMeans[i.id][d.key] })));
        rows.sort((a, b) => Math.abs(b.pan - b.mine) - Math.abs(a.pan - a.mine) || (a.id < b.id ? -1 : 1) || (a.d < b.d ? -1 : 1));
        root.appendChild(table(m.t2GapCols, rows.slice(0, 8).map((r) => [shortCap(r.id), C.dims[r.d][0], fmt(r.mine), fmt(r.pan, 1)]), m.t2Panel));

        root.appendChild(el('h3', { text: m.failedH }));
        root.appendChild(el('p', { text: fill(m.failed, { rhoYear: fmt(S.yearRho, 2), trustPull: fmt(S.dimPullMine.trust, 2) }) }));
        root.appendChild(table(m.dimCols, D.DIMS.map((d) => [C.dims[d.key][0], fmt(S.dimPullMine[d.key], 2), fmt(S.dimPullPanel[d.key], 2)]), m.dimCaption));

        root.appendChild(el('h3', { text: m.limitsH }));
        root.appendChild(el('p', { text: fill(m.limits, { rrMin: fmt(S.rrMin, 2), rrMax: fmt(S.rrMax, 2) }) }));
    }

    /* ---------- step switching ---------- */
    function showStep(step) {
        state.step = step;
        ['choose', 'brief', 'journey'].forEach((s) => { $('#step-' + s).hidden = s !== step; });
    }
    function openItem(id, push) {
        state.itemId = id; state.eraId = null;
        renderBrief();
        showStep('brief');
        if (push) pushRoute(false);
        const h = $('#brief-name');
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
        scrollToEl($('#play'), { offset: 70 });
    }
    function toChoose(push) {
        state.itemId = null; state.eraId = null;
        showStep('choose');
        terrain.setSelected(null);
        terrain.setMask(null);
        if (push) pushRoute(false);
        const h = $('#choose-h');
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
        scrollToEl($('#play'), { offset: 70 });
    }
    function applyRoute(r, fromLoad) {
        if (r.step === 'brief') { state.itemId = r.itemId; renderBrief(); showStep('brief'); }
        else if (r.step === 'journey') {
            state.itemId = r.itemId; state.eraId = r.eraId;
            const key = resultKey(r.itemId, r.eraId);
            state.results[key] = M.landing(ITEM[r.itemId], r.eraId).score;
            saveStore();
            opts_instantAll = true;
            renderJourney();
            opts_instantAll = false;
            showStep('journey');
            terrain.setSelected(r.itemId);
            renderChoose();
        } else {
            showStep('choose'); terrain.setSelected(null);
            if (r.section) setTimeout(() => scrollToEl($('#' + r.section), { offset: 70 }), 50);
            if (r.rank) {
                state.peek = true; saveStore(); renderRanking();
                const d = $('#rank-' + r.rank); if (d) { d.open = true; setTimeout(() => scrollToEl(d, { offset: 70 }), 50); }
            }
        }
        updateTerrainStatus();
        terrain.redraw();
        if (fromLoad) { renderRanking(); }
    }

    /* ---------- chrome: theme, language link, to-top, address bar ---------- */
    function effectiveTheme() {
        const t = document.documentElement.getAttribute('data-theme');
        if (t) return t;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    function syncThemeButton() {
        const t = effectiveTheme();
        const btn = $('#theme-btn');
        btn.setAttribute('aria-label', t === 'dark' ? C.themeToLight : C.themeToDark);
        btn.title = t === 'dark' ? C.themeToLight : C.themeToDark;
        $('#icon-sun').hidden = t !== 'dark';
        $('#icon-moon').hidden = t === 'dark';
        terrain.refreshTheme();
    }
    function initChrome() {
        const stored = safe(() => localStorage.getItem('timeCargo.theme'), null);
        if (stored === 'light' || stored === 'dark') document.documentElement.setAttribute('data-theme', stored);
        $('#theme-btn').addEventListener('click', () => {
            const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            safe(() => localStorage.setItem('timeCargo.theme', next));
            syncThemeButton();
            if (!$('#result').hidden) drawPass();
        });
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', syncThemeButton);
        syncThemeButton();

        const top = $('#to-top');
        top.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: REDUCED.matches ? 'auto' : 'smooth' });
            $('#h1').setAttribute('tabindex', '-1');
            $('#h1').focus({ preventScroll: true });
            safe(() => history.replaceState(null, '', location.pathname + location.search));
        });
        // address bar follows the reader
        let ticking = false;
        const born = performance.now();
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                top.hidden = window.scrollY < window.innerHeight;
                if (performance.now() - born < 700) return;
                const line = window.innerHeight * 0.34;
                const rect = (id) => $(id).getBoundingClientRect();
                let h = null;
                if (!$('#method').hidden && rect('#method').top < line) h = '#method';
                else if (!$('#ranking').hidden && rect('#ranking').top < line) {
                    h = '#ranking';
                    if (unlocked()) {
                        const rows = $$('#rank-list .rank-row');
                        let cur = null;
                        rows.forEach((r) => { if (r.getBoundingClientRect().top < line) cur = r; });
                        if (cur) { h = '#rank/' + cur.dataset.id; terrain.setSelected(cur.dataset.id); }
                    }
                } else if (window.scrollY < 40) h = '';
                else h = hashFor();
                if (h === null) return;
                const wanted = location.pathname + location.search + h;
                if (location.pathname + location.search + location.hash !== wanted && (h !== '' || location.hash)) {
                    safe(() => history.replaceState(null, '', wanted));
                    updateLangLink();
                }
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- wiring ---------- */
    function clearAll() {
        state.results = {};
        state.peek = false;
        state.scorer = 'mine';
        saveStore();
        terrain.setOrder(D.MANIFEST_ORDER, true);
        toChoose(false);
        safe(() => history.replaceState(null, '', location.pathname + location.search));
        updateLangLink();
        renderChoose();
        renderRanking();
        updateTerrainStatus();
        terrain.redraw();
    }

    function wire() {
        $('#hint-btn').addEventListener('click', () => { $('#hint-text').hidden = false; $('#hint-btn').hidden = true; });
        $('#back-choose').addEventListener('click', () => toChoose(true));
        $('#again-btn').addEventListener('click', () => { openItem(state.itemId, true); });
        $('#other-btn').addEventListener('click', () => toChoose(true));
        $('#rank-btn').addEventListener('click', () => {
            state.peek = true; saveStore(); renderRanking(); updateTerrainStatus(); terrain.redraw();
            scrollToEl($('#ranking'), { offset: 70 });
        });
        $('#cta-choose').addEventListener('click', (e) => { e.preventDefault(); if (state.step !== 'choose') toChoose(true); else scrollToEl($('#play'), { offset: 70 }); });
        $('#cta-rank').addEventListener('click', (e) => {
            e.preventDefault();
            state.peek = true; saveStore(); renderRanking(); updateTerrainStatus(); terrain.redraw();
            scrollToEl($('#ranking'), { offset: 70 });
        });
        $('#lock-btn').addEventListener('click', () => {
            state.peek = true; saveStore(); renderRanking(); updateTerrainStatus(); terrain.redraw();
        });
        $$('#scorer button').forEach((b) => b.addEventListener('click', () => { state.scorer = b.dataset.mode; renderRanking(); }));
        $$('.nav-link').forEach((a) => a.addEventListener('click', (e) => {
            const t = a.getAttribute('data-target');
            e.preventDefault();
            if (t === 'play') { if (state.step !== 'choose') toChoose(true); else scrollToEl($('#play'), { offset: 60 }); }
            else {
                if (t === 'ranking' && !unlocked()) { scrollToEl($('#ranking'), { offset: 60 }); }
                else scrollToEl($('#' + t), { offset: 60 });
            }
        }));
        $('#clear-all').addEventListener('click', clearAll);
        $('#clear-all-2').addEventListener('click', clearAll);
        $('#sh-copy').addEventListener('click', copyLink);
        $('#sh-save').addEventListener('click', savePass);
        $('#sh-native').addEventListener('click', nativeShare);
        terrain.onPick = (id, c) => {
            if (state.step === 'choose') { if (terrain.named(id)) openItem(id, true); }
            else if (!$('#ranking-body').hidden) {
                const d = $('#rank-' + id);
                if (d) { d.open = true; scrollToEl(d, { offset: 70 }); terrain.setSelected(id); }
            }
        };
        window.addEventListener('popstate', () => applyRoute(parseHash(), false));
        window.addEventListener('hashchange', updateLangLink);
        $('#rank-list').addEventListener('keydown', () => {});
    }

    function staticText() {
        $('#terrain-title').textContent = C.terrain.title;
        $('#legend-low').textContent = C.terrain.low;
        $('#legend-high').textContent = C.terrain.high;
        $('#clear-all').textContent = C.terrain.clear;
        $('#clear-all-2').textContent = C.terrain.clear;
    }

    function init() {
        loadStore();
        staticText();
        initChrome();
        renderChoose();
        wire();
        updateLangLink();
        const route = parseHash();
        applyRoute(route, true);
        updateTerrainStatus();
        if (unlocked()) terrain.setOrder(ranked('mine').map((r) => r.id), false);
        document.documentElement.setAttribute('data-ready', 'true');
        window.__TC = { state, terrain, go: applyRoute, land, openItem, M, D };
    }
    init();
}());
