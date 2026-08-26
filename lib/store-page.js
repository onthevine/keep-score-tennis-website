// The one page every deep link falls back to when the app is NOT installed.
//
// How a link resolves:
//   * app installed  → iOS/Android intercept the URL via Universal Links /
//     App Links and hand it to the app. This page never loads.
//   * not installed  → this page loads and sends mobile visitors to the
//     right store. Desktop falls through to the body, which shows both
//     badges and whatever code was scanned.
//
// Shared by every function under functions/ so the four entry points cannot
// drift apart. Kept OUTSIDE functions/ on purpose: anything inside that
// directory becomes a route.

// TODO: fill in once the app has an App Store listing (LAUNCH.md section 8).
// While this is empty the page deliberately does NOT redirect   it says the
// app is coming rather than bouncing someone to a dead store URL.
export const APP_STORE_ID = "";

export const PLAY_PACKAGE = "com.onthevinemedia.keepscoretennis";

const APP_STORE_URL = APP_STORE_ID
  ? `https://apps.apple.com/app/id${APP_STORE_ID}`
  : "";
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;

/**
 * @param {{ badge?: string, sub?: string }} opts
 *   badge   short label for what was scanned, e.g. "MATCH ABCD" or "COURT 12"
 *   sub     one line under the title, tailored to the kind of link
 */
export function storePage({ badge = "", sub = "" } = {}) {
  const subtitle =
    sub || "Get the app to record the match, see the score, and keep your record.";

  // Only redirect where there is somewhere real to send people.
  const redirectScript = `
    var ua = navigator.userAgent || '';
    var appStore = ${JSON.stringify(APP_STORE_URL)};
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      if (appStore) window.location.replace(appStore);
    } else if (/Android/.test(ua)) {
      window.location.replace(${JSON.stringify(PLAY_STORE_URL)});
    }
    // Desktop, and iOS before the App Store listing exists, fall through.
  `;

  const appStoreButton = APP_STORE_URL
    ? `<a class="store-btn" href="${APP_STORE_URL}">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <div class="store-btn-text">
          <span class="store-btn-label">Download on the</span>
          <span class="store-btn-name">App Store</span>
        </div>
      </a>`
    : `<div class="store-btn store-btn--soon">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <div class="store-btn-text">
          <span class="store-btn-label">Coming soon to the</span>
          <span class="store-btn-name">App Store</span>
        </div>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Keep Score: Tennis</title>
  <meta name="description" content="A private scorebook for tennis." />
  <link rel="icon" href="/favicon.ico" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800&family=Barlow:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      /* US Open hard court, same palette as the app (constants/theme.ts). */
      --green: #537D45;
      --court-blue: #3F76B0;
      --optic: #E9F75E;
      --cream: #FAF8F2;
      --ink: #1A1A1A;
      --ink-soft: #555;
      --line: rgba(0,0,0,0.08);
    }

    html, body {
      height: 100%;
      background: var(--cream);
      color: var(--ink);
      font-family: 'Barlow', sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: 2rem 1.5rem;
    }

    .court-wrap {
      position: relative;
      width: 140px; height: 140px;
      margin-bottom: 2rem;
      animation: drop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .court-bg {
      width: 140px; height: 140px;
      border-radius: 16px;
      background: var(--green);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 12px 40px rgba(83,125,69,0.35), 0 2px 8px rgba(0,0,0,0.12);
    }

    /* The blue court inside the green surround, exactly as the app draws it. */
    .court-inner {
      width: 76px; height: 104px;
      background: var(--court-blue);
      border: 2px solid #fff;
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .court-inner::before {
      content: '';
      position: absolute; left: 0; right: 0; top: 50%;
      height: 2px; background: #fff; transform: translateY(-50%);
    }
    .ball {
      width: 26px; height: 26px;
      background: var(--optic);
      border-radius: 50%;
      position: relative; z-index: 1;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }

    .code-badge {
      position: absolute;
      bottom: -10px; right: -10px;
      background: var(--optic);
      color: var(--ink);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      padding: 3px 9px;
      border-radius: 6px;
      border: 2px solid var(--ink);
      white-space: nowrap;
    }

    .headline {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800;
      font-size: clamp(2rem, 8vw, 2.8rem);
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      text-align: center;
      animation: fade-up 0.5s 0.1s ease both;
    }
    .headline span { color: var(--green); }

    .sub {
      margin-top: 0.6rem;
      font-size: 1rem;
      color: var(--ink-soft);
      text-align: center;
      max-width: 300px;
      line-height: 1.5;
      animation: fade-up 0.5s 0.2s ease both;
    }

    .divider {
      width: 40px; height: 3px;
      background: var(--green);
      border-radius: 2px;
      margin: 1.75rem 0;
      animation: fade-up 0.5s 0.25s ease both;
    }

    .store-buttons {
      display: flex; flex-direction: column;
      gap: 0.875rem;
      width: 100%; max-width: 300px;
      animation: fade-up 0.5s 0.3s ease both;
    }

    .store-btn {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.875rem 1.25rem;
      border-radius: 12px;
      text-decoration: none;
      border: 1.5px solid var(--line);
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    a.store-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    a.store-btn:active { transform: translateY(0); }
    .store-btn--soon { opacity: 0.55; }
    .store-btn svg { flex-shrink: 0; width: 28px; height: 28px; }

    .store-btn-text { display: flex; flex-direction: column; }
    .store-btn-label {
      font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--ink-soft); font-weight: 500; line-height: 1;
    }
    .store-btn-name {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700; font-size: 1.1rem;
      color: var(--ink); line-height: 1.2;
    }

    @keyframes drop-in {
      from { opacity: 0; transform: translateY(-20px) scale(0.9); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  </style>

  <script>${redirectScript}</script>
</head>
<body>

  <div class="court-wrap">
    <div class="court-bg"><div class="court-inner"><div class="ball"></div></div></div>
    ${badge ? `<div class="code-badge">${badge}</div>` : ""}
  </div>

  <h1 class="headline">Keep Score<br><span>Tennis</span></h1>
  <p class="sub">${subtitle}</p>

  <div class="divider"></div>

  <div class="store-buttons">
    ${appStoreButton}
    <a class="store-btn" href="${PLAY_STORE_URL}">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3.18 23.76c.3.17.64.23.99.17l12.47-7.2-2.79-2.79-10.67 9.82zM1.81 3.26C1.61 3.54 1.5 3.86 1.5 4.22v15.56c0 .36.11.68.31.96l.06.06 8.72-8.72v-.2L1.81 3.26zM20.1 10.37l-2.55-1.47-3.12 3.12 3.12 3.12 2.56-1.48c.73-.42.73-1.1 0-1.52zM4.17.24L16.64 7.44l-2.79 2.79L3.18.41C3.5.22 3.87.19 4.17.24z"/>
      </svg>
      <div class="store-btn-text">
        <span class="store-btn-label">Get it on</span>
        <span class="store-btn-name">Google Play</span>
      </div>
    </a>
  </div>

</body>
</html>`;
}

/** Every function returns the page the same way. */
export function pageResponse(opts) {
  return new Response(storePage(opts), {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
