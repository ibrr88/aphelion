# APHELION

### A different perspective.
<img width="1487" height="938" alt="clipboard" src="https://github.com/user-attachments/assets/97a59aaa-0772-4aae-8e1c-20248cf423d6" />


<p align="center">
  A cinematic, fictional space-travel experience by <strong>Ebrahim Alhebshi</strong>.<br />
  An original redesign of the <a href="https://pixiu.qode.top/">Pixiu</a> WordPress project, built as a responsive React website.
</p>

---

## The experience

Aphelion is designed as a slow, atmospheric passage from Earth to orbit. It pairs scroll-controlled cinematic scenes with an orbital destination explorer, layered stars, motion that respects user preferences, and a fictional mission planner.

**Inside the experience**

- A branded loading sequence, cinematic hero, and scroll-driven ascent scenes.
- Smooth scrolling, layered star fields, horizontal planet movement, and coordinated reveals.
- Four imagined destinations: Earth orbit, the Moon, Mars, and Saturn.
- A responsive experience tailored for desktop and mobile, with reduced-motion support.
- An accessible fictional planner that creates a downloadable concept itinerary.

> Aphelion is a portfolio concept. It does not sell travel, process payment, or collect personal information.

## Built with

Next.js · React · TypeScript · GSAP · Lenis · self-hosted fonts · responsive WebP and MP4 media

The project is exported as static files, so it can be deployed to GitHub Pages, a subdomain, or any standard web host.

## Run it locally

```sh
npm ci
npm run dev
```

Open the URL printed in the terminal. Then use these checks before deployment:

```sh
npm run typecheck
npm run build
npm start
```

The production export is generated in `out/`. Stop the development server before using the production preview on the same port.

## Project guide

| Location | What it contains |
| --- | --- |
| `components/aphelion.tsx` | Page sections, navigation, planner, FAQ, and dialogs |
| `app/cinematic.css` | The cinematic visual system, animation, and responsive styling |
| `lib/use-scene-motion.ts` | Scroll animation setup and motion-preference cleanup |
| `lib/journeys.ts` | Destination content and itinerary data |
| `public/images/` | Responsive planet and editorial imagery |
| `public/videos/` | Desktop and mobile cinematic media |

## Further reading

- [Case study](docs/CASE-STUDY.md) — creative direction, interaction design, and outcome.
- [Deployment guide](docs/DEPLOYMENT.md) — hosting on a custom domain or GitHub Pages.
- [Artwork and Magnific workflow](docs/ASSETS.md) — asset provenance and media pipeline.
- [QA record](docs/QA.md) — completed checks and known limits.

The included GitHub workflow runs type and production-build checks on pushes and pull requests. It does not publish the site automatically.

## Credits

Original concept and creative direction: **Ebrahim Alhebshi**. Design and development created in collaboration with Codex. See the asset documentation for third-party imagery and dependencies.
