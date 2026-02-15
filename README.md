# The Deep Logic of Male-Imposed Body Modification on Women

Long-form editorial webpage built as a static site and published with GitHub Pages.

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

## Run locally

### Option 1: open directly

Open `index.html` in your browser.

### Option 2: local HTTP server (recommended)

```bash
cd github-pages-site
python3 -m http.server 8080
```

Then open: http://localhost:8080

## Deployment (GitHub Pages)

This repository is configured to publish from:

- Branch: `main`
- Folder: `/` (root)

Any push to `main` triggers a GitHub Pages build and updates the public site.

## Customization notes

- Update hero subtitle text in `index.html` under `id="heroSubtitle"`.
- Replace article content by editing the markdown block (`markdown-source`).
- If you want to remove CDN dependency, pre-render markdown into static HTML and remove the `marked` script.

## License

No explicit license has been added yet. If this repo is intended for reuse, add a license file (for example, MIT).
