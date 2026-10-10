# Try the demo app

The demo app is the quickest way to see Intl TMS working end to end: a website
that marks its text, the endpoints, a real storage adapter, and the Extension
editing it.

**Repository: [github.com/intl-tms/demo-app](https://github.com/intl-tms/demo-app)**

It is one example of an integration, not the reference for one. Its storage
choice (MongoDB) and the way it reads saved values are its own; yours can be
anything that satisfies the [storage adapter](./storage-adapter) contract.

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

## 3. Run the demo app

```bash
cd demo-app
pnpm install
echo 'MONGODB_URI=mongodb://localhost:27017' > apps/web/.env.local
pnpm --filter web dev
```

Open `http://localhost:3000`.

`MONGODB_URI` is the only setting it needs. Editing is always on under
`next dev`.

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

The app also has a Storybook with the [Storybook addon](./storybook) set up.
Keep the app running, since Storybook saves through its endpoints, and in a
second terminal run `pnpm --filter web storybook`. Open
`http://localhost:6006` and choose **Edit translations: on** in the toolbar.

::: warning Demo authorization
The demo's `authorize` allows anyone to read and write while editing is
enabled. Replace it with a real check before using this pattern for real
content. See [Security](./security).
:::
