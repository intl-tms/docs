# Troubleshooting

Find what you see, then check the causes in order.

## The On button is greyed out

A line under the field says why.

| It says | What to do |
| --- | --- |
| `Enter a config URL to enable.` | Paste the address you were given. |
| `The config URL must be a full address…` | It has to start with `http://` or `https://`. A part such as `/api/tms/config` is not enough. |
| `Edit mode cannot be switched on for this tab.` | The tab is not a website (a settings page, a new tab, a local file). |

## I clicked On and it still shows Off

`The browser has not been given access to this site.` Chrome's question was
closed or answered with a refusal. Click **On** again and choose **Allow**.

## Nothing is outlined

1. You are not signed in, or may not edit. The extension's window says so:
   see [Sign in](./install#sign-in). A website marks its text only for its
   Editors.
2. Edit mode is not on for this website. Open the popup: it must show **On**
   and name this website. Two addresses that differ only in the port are two
   websites.
3. The website does not mark its text for editing. The Config URL being correct
   does not make a website editable; its developer has to set it up.
4. Cookies are blocked for this website. Edit mode is switched on with a
   cookie. Allow cookies for the site and reload.
5. The page has no translated text on it.

## The panel says "Could not load other locales"

The panel is showing only the text from the page. Open **Diagnostics** at the
bottom of the panel (it opens by itself when something fails).

1. The Config URL is wrong or the website is down.
2. You are signed out of the website. The panel says so at the top: press
   **Sign in**, sign in, go back, and Alt-click the text again.

## Save shows ✗

Open **Diagnostics**. The line after `FAILED` says which:

| It says | What to do |
| --- | --- |
| `The page did not answer…` | Reload the page, Alt-click the text again, and save. |
| `The page no longer holds this translation. Click the text again.` | The page reloaded or changed since you clicked. Alt-click the text again; what you typed is still in the panel. |
| `No translation is selected…` | Alt-click an outlined text on the page first. |
| `The configuration never loaded…` | Check the Config URL in the popup. |
| `da: 401` or `da: 403` | You are not signed in, or may not edit. The line at the top of the panel says which. What you typed is kept: [sign in](./install#sign-in) and save again. |
| `da: 400 …` | The website refused the text; the reason follows the number. |
| `da: the request never reached the server…` | The website is unreachable. Check your connection and try again. |

The letters at the start (`da` here) are the language the problem is with.

## Save shows ⚠ changed elsewhere

Not a fault. Someone else changed the same text while you had it open: see
[When someone else changed the same text](./editing#when-someone-else-changed-the-same-text).

## Asking for help

**Copy** in Diagnostics puts the whole log on the clipboard. Send it to whoever
supports the website.
