# eduardenache.ro

Eduard Enache's interactive CV and portfolio: an Astro static site (TypeScript strict, GSAP + Lenis for motion,
View Transitions for page changes). Pages are complete without JavaScript; motion scenes layer on top.

## Commands

    npm install
    npm run dev       # http://127.0.0.1:4321 (loopback only)
    npm run build     # static site in dist/
    npm run preview   # serve dist/ on loopback
    npm run check     # astro check (types)

## Where to change things

- Design (colours, fonts, type scale, spacing, easing, durations): `src/styles/tokens.css`, the only place for them.
  `src/styles/base.css` holds the reset, grid helpers and the sky / haze / water ground classes.
- Projects: `src/content/projects/*.md`. CV: `src/content/cv.json`. Name, links, email: `src/data/site.ts`.
- Project screenshots live in `design/assets/projects/<folder>/` and are listed in each project's front matter.
- Motion: `src/scripts/motion.ts` (`scene(name, fn)` runs for each `[data-scene="name"]` on page load).

## Environment (optional, build time)

- `PUBLIC_API_BASE`: base URL of the live API; unset shows the offline fallback on /live/.
- `PUBLIC_CONTACT_ENDPOINT`: form POST target; unset falls back to a mailto link.

The downloadable CV (`/cv/Eduard-Enache-CV.pdf`) is added to `public/cv/` separately.
