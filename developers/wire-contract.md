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
is `true` when requests must include credentials. A check that declares nothing
sends `auth: {}`. Help texts are plain text, at most 200 characters, with no
line breaks, and editing tools show them as text only. See
[Signing Editors in](./editors-login).
