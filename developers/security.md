# Security

**Read this before you ship.**

## Not ready for production

::: danger Under development
Intl TMS is under active development and is **not ready for production**.

- **The Core is not an identity provider.** Your website signs Editors in;
  every request is allowed or denied by the `authorize` check you build, and it
  is only as safe as that check and your login.
- **The demo app's sign-in is not authentication.** Its stand-in identity
  provider lets anyone pick any demo account. Its session and checks are real.
- **The API can change between any two releases**, including the request
  handler, the wire contract and the storage adapter interface.
- Several protections are not built yet, among them size limits on request
  bodies and rate limits.

Use it on local and test environments only.
:::

## The Toggle protects nothing

The cookie `tms-edit=1` is a user-interface switch that tells your website to
mark its Catalog. Anyone can set a cookie. Protection lives in `authorize`,
never in the Toggle. Mark pages with `isEditingRequest(request, authorize)`, so
the Toggle marks a page only for a signed-in Editor.

## Editors sign in with a login of their own

Build `authorize` with `sessionCheck` over a login for Editors only, through
your organisation's identity provider. [Signing Editors in](./editors-login)
has the setup and a recipe. In short, with the reasons there:

- **Editors authenticate with your website's session**, carried by its cookie.
  The editing tools hold no credential.
- **The login for Editors is separate from any customer login**: its own
  sign-in address, cookie and session settings. A customer session never
  authorizes editing.
- **A session lasts at most 10 hours**, and the account and its Editor role are
  checked with the identity provider **at least every hour**, so a withdrawn
  Editor loses access within the hour.
- **The endpoints are on the same site as the pages**, because browsers do not
  send a session cookie to another site.
- **A Storybook published on another site** will sign in through a pop-up on
  your login that hands it a short-lived editing token. That is not built yet.

## `authorize` is required and has no default

It receives the request and the operation (`read` for GET, `write` for PUT and
POST). It answers `true` or `{ identity }` to allow, and `"forbidden"` for
someone signed in who may not (`403`). Anything else, including `false` and
`undefined`, is not authenticated (`401`). It is *not* consulted for a CORS
preflight, because a preflight carries no credentials.

A refusal tells the editing tools how to sign in: a `401` carries the sign-in
address and a `403` your help text. Both are fixed when the handler is built and
never depend on the caller.

- **Deny writes to anyone who may not translate.**
- **Gate reads too**, unless your translations and page URLs are public.
- The configuration endpoint publishes every other endpoint by design. Anyone
  who may read it learns where everything is.

## Input validation

All network input is validated and rebuilt before it reaches your adapter: it
never receives an undeclared field, an unlisted Locale, a Read-only Field, a
Select value outside its options, or an object where a string belongs.

Stored usage URLs must be http or https, checked where they enter. Tools that
follow one should check again with `isHttpUrl`.

## Cross-origin access

Off unless configured, by an explicit list of exact origins. There is no
wildcard: building the handler with `*` throws. Cookies and credentials are a
separate explicit choice. Every response to a listed origin names it, errors
included, and every response declares `Vary: Origin`.

## Cross-site request protection for writes

- Every write (PUT and POST) must be sent as `application/json`, which a
  cross-site HTML form cannot do without a preflight.
- A write whose `Origin` is neither the website's own nor listed in your
  cross-origin policy is refused with `403` **before authorization runs**.
- "The website's own" is the origin of the request URL or of your base path, so
  a proxy that rewrites the URL is fine.
- A request with no `Origin` header (a server, a script) is allowed: it carries
  no ambient cookies to abuse. A deployment that must refuse those too can do
  so in `authorize`.
- `Origin: null` is refused.
- Reads are not origin-checked; the cross-origin policy decides who may read
  the answer.

If a browser extension talks to your endpoints from its own origin, list that
origin in `cors.origins`.

The [Storybook addon](./storybook) always does: a Storybook is its own origin.
List it (`http://localhost:6006` in development, and a deployed Storybook's
address if Editors use one), and remember that listing an origin only lets its
requests through to `authorize`. Storybook is not signed in to your website, and
its sign-in is not built yet. Do not loosen `authorize` to make Storybook work.

## On the page

- Text is only ever inserted into the page as text, never as markup.
- The highlighter injects one `<style>` element. It never writes inline styles,
  but a page whose content security policy forbids inline `<style>` elements
  needs `style-src` to allow it for editing sessions.

In Storybook the panel is added to the preview frame in a shadow root, with
its styles in one `<style>` element inside it.

## Caching

Never cache a marked response for another visitor. Marked output is for the
editing session that asked for it.
