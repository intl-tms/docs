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

`authorize` still decides who may read and write. Storybook signs Editors in
through a pop-up on your website's login: see the next step. Never put a key
or token in a Storybook's source: a published Storybook is public.

See [Security](./security) before exposing the endpoints to another origin.

## 5. Let Editors sign in

A Storybook is usually published on another site than your website (a
hosting service, a preview address), where your Editors' session cookie does
not travel. So Storybook never uses the cookie, also on `localhost`. Instead
it **pairs**:

1. The panel shows **Sign in**. It opens a pop-up on your website.
2. The pop-up uses your [login for Editors](./editors-login). Someone who is
   not signed in is sent to your sign-in page and back. Someone signed in
   without the Editor role is told so, with your help text.
3. For a permitted Editor, the pop-up hands Storybook a one-time code and
   closes. Storybook exchanges the code, together with a secret only it holds,
   for a short-lived **editing token**.
4. Storybook sends the token with every request to your website, and keeps it
   in that browser tab only: a reload keeps it, closing the tab forgets it.

The token lives as long as a session: it ends 10 hours after the sign-in it
came from, and the account and role are checked with your identity provider
again every hour. Your `authorize` judges a token's user exactly as a
session's, so the Editor role and your editing switch apply to both.

### On the website

```ts
import { createHandler, createPairing, sessionCheck } from "@intl-tms/core";

export const pairing = createPairing({
  // Where the records live: your database. Only digests of codes and tokens are kept.
  store: pairingStore,
  // Your sign-in page, with a way back to the pop-up afterwards.
  signIn: (returnTo) => `/editors/sign-in?return=${encodeURIComponent(returnTo)}`,
  // Who is signed in to the login for Editors on this request.
  session: (request) => editorSessions.forPairing(request),
  // The re-check your sessions use.
  recheck: (user, grant) => identityProvider.recheck(user, grant),
});

export const authorize = sessionCheck({
  // An editing token first, then the Editors' session.
  user: async (request) => (await pairing.user(request)) ?? editorSessions.user(request),
  may: (user) => editingIsOn() && user.roles.includes("Editor"),
  signIn: "/editors/sign-in",
});

export const handler = createHandler({
  config,
  adapter,
  authorize,
  pairing,
  cors: { origins: ["http://localhost:6006", "https://storybook.example.com"] },
});
```

| Option of `createPairing` | Meaning |
| --- | --- |
| `store` | `save`, `find(digest)`, `update`, `delete(digest)` (answering whether the record was there) and `deleteAllOf(id)`, over a table in your database. `createMemoryPairingStore()` is for tests and demos only. A record past its `endsAt` may be deleted at any time. |
| `signIn` | `(returnTo) => address`: your sign-in page, which sends the Editor to `returnTo`, a path on your website, afterwards. Accept only a path there, never another site. |
| `session` | `(request) => { user, grant, signedInAt, checkedAt? }` or nothing: the Editors' session on the pop-up's request. `grant` is what your identity provider needs to check the user again (for Microsoft, the refresh token). |
| `recheck` | `(user, grant) => { active: false }` or `{ active: true, user, grant }`: the user as they are now, for your check to judge. |
| `lifetimeMs`, `recheckEveryMs` | 10 hours and one hour unless you choose otherwise. |

- **List every Storybook origin in `cors.origins`.** The pop-up hands a code
  to no other origin, so another website cannot open it and collect a
  sign-in for an Editor who is signed in. Building the handler with pairing
  and no listed origin throws.
- **Signing out on the website ends the Editor's Storybook sign-ins** when
  your sign-out calls `pairing.endAllOf(user.id)`. Call it in your emergency
  stop too.
- **The pop-up is served by the handler**, at `{basePath}/pair`, with its own
  content security policy. If your website adds a stricter policy to every
  response, or serves pages with `Cross-Origin-Opener-Policy: same-origin`,
  exempt that address: otherwise the pop-up cannot hand the code back.
- **A published Storybook may be public.** Without a token it cannot read
  stored values or save; it shows outlines and the panel, and **Sign in**.

### The sign-in area, your way

The panel's sign-in area shows the addon's own line. To use your own words
and looks, pass `signInView`: a function given an empty element and the
sign-in's state and actions, returning a function that cleans up. In React:

