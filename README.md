# The deep logic of body modification imposed on women

Long-form editorial webpage built as a static site and published with GitHub Pages.

## Essay overview

This essay analyzes why harmful body-modification practices aimed at women can persist across generations, even when they are enforced by women themselves. It focuses on the social and strategic logic behind:

- Foot binding
- Female genital cutting (FGC/FGM)
- Breast ironing

The central argument is that these practices are sustained by overlapping forces:

- Male reproductive and lineage interests
- Maternal strategy under constrained social systems
- Coordination traps in marriage markets and community norms

It also compares these dynamics with hazing, then explains why individual awareness campaigns often fail and why coordinated abandonment works better.

## Live site

- Public URL: https://mariuscomper.github.io/deep-logic-webapp/
- Repository: https://github.com/mariuscomper/deep-logic-webapp

## Project purpose

This project presents a long-form analytical essay in a magazine-style reading experience with:

- Hero section with title, subtitle, and read-time estimate
- Auto-generated table of contents from markdown headings
- Scroll progress bar
- Fade-in section reveals
- Back-to-top floating button
- Responsive typography/layout for desktop and mobile

## Tech stack

- Single-page static HTML (`index.html`)
- CSS custom properties for theme and typography
- Vanilla JavaScript for rendering and UI behavior
- Local, dependency-free Markdown renderer (`markdown-parser.js`)
- Light and dark themes with reduced-motion support

## File structure

- `index.html`: full app (layout, styles, JS, and embedded markdown source)
- `markdown-parser.js`: local Markdown renderer used by the page
- `README.md`: project documentation

## How content works

The article body is stored inside `index.html` in a `<script id="markdown-source" type="text/plain">` block.
At runtime, JavaScript converts that markdown into HTML and:

1. Generates heading anchors
2. Wraps sections for animation and spacing
3. Builds the table of contents automatically
4. Computes and displays read time

## Viking Journeys map

`viking-journeys.html` is a second, independent page on this site: an interactive dark-mode map of the Viking Age (793-1066), built with [Leaflet](https://leafletjs.com/) and a CARTO dark basemap.

It plots raids and conquest in Britain and Francia, the North Atlantic exploration route to Iceland, Greenland and Vinland, and the eastern river routes from the Baltic to Byzantium and along the Volga to the Abbasid Caliphate. Each route and settlement has its own popup, a category legend lets you toggle layers on and off, and a timeline slider (with a play button) reveals events chronologically.

- `viking-journeys.html`: page markup, styles, and map/timeline logic
- `viking-journeys-data.js`: the journeys and trading-hub dataset the map renders
- `vendor/leaflet/`: a vendored copy of the Leaflet library (no CDN dependency for the library itself; map tiles still load from CARTO/OpenStreetMap over the network)

## Time cargo: what to take back in time

`time-cargo.html` (English) and `time-cargo-ro.html` (Romanian) are a third, independent page: twenty objects (WD-40, seed potatoes, a slide rule, reading glasses, oral rehydration salts and more) that a time traveller could carry, nine historical windows to land them in, and a ranking of how much good each does at its best landing.

The reader picks one object and one era, travels there, and is scored. The picture beside the text is the model's own surface (20 objects by 9 eras): its rows stay unnamed until the reader lands them, and the ranking is revealed on request.

How the numbers are made and tested:

- Each object has four judgement scores (Need, Copy, Trust, Ripple), combined into a Delta from 0 to 100. The scores were written first and are not edited after seeing the tests.
- Test 1: the ranking is re-computed under 5,000 random weightings (seeded, so the page and the check agree).
- Test 2: three raters that never saw the scores (separate model contexts given only a neutral description) scored the same objects. Their raw answers are stored in `time-cargo-data.js` and the page prints how far they differ.
- The main finding printed on the page (Copy predicts the ranking, Trust does not) is asserted by the release check, not typed.

Files:

- `time-cargo-data.js`: objects, scores, sources, the raters' raw answers, English item text
- `time-cargo-copy.en.js`, `time-cargo-copy.ro.js`: interface copy and Romanian item text
- `time-cargo-model.js`: the scoring model, run identically in the browser and in Node
- `time-cargo.js`, `time-cargo.css`: the page
- `scripts/build-time-cargo.mjs`: builds the two HTML pages from `scripts/templates/`
- `scripts/build-time-cargo-cards.mjs`: draws the social posters and one preview page per landing in `share/` (chat apps ignore `#hash`, so each landing has its own page and picture)
- `scripts/check-time-cargo.mjs`: release check (data, claims in the prose against the numbers, Romanian parity, contrast in both themes, text lint)
- `scripts/test-time-cargo.mjs`: behaviour tests in Chromium (needs Playwright)
- `docs/time-cargo-brief.md`: the finding, the tests, what failed

After a content change: `node scripts/build-time-cargo.mjs && node scripts/build-time-cargo-cards.mjs && node scripts/check-time-cargo.mjs && node scripts/test-time-cargo.mjs`.

## License

This project is licensed under the MIT License.

See the full text in `LICENSE`.
