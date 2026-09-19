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

## License

This project is licensed under the MIT License.

See the full text in `LICENSE`.
