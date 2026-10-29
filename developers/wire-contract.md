# Wire contract

The endpoints `createHandler` serves, relative to the mount point. A key is
only ever the path segment after a prefix, so a key named `config` or `usage`
is still just a key.

| Method | Path | Operation | Answers |
| --- | --- | --- | --- |
| GET | `/config` | read | The resolved configuration, plus `access: { name?, write }` for this caller |
| GET | `/keys/{key}` | read | `{ meta?, locales }`, with only the Locales that have a stored row |
| PUT | `/keys/{key}` | write | One Locale's partial write; `{ ok: true }` |
| POST | `/usage` | write | One page's sightings; `{ ok: true, count }` |
| GET | `/usage/{key}` | read | Where a key is used, most recent first; `[]` when none |

The `/config` address is the **Config URL** an Editor pastes into the Extension.

## Pairing

With `pairing` passed to `createHandler`, three more routes sign a Storybook
in (see [The Storybook addon](./storybook#_5-let-editors-sign-in)). They are
served without asking `authorize` first: each decides for itself.

| Method | Path | Answers |
| --- | --- | --- |
| GET | `/pair?origin=…&challenge=…` | The pop-up page. Someone not signed in is sent (`303`) to your sign-in page and back. Otherwise the page posts `{ type: "intl-tms-pair", code }` to `origin`, or `{ type, refused: "forbidden", help? }` for someone who may not edit, and closes. `origin` must be listed in `cors.origins`; `challenge` is the URL-safe base64 SHA-256 of a secret only the Storybook holds. |
| POST | `/pair/token` | `{ code, proof }` from the origin the code was handed to, within 60 seconds: `{ token, name? }`. The code is used up whatever the outcome; anything wrong answers `400` with code `invalid-request`. |
| POST | `/pair/end` | Ends the token in the `tms-editing-token` header; `204`. |

Storybook sends the token in the `tms-editing-token` header on every other
request. The token begins with `tmset_`, ends 10 hours after the sign-in it
came from, and is judged by your `authorize` like a session.

## Writes and conflicts

A write is `{ locale, value?, fields?, expected? }`.

With `expected` (what the sender loaded for each column it names) the write is
*checked*: a column whose stored value differs from what was expected **and**
from what is being written answers `409 { error: "conflict", current }` and
nothing is written.

Every write must be sent as `application/json`.

## Errors

Every error is `{ error, code }`.

| Status | Meaning |
| --- | --- |
| `400` | Invalid body or path |
| `401` | Not authenticated. The body adds `auth`: how to sign in. |
| `403` | Not permitted (code `forbidden`, with your `help` text if you declared one), or origin not allowed (code `forbidden-origin`) |
| `404` | No such route |
| `405` | Wrong method (with `Allow`) |
| `409` | Write conflict |
| `415` | Write not sent as JSON |
| `500` | Fixed generic body |

The real cause of a 500 goes to your `onError` hook, never to the response.

## Refusals

```json
{ "error": "unauthorized", "code": "unauthorized", "auth": { "session": { "signIn": "https://example.com/editors/sign-in" }, "help": "Sign in with your company account." } }
{ "error": "forbidden", "code": "forbidden", "help": "Ask IT for the Editor role." }
```

`auth.session.signIn` is where an Editor signs in; `auth.session.credentials`
is `true` when requests must include credentials. `auth.pair.address` is
present when the handler offers [pairing](#pairing): the address of `/pair`.
A check that declares nothing
sends `auth: {}`. Help texts are plain text, at most 200 characters, with no
line breaks, and editing tools show them as text only. See
[Signing Editors in](./editors-login).
