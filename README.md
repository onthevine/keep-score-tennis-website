# keep-score-tennis-website

The link-handling site for **Keep Score: Tennis**. Its whole job is to make a
scanned QR code work for someone who does not have the app yet.

A QR carrying the custom scheme (`keepscoretennis://claim/K7X2M9`) is invisible
to a phone without the app: the iOS Camera shows nothing at all. An HTTPS
Universal Link does both jobs from one string   the OS hands it to the app when
it is installed, and this site catches it when it is not, then sends the visitor
to the store.

That matters most for **claim codes**: a player has a claim code precisely
because they were recorded as a placeholder, which usually means they are not
on the app yet.

## Deploy (Cloudflare Pages)

Static files plus Pages Functions, no build step.

1. Push this repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command: *(none)*. Build output directory: `/`.
4. Confirm the project's subdomain is **keepscore-tennis.pages.dev**   the app
   hardcodes that host (`lib/links.ts` → `LINK_DOMAIN`) and it is baked into the
   AASA file and `app.config.js`. Change all three together if it differs.

Verify after the first deploy:

```bash
curl -sI https://keepscore-tennis.pages.dev/.well-known/apple-app-site-association | grep -i content-type
# expect: content-type: application/json
curl -s  https://keepscore-tennis.pages.dev/claim/TESTME | head -5
```

## Routes

| URL | App route | Fallback shows |
|-----|-----------|----------------|
| `/app` | (any) | Generic "get the app" |
| `/join-game?code=ABCD` | `app/join-game.tsx` | `MATCH ABCD` |
| `/court/<CODE>` | `app/court/[code].tsx` | `COURT <CODE>` |
| `/claim/<CODE>` | `app/claim/[code].tsx` | `MATCH` |

Paths mirror the app's own routes so expo-router resolves them with no extra
registration. That is also why the join code rides in a query string rather
than the path   the app's route is `join-game`, not `join/[code]`.

`lib/store-page.js` builds every fallback page, and lives outside `functions/`
because anything inside that directory becomes a route.

## Before this actually works

Three things had to be true before an HTTPS QR could open the app instead of
landing someone in Safari. All three are now done:

1. **Deploy this site** to the domain above.
2. **`APP_STORE_ID`** in `lib/store-page.js` — `6804699922`. iOS visitors
   without the app are redirected to the App Store listing.
3. **In the app repo**: `ios.associatedDomains` and the Android
   `intentFilters` are set in `app.config.js`, and `USE_UNIVERSAL_LINKS` is
   `true` in `lib/links.ts`. iOS fetches the AASA file at **install time**, so
   any build made before the site went live has to be reinstalled.

Still open, on the Android side only: the Play listing is not live yet, so the
Play badge on `index.html` and the Android redirect in `lib/store-page.js`
point at a URL that 404s until it is. `.well-known/assetlinks.json` also still
carries a placeholder fingerprint — replace it with the tennis upload cert's
SHA-256 when the Android build exists, or Android App Links will not verify and
those URLs open in the browser.

## Sibling

`keep-score-pickleball-website` is the same shape for the pickleball app. Keep
the two structurally alike so a fix in one is obvious to port to the other.
