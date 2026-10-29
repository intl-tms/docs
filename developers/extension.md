# The Extension

A Chrome extension for editing a website's translations directly on the page.
It is a Host of `@intl-tms/core`: the Core owns the editing logic, and the
Extension owns what only a browser extension can do.

Repository: [intl-tms/extension](https://github.com/intl-tms/extension). How an
Editor uses it is in the [Editor guide](/editors/).

## What your website must do

For the Extension to work, a website must:

- mark its message Catalog with the Core's `markCatalog` when the request
  carries the cookie `tms-edit=1`, and not otherwise;
- serve the Core's request handler, whose `/config` address is the Config URL
  an Editor pastes;
- declare each page's language in `<html lang>`, spelled as (or matching, up
  to case and `_`/`-`) one of the configured locales.

It must never cache a marked response for another visitor, and never treat the
cookie as authorization: anyone can set a cookie. Protection is the handler's
`authorize`, built over a [login for Editors](./editors-login). The Extension
learns how to sign in from the handler's refusal and holds no credential.

When cookies are blocked or the configuration cannot be loaded, the page's
console says why, prefixed `[intl-tms]`.

## Building it

The Core is installed from npm as `@intl-tms/core` and bundled in.

```bash
pnpm install
pnpm build       # dist/ is a loadable extension
pnpm watch       # rebuild on change, static files included
pnpm test        # unit tests: every logic module through its ports, in a simulated DOM, with the real Core
pnpm typecheck   # strict TypeScript; also runs the type-level protocol test
pnpm lint
pnpm test:e2e    # builds dist-e2e/ and runs the real-browser suite (first: pnpm exec playwright install chromium)
```

Load `dist` through `chrome://extensions` → **Developer mode** → **Load
unpacked**.

## Layout

A browser extension is four programs with different lifetimes. Each is a logic
module behind injected ports, a `start.ts` that wires a browser API object to
those ports, and a three-line `main.ts` that passes the real `chrome`.

| Context | Logic | What it does |
| --- | --- | --- |
| Popup | `src/popup/logic.ts`, `view.ts` | Switches edit mode on and off for one Site. Writes settings and asks for a permission; talks to nothing else. |
| Worker | `src/worker/reconcile.ts`, `relay.ts` | Keeps the script registration in step with the Sites that are Listed and Granted; relays messages; opens the panel inside the click. Stopped by the browser when idle, so everything it routes on is persisted. |
| Page Host | `src/page/page-host.ts` | Runs inside an enabled website. The Gate, the Toggle cookie, the configuration, and hosting the Core's editing session. |
| Side Panel | `src/panel/controller.ts`, `view.ts`, `log.ts` | The editing UI: a thin view over the Core's panel store. |
| shared | `src/shared/` | Site helpers, stored value names, the message protocol, the string catalogue: each defined once. |

## Permissions

The Extension starts with access to no website at all. An Editor grants it one
website at a time, when switching edit mode on there. Switching off keeps the
permission; removing the site under **Site access** in `chrome://extensions`
withdraws it.

## Manual check

Three things no automated test can do: answer Chrome's permission prompt, open
the real side panel from a click, and render the popup under the toolbar. After
a change to a bootstrap, the Popup or the manifest, load `dist` and walk the
[Editor guide](/editors/install) once against a website that integrates the
Core. The [demo app](./demo-app) is one.

Every change to what ships bumps `version` in `static/manifest.json`: Chrome
keeps running the old Worker and old pages until it sees a new version.
