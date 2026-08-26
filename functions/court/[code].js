// Permanent court QR: https://<domain>/court/<CODE>
// These live on physical stickers, so this page is the one a stranger who
// walks up to the court will see. Route: app/court/[code].tsx.
import { pageResponse } from "../../lib/store-page.js";

export async function onRequestGet({ params }) {
  const code = (params.code || "").toUpperCase().slice(0, 12);
  return pageResponse({
    badge: code ? `COURT ${code}` : "",
    sub: "Get the app to start or join a match on this court.",
  });
}
