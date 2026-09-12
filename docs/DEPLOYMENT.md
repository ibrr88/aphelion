# Publish Aphelion

Aphelion produces a complete static website. Your web host does not need Node.js, WordPress, a database, or an API key. Node is used only on the machine that builds it.

## Your domain or subdomain

1. Install Node.js 24 (the development version) or a compatible version satisfying package.json.
2. From the Aphelion repository, run `npm ci`, then `npm run build`.
3. Upload **the contents of `out/`** into the domain's document root (often `public_html/`) or your subdomain's document root.
4. Keep `_next/`, `images/`, `icon.svg`, and all generated HTML/text files in their relative locations.
5. Enable HTTPS using your hosting panel. If available, serve `404.html` for missing pages.

For a new release, build again and replace the deployed output together. Keep old hashed `_next/static/` assets briefly if your host/CDN caches older HTML.

The included `aphelion-static.zip` handoff, when supplied beside this repository, contains the same `out/` contents. Extract it directly into the chosen document root. It excludes source code and private credentials.

## Local verification of the production output

```sh
npm run build
npm start
```

Open the localhost URL printed by the server. Stop any development server using the same port first. Set `PORT` to use another port.

## Hosting below a path / GitHub project Pages

Root domains and subdomains use an empty base path. A GitHub project page, for example `username.github.io/aphelion/`, needs the base path at build time.

macOS / Linux:

```sh
NEXT_PUBLIC_BASE_PATH=/aphelion npm run build
```

PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/aphelion'
npm run build
```

Publish `out/` using your chosen GitHub Pages deployment workflow. The included `.nojekyll` file preserves the `_next` folder if publishing from a branch. For local verification of this variant, retain the same environment value for `npm start`.

Clear that environment value and rebuild before publishing to the root of a custom domain. Do not include a trailing slash in the configured base path. Actual GitHub publishing and domain DNS configuration are performed in your own account.

## Project files that do not belong on your host

- `node_modules/`, source files, `.git/`, `.sites-runtime/`, and local logs.
- The `.openai/hosting.json` manifest is only for the separate private Sites preview. It is not required by your own host.
- The starter includes additional library primitives and tooling for future extension. These do not become a runtime service in the static export.

## Before sharing publicly

Confirm your chosen domain, page title, creator credit, and concept disclaimer. No real travel, reservations, payments, user accounts, analytics, or email submissions are implemented. The planner remains a local interactive demo.
