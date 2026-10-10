# Security

**Read this before you ship.**

## The Toggle protects nothing

The cookie `tms-edit=1` is a user-interface switch that tells your website to
mark its Catalog. Anyone can set a cookie. Protection lives in `authorize`,
never in the Toggle.

## `authorize` is required and has no default

It receives the request and the operation (`read` for GET, `write` for PUT and
POST) and must answer `true` to allow. Anything else, including `undefined`,
denies. It is *not* consulted for a CORS preflight, because a preflight carries
no credentials.

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

## On the page

- Text is only ever inserted into the page as text, never as markup.
- The highlighter injects one `<style>` element. It never writes inline styles,
  but a page whose content security policy forbids inline `<style>` elements
  needs `style-src` to allow it for editing sessions.

## Caching

Never cache a marked response for another visitor. Marked output is for the
editing session that asked for it.
