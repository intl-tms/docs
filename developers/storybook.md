# The Storybook addon

Edit translations in Storybook, on the rendered story, with no browser
extension. The addon ships in the Core as `@intl-tms/core/storybook` and is
configured in code, in your preview file.

It is a Host of the Core, like [the Extension](./extension): the Core owns the
editing logic, and the addon owns what only a workbench knows. Switching edit
mode on is a toolbar button instead of a cookie, and the panel is docked inside
the preview instead of in a browser side panel.

It imports nothing from Storybook, so it works with every renderer (React, Vue,
Svelte, web components, HTML) and adds no dependency.

## What you need

- A website that already [serves the endpoints](./getting-started#_8-serve-the-endpoints).
  Storybook edits through the same handler and the same storage adapter.
- Storybook 8.2 or newer, for `initialGlobals`. The addon is tested against
  Storybook 10.
- Stories that render through your i18n library, so the text comes from a
  message Catalog.

## 1. Create the addon

In `.storybook/preview.ts` (or `.tsx`):

```ts
import { createStorybookAddon } from "@intl-tms/core/storybook";

const tms = createStorybookAddon({
  config: "https://app.example.com/api/tms/config",
});
```

`config` is the address of your handler's `/config` endpoint, used exactly as
written. If your preview can import the configuration itself, pass the object
`resolveConfig` returned instead and nothing is fetched.

## 2. Add it to the preview

Three things go into the preview: the toolbar switch, its starting position,
and the decorator.

```tsx
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  globalTypes: {
    locale: { toolbar: { title: "Locale", icon: "globe", items: ["en", "da"] } },
    ...tms.globalTypes,
  },
  initialGlobals: { locale: "en", ...tms.initialGlobals },
  decorators: [/* your i18n decorator, see step 3 */ tms.decorator],
};

export default preview;
```

`tms.decorator` renders nothing and returns the story untouched. While edit
mode is on it keeps the editing session and the panel running in the preview.
Its position among your decorators does not matter.

## 3. Mark the messages

This is the one step that depends on your i18n library: wherever your preview
hands messages to it, pass them through `tms.mark`.

```tsx
import { NextIntlClientProvider } from "next-intl";
import en from "../messages/en.json";
import da from "../messages/da.json";

const messages = { en, da };

const withMessages = (Story, context) => {
  const locale = context.globals.locale;
  return (
    <NextIntlClientProvider locale={locale} messages={tms.mark(messages[locale], context)}>
      <Story />
    </NextIntlClientProvider>
  );
};
```

`tms.mark(catalog, context)` returns the very same object while edit mode is
off, and the marked Catalog while it is on. Pass it the Catalog of the Locale
the story is rendered in. It takes the same options as `markCatalog`, so a
custom `separator` goes in the third argument.

## 4. Allow Storybook's origin

Storybook runs on its own origin, so the website must list it in the handler's
cross-origin policy. Without it writes are refused with `403` and the browser
blocks the answers to reads.

```ts
export const handler = createHandler({
  config,
  adapter,
  authorize,
  cors: { origins: ["http://localhost:6006"] },
});
```

List a deployed Storybook's origin the same way. There is no wildcard.

`authorize` still decides who may read and write. Storybook is not signed in
to your website, so give the addon whatever your check looks at:

```ts
const tms = createStorybookAddon({
  config: "https://app.example.com/api/tms/config",
  // A header your authorize function checks:
  request: (url, init) => fetch(url, { ...init, headers: { ...init?.headers, "x-editor-token": token } }),
  // Or the website's own session cookie. The website must then also set
  // cors.credentials, and the cookie must be allowed cross-site.
  // credentials: "include",
});
```

See [Security](./security) before exposing the endpoints to another origin.

## Edit something

1. Start your website and Storybook.
2. In Storybook's toolbar, click **Edit translations: off** and choose **Edit
   translations: on**. Every translated text gets an outline and the panel
   appears at the edge of the preview.
3. Hold **Alt** (Option on a Mac) and click an outlined text.
4. Edit any Locale in the panel and click **Save all**.

Text that lives in an attribute (`aria-label`, `alt`, `title`, `placeholder`)
has nothing to click. It is listed under **Hidden translations** in the panel:
point at a row to flash the element, click it to edit.

## Diagnostics

The panel ends with a collapsed **Diagnostics** pane, the same one the
Extension's panel has. It logs what each step actually did:

| Entry | Logged when |
| --- | --- |
| `config` | The configuration arrives: its Locales, Source Locale and whether it has a Schema. `FAILED`, with the address and the reason, when it could not be loaded. |
| `open` | A translation is opened: its key and Locale, with the text on the story. Also when the story's Locale is not a configured one. |
| `values` | The stored values arrive: which Locales have a row, or `READ FAILED`. |
| `save` | A save is sent (`PUT <key>` with exactly what was sent), and how it ended: `saved`, `refused: changed elsewhere`, `FAILED` or `THREW`, with the answer. |
| `why` | A failed save, explained in words: the status and the website's reason for each Locale. |

The pane opens by itself when something fails and stays collapsed otherwise.
**Copy** puts the whole log on the clipboard, for a bug report; **Clear**
empties it. The log keeps the newest 200 entries and is gone when Storybook
reloads.

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `config` | required | The configuration endpoint's address, or a resolved configuration object. |
| `request` | `fetch` | How every request is made, the configuration fetch included. |
| `credentials` | unset | `"include"` sends the website's cookies from Storybook's origin. |
| `locale` | see below | `(context) => string`: the Locale a story is rendered in. |
| `editing` | `false` | Start with edit mode switched on. |
| `placement` | `"right"` | The edge the panel is docked to: `"right"`, `"left"` or `"bottom"`. |
| `onSaved` | none | Called with `{ key, writes, outcome }` after every save that got an answer. |
| `timeoutMs` | `10000` | The time limit of every request. |

What `createStorybookAddon` returns:

| Member | Use |
| --- | --- |
| `decorator` | Add to `decorators`. |
| `globalTypes` | Spread into `globalTypes`: the toolbar switch. |
| `initialGlobals` | Spread into `initialGlobals`: the switch's starting position. |
| `mark(catalog, context, options?)` | Marks a Catalog while edit mode is on. |
| `isEditing(context)` | Whether edit mode is on for the story being rendered. |
| `stop()` | Removes the panel and every outline from the preview. |

### The Locale of a story

The panel needs to know which Locale a story shows, to mark that row and to
write a saved value back into the story. It asks, in order:

1. your `locale` function, if you gave one;
2. the Storybook global named `locale`;
3. `<html lang>` of the preview;
4. the Source Locale of the configuration.

The answer is matched to the configured Locales up to case and `_`/`-`, as
everywhere else.

## Things to know

### A story shows what the store holds

A story is rendered from the messages your preview imported, and those do not
change because an Editor saved a row, on the website or in Storybook. Without
help a story would show the bundled text while the panel shows the stored one.

So while edit mode is on, the addon reads the stored values of every key a
story shows and puts them in front of you:

- a value that differs from the rendered text is written into the story as
  soon as it arrives, so the bundled text may be visible for a moment first;
- `tms.mark` lays the stored values over the Catalog, so later renders (another
  Locale, a changed arg, another story with the same key) use them from the
  start;
- what you save from Storybook is kept the same way.

This costs one request per key: the wire contract has no bulk read yet. Each
key is read once per editing session, six at a time, and the answer covers
every Locale. Values changed by someone else after that show up when you
switch edit mode off and on, or reload.

A message that needs the formatter (an ICU argument, a plural, rich text tags)
cannot be replaced in place, because only your i18n library can render it.
That goes for a stored message and for a bundled one. The story keeps what it
rendered until its next render, which gets the stored message through
`tms.mark`. After a save of such a message the panel says so.

Stored values are only shown while edit mode is on. Use `onSaved` if your
preview keeps messages somewhere of its own.

### Off means off

With the switch off, `tms.mark` returns the same Catalog object it was given
and the decorator creates nothing: no request, no element, no stylesheet, and
no stored value is shown. Your
stories, visual tests and snapshots are what they were without the addon.

With it on, [what marking does to strings](./marking) applies to stories too:
a marked string is longer than its visible text and not equal to its unmarked
form. Leave the switch off (the default) wherever stories are tested.

### Usage is not reported

The Extension reports which page each key was seen on. The addon does not: a
story's address is not a page of your website. **Used on** in the panel still
lists the website's pages, and opens one in a new tab.

### The panel is in the preview

The panel is rendered inside the preview frame, in a shadow root, so story
styles and panel styles cannot reach each other. It works in docs mode as well.
**Hide** in its header reduces it to a tab in the corner when it covers what
you are looking at; clicking a text opens it again.

It is not a tab in Storybook's addon panel. That would need Storybook's manager
API and React as dependencies; the reasoning is in
[Design decisions](./decisions#storybook-addon).

### No server at all

For a Storybook that should be editable without a running website (a spike, a
workshop), call a handler directly. Nothing leaves the browser tab, and
nothing is kept after a reload.

```ts
import { createHandler, createMemoryAdapter, resolveConfig } from "@intl-tms/core";
import { createStorybookAddon } from "@intl-tms/core/storybook";

const config = resolveConfig({ locales: ["en", "da"], basePath: "https://tms.invalid/api", sourceLocale: "en" });
const handler = createHandler({ config, adapter: createMemoryAdapter(), authorize: () => true });

const tms = createStorybookAddon({ config, request: (url, init) => handler(new Request(url, init)) });
```

## Troubleshooting

| What you see | Why |
| --- | --- |
| No outlines with the switch on | The messages are not marked. Check that the story's messages go through `tms.mark` and that `tms.decorator` is in `decorators`. |
| "The editing configuration could not be loaded" in the panel | The address did not answer with a configuration. The reason follows the colon, and is also under [Diagnostics](#diagnostics) and in the console, prefixed `[intl-tms]`. A blocked cross-origin request shows up here: see [step 4](#_4-allow-storybook-s-origin). |
| A row is missing for a Locale | The panel shows the Locales of the configuration. Check `locales` in `resolveConfig`. |
| Saving shows `✗` and the console reports a blocked cross-origin request | Storybook's origin is not in `cors.origins`. The website answers `403`, and the browser keeps the answer from the addon. |
| Saving shows `✗ (401)` | `authorize` refused. Give the addon a `request` that carries what it checks. |
| Saving fails and the status line does not say why | Open **Diagnostics** in the panel: the `why` entry has the status and the website's reason for each Locale. |
| The wrong row is marked "shown now" | The addon could not tell the story's Locale. Pass a `locale` function. |
| Typing a letter in the panel triggers a Storybook shortcut | It should not: key events are stopped at the panel. Check that nothing else re-dispatches them. |

| The story shows the bundled text although the panel shows a newer one | The message needs the formatter, so it is only replaced on the story's next render: change the Locale and back, or an arg. If it is plain text, look for a failed read in the browser's network tab. |

## Example

The [demo app](./demo-app#storybook) has a Storybook with the addon set up,
in `apps/web/.storybook/`.
