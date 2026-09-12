# Verification record

## 4K motion refinement — 12 September 2026

- Both approved films received one completed 4K Magnific Precision enhancement and were visually inspected at 2560 × 1440 after local conversion.
- The hero and ascent now use 2560px desktop and 1280px mobile H.264 exports at 30fps, with frequent keyframes, no B-frames, and fast-start metadata.
- Video sections were lengthened to 320svh/300svh on desktop and 280svh/260svh on mobile. Lenis interpolation was reduced and wheel input softened; video time now eases toward scroll position and retries a failed load at most twice.
- Mobile browser testing confirmed forward seeking settled from frame 0 to approximately 2.95 seconds, reverse seeking settled back to approximately 1.14 seconds, and decoder readiness returned after each seek.
- The intro now shows four concentric rings with four planet images rotating at distinct scroll-driven rates and accelerating curves.
- Destination-star parallax increased modestly while the same sparse density and minority-only twinkle remain.
- The final invitation was replaced with a responsive orbital instrument composition and coordinated entrance/scroll animation.
- At 413 × 912, the footer copyright and creator share one compact row; the motion control sits left and the circular back-to-top arrow sits right. Reduced motion removes horizontal enhancement and displays all destinations in normal document flow.

## Cinematic update — 12 September 2026

Two completed Seedance 2.5 films now drive the hero and ascent. The hero gently seeks through its opening frames while idle; vertical scrolling seeks forward and backward. Earth, Moon, Mars and Saturn appear in a horizontal passage. Lenis smooth scrolling and GSAP entrance/section motion are integrated. The procedural star field has 110 small stars on desktop and 44 on narrow displays: only every eleventh star varies subtly in brightness, independently over 11–23 seconds. Star travel is much smaller than planet travel.

Validated:

- TypeScript and final Next.js production static export pass.
- Desktop hero at 1280 × 720 loads and decodes the local 1080p film. Forward scroll advanced playback to approximately 5 seconds; reverse scroll reduced it to approximately 3.5 seconds.
- Mobile at 413 × 912 selects both mobile MP4 sources and decodes them. Horizontal panels have matching viewport widths; scrolling changes the active planet, and the Saturn control reaches the final panel.
- Mobile menu opens and its journey link closes it, focuses the journey section, and scrolls there. Journey and back-to-top anchors respond.
- Frame contact sheets of both complete films were visually inspected. The Moon's residual square backdrop was identified during review and fixed with circular clipping; mobile destination labels were enlarged, followed by a successful final build.
- Local production server returns video/mp4 and correct 206 byte ranges, suffix ranges, 416 for unsatisfiable requests, and HEAD with an empty body. This supports reverse/forward media seeking.
- Reduced-motion code uses posters, removes enhanced horizontal movement, and stops procedural animation. This new film fallback has not been independently exercised on physical devices.

Scope remains local only. No hosting changes, deployment, or GitHub upload was performed. Existing older handoff archives are not updated copies of this cinematic revision. Physical-device performance and cross-browser testing remain future release checks.

## Local visual revision — 12 September 2026

Added cyan/white/orange lighting, an animated canvas particle ring over the supplied Starmind image, photographic planet cutouts with differing scroll transforms, four working demo destinations, and a redesigned footer. These are layered photographic effects, not interactive 3D models or a generated video file.

Verified all seven page images load, desktop and 390px mobile layouts have no horizontal overflow, the Saturn planner produces its matching itinerary, the about dialog opens from the footer, and reduced motion stops the planet animations. The production build and TypeScript checks pass. Changes remain local; the previously published site is unchanged. Earlier two-destination QA below describes the original version.

Checked on 11 September 2026 using Node.js 24 and the Codex in-app Chromium browser.

## Completed

- TypeScript `tsc --noEmit` and the Next.js production static export completed successfully.
- Responsive browser checks at 1440 × 900, 768 × 1024, 390 × 844, and 320 × 740. No horizontal document overflow at these widths; hero text, journey cards, and planner fit the inspected layouts.
- All five rendered photographs loaded from local responsive WebP assets. One primary page heading was present.
- Both journey selections open the planner. Lunar configuration with September 2038 and four travelers produces the matching itinerary. Orbital configuration also produces its matching result.
- The itinerary download control initiates a text download and displays its completion state. The browser's downloaded file was not separately inspected.
- Escape closes the planner and returns focus to its original journey trigger. The generated itinerary receives focus on submission.
- Mobile navigation and the reduced-motion control respond to interaction. Reduced motion removes the extended ascent scroll sequence and displays its final altitude. The saved reduced-motion preference was observed when the production page hydrated on the same origin.
- The optional WebMCP planner tool configures the visible lunar planner. An invalid journey is rejected without changing the selection.
- The exported site returns HTTP 200 from the included static server. Production browser smoke checks cover the FAQ and planner as well as initial layout.

## Limits

These are targeted development checks, not a formal accessibility certification or a measured Lighthouse score. Physical iOS/Android devices, Safari, Firefox, slow-network performance, and deployment under a GitHub Pages subpath have not been tested. Check these environments before a broad public launch.

The planner is intentionally fictional: no payment, contact submission, reservation service, or real travel availability is integrated.
