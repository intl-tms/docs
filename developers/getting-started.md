# Getting started

Integrating a website takes three steps: describe the setup, mark the Catalog,
serve the endpoints.

::: tip Prefer a working example?
The [demo app](./demo-app) is a complete Next.js and next-intl integration you
can clone and run.
:::

## Install

`@intl-tms/core` is not published to a registry yet. Clone
[intl-tms/core](https://github.com/intl-tms/core), build it, and link it:

```bash
git clone https://github.com/intl-tms/core.git
cd core && npm install && npm run build
```

```json
{
  "dependencies": {
    "@intl-tms/core": "link:../core"
  }
}
```

## 1. Describe your setup

Locales and one absolute base path are a complete, working configuration.
Mistakes throw here, at boot, naming the value.

```ts
import { resolveConfig } from "@intl-tms/core";

export const config = resolveConfig({
  locales: ["en", "da"],
  basePath: "https://app.example.com/api/tms",
  sourceLocale: "en",
});
```

See [Configuration](./configuration) for every option.

## 2. Mark the Catalog

Mark the merged message Catalog, for editing sessions only. Your i18n library
then formats marked strings as if they were plain.

```ts
import { markCatalog } from "@intl-tms/core";

export function messagesFor(catalog: Record<string, unknown>, isEditingSession: boolean) {
  return isEditingSession ? markCatalog(catalog) : catalog;
}
```

An editing session is a request that carries the Toggle cookie `tms-edit=1`
(exported as `TOGGLE_COOKIE_NAME` and `TOGGLE_ON_VALUE`). The cookie is a
user-interface switch and protects nothing: see [Security](./security).

Never cache a marked response for another visitor.

## 3. Serve the endpoints

The handler is one function from a web `Request` to a web `Response`, so
mounting it is a re-export on any modern framework.

```ts
import { createHandler, createMemoryAdapter } from "@intl-tms/core";

const EDITOR_TOKEN = "replace-me"; // your real check goes here: a session, a role
export const handler = createHandler({
  config,
  adapter: createMemoryAdapter(), // for tests and spikes only: write your own
  authorize: ({ request }) => request.headers.get("x-editor-token") === EDITOR_TOKEN,
});
```

Mount `handler` at the path of your base path (`/api/tms` above):

```ts
export const GET = handler;
export const PUT = handler;
export const POST = handler;
```

Then replace the memory adapter with [your own storage adapter](./storage-adapter).

## Declare the page language

The editing tool reads the page's Locale from `<html lang>`. It must be spelled
as (or match, up to case and `_`/`-`) one of the configured locales.

## Example: Next.js with next-intl

This is how the [demo app](https://github.com/intl-tms/demo-app) does it.

Mark the messages in `src/i18n/request.ts`, only when the cookie is set:

```ts
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { markCatalog, TOGGLE_COOKIE_NAME, TOGGLE_ON_VALUE } from "@intl-tms/core";

export default getRequestConfig(async ({ locale }) => {
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const editing = (await cookies()).get(TOGGLE_COOKIE_NAME)?.value === TOGGLE_ON_VALUE;

  return { locale, messages: editing ? markCatalog(messages) : messages };
});
```

Serve the handler from a catch-all route, `src/app/api/tms/[...path]/route.ts`:

```ts
import { createHandler } from "@intl-tms/core";
import { adapter } from "@/tms/adapter";
import { config } from "@/tms/config";

const handler = createHandler({ config, adapter, authorize });

export const GET = handler;
export const PUT = handler;
export const POST = handler;
```

The demo app also overlays the values saved by Editors onto the bundled
messages before marking, so a saved change shows up on the next render. See
`apps/web/src/tms/messages.ts` in the demo app.

## Try it

Install the [Extension](./extension), give it your Config URL (the handler's
`/config` address, for example `https://app.example.com/api/tms/config`), and
follow the [Editor guide](/editors/install).

## Building your own editing tool

The Extension is one Host of the Core. To build another (a component-workbench
addon, for example), wire a session to a panel store. The Core ships both; the
views are yours.

```ts
import { createClient, createPanelStore, createSession } from "@intl-tms/core/tools";

const client = createClient({ getConfig: () => served /* GET {basePath}/config */ });
const panel = createPanelStore({ persist: (changes) => session.save(panel.getState().selection!.key, changes) });
const session = createSession({ sink: panel, client, getConfig: () => served, getLocale: () => document.documentElement.lang });
session.start(document);
```

The panel store is the session's sink directly. Render `panel.getState()`
however you like and subscribe with `panel.subscribe`.
