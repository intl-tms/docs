# Privacy

*Last updated: 29 October 2026*

Intl TMS is open-source software. It has no servers, no accounts and no
analytics. Nothing described on this page is ever sent to the people who make
Intl TMS.

This page covers the three parts of Intl TMS: the Chrome extension, the Core
package (`@intl-tms/core`) and the Storybook addon.

## The Chrome extension

### What it stores

The extension uses Chrome's own storage. It stores:

| What | Where | Why |
| --- | --- | --- |
| The websites you switched editing on for (their origins, such as `https://example.com`) | `chrome.storage.sync` | To remember where editing is on. |
| The configuration address you typed, if any | `chrome.storage.sync` | To find a website's endpoints. |
| Part of each website's configuration: its languages, field names and endpoint addresses | `chrome.storage.local` | So the side panel works when Chrome restarts the extension. |
| For each open tab on a website you switched on: the text you last clicked, its translation key, its translations in every language, the hidden texts the side panel lists, and whether the website lets you edit, with the name it knows you by | `chrome.storage.session` | So the side panel keeps its place when Chrome pauses the extension, and can show `Editing as <your name>`. Kept in memory only, and cleared when you close the tab or Chrome. |

Chrome syncs `chrome.storage.sync` between the browsers you are signed in to
with your Google account, if you have sync switched on. That sync is done by
Google under
[Google's privacy policy](https://policies.google.com/privacy), not by Intl TMS.
Only the first two rows are synced.

The extension holds **no credential**: no password, no token and no key. It
signs nothing in; you sign in on the website itself. Your name, as the website
gives it, is kept only to show it, and never in `chrome.storage.sync` or
`chrome.storage.local`.

The extension does not store your browsing history. On websites you have not
switched on, it reads nothing except the address of the tab you open its popup
on, to show whether editing is on there.

### What it sends, and where

When you edit on a website, the extension sends requests to **that website's
own endpoints**, the ones its configuration lists. Those requests carry the
translation keys you open and the values you save. They go from your browser
to that website, the same way the page's own requests do, including its
cookies. Intl TMS never sees them.

What happens to your edits after that is up to whoever runs the website. Their
privacy policy applies.

The extension sends nothing anywhere else: no analytics, no crash reports and
no tracking.

### Permissions

| Permission | Why |
| --- | --- |
| `storage` | To store the settings in the table above. |
| `sidePanel` | To show the side panel you edit in. |
| `scripting` | To run the editing script on the websites you switched on. |
| `activeTab` | To work on the tab you are looking at when you open the popup. |
| Access to a website (optional) | Asked for per website, only when you switch editing on for it. You can remove it at any time in `chrome://extensions`. |

### Removing your data

Uninstalling the extension removes everything it stored in this browser. To
remove it from Chrome sync as well, also uninstall it in your other browsers,
or clear your synced data in your Google account.

## The Core package and the Storybook addon

`@intl-tms/core` is a library that developers add to their own website. It
does not collect, send or store anything by itself. Saved translations go to
the storage adapter that the website's developers write, and they decide what
is kept and for how long.

### Editors' personal data

Editors sign in to the website, so the website handles some personal data
about them: an Editor's identifier and name, from the organisation's identity
provider. It lives in:

- the website's sessions for its login for Editors;
- the records of Storybook's short-lived editing tokens, which end with the
  token (at most 10 hours after sign-in);
- with each saved change, if the website's storage adapter keeps who made it.
  The Core passes the Editor's identifier and name to the adapter and records
  nothing itself.

All of it lives only in the website owner's own systems: their identity
provider, their authentication setup and their database. Intl TMS sends
nothing anywhere. The website's owner decides what is kept and for how long,
and covers it in their own privacy notice.

The Storybook addon runs inside a developer's Storybook and sends requests
only to the endpoints that Storybook is configured with. Its editing token is
kept in that browser tab only, and is forgotten when the tab is closed.

## Changes

If this page changes, the new version is published here and the date at the
top changes. Its full history is in the
[docs repository](https://github.com/intl-tms/intl-tms.github.io/commits/main/privacy.md).

## Contact

Questions about this page can be asked as an issue in the
[docs repository](https://github.com/intl-tms/intl-tms.github.io/issues).
