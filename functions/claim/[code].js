// Connect players to a recorded match: https://<domain>/claim/<CODE>
//
// The likeliest of the four to be scanned by someone WITHOUT the app: a
// claim code exists precisely because the host recorded that player as a
// placeholder, which usually means they aren't on the app yet. Route:
// app/claim/[code].tsx.
import { pageResponse } from "../../lib/store-page.js";

export async function onRequestGet({ params }) {
  const code = (params.code || "").toUpperCase().slice(0, 8);
  return pageResponse({
    badge: code ? "MATCH" : "",
    sub: "Get the app to add yourself to this match and keep your record.",
  });
}