```tsx
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { SignInControls, SignInView } from "@intl-tms/core/storybook";

function SignIn({ controls }: { controls: SignInControls }) {
  const [state, setState] = useState(controls.state);
  useEffect(() => controls.onChange(setState), [controls]);
  if (state.status === "signed-in") {
    return <button onClick={controls.signOut}>Sign out {state.name}</button>;
  }
  return (
    <>
      {state.help && <p>{state.help}</p>}
      <button onClick={controls.signIn}>Sign in with your company account</button>
    </>
  );
}

export const signInView: SignInView = (element, controls) => {
  const root = createRoot(element);
  root.render(<SignIn controls={controls} />);
  return () => root.unmount();
};

const tms = createStorybookAddon({ config: "https://app.example.com/api/tms/config", signInView });
```

- **Call `signIn()` directly in the click handler**, before anything is
  awaited, or the browser blocks the pop-up. When it is blocked, the state
  says `popup-blocked`, so you can say so.
- **The states** are `signed-out`, `signing-in`, `popup-blocked`,
  `not-permitted`, `expired` (the website no longer accepts the sign-in) and
  `signed-in`. A state carries the Editor's `name` and the website's `help`
  text when there are any. Both come from the website: show them as text,
  which React does unless told otherwise.
- **The view never receives the token, the code or the secret.** The actions
  do the signing in; the view only shows the state and calls them.
- **A view that throws** is removed and the addon's own line takes its place,
  with the error in [Diagnostics](#diagnostics). Signing in keeps working.
- The area is inside the panel's shadow root, where your page's stylesheets do
  not reach: style it inline, or render a `<style>` element with it.

The demo app's Storybook has a working view in
`apps/web/.storybook/sign-in-view.tsx`.

::: details Doing the authentication yourself
The `request` option can attach any header to every request, so a Developer
can sign Storybook in some other way. Then you own every step this section
describes, including where a credential is kept and how it ends. It is an
escape hatch, not a supported way to sign in.
:::

## Edit something

1. Start your website and Storybook.
2. In Storybook's toolbar, click **Edit translations: off** and choose **Edit
   translations: on**. Every translated text gets an outline and the panel
   appears at the edge of the preview.
3. If the panel says to sign in, press **Sign in** and sign in in the pop-up.
   The pop-up closes by itself.
4. Hold **Alt** (Option on a Mac) and click an outlined text.
5. Edit any Locale in the panel and click **Save all**.

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
| `request` | `fetch` | How every request is made, the configuration fetch included. The editing token is added to what it is given, for requests to the website only. |
| `signInView` | the addon's line | `(element, controls) => cleanup`: draws the panel's sign-in area. See [the sign-in area](#the-sign-in-area-your-way). |
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
| The panel shows no **Sign in**, and "could not be loaded … status 401" | The website does not offer Storybook's sign-in: pass `pairing` to `createHandler` (see [step 5](#_5-let-editors-sign-in)). |
| Saving shows `✗ (401)` and the panel says the sign-in has ended | The editing token ended: 10 hours passed, the account was disabled, or the Editor was signed out. What was typed is kept: sign in again and save. |
| The panel says the browser blocked the sign-in pop-up | Allow pop-ups for the Storybook's address. A custom sign-in view must call `signIn()` directly in the click handler. |
| The pop-up says "This sign-in was not asked for by a workbench this website knows" | The Storybook's origin is not in `cors.origins`, or is written differently (scheme, port). |
| The pop-up says it "cannot reach the workbench" | The pop-up lost its link to Storybook, usually because of a `Cross-Origin-Opener-Policy` header on the website's pages. Exempt `{basePath}/pair` and the sign-in pages from it. |
| Saving fails and the status line does not say why | Open **Diagnostics** in the panel: the `why` entry has the status and the website's reason for each Locale. |
| The wrong row is marked "shown now" | The addon could not tell the story's Locale. Pass a `locale` function. |
| Typing a letter in the panel triggers a Storybook shortcut | It should not: key events are stopped at the panel. Check that nothing else re-dispatches them. |

| The story shows the bundled text although the panel shows a newer one | The message needs the formatter, so it is only replaced on the story's next render: change the Locale and back, or an arg. If it is plain text, look for a failed read in the browser's network tab. |

## Example

The [demo app](./demo-app#storybook) has a Storybook with the addon set up,
in `apps/web/.storybook/`.
