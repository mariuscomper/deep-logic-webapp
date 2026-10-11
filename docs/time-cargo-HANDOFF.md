# Handoff: publish “what to take back in time” on mariuscomper.uk

For the Claude session that has the mariuscomper.uk workspace (AGENTS.md, standards/v2, the router publisher). The piece was built in a cloud session against a plain GitHub Pages repo, so it has not been through your pipeline. Your job: adapt it to the site standard, verify what could not be verified there, publish through the router, and report plainly.

## Where it is

- Repo: `mariuscomper/deep-logic-webapp`, branch `ccr-3567bd8a-x7s9tf` (last commit `0a155f0`). No PR is open and nothing was merged to `main`. Do not merge or open a PR unless Marius asks.
- Get it: `git clone https://github.com/mariuscomper/deep-logic-webapp && cd deep-logic-webapp && git checkout ccr-3567bd8a-x7s9tf`
- Read first: `README.md` (section “Time cargo”), `docs/time-cargo-brief.md` (the finding, the tests, what failed, what must not be claimed).
- Do not use the older essay (`index.html`) or `viking-journeys.*` in that repo; they are unrelated.

## What it is

An interactive piece. The reader carries one of 20 objects (WD-40, seed potatoes, slide rule, reading glasses, oral rehydration salts, and 15 more) back in time, picks one of 9 historical windows, watches a time tunnel, reads what happens, and gets a score (“Delta”, 0–100). They can then open the full ranking with the author's reasoning.

