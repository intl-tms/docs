# Try the demo app

The demo app is the quickest way to see Intl TMS working end to end: a Next.js
website using next-intl that marks its text, serves the endpoints and stores
edits, with the Extension editing it.

**Repository: [github.com/intl-tms/demo-app](https://github.com/intl-tms/demo-app)**

How to run it is in the repository's
[README](https://github.com/intl-tms/demo-app#running-it). You need Node.js,
pnpm, a MongoDB database and Chrome.

It is one example of an integration, not the reference for one. Its storage
choice and the way it reads saved values are its own; yours can be anything
that satisfies the [storage adapter](./storage-adapter) contract.

## Storybook

The demo app also has a Storybook with the [Storybook addon](./storybook) set
up. Its
[README](https://github.com/intl-tms/demo-app#storybook) says how to start it.
