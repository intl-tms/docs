# What marking does to your strings

These are properties of the approach, not defects. They only apply during an
editing session; with the Toggle off, nothing is marked.

- A marked string is **longer** than its visible text; length checks,
  truncation and `maxlength` see the marker.
- A marked string is **not equal** to its unmarked form: string comparison,
  `switch` on translated text and snapshot tests will differ.
- Marked text must never reach **emails, logs, analytics, search indexes,
  structured data or the document head**. `strip(text)` removes every marker.
- An accessible name built from a marked attribute contains the marker
  characters. Editing sessions are not production sessions, which is what the
  Toggle is for.
- Empty strings are marked too, so a missing translation is something an Editor
  can find and fill.
- Marking is memoised by Catalog object: treat a Catalog you have passed to
  `markCatalog` as immutable.

## Keys

A key is the path through the Catalog, joined by `.`. A segment that itself
contains the separator or a backslash is escaped with a backslash, so the flat
key `a.b` marks as `a\.b` and the nested path `a` → `b` marks as `a.b`.
`markCatalog` takes an optional `separator` if your store uses flat dotted keys.

Only plain objects are walked. Class instances, dates and maps are carried
through untouched.

A key that starts with `shared` is a
[Shared translation](./shared-translations).

## The marker format

A marker is `U+2063 · version · key bytes · CRC-8 · U+2064`, each byte as two
variation-selector characters (`U+FE00`–`U+FE0F`): two invisible characters per
key byte plus a small constant.

A damaged marker decodes to nothing rather than to a wrong key.

## Text with tags or placeholders

A message with tags (such as `<b>…</b>`) or placeholders cannot be updated on
the page in place: the website has to render it again. Editing tools reload the
page after saving one. The Core's classification helpers (`hasTags`, `isPlain`,
`tagMismatch`) tell the two kinds apart.
