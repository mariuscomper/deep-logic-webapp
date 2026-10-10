/*
 * The scoring model behind time-cargo.html, written so that the browser and
 * the Node check (scripts/check-time-cargo.mjs) run exactly the same code on
 * exactly the same data. Every number the page prints about the ranking is
 * computed here.
 */
(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory;
    } else {
        root.TimeCargoModel = factory(root.TIME_CARGO);
    }
}(typeof window !== 'undefined' ? window : globalThis, function (DATA) {
    'use strict';

    const { WEIGHTS, FALLOFF, DIMS, ERAS, ITEMS } = DATA;
    const eraIndex = Object.fromEntries(ERAS.map((e) => [e.id, e.idx]));
    const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

    function composite(dims, w) {
        const weights = w || WEIGHTS;
        let s = 0;
        for (const d of DIMS) s += weights[d.key] * dims[d.key];
        return s * 10;
    }

    function delta(item, w) {
        return composite(item.dims, w);
    }

    // Score for landing `item` in era `eraId`, plus how the landing is described.
    function landing(item, eraId) {
        const full = delta(item);
        const sweetIdx = eraIndex[item.sweet];
        const idx = eraIndex[eraId];
        const dist = Math.abs(idx - sweetIdx);
        let side = dist === 0 ? 'best' : (idx < sweetIdx ? 'early' : 'late');
        let mult = FALLOFF[Math.min(dist, FALLOFF.length - 1)];
        let alt = null;
        if (item.alt && item.alt[eraId]) {
            alt = item.alt[eraId];
            mult = alt.mult;
        }
        return { score: full * mult, full, mult, dist, side, alt };
    }

    function ranking(w) {
        return ITEMS.map((it) => ({ id: it.id, delta: delta(it, w) }))
            .sort((a, b) => b.delta - a.delta || (a.id < b.id ? -1 : 1));
    }

    function ranksOf(w) {
        const r = ranking(w);
        const out = {};
        r.forEach((x, i) => { out[x.id] = i + 1; });
        return out;
    }

    // Average rank for ties, then Pearson on ranks.
    function toRanks(values) {
        const idx = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
        const ranks = new Array(values.length);
        let i = 0;
        while (i < idx.length) {
            let j = i;
            while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
            const avg = (i + j) / 2 + 1;
            for (let k = i; k <= j; k++) ranks[idx[k][1]] = avg;
            i = j + 1;
        }
        return ranks;
    }

    function pearson(a, b) {
        const n = a.length;
        const ma = a.reduce((s, x) => s + x, 0) / n;
        const mb = b.reduce((s, x) => s + x, 0) / n;
        let num = 0, da = 0, db = 0;
        for (let i = 0; i < n; i++) {
            num += (a[i] - ma) * (b[i] - mb);
            da += (a[i] - ma) ** 2;
            db += (b[i] - mb) ** 2;
        }
        return num / Math.sqrt(da * db);
    }

    function spearman(a, b) {
        return pearson(toRanks(a), toRanks(b));
    }

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Uniform draw from the simplex of non-negative weights summing to 1.
    function randomWeights(rand) {
        const e = DIMS.map(() => -Math.log(1 - rand()));
        const s = e.reduce((a, b) => a + b, 0);
        const w = {};
        DIMS.forEach((d, i) => { w[d.key] = e[i] / s; });
        return w;
    }

    // How much does the order depend on the weights I chose? Draw many random
    // weightings and record where each object lands.
    function weightSensitivity(draws, seed) {
        const rand = mulberry32(seed);
        const ranksPer = Object.fromEntries(ITEMS.map((i) => [i.id, []]));
        for (let d = 0; d < draws; d++) {
            const ranks = ranksOf(randomWeights(rand));
            for (const id in ranks) ranksPer[id].push(ranks[id]);
        }
        const out = {};
        for (const id in ranksPer) {
            const r = ranksPer[id].slice().sort((a, b) => a - b);
            const q = (p) => r[Math.min(r.length - 1, Math.floor(p * r.length))];
            out[id] = {
                median: q(0.5), p5: q(0.05), p95: q(0.95),
                top3: r.filter((x) => x <= 3).length / r.length,
                top5: r.filter((x) => x <= 5).length / r.length,
                bottom5: r.filter((x) => x > ITEMS.length - 5).length / r.length
            };
        }
        return out;
    }

    // Compare a blind rater's dimensions and window picks with mine.
    function raterAgreement(rater) {
        const ids = ITEMS.map((i) => i.id);
        const mine = ids.map((id) => delta(byId[id]));
        const theirs = ids.map((id) => composite(rater.scores[id]));
        const rho = spearman(mine, theirs);
        let absSum = 0, windowHits = 0;
        const perDim = {};
        DIMS.forEach((d) => { perDim[d.key] = 0; });
        ids.forEach((id) => {
            DIMS.forEach((d) => {
                const diff = Math.abs(rater.scores[id][d.key] - byId[id].dims[d.key]);
                absSum += diff;
                perDim[d.key] += diff;
            });
            if (rater.scores[id].window === byId[id].sweet) windowHits++;
        });
        const n = ids.length;
        const dimDiffs = {};
        DIMS.forEach((d) => { dimDiffs[d.key] = perDim[d.key] / n; });
        return { rho, meanAbsDiff: absSum / (n * DIMS.length), windowHits, dimDiffs };
    }

    // Distance in landing windows between my best and the rater's pick, when they differ.
    function windowMisses(rater) {
        return ITEMS.filter((i) => rater.scores[i.id].window !== i.sweet).map((i) => ({
            id: i.id, mine: i.sweet, theirs: rater.scores[i.id].window
        }));
    }

    // Average of the panel's four-dimension scores per object.
    function panelMeans(raters) {
        const out = {};
        ITEMS.forEach((i) => {
            const m = {};
            DIMS.forEach((d) => {
                m[d.key] = raters.reduce((s, r) => s + r.scores[i.id][d.key], 0) / raters.length;
            });
            out[i.id] = m;
        });
        return out;
    }

    // Which single dimension, held alone, orders the objects most like the full Delta?
    function dimensionPull() {
        const full = ITEMS.map((i) => delta(i));
        const out = {};
        DIMS.forEach((d) => {
            out[d.key] = spearman(ITEMS.map((i) => i.dims[d.key]), full);
        });
        return out;
    }

    function roundTo(x, n) {
        const f = 10 ** n;
        return Math.round(x * f) / f;
    }

    return {
        composite, delta, landing, ranking, ranksOf, toRanks, pearson, spearman,
        mulberry32, randomWeights, weightSensitivity, raterAgreement, windowMisses,
        panelMeans, dimensionPull, roundTo, eraIndex, byId
    };
}));
