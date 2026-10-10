# Getting started with Next.js

This guide adds Intl TMS to a Next.js App Router website that renders its text
with [next-intl](https://next-intl.dev). It starts from an empty app and ends
with a page where you can Alt-click a text and edit it.

::: info next-intl does the internationalization
Intl TMS is not an i18n library. In this guide
[next-intl](https://next-intl.dev) loads the messages, resolves the locale and
formats every text, and your components only ever call next-intl. Intl TMS is
a layer on top that lets an Editor change those messages on the page and save
them. Of the files below, three belong to Intl TMS; the rest are next-intl's
own setup.
:::

It is the smallest setup that works: two locales, one page, and edits kept in
memory. Where edits are stored for real is yours to decide and to build; the
last section says what that takes.

::: tip Prefer to read a finished integration?
The [demo app](./demo-app) is a complete Next.js and next-intl website you can
clone and run.
:::

## What you will build

Every file the guide creates or changes, and the step that does it:

```
my-app
├── messages
│   ├── en.json                      (step 2)
│   └── da.json                      (step 2)
├── next.config.ts                   (step 3)
└── src
    ├── app
    │   ├── api
    │   │   └── tms
    │   │       └── [...path]
    │   │           └── route.ts     (step 8)
    │   ├── layout.tsx               (step 7)
    │   └── page.tsx                 (step 7)
    ├── i18n
    │   └── request.ts               (step 6)
    └── tms
        ├── config.ts                (step 4)
        └── messages.ts              (step 5)
```

Steps 2, 3, 6 and 7 are a plain next-intl setup, taken from next-intl's own
[App Router guide](https://next-intl.dev/docs/getting-started/app-router). Read
that guide for what those files mean and what else next-intl can do. If your
website already uses next-intl, you only need the three files that are new: `src/tms/config.ts`,
`src/tms/messages.ts` and the `route.ts`, plus one changed line in
`src/i18n/request.ts`.

## Prerequisites

- Node.js 20.9 or newer.
- Chrome, for the Extension you edit with in the last step.

## 1. Create the app and install the packages

`@intl-tms/core` is not published to a registry yet, so you build it from
source and install the packed file. Run this in an empty folder:

```bash
git clone https://github.com/intl-tms/core.git
cd core
npm install
npm run build
npm pack
cd ..
```

`npm pack` writes `core/intl-tms-core-0.1.0.tgz`. Now create the app next to
the `core` folder and install both packages:

```bash
npx create-next-app@latest my-app --typescript --app --src-dir --import-alias "@/*"
cd my-app
npm install next-intl ../core/intl-tms-core-0.1.0.tgz
```

The rest of the guide assumes those three choices: the App Router, a `src`
directory, and the `@/*` import alias.

## 2. Add the messages

One JSON file per locale, in a `messages` folder at the root of the app.

::: code-group

```json [messages/en.json]
{
  "HomePage": {
    "title": "Hello world!",
    "description": "Every text on this page can be edited in place."
  }
}
```

```json [messages/da.json]
{
  "HomePage": {
    "title": "Hej verden!",
    "description": "Al tekst på denne side kan redigeres direkte."
  }
}
```

:::

The path to a message is its **key**: the title above is `HomePage.title`.

## 3. Add the next-intl plugin

Wrap the Next.js configuration with next-intl's plugin, and keep whatever
options `create-next-app` generated.

::: code-group

```ts [next.config.ts]
import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* the options create-next-app generated stay here */
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

:::

## 4. Describe your setup

Create a `src/tms` folder. Its first file tells Intl TMS which locales exist and
where its endpoints are served.

::: code-group

```ts [src/tms/config.ts]
import {resolveConfig} from '@intl-tms/core';

// A deployment-level switch. With it off, no cookie is read, nothing is
// marked and the endpoints deny every request.
export const editingEnabled =
  process.env.NODE_ENV === 'development' || process.env.TMS_EDITING === '1';

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

export const config = resolveConfig({
  locales: ['en', 'da'],
  sourceLocale: 'en',
  basePath: `${siteUrl}/api/tms`
});
```

:::

`basePath` must be an absolute URL, because the editing tools call it from the
browser. A mistake here throws when the server starts and names the value.
Every option is listed in [Configuration](./configuration).

## 5. Mark the messages

Marking adds an invisible identifier to every string, naming the key it came
from. It only happens in an **editing session**: a request that carries the
cookie `tms-edit=1`, which the Extension sets when an Editor switches edit mode
on.

::: code-group

```ts [src/tms/messages.ts]
import {cookies} from 'next/headers';
import {
  markCatalog,
  TOGGLE_COOKIE_NAME,
  TOGGLE_ON_VALUE,
  type Catalog
} from '@intl-tms/core';
import {editingEnabled} from './config';

async function isEditingSession() {
  if (!editingEnabled) return false;
  return (await cookies()).get(TOGGLE_COOKIE_NAME)?.value === TOGGLE_ON_VALUE;
}

export async function prepareMessages<T extends Catalog>(messages: T) {
  return (await isEditingSession()) ? markCatalog(messages) : messages;
}
```

:::

Every other visitor gets the messages untouched, so the page they see is
byte-for-byte what it was before.

## 6. Hand the messages to next-intl

This is next-intl's request configuration with one difference: the messages go
through `prepareMessages` on the way out.

::: code-group

```ts [src/i18n/request.ts]
import {getRequestConfig} from 'next-intl/server';
import {prepareMessages} from '@/tms/messages';

export default getRequestConfig(async () => {
  const locale = 'en';
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages: await prepareMessages(messages) // [!code highlight]
  };
});
```

:::

The locale is fixed to `en` to keep the setup small. See
[With locale-based routing](#with-locale-based-routing) for a website that has
a `[locale]` segment.

## 7. Render a page

Replace the generated layout and page.

::: code-group

```tsx [src/app/layout.tsx]
import {Suspense} from 'react';
import {NextIntlClientProvider} from 'next-intl';

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
```

```tsx [src/app/page.tsx]
import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
```

:::

Two details matter to Intl TMS:

- **`<html lang>`** is how the editing tools know which locale the page is in.
  It must be one of the locales in `src/tms/config.ts`.
- **`<Suspense>`** is needed because the messages depend on a cookie during an
  editing session. With `cacheComponents` on, which `create-next-app` enables,
  Next.js refuses to read a cookie outside a Suspense boundary.

The page component itself does not change. Call sites never know about
marking.

## 8. Serve the endpoints

The editing tools read and save through endpoints your website serves. The
handler is one function from a `Request` to a `Response`, mounted on a
catch-all route at the path of `basePath`.

::: code-group

```ts [src/app/api/tms/[...path]/route.ts]
import {createHandler, createMemoryAdapter} from '@intl-tms/core';
import {config, editingEnabled} from '@/tms/config';

const handler = createHandler({
  config,
  adapter: createMemoryAdapter(),
  authorize: () => editingEnabled
});

export const GET = handler;
export const PUT = handler;
export const POST = handler;
```

:::

::: warning This authorization is for your own machine
`authorize` decides who may read and save. Here it allows everyone while
editing is enabled, which is only acceptable on `localhost`. Replace it with a
real check, such as a signed-in session with a translator role, before you
deploy. The cookie protects nothing: anyone can set one. See
[Security](./security).
:::

## 9. Check that it works

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`. The page shows "Hello world!", exactly as it
would without Intl TMS.

Then ask the handler for its configuration:

```bash
curl http://localhost:3000/api/tms/config
```

```json
{
  "protocol": 1,
  "capabilities": ["usage", "conflicts"],
  "locales": ["en", "da"],
  "endpoints": {
    "values": "http://localhost:3000/api/tms/keys/{key}",
    "usageReport": "http://localhost:3000/api/tms/usage",
    "usageRead": "http://localhost:3000/api/tms/usage/{key}"
  },
  "basePath": "http://localhost:3000/api/tms",
  "sourceLocale": "en"
}
```

That address, `http://localhost:3000/api/tms/config`, is your **Config URL**.

## 10. Edit a text

1. Build and load the Extension. It links the Core from the `core` folder you
   cloned in step 1, so clone it next to that folder:

   ```bash
   cd ..
   git clone https://github.com/intl-tms/extension.git
   cd extension
   pnpm install
   pnpm build
   ```

   Open `chrome://extensions`, switch on **Developer mode**, choose **Load
   unpacked** and pick the `extension/dist` folder.

2. On `http://localhost:3000`, click the **Intl TMS** icon and paste the
   Config URL.
3. Click **On** and allow access when Chrome asks. The page reloads and both
   texts get an outline.
4. Hold **Alt** and click the title. Change it and click **Save all**.

The save went through your handler into the memory adapter. A reload brings
back "Hello world!", because the memory adapter forgets everything when the
server restarts and nothing reads the saved value back into the page yet.
Both are your part of the integration: see [Storage is yours](#storage-is-yours).

## If something does not work

| What you see | Why |
| --- | --- |
| No outlines after switching on | The page is not marked. Check that `src/i18n/request.ts` calls `prepareMessages`, and that the `tms-edit` cookie is set for `localhost` in Chrome's developer tools. |
| The panel cannot load or save | The app is not running on port 3000. `basePath` is built from `SITE_URL`, so start the app with `SITE_URL=http://localhost:3001 npm run dev`, or whichever port it uses. |
| `Next.js encountered uncached data during prerendering` | The `<Suspense>` boundary in `src/app/layout.tsx` is missing. |
| `ConfigError` when the server starts | A value in `src/tms/config.ts` is wrong. The message names it. |
| The endpoints answer `401` in production | `editingEnabled` is off outside `next dev`. Set `TMS_EDITING=1` where Editors work, after replacing `authorize`. |

The Extension also explains itself in the page's console, prefixed
`[intl-tms]`. The [Editor guide](/editors/troubleshooting) covers what an
Editor can run into.

## Storage is yours

Intl TMS does not store translations and has no opinion on where they live.
To finish the integration you write two things:

1. **A storage adapter**: four functions that read and save rows in whatever
   you use, be it a database, a CMS or files. Pass it to `createHandler` in
   place of `createMemoryAdapter()`. The contract is one page:
   [Storage adapter](./storage-adapter).
2. **A way to render saved values.** Saving stores a value; putting it on the
   page is your website's job. In `prepareMessages`, replace each message with
   its saved value before the messages are marked.

## With locale-based routing

A website with a `[locale]` segment needs nothing extra from Intl TMS:

- Keep your own `src/i18n/request.ts` and only pass its messages through
  `prepareMessages`.
- Use your routing's locales in `src/tms/config.ts`, so they are defined once.
- Render the matched locale as `<html lang={locale}>`.
- Leave the route at `src/app/api/tms/[...path]/route.ts`, outside the
  `[locale]` segment.

## Not using Next.js?

Nothing in the Core is specific to Next.js or next-intl. Any website does the
same three things:

1. Call `resolveConfig` once, at boot.
2. Pass the assembled messages through `markCatalog` when the request carries
   the cookie `tms-edit=1`, and not otherwise.
3. Mount the function `createHandler` returns at the path of `basePath`, for
   GET, PUT and POST.

Never cache a marked response for another visitor.

## Credits

The internationalization in this guide is [next-intl](https://next-intl.dev),
created by [Jan Amann](https://github.com/amannn). The setup in steps 2, 3, 6
and 7 and the structure of this page follow its
[App Router guide](https://next-intl.dev/docs/getting-started/app-router).

## Next

- [Storage adapter](./storage-adapter): the four functions you write to keep
  what Editors save.
- [Security](./security): read this before you ship.
- [The Storybook addon](./storybook): edit the same translations on your
  stories.
