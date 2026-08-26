// Generic smart app link. Share ONE URL: https://<domain>/app
// Installed → the OS opens the app and this never runs. Not installed →
// straight to the store.
import { pageResponse } from "../lib/store-page.js";

export async function onRequestGet() {
  return pageResponse();
}
