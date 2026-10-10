# Try the demo app

The demo app is the quickest way to see Intl TMS working end to end: a website
that marks its text, the endpoints, a real storage adapter, and the Extension
editing it.

**Repository: [github.com/intl-tms/demo-app](https://github.com/intl-tms/demo-app)**

It is a Turborepo. The app to run is `apps/web`: Next.js with next-intl, English
and Danish, storing edits in MongoDB.

A second app, `apps/next-intl-extracted`, shows the same integration with
messages extracted from `useExtracted` calls. It is on the
`feature/next-intl-extracted` branch and not yet on `main`.

## What you need

- Node.js 24 or newer, and pnpm.
- A MongoDB database (a local instance or a hosted one) and its connection
  string.
- Chrome, for the Extension.

## 1. Clone the repositories side by side

The demo app and the Extension link the Core from a sibling folder, so all
three must sit next to each other.

```bash
mkdir intl-tms && cd intl-tms
git clone https://github.com/intl-tms/core.git
git clone https://github.com/intl-tms/extension.git
git clone https://github.com/intl-tms/demo-app.git
```

## 2. Build the Core

```bash
cd core
npm install
npm run build
cd ..
```

## 3. Run a demo app

```bash
cd demo-app
pnpm install
echo 'MONGODB_URI=mongodb://localhost:27017' > apps/web/.env.local
pnpm --filter web dev
```

Open `http://localhost:3000`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | none, required | Where edits and usage are stored. |
| `MONGODB_DB` | `intl-tms` | The database name. |
| `SITE_URL` | `http://localhost:3000` | The origin the endpoints are published under. |
| `TMS_EDITING` | off | Set to `1` to enable editing outside `next dev`. Editing is always on in development. |

To run the other app, check out `feature/next-intl-extracted`, put the same
`.env.local` in `apps/next-intl-extracted`, and run
`pnpm --filter next-intl-extracted dev`.

## 4. Build and load the Extension

```bash
cd ../extension
pnpm install
pnpm build
```

Open `chrome://extensions`, switch on **Developer mode**, choose **Load
unpacked** and pick the `extension/dist` folder.

## 5. Edit something

1. On `http://localhost:3000`, click the **Intl TMS** icon.
2. Paste the Config URL: `http://localhost:3000/api/tms/config`
3. Click **On** and allow access when Chrome asks.
4. Hold **Alt** and click any outlined text, change it, and click **Save all**.

The rest is in the [Editor guide](/editors/editing).

## Storybook

Both apps have a Storybook with the [Storybook addon](./storybook) set up, so
you can edit the same translations on a story, without the Extension.

Keep the app running (step 3), since Storybook saves through its endpoints,
and in a second terminal:

```bash
pnpm --filter web storybook
```

Open `http://localhost:6006`, choose **Edit translations: on** in the toolbar,
hold **Alt** and click an outlined text. The **Locale** button next to it
switches the story between English and Danish.

| File | What it does |
| --- | --- |
| `.storybook/preview.tsx` | Creates the addon with the app's Config URL, adds the toolbar switch and the decorator, and passes the messages through `tms.mark`. |
| `.storybook/main.ts` | Storybook's own configuration (`@storybook/nextjs-vite`), plus Tailwind and access to the linked Core. |
| `.storybook/navigation.mock.ts` | Stands in for `src/i18n/navigation` in stories, which have no route. |
| `src/app/api/tms/[...path]/route.ts` | Lists Storybook's origin in `cors.origins`. Set `STORYBOOK_URL` if yours is not `http://localhost:6006`. |

In `apps/next-intl-extracted`, `.storybook/main.ts` also runs next-intl's
extraction loader, so `useExtracted` calls are compiled to message ids in
Storybook as they are in `next dev`.

With edit mode on, a story shows the values stored in MongoDB, the same ones
the website shows, not only the bundled messages. See
[A story shows what the store holds](./storybook#a-story-shows-what-the-store-holds).

## Where the integration lives

In `apps/web/src/`:

| File | What it does |
| --- | --- |
| `tms/config.ts` | `resolveConfig` with the next-intl locales, and the `editingEnabled` deployment switch. |
| `tms/messages.ts` | Reads the Toggle cookie, overlays stored values on the bundled messages, and calls `markCatalog`. |
| `tms/adapter.ts` | The MongoDB [storage adapter](./storage-adapter). |
| `tms/bundled.ts` | Looks up a key's bundled message so the panel edits the real pattern. |
| `i18n/request.ts` | Hands next-intl marked messages during an editing session, plain ones otherwise. |
| `app/api/tms/[...path]/route.ts` | Mounts `createHandler`. |

::: warning Demo authorization
The demo's `authorize` allows anyone to read and write while editing is
enabled. Replace it with a real check before using this pattern for real
content. See [Security](./security).
:::
