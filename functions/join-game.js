// Join a live match: https://<domain>/join-game?code=ABCD
//
// The path matches the app's own route (app/join-game.tsx) so expo-router
// resolves the Universal Link with no extra registration   which is also why
// the code rides in a query string rather than the path.
import { pageResponse } from "../lib/store-page.js";

export async function onRequestGet({ request }) {
  const code = (new URL(request.url).searchParams.get("code") || "")
    .toUpperCase()
    .slice(0, 8);
  return pageResponse({
    badge: code ? `MATCH ${code}` : "",
    sub: "Get the app to join this match and keep the score together.",
  });
}
