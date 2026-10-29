# Signing Editors in

Editors are often people outside the development team: colleagues in
marketing, or translators at an agency. Access to editing should be given and
taken away by whoever manages your organisation's accounts, usually the IT
department, not by developers. So Editors sign in with **a login for Editors**
on your website, through your organisation's identity provider, and IT
decides who holds the **Editor** role.

The Core is not an identity provider. Your website signs Editors in; the Core
reads the result through the `authorize` check you build with `sessionCheck`.

## The rules, and why

| Rule | Why |
| --- | --- |
| **The login for Editors is its own**: its own sign-in address, session cookie and session settings, separate from any login your website has for customers. A customer session never authorizes editing. | Editors are managed by IT and re-checked every hour; customers are not. Kept apart, a customer account cannot become an editing account by mistake, and changing one login's settings cannot weaken the other. |
| **One role, `Editor`, assigned in the identity provider.** It allows reading and saving in every language. | Access is granted and withdrawn where IT already manages accounts. Someone who leaves loses access when their account is disabled. |
| **A session ends 10 hours after sign-in**, however active the Editor is. | A working day with margin, so an Editor signs in once a day. |
| **The account and role are checked with the identity provider at least every hour.** | It bounds how long someone whose role was withdrawn keeps access. |
| **The endpoints are on the same site as the pages.** | Browsers do not send a session cookie to another site. |
| **Sessions are kept in a store**, not in self-contained signed cookies. | A session in a store can be ended at once; a self-contained one lasts until it expires. |

These are carried out by your code, not by the Core, which owns no session.
If you choose other values, do so knowingly.

## What the Core gives you

```ts
import { sessionCheck } from "@intl-tms/core";

export const authorize = sessionCheck({
  // Who the request is from: your session lookup for the Editors' login only.
  user: (request) => editorSessions.user(sessionIdFrom(request)),
  // Whether they may: the Editor role, while editing is switched on.
  may: (user) => editingSwitch.isOn() && user.roles.includes("Editor"),
  // Where the Extension sends someone who is not signed in.
  signIn: "/editors/sign-in",
  // Optional: your own words, plain text, at most 200 characters.
  help: {
    unauthenticated: "Sign in with your company account.",
    forbidden: "Ask IT at it@example.com for the Editor role.",
  },
});
```

- Nobody signed in: `401`, with the sign-in address. The Extension says
  "You are not signed in to this website." and offers **Sign in**.
- Signed in without the role: `403`. The Extension says the Editor may not edit
  here, followed by your `forbidden` help text.
- Signed in with the role: allowed. The user's `id` and `name` are passed to
  your [storage adapter](./storage-adapter) as `context.identity`, so you can
  store who made each change, and the Extension shows `Editing as <name>`.

Use the same check to mark pages only for Editors:

```ts
import { isEditingRequest, markCatalog } from "@intl-tms/core";

const marked = await isEditingRequest(request, authorize);
```

A visitor who sets the `tms-edit` cookie, or a customer signed in to your other
login, then gets the page everyone else gets.

Give the session cookie a path that covers your pages as well as the
endpoints, because marking reads it. Make it not readable by script
(`HttpOnly`), `Secure`, and `SameSite=Lax`.

## The shape of a setup

The [demo app](https://github.com/intl-tms/demo-app) has the whole setup in
`apps/web/src/editors/`, with a stand-in identity provider so it runs with no
Microsoft account:

| File | What it is |
| --- | --- |
| `identity-provider.ts` | The **only** provider-specific part: sign in, and re-check. Replace it for a real provider. |
| `sessions.ts` | The Editors' sessions: kept in a store, 10 hours at most, re-checked with the provider at an interval. |
| `check.ts` | The `authorize` check above. |
| `recipe.test.ts` | Runs the setup against the stand-in: with and without the role, a role withdrawn, a session past 10 hours, the emergency stop. |

The sessions need one thing from the provider:

```ts
type Recheck = { active: false } | { active: true; roles: string[]; grant: string };
type IdentityProvider = { recheck: (grant: string) => Recheck | Promise<Recheck> };
```

Signing in gives the user (`id`, `name`, `roles`) and a **grant**: whatever
the provider needs to check that user again later. For Microsoft it is a
refresh token.

## Recipe: Microsoft Entra ID

::: warning Not yet run against a real Microsoft tenant
This recipe follows Microsoft's documented OpenID Connect flow and is the shape
the demo's tests run against the stand-in. It has not yet been run against a
real tenant. Try it in a test tenant first.
:::

### 1. Register the website (developer, with IT)

1. In the Microsoft Entra admin center, **App registrations → New
   registration**. Name it after the website ("Example.com editing"). Choose
   *Accounts in this organizational directory only*.
2. Add a **Web** redirect address: `https://example.com/editors/callback`.
3. **Certificates & secrets → New client secret.** Keep the value in your
   server's secrets (`MICROSOFT_CLIENT_SECRET`).
4. **App roles → Create app role**: display name *Editor*, allowed member
   types *Users/Groups*, value `Editor`.
5. Note the **Application (client) ID** and the **Directory (tenant) ID**.

Assigning the role is IT's part: see [Managing Editors](/it/).

### 2. The provider module

Replace the stand-in with this. It uses the authorization code flow with PKCE
and only `fetch`. The ID token comes straight from Microsoft's token endpoint
over HTTPS, so its claims are read without checking its signature, which the
OpenID Connect specification allows for this flow. Audience, issuer, expiry and
nonce are still checked.

::: code-group

```ts [src/editors/identity-provider.ts]
import type { ProviderSignIn, Recheck } from "./sessions";

export const EDITOR_ROLE = "Editor";

const tenant = process.env.MICROSOFT_TENANT_ID!;
const clientId = process.env.MICROSOFT_CLIENT_ID!;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
const redirectUri = `${process.env.SITE_URL}/editors/callback`;
const authority = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`;
// offline_access gives a refresh token: the grant the hourly re-check uses.
const scope = "openid profile offline_access";

const random = () => Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
const sha256 = async (text: string) => Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))).toString("base64url");

