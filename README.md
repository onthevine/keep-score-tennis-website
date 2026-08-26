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

Three things, in order. Missing any one of them means an HTTPS QR opens Safari
on this page instead of opening the app   which is why the app still emits
custom-scheme QRs until they are done.

1. **Deploy this site** to the domain above.
2. **`APP_STORE_ID`** in `lib/store-page.js`   empty today, because the app has
   no listing yet. While it is empty the page honestly says "Coming soon to the
   App Store" instead of bouncing people to a dead URL. Fill it in at release.
3. **In the app repo**: uncomment `ios.associatedDomains` (and the Android
   `intentFilters`) in `app.config.js`, flip `USE_UNIVERSAL_LINKS` to `true` in
   `lib/links.ts`, then prebuild and make a fresh native build. iOS fetches the
   AASA file at **install time**, so an existing build will not pick it up.

`.well-known/assetlinks.json` still carries a placeholder fingerprint; replace
it with the tennis upload cert's SHA-256 when the Android build exists.

## Sibling

`keep-score-pickleball-website` is the same shape for the pickleball app. Keep
the two structurally alike so a fix in one is obvious to port to the other.
