# Aphelion — from Pixiu to a new perspective

**Creator and creative direction:** Ebrahim Alhebshi  
**Design and implementation:** developed in collaboration with Codex  
**Status:** Independent fictional concept, September 2026

## The starting point

Pixiu was Ebrahim's fictional space-tourism website, built with WordPress, Elementor, and the Hub Liquid theme. The redesign brief allowed a complete change of identity, visual style, content, and section order. The objective was a memorable coded portfolio project that could be published on GitHub and an independent domain.

The original was reviewed at [pixiu.qode.top](https://pixiu.qode.top/). It included destinations, fictional flight availability, benefits, testimonials, FAQs, and booking calls to action. Some copy contained typographic errors and old dates. The new design uses a more focused narrative and explicitly identifies its fictional offerings.

## The design decision

The central idea is a change of perspective. Aphelion combines the intimacy of a journey with the scale of orbital photography. A blue atmospheric rim is the recurring visual thread. Deep black and cool white carry most of the composition; restrained orange marks activity and selected states.

The user's Rempus and Starmind references informed atmospheric color and negative space. Their branding, compositions, type treatments, and images were not copied into the production site. Aphelion has its own wordmark, original imagery, and page architecture. It is separate from the earlier Cuatroz presentation.

## Content architecture

1. **Arrival:** Earth as the opening image; a single promise, “A different perspective.”
2. **Perspective:** an editorial statement about the emotional purpose of the journey.
3. **Ascent:** a sticky scene that connects scroll progress with a changing horizon and imagined altitude.
4. **Journeys:** two distinct fictional routes, orbital and lunar.
5. **Life above:** a quiet observatory interior and a more intimate scale.
6. **Clarity:** FAQs explain the concept and how the demo works.
7. **Invitation:** an interactive mission planner, followed by creator credit.

## Interaction decisions

- Native scrolling remains in control. GSAP ScrollTrigger synchronizes transforms with scroll progress without intercepting wheel or touch input.
- The ascent uses CSS sticky positioning. A visible link lets visitors skip directly to the journeys.
- Hero photography moves gently; selected text and section entrances reveal progressively.
- The planner offers route, season, and traveler count, then produces a downloadable text itinerary. It requests no personal data and creates no real reservation.
- The site respects device reduced-motion preferences and provides a persisted manual preference. Content starts visible before animation initializes.
- Installed Radix/shadcn primitives provide dialog focus trapping, Escape handling, radio keyboard behavior, and accordion semantics.

## Engineering and portability

React 19, TypeScript, Next.js static export, GSAP, semantic HTML, and custom CSS. The Sites starter supplied the local development shell and interface primitives. The production output is ordinary static files and can be hosted independently.

Fonts are self-hosted. Original images are delivered as responsive WebP variants at 768, 1280, 1920, and 2560 pixels. The hero is eager/high-priority; secondary media loads lazily. No remote image endpoint, AI subscription, or API key is needed to run the finished site.

## Honest outcome

This is a working portfolio concept, not a real commercial launch. No fabricated conversion metrics, business results, traveler testimonials, award wins, or safety certifications are claimed. See `QA.md` for the checks actually completed and their limits.