The finding the page prints and the release check asserts: what predicts the ranking is whether the era can copy the object (rank correlation of Copy alone with the full ranking ρ = 0.90), not how convincing it is (Trust: ρ = −0.02 on the author's scores, negative on each blind rater's). The year of the best landing is unrelated to Delta (ρ ≈ −0.07). It was tested against 5,000 seeded random weightings and against three blind raters (separate model contexts that never saw the author's scores); the page prints where they disagree. The raters are the same model family as the author, so the page and brief call this a consistency check, not independent evidence. Keep that limit on the page.

The picture is the model's own surface (20 objects × 9 eras, one cell per landing). Rows are anonymous until the reader lands them; a touched row goes dark except where they landed; the surface sorts into the ranking on request. On phones it is pinned under the top bar and the text passes beneath.

## Files

- `time-cargo-data.js` facts: objects, 4 scores each, sources, the raters' raw answers, English item text
- `time-cargo-copy.en.js`, `time-cargo-copy.ro.js` interface copy; Romanian item text
- `time-cargo-model.js` scoring model, run identically in browser and Node
- `time-cargo.js`, `time-cargo.css` the page (both editions)
- `scripts/templates/time-cargo.template.html`, `scripts/build-time-cargo.mjs` build the two HTML pages
- `scripts/build-time-cargo-cards.mjs` draws the two posters and one preview page + 1200×630 picture per landing (`share/<lang>/<item>-<era>.{html,png}`, 360 pages, about 8 MB)
- `scripts/check-time-cargo.mjs` release check (data integrity, every claim in the prose asserted against the numbers, RO parity, contrast AAA both themes, text lint, share pages, built-page staleness)
- `scripts/test-time-cargo.mjs` behaviour tests in Chromium (needs Playwright; starts its own server)

Run order after any content change:
`node scripts/build-time-cargo.mjs && node scripts/build-time-cargo-cards.mjs && node scripts/check-time-cargo.mjs && node scripts/test-time-cargo.mjs`
Last state: check 846 passed / 0 failed; tests 404 passed / 0 failed.

## What you must adapt before publishing (the site standard differs from the repo it was built in)

1. **Slug and overlap.** Pick a slug in Romanian and English terms people would search; run `node scripts/source-lookup.mjs <words>` and `curl -I https://mariuscomper.uk/<word>/` and read the nearest pages (`/stiai/`, the catalogue). Record commission/hold in a BRIEF.md using `docs/time-cargo-brief.md` as the base.
2. **Language layout.** Here English is the root file (`time-cargo.html`) and Romanian is `time-cargo-ro.html` (this repo's other pages are English). On mariuscomper.uk the usual layout is Romanian at the root and English at `/en/`. Decide, state why, and restructure: output paths, `hreflang`/`x-default`, canonical, the language switch, `#lang-other`, and the Romanian-first language suggestion banner (currently suggests the other edition from `navigator.languages`, never redirects; keep it).
3. **Hard-coded GitHub Pages URLs.** Replace `https://mariuscomper.github.io/deep-logic-webapp/` in `scripts/build-time-cargo.mjs` (`BASE`, `FILES`), `scripts/build-time-cargo-cards.mjs` (`BASE`, `FILES`, the redirect target `../../<page>#land/<item>/<era>`) and `time-cargo.js` (`CARD_URL`, and `shareUrl()` which builds `share/<lang>/<item>-<era>.html` relative to the page). Then regenerate the share pages and pictures and re-check that a shared link opens on the reader's own result under the real URL layout. The check script asserts the og/canonical/redirect shape; update its expected strings to match.
4. **Footer and chrome.** Replace my footer with the shared footer contract (`proiecte-publice/docs/FOOTER-CONTRACT.md`): remove the `← Back to the essay` link to `./index.html` (it points at an unrelated essay) and the MIT line. No GitHub links. Use the standard topbar and theme control (`templates/topbar.md`), the reading rail (`templates/reading-rail.css`, hand-written labels in both languages; sections: choose, ranking, method), and the shared back-to-top asset or keep mine only if `tools/to-top-check.mjs` passes. Mine appears only when scrolling up so it never covers text; that is deliberate.
5. **Tokens and checks the pack runs.** Colours are semantic CSS variables only (no inline colour; checked). Run `hidden-guard`, `clip-check`, `rail-check`, `scroll-perf`, `font-coverage` (system fonts are used, so confirm ă â î ș ț render) and `tools/prose-check.py` on both rendered editions; treat every warning as a decision. My text lint is a stand-in.
6. **Router publish.** New site via `node router/scripts/publish.mjs <project-folder>`; the folder needs the layout the router expects. Cache headers for js/css must be `no-cache, must-revalidate`. `share/` is about 8 MB of small PNGs plus 360 tiny HTML pages; check the upload limits and that the pages are served with their og tags intact (the point is that WhatsApp/Facebook read static HTML and ignore `#hash`).
7. **Catalogue and project records.** `project.json`, `SOURCES.md` (convert from the `sources` arrays in `time-cargo-data.js`, with the ledger status for each: verified-direct vs not), catalogue entry and taxonomy, 800×450 thumbnail from the poster, `qa/report.json`.
8. **Social.** `SOCIAL.md` with the 250–450-word Facebook post per language (not written). Posters exist (`time-cargo-og.png`, `time-cargo-og-ro.png`): the data surface plus the h1. Review them at feed size (about 500 px) against the art-directed-cover rule; replace if weak.
9. **Process steps in the pack.** Advisor call before the final plan and before declaring done; opening review (one cold reader with the headline, deck and first phone screen: one was done on the first draft and led to the phone layout change); `/brief` checks; harvest of reusable pieces into `standards/v2/toolsets/` with FM entries; a memory entry; final report with a “Beyond the ask” section.

## What was NOT verified (this is the real work for you)

The cloud build could not open the source pages (the egress policy returns 403 for those hosts) and could not use WebFetch. Everything below rests on search snippets or the model's memory.

- **Open every source link** in `time-cargo-data.js` (about 78 URLs, 3–4 per object) and check that the page supports the nearby claim. Fix or drop any that don't. Dead or unseen links to check first: Wikipedia pages (Great Famine, Frontinus, Pontine Marshes, Pecia, Kiwix, Napier, Cristallo, De heretico comburendo, Death of Alexander, Wars of the Diadochi, Vibrio cholerae, John L. Leal), `foldscope.com` user guide, `publicdomainreview.org`, `tastesofhistory`, `jstor` Cowan, `britannica.com` Fust and Helmasperger, `historynet.com`, `napoleon.org`, `litfl.com`.
- **Claims only from memory or a single snippet** (re-verify from primary or scholarly sources): Stevin's decimal fractions 1585; Eratosthenes as chief librarian c. 240 BCE; clear Roman glass and Venetian cristallo c. 1450; Ireland's reliance on the Lumper variety; potato to Europe by the Canaries in the 1570s; the Mainz sack of 1462 and how much it scattered printers; the Encyclopédie prospectus (1750), suppression of the first two volumes (1752) and papal condemnation (1759); that Shovell “goes with the majority”; “around −15 °C by 9 November” 1812; Puteoli instead of Ostia as the grain port in 30 BCE; Josephus, Jewish War 2.386 (Egypt feeding Rome four months); Snow's 1849 argument and the 7–8 September 1854 dates; Bazalgette from 1859; Lloyd's origin in a coffeehouse; Arrhidaeus/Roxana and the Diadochi span; ten aqueducts c. 110 CE; Mussolini's Pontine drainage; Antonine and Cyprianic plagues not being malaria; the Rhenish gulden's fine-gold content (about 2.5–2.76 g) behind “a kilo covers roughly half of that first sum”; the 1,300–2,000 range for the Scilly dead; BIC lighters using isobutane (BIC's own page); Ibn al-Haytham's Optics dating (1011–21 vs 1028–38).
- **Numbers read from search snippets**: the Nunn and Qian “one-quarter” (a critical review says one-sixth to one-quarter), the 32,000 British cholera deaths (lower registered figure for England and Wales), 616 Broad Street deaths (some sources say 420–700), 70% of print counts, 21.7 million Encyclopédie words and Wikipedia's size ratio.
- **Real devices.** Never opened on a phone, in Safari or Firefox, or with a screen reader. Do a real phone pass with the pinned picture and each story step in reading position (the pack's own rule), and test the Romanian diacritics rendering.
- **Native Romanian read.** The Romanian was drafted by model passes under one terminology brief, reviewed by three model editors (two found real errors, applied), and checked mechanically for years and figures. No human has read it. Run your standard Romanian review (calques, „de” after numerals, sentence-case titles, „număr” not „cifră”, no „nu X, ci Y”). Decisions to confirm: the dimension names (Nevoie, Copiere, Încredere, Efect în lanț), „punctaj”, „aterizare”, and „evaluatori” for the blind raters (explained once as raters who never saw the author's scores).

## Decisions to preserve

- **Do not change the author's scores to match the raters.** The test is only valid because the scores were fixed first (commit `8b06a97`). If you re-score, re-run the raters and keep both. The release check asserts statements in the verdicts about specific scores and rater choices; if it fails after an edit, the prose is wrong, not the check.
- The ranking and the terrain order stay hidden until the reader asks (a sorted surface would give the answers away).
- Printed numbers about the ranking are computed in `time-cargo-model.js` and printed by the page; the check recomputes them in Node. Do not hand-type them into copy.
- Keep the limits visible on the page: raters are the same model family; scores are judgements; counterfactual history cannot be settled by data.
- Trust, Copy and ranking claims are phrased as what the data show on these 20 objects, not as laws.

## Report back

Say plainly what was verified live, what was not, which links or claims you changed, and what you did beyond the ask. If a gate fails, do not publish; fix it or report the blocker.
