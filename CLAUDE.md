# Keep Score: Tennis - Website

Marketing and deep-link site for the "Keep Score: Tennis" mobile app. Static
site deployed on **Cloudflare Pages**, with **Pages Functions** for dynamic
smart links. Modeled on `keep-score-pickleball-website`; keep the two
structurally alike so a fix in one is obvious to port to the other.

## App identifiers

- iOS App Store: `https://apps.apple.com/app/id6804699922` (Apple ID
  `6804699922`, SKU `com.onthevinemedia.keepscoretennis`). Set as
  `APP_STORE_ID` in `lib/store-page.js`; the fallback pages redirect iOS
  visitors straight to it.
- Google Play: `https://play.google.com/store/apps/details?id=com.onthevinemedia.keepscoretennis`
  — **not live yet**, so that URL 404s. The hero badge and the Android
  redirect in `lib/store-page.js` still point at it.
- iOS appID (Team plus bundle): `2A76QQ868A.com.onthevinemedia.keepscoretennis`
- Android package: `com.onthevinemedia.keepscoretennis`
- Domain: `keepscore-tennis.pages.dev`, hardcoded in the app at
  `lib/links.ts` (`LINK_DOMAIN`) and in `app.config.js`. Change all three
  together.

## Layout

- `index.html`, `privacy.html`, `ratings.html`: static pages, adapted from the
  pickleball site. `tennis-court.svg` is the hero art, drawn to the same
  geometry as the app's own court component. There is no stickers page yet.
- `functions/`: Cloudflare Pages Functions (file path maps to URL path).
  - `functions/app.js` serves `/app`: generic smart link, no code.
  - `functions/join-game.js` serves `/join-game?code=ABCD`: joining a live
    match. Query string rather than a path segment because the app's route is
    `join-game`, and matching the app's own routes is what lets expo-router
    resolve these Universal Links with no extra registration.
  - `functions/court/[code].js` serves `/court/:code`: permanent court QR.
  - `functions/claim/[code].js` serves `/claim/:code`: connecting players to a
    recorded match. The likeliest of the four to be opened by someone without
    the app, since a claim code exists precisely because that player was
    recorded as a placeholder.
- `lib/store-page.js`: builds every fallback page. Lives OUTSIDE `functions/`
  because anything inside that directory becomes a route.
- `.well-known/apple-app-site-association`: iOS Universal Links. Lists the
  paths the app may open (`/app`, `/app/*`, `/join-game*`, `/court/*`,
  `/claim/*`).
- `.well-known/assetlinks.json`: Android App Links verification. Still carries
  a **placeholder SHA-256**; replace it once a tennis Android build exists.
- `_headers`: forces `Content-Type: application/json` on the two
  `.well-known` files (Cloudflare Pages otherwise serves them as text).

## Smart links (open app if installed, else send to the store)

Two layers:

1. **OS interception (app installed).** iOS Universal Links and Android App
   Links open the app directly when the URL matches a claimed path. The site
   advertises those paths in `.well-known`; the **app must register the same
   paths** (`ios.associatedDomains`, Android `intentFilters` in
   `app.config.js`). Without both halves the OS does not intercept and the web
   page loads instead.
2. **Web fallback (app not installed).** The Function returns HTML whose
   inline script sniffs the User-Agent and redirects to the App Store or Play
   Store. Desktop falls through to a landing page with both badges.

This is the whole point of the site: a custom-scheme QR
(`keepscoretennis://claim/K7X2M9`) is invisible to a phone without the app.
The iOS Camera shows nothing at all, so the person most likely to need the app
is the one given no way to get it.

## Before the links actually work

In order. The app deliberately still emits custom-scheme QRs until all three
are done, because an HTTPS QR pointed at a site that is not up yet is strictly
worse than the current silence.

1. Deploy this site to `keepscore-tennis.pages.dev`.
2. Verify the AASA file:
   `curl -sI https://keepscore-tennis.pages.dev/.well-known/apple-app-site-association`
   must return `content-type: application/json`.
3. In the app repo: flip `USE_UNIVERSAL_LINKS` to `true` in `lib/links.ts`,
   then prebuild and install a fresh native build. iOS fetches the AASA file
   at **install time**, so an existing build will not pick it up.

## Conventions

- **No em dashes or en dashes anywhere in source.** Use hyphens, commas, or
  reword. (Same rule as the pickleball site.)
- Function HTML shares one visual style via `lib/store-page.js`. Static pages
  inline their own CSS, matching the app's palette: green `#537D45`, court
  blue `#3F76B0`, optic yellow `#E9F75E`, ink `#1A1A1A`.

## Porting this to pickleball

The pickleball site already has `/app` and `/court/*` and the same two
`.well-known` files, so the web half is mostly there. What it is missing is
the app half plus the two newer routes:

1. Add `functions/claim/[code].js` (once pickleball has a claim feature) and
   `functions/join-game.js`, and add those paths to
   `.well-known/apple-app-site-association`. Consider refactoring its two
   existing Functions onto a shared `lib/store-page.js` first, the way this
   repo does, so the pages cannot drift apart.
2. In the pickleball app: add the equivalent of `lib/links.ts` and route every
   QR through it, then enable the matching `intentFilters` for the new paths.
   Its `associatedDomains` already covers `/court/*`.
3. Same switchover order as here: deploy, verify the AASA content type, flip
   the switch, ship a fresh native build (iOS reads the AASA file at install
   time).
