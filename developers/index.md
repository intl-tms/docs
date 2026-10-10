# How it works

Intl TMS is an in-context translation management system. A website renders
translated text; Intl TMS makes every rendered string carry an invisible
identifier of the translation key it came from. An editing tool running on the
page decodes those identifiers, lets an Editor Alt-click any text, edit it in
every Locale, and save it. The website stores the change through a storage
adapter **you** write.

## What Intl TMS does not do

Intl TMS is not an internationalization library and does not replace one. It
never loads a message file, chooses a locale, formats a plural or a date, or
routes between languages. Your i18n library keeps doing all of that, and your
components keep calling it the way they do today.

Intl TMS sits between your message files and that library, and touches them at
exactly one point: just before the messages are handed over, it adds the
invisible identifiers. Everything else it does happens beside your website, in
the editing tool and in the endpoints that save a change.

```
messages/*.json ──► Intl TMS marks them ──► your i18n library ──► the page
                    (editing sessions only)   (unchanged)
```

Take Intl TMS out and the website renders exactly as before. Take the i18n
library out and there is nothing left to edit.

These docs use [next-intl](https://next-intl.dev) as the i18n library, because
the guide and the demo app are Next.js websites. The Core itself has no
next-intl code in it and works with any library that takes a tree of message
strings.

## The pieces

| Piece | What it is | Repository |
| --- | --- | --- |
| **Core** (`@intl-tms/core`) | The library-agnostic package on both sides of the seam between a website and its editing tools: marker codec, Catalog marking, request handler, page-side editing flow and panel state machine. No storage or i18n-library code. | [intl-tms/core](https://github.com/intl-tms/core) |
| **Extension** | A Chrome extension that hosts the Core's editing session: outlines, Alt-click, and a side panel. | [intl-tms/extension](https://github.com/intl-tms/extension) |
| **Storybook addon** (`@intl-tms/core/storybook`) | The same editing session inside Storybook, configured in your preview file. No extension needed. Ships in the Core. | [intl-tms/core](https://github.com/intl-tms/core) |
| **Demo app** | A Next.js app using next-intl with the Core integrated. Clone it to try everything locally. | [intl-tms/demo-app](https://github.com/intl-tms/demo-app) |

## The flow

1. An Editor switches edit mode on for your website. That sets the **Toggle**
   cookie `tms-edit=1`.
2. Your website sees the cookie and passes its message Catalog through
   `markCatalog` before handing it to the i18n library. Every string now ends
   with an invisible marker naming its key.
3. The editing tool scans the page, decodes the markers and outlines the text.
4. The Editor Alt-clicks a text. The tool reads every Locale's value from the
   endpoints your website serves with `createHandler`.
5. The Editor saves. The handler validates the write, asks your `authorize`
   function, and calls your storage adapter.

In Storybook the first two steps are a toolbar switch and one function call in
your preview file instead of a cookie; the rest is the same. See
[The Storybook addon](./storybook).

## Principles

- **Call sites never change.** Marking happens once, on the assembled message
  Catalog, before your i18n library sees it.
- **No runtime dependencies.** Web-standard APIs only; no platform module is
  imported anywhere.
- **You own storage and authorization.** The Core defines the seam and never
  crosses it. Neither has a default.
- **Off means off.** With editing switched off your output is byte-for-byte
  what it would be without the Core.

## Next

- [Getting started](./getting-started): add the Core to a Next.js website, file
  by file.
- [Storage adapter](./storage-adapter): the four functions you write to keep
  what Editors save.
- [Try the demo app](./demo-app): see a working integration first.
- [The Storybook addon](./storybook): edit translations on your stories.
- [Security](./security): read this before you ship.
