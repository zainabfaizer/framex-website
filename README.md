# FrameX Prime

Marketing / lead-generation website for FrameX Prime (90-Day Video Funnels for Dubai real estate agents).
Plain HTML, CSS and vanilla JavaScript. No build step, no dependencies, no backend.

## Run locally
Open the folder in VS Code and use the "Live Server" extension on `index.html`,
or double-click `index.html`.

## Structure
- `index.html` – all markup (semantic sections, SEO metadata)
- `css/style.css` – design tokens (`:root`), base, layout, components, sections, motion
- `css/responsive.css` – tablet and mobile overrides (breakpoints: 1024 / 960 / 768 / 480 / 360)
- `js/config.js` – site settings, including the booking URL (edit here)
- `js/script.js` – header, mobile nav, booking links, hero intro, scroll reveals, roadmap, FAQ
- `assets/` – `images/` (+ `images/logo/`), `videos/`, `icons/`, `fonts/`

## Common changes
- **Booking URL:** edit `bookingUrl` in `js/config.js`. Set `embedBooking: true` to load it inline.
- **Colors / fonts / spacing:** edit the tokens at the top of `css/style.css`.
- **Animations:** elements marked `data-reveal` reveal on scroll; the hero uses `data-hero`.
  All motion respects `prefers-reduced-motion`.

## Placeholders to replace
Search the project for `data-placeholder`. Current items:
VSL video, roadmap phase descriptions, Evidence cards, booking calendar embed,
FAQ answers and extra questions, footer legal links.




## Deployment
Static site: upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
A backend can be added later as a separate layer without restructuring the frontend.