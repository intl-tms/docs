# Shared translations

Some texts are meant for many places: **Cancel**, **OK**, **Yes**, **No**. A
**Shared translation** is one you have named as meant for more than one place.
The editing tools then tell the Editor so, before they change it.

Only a Developer can make a translation shared. It follows from the key, and
the key is in your code.

## Declare one

A translation is shared when its **key starts with `shared`**. In a message
file that is a top-level `shared` group:

::: code-group

```json [messages/en.json]
{
  "HomePage": {
    "title": "Hello world!"
  },
  "shared": {
    "cancel": "Cancel",
    "ok": "OK"
  }
}
```

```json [messages/da.json]
{
  "HomePage": {
    "title": "Hej verden!"
  },
  "shared": {
    "cancel": "Annuller",
    "ok": "OK"
  }
}
```

:::

Use it like any other message:

```tsx
import {useTranslations} from 'next-intl';

export function ConfirmButtons() {
  const shared = useTranslations('shared');

  return (
    <>
      <button type="button">{shared('cancel')}</button>
      <button type="button">{shared('ok')}</button>
    </>
  );
}
```

The keys are `shared.cancel` and `shared.ok`. There is nothing to configure and
nothing to register.

::: warning Lowercase
The rule is case-sensitive. A group named `Shared` or `Common`, next to
`HomePage`, is not shared.
:::

### With extracted messages

next-intl's `useExtracted` generates each key from the message text. A key like
`9s3ioP` has no name to go by, so give the hook the namespace:

```tsx
import {useExtracted} from 'next-intl';

export function ConfirmButtons() {
  const shared = useExtracted('shared');

  return (
    <>
      <button type="button">{shared('Cancel')}</button>
      <button type="button">{shared('OK')}</button>
    </>
  );
}
```

The extractor writes those messages under the namespace in `messages/en.json`,
so their keys are `shared.47FYwb` and `shared.kAEQyV`:

```json
{
  "9s3ioP": "Hello world!",
  "shared": {
    "47FYwb": "Cancel",
    "kAEQyV": "OK"
  }
}
```

## What the Editor sees

When an Editor opens a Shared translation, the panel shows a **Shared** badge
below the key, with the notice *This text may appear in more than one place.*
The Extension and the Storybook addon both show it.

That is the only difference. A Shared translation is marked, read and saved
like any other: one stored value per Locale, so a save changes the text
wherever the key is rendered.

The Editor's side of this is [Shared text](/editors/editing#shared-text) in
the Editor guide.

## The rule

| Key | Shared | |
| --- | --- | --- |
| `shared.cancel` | yes | |
| `shared.buttons.ok` | yes | |
| `sharedLinks.home` | yes | The key only has to start with `shared`; no `.` is needed after it. |
| `Shared.cancel` | no | Case-sensitive. |
| `common.cancel` | no | |
| `HomePage.shared.cancel` | no | Only the start of the key counts. |

- **The name is the whole rule.** Where a key is really used is never checked.
  A `shared` key rendered once still gets the badge, and a key outside `shared`
  that is rendered on every page does not. **Used on** in the panel lists the
  pages a key has actually been seen on.
- **The rule is fixed.** `resolveConfig` has no option for it. A configurable
  rule is specified but not built yet.

## Moving a message into `shared`

A message's key is its path, so moving it gives it a new key. Values Editors
saved under the old key stay under the old key: copy them to the new one in
your store if you want to keep them.

## In your own editing tool

`isSharedKey(key)` is the rule and `SHARED_NOTICE` is the notice text. Both are
exported from `@intl-tms/core` and from `@intl-tms/core/tools`. The panel store
applies the rule for you: `createPanelStore().getState().shared` is `true`
while a Shared translation is open.

## Example

The [demo app](./demo-app) has shared **Cancel** and **OK** buttons on the home
page of both apps: `apps/web` with message files, and
`apps/next-intl-extracted` with extracted messages.
