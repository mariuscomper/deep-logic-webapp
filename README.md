# The Deep Logic of Male-Imposed Body Modification on Women

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
- `marked` (loaded from CDN) to render embedded markdown content

## File structure

- `index.html`: full app (layout, styles, JS, and embedded markdown source)
- `README.md`: project documentation

## How content works

The article body is stored inside `index.html` in a `<script id="markdown-source" type="text/plain">` block.
At runtime, JavaScript converts that markdown into HTML and:

1. Generates heading anchors
2. Wraps sections for animation and spacing
3. Builds the table of contents automatically
4. Computes and displays read time

## License

No explicit license has been added yet. If this repo is intended for reuse, add a license file (for example, MIT).
