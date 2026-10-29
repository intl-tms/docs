# Try the demo app

The demo app is the quickest way to see Intl TMS working end to end: a Next.js
website using next-intl that marks its text, serves the endpoints and stores
edits, with the Extension editing it.

**Repository: [github.com/intl-tms/demo-app](https://github.com/intl-tms/demo-app)**

How to run it is in the repository's
[README](https://github.com/intl-tms/demo-app#running-it). You need Node.js,
pnpm, a MongoDB database and Chrome.

Editors sign in to the demo with a stand-in identity provider: a sign-in page
lists demo accounts, and an access page plays the IT department (give or
withdraw the Editor role, disable an account, the emergency stop). The session
and the checks are real; only the provider is fake. See
[Signing Editors in](./editors-login).

It is one example of an integration, not the reference for one. Its storage
choice and the way it reads saved values are its own; yours can be anything
that satisfies the [storage adapter](./storage-adapter) contract.

## Storybook

The demo app also has a Storybook with the [Storybook addon](./storybook) set
up. Its
[README](https://github.com/intl-tms/demo-app#storybook) says how to start it.
