# Groovethiopia — Static Preview Site

A lightweight static HTML/CSS/JS site that mirrors the design and content of the public marketing pages, deployed automatically to **GitHub Pages**.

## Pages

| URL | Source |
|---|---|
| `/` | `index.html` — Home |
| `/about.html` | About + Team |
| `/events.html` | Events index |
| `/event-detail.html?slug=...` | Event detail (with booking CTA) |
| `/collection.html` | The Collection (vehicles) |
| `/partners.html` | Partners directory |
| `/sanctuary.html` | The Sanctuary |
| `/gallery.html` | Gallery |
| `/contact.html` | Contact form |
| `/lang.html` | Language switcher |
| `/404.html` | Not found |

## Local preview

```bash
cd apps/web-preview
python3 -m http.server 8080
# → http://localhost:8080
```

Or just open `index.html` in a browser.

## Deploy to GitHub Pages

The repo is configured with a GitHub Action that deploys this folder to the `gh-pages` branch on every push to `main`.

**Live URL:** `https://abrhamt.github.io/groovethiopia/`

### Manual deployment

If you want to deploy manually:

```bash
cd apps/web-preview
# Install: npm install -g gh-pages
npx gh-pages -d . -b gh-pages --dist .
```

Or:

```bash
git worktree add /tmp/gh-pages gh-pages
cp -r apps/web-preview/* /tmp/gh-pages/
cd /tmp/gh-pages
git add . && git commit -m "Update preview"
git push origin gh-pages
```

## Editing content

All seed content lives in `js/content.js`:
- `EVENTS` — 4 events
- `VEHICLES` — 6 collector vehicles
- `TEAM` — 8 team members
- `PARTNERS_STRATEGIC` / `PARTNERS_CULTURAL` — 12 partners
- `DIVISIONS` — 4 main divisions

Edit the arrays, commit, push — the page rebuilds automatically.

## Design

- **Colors**: deep black (#0a0a0a) + warm gold (#d49520) + amber accents
- **Typography**: Söhne (sans), Cormorant Garamond (serif/headings), JetBrains Mono (labels)
- **Layout**: max 1280px container, generous spacing, editorial hierarchy
- **Responsive**: 1-2-3-4 column grids that collapse on mobile
