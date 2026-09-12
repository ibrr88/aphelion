# Artwork and asset provenance

## Current cinematic revision — 12 September 2026

Two original videos were generated with Magnific MCP using **Seedance 2.5**, 1080p, 16:9, without audio. The Rempus screenshot supplied by the user informed color and composition; its branding is not included in the films.

| Local video | Creation ID | Duration | Reported credits |
| --- | --- | --- | --- |
| `public/videos/departure.mp4` | `yiWuC7OPW9` | 10 seconds | 7900 |
| `public/videos/observatory.mp4` | `WDmgsnpcXe` | 8 seconds | 6320 |

Total: **14,220 credits**, one generation per scene. Reuse these completed assets; do not regenerate on resume. Optimized H.264 files have frequent keyframes for forward/reverse seeking, no audio, and separate 960px-wide mobile versions. Posters provide reduced-motion and loading fallbacks. Hero idle motion gently traverses the opening frames; vertical scroll controls the complete clip. The second film loads near the ascent section.

The follow-up quality pass used one **4K Magnific Precision** upscale per completed film, preserving the original composition and motion. The hero upscale cost 10,963 credits and the ascent upscale cost 8,830 credits (19,793 total). Production exports are 2560px-wide H.264 at 30fps with CRF 17; mobile exports are 1280px wide at CRF 19. Both use keyframes every six frames, no B-frames, and fast-start metadata to support responsive forward/reverse seeking.

## Earlier reference-led revision

An earlier September 12 revision used the user-supplied Starmind reference by Dogan Ural with a canvas overlay. The current hero replaces that composition with original video. Four NASA/ESA planetary photographs remain. Source links and licensing details are in `public/image-credits.txt`, linked from the footer. Earth and Saturn retain image transparency; Moon and Mars use circular clipping and screen blending on the dark page.

## Original generated assets

The production imagery was generated specifically for Aphelion through the connected Magnific MCP using **Seedream 5 Pro**, 2k, 16:9, one image per request. Three 2560 × 1440 PNG originals were generated. The service reported **100 credits per image, 300 total**. No video, upscaling, extra variants, or generation retries were used.

| Production asset | Magnific creation | Purpose |
| --- | --- | --- |
| earth-{width}.webp | [Orbital Earth](https://www.magnific.com/app/creation/eIQbmrtdqL) | Hero, ascent, orbital mission |
| moon-{width}.webp | [Lunar landscape](https://www.magnific.com/app/creation/9ZTpAXkNYZ) | Lunar mission |
| cabin-{width}.webp | [Orbital observatory](https://www.magnific.com/app/creation/WDmfeHOcXe) | Life above |

These are concept illustrations, not photographs documenting actual destinations, spacecraft, or services. The original signed media URLs are temporary and deliberately not part of the production source. Production WebP files are stored locally in `public/images/`.

## Art direction and prompts

Shared direction: original ultra-real cinematic aerospace photography; nearly black void, restrained cold white-blue light and a narrow amber accent; physically plausible materials and optics; subtle film grain; clean large-format cinema composition. No typography, lettering, logos, watermark, interface, or overlays.

**Earth:** A giant nearby Earth with its curved blue horizon rising from lower left to middle right. Dark ocean and subtle clouds occupy the bottom half. Thin electric-blue atmosphere and restrained sunrise at the right edge. Empty dark upper-left area for a large headline. Very sparse stars; no nebulae or spacecraft.

**Moon:** A low camera over rugged pale grey crater ridges. Sharp granular regolith and fractured rock in the lower half. Black sky with a small blue Earth high at the right. Dramatic low sidelight and deep crater shadows. No people, atmosphere, or structures.

**Cabin:** A plausible minimalist orbital observatory. A circular window dominates the right two-thirds, revealing Earth. Dark titanium ribs, matte flooring, one refined light-upholstered seat lower left, and a slim recessed warm practical light. Empty, quiet, intimate; no screens or controls.

## Original still-image pass

The first version animated original still images in the browser. The current revision replaces the hero and ascent imagery with the two videos documented above. The image and video generation services are used only during authoring; no paid AI service runs for site visitors.

Magnific's catalog distinguishes Seedream (images) from Seedance (video). The approved video pass consumed credits through MCP; unlimited website access did not apply.

## Other assets

- Wordmark/orbital symbol: original CSS geometry and matching SVG favicon created for this concept.
- Typeface: Manrope (variable) and IBM Plex Mono, served locally from Fontsource packages. Keep their package license notices when redistributing.
- Icons: Lucide via the declared dependency.
- User-supplied Rempus and Starmind screenshots: visual references; their branding is not rendered in the current site. An unused Starmind asset may remain from the earlier local revision.

The repository does not grant additional rights beyond those provided by each asset's originating terms. No third-party identity or partner endorsement is implied.
