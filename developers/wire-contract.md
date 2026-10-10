# Wire contract

The endpoints `createHandler` serves, relative to the mount point. A key is
only ever the path segment after a prefix, so a key named `config` or `usage`
is still just a key.

| Method | Path | Operation | Answers |
| --- | --- | --- | --- |
| GET | `/config` | read | The resolved configuration |
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
| `401` | Authorization denied |
| `403` | Origin not allowed |
| `404` | No such route |
| `405` | Wrong method (with `Allow`) |
| `409` | Write conflict |
| `415` | Write not sent as JSON |
| `500` | Fixed generic body |

The real cause of a 500 goes to your `onError` hook, never to the response.