/** Where to send the browser to sign in, and what to keep until it comes back. */
export async function startSignIn() {
  const pending = { state: random(), nonce: random(), verifier: random() };
  const url = new URL(`${authority}/authorize`);
  url.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    state: pending.state,
    nonce: pending.nonce,
    code_challenge: await sha256(pending.verifier),
    code_challenge_method: "S256",
  }).toString();
  return { url: url.href, pending };
}

async function token(body: Record<string, string>) {
  const response = await fetch(`${authority}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, scope, ...body }),
  });
  return { ok: response.ok, body: await response.json() };
}

function claims(idToken: string, nonce?: string) {
  const payload = JSON.parse(Buffer.from(idToken.split(".")[1]!, "base64url").toString());
  if (payload.aud !== clientId) throw new Error("ID token for another application");
  if (payload.iss !== `https://login.microsoftonline.com/${tenant}/v2.0`) throw new Error("ID token from another tenant");
  if (payload.exp * 1000 < Date.now()) throw new Error("ID token expired");
  if (nonce !== undefined && payload.nonce !== nonce) throw new Error("ID token for another sign-in");
  return payload as { oid: string; name?: string; roles?: string[] };
}

/** The callback: the code and state Microsoft sent back, and what `startSignIn` kept. */
export async function finishSignIn(
  code: string,
  state: string,
  pending: { state: string; nonce: string; verifier: string },
): Promise<ProviderSignIn | undefined> {
  if (state !== pending.state) return undefined;
  const answer = await token({ grant_type: "authorization_code", code, redirect_uri: redirectUri, code_verifier: pending.verifier });
  if (!answer.ok) return undefined;
  const user = claims(answer.body.id_token, pending.nonce);
  return {
    // oid is the account's stable identifier in your directory, guests included.
    user: { id: user.oid, name: user.name ?? user.oid, roles: user.roles ?? [] },
    grant: answer.body.refresh_token,
  };
}

/**
 * The hourly re-check: a new ID token from the refresh token. It carries the
 * roles assigned now. A disabled or deleted account cannot refresh, which
 * ends the session.
 */
export async function recheck(grant: string): Promise<Recheck> {
  const answer = await token({ grant_type: "refresh_token", refresh_token: grant });
  if (!answer.ok) return { active: false };
  const user = claims(answer.body.id_token);
  // Microsoft may hand out a new refresh token; the old one is then not used again.
  return { active: true, roles: user.roles ?? [], grant: answer.body.refresh_token ?? grant };
}
```

:::

### 3. The routes

- `GET /editors/sign-in` calls `startSignIn()`, keeps `pending` in a
  short-lived cookie of its own (`HttpOnly`, `Secure`, `SameSite=Lax`, ten
  minutes, path `/editors`), and redirects to `url`. This address is the
  `signIn` in your check. When it is given `?return=`, a path on your website
  starting with a single `/`, keep that in the pending cookie too: Storybook's
  sign-in pop-up comes here that way.
- `GET /editors/callback` reads `code` and `state`, calls `finishSignIn`,
  deletes the pending cookie, starts a session with `sessions.start(...)`, sets
  the Editors' session cookie, and then redirects to the kept return path, or
  else shows "Signed in. Go back to the tab you were editing in."
- `POST /editors/sign-out` ends the session, ends the Editor's Storybook
  sign-ins with `pairing.endAllOf(user.id)`, and deletes the cookie.

Create the sessions with
`createEditorSessions({ provider: { recheck }, recheckEveryMs: 60 * 60 * 1000 })`:
one hour. The demo uses one minute only so withdrawing the role can be seen
quickly. Keep the session store in your database instead of in memory, so it
survives a restart and is shared between servers.

### 4. The emergency stop

- **One Editor at once:** `sessions.endAllOf(id)` ends every session of that
  account, and `pairing.endAllOf(id)` every Storybook sign-in. Give whoever
  handles incidents a way to call both.
- **All editing at once:** read an editing switch on every request, from a
  stored setting that can be changed without a deploy, and refuse in `may`
  when it is off. No page is marked either, because marking asks the same
  check.

### 5. Test it

Run the demo's `recipe.test.ts` against your setup: it needs only the
`recheck` seam, so a stand-in provider like the demo's tests your sessions and
check without a Microsoft account.

## Other providers

A provider that puts roles in its sign-in result works the same way: replace
`identity-provider.ts`. One that does not (some only say who signed in) needs a
group lookup with further permissions from IT, so not every provider works
alike. Ask for a recipe if you need one.

## Storybook

A published Storybook usually runs on another site, where the session cookie
does not travel, so it signs in through a pop-up on this login and edits with
a short-lived editing token: see [The Storybook addon](./storybook#_5-let-editors-sign-in).
The token follows the same rules as a session (10 hours from sign-in,
re-checked every hour, judged by your check), using two more things from your
sessions:

- **`forPairing`**: the signed-in user of a request, with the grant and the
  sign-in time, for the pop-up. The demo's `sessions.ts` has it.
- **The re-check**, called with the token's user and grant. With the Microsoft
  recipe it is `recheck(grant)` above, with the roles put back on the user.

The demo's `pairing.ts` wires them up with `createPairing`, and its
`recipe.test.ts` runs Storybook's sign-in against the stand-in.
