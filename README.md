# Aphelion

**A different perspective.** A cinematic space-travel concept by Ebrahim Alhebshi.

Aphelion reimagines the original [Pixiu](https://pixiu.qode.top/) WordPress project as a responsive React experience with original artwork, a scroll-controlled orbital story, and an interactive fictional mission planner.

## Run locally

```sh
npm ci
npm run dev
```

The development server prints its localhost URL (normally port 5173). Node.js 24 was used for development; package.json records the minimum compatible version.

```sh
npm run typecheck
npm run build
npm start
```

The production build exports to `out/`. Stop the development server before starting the production preview on the same port.

## Experience

- Original Aphelion identity, large editorial typography, and cinematic Earth/lunar/observatory imagery.
- Scroll-controlled Seedance 2.5 hero and ascent videos, Lenis smooth scrolling, horizontal planet passages, sparse canvas stars, and coordinated GSAP reveals.
- Distinct desktop and phone compositions, accessible dialogs and menus, visible focus states, and reduced-motion support.
- Four fictional journeys with configurable season and group size; downloadable concept itinerary.
- Self-hosted fonts, responsive local WebP imagery, and optimized desktop/mobile MP4 films; no runtime AI or paid APIs.
- Optional progressive WebMCP planner tool in supported browsers.

## Project map

| File | Purpose |
| --- | --- |
| `components/aphelion.tsx` | Page sections, planner, navigation, FAQ, and dialogs |
| `app/globals.css` | Visual system and responsive styles |
| `lib/use-scene-motion.ts` | Scroll animation and preference cleanup |
| `lib/journeys.ts` | Editable itinerary content and asset base path |
| `app/layout.tsx` | Fonts, metadata, and icon |
| `public/images/` | Optimized original artwork |

The Sites React starter supplies local preview tooling and UI primitives. Production uses Next.js static export so the resulting site can be hosted on an ordinary web server.

## Documentation

- [Case study](docs/CASE-STUDY.md): original problem, creative direction, interaction design, and honest outcome.
- [Deploy to your domain or GitHub Pages](docs/DEPLOYMENT.md): static hosting and optional subpath setup.
- [Artwork and Magnific workflow](docs/ASSETS.md): provenance, prompts, credit usage, and the media pipeline.
- [QA record](docs/QA.md): completed checks and limitations.

The included GitHub workflow checks types and builds on pushes and pull requests. It does not publish publicly.

## Concept status

Aphelion is a fictional portfolio project. It is not a travel operator and does not collect payment, personal data, or real bookings. Journey durations, future departures, spacecraft, and service descriptions are speculative. There are no fabricated customer testimonials or claimed awards.

Original concept and creative direction: **Ebrahim Alhebshi**. Design and development created in collaboration with Codex. See asset provenance for third-party dependencies and imagery.

