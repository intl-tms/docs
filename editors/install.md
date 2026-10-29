# Install and switch on

## Install

1. Get the extension's `dist` folder from your developer. (Developers: see
   [Building it](/developers/extension#building-it).)
2. Open `chrome://extensions` in Chrome.
3. Switch on **Developer mode** in the top right corner.
4. Choose **Load unpacked** and pick the `dist` folder.
5. Pin **Intl TMS** to the toolbar so its icon is always there.

The extension starts with access to no website at all. It does nothing on any
site until you switch it on there.

## Switch it on

1. Open the website you want to edit.
2. Click the **Intl TMS** icon. The window says `Edit mode on <website>` so you
   can see which website you are switching.
3. Paste the **Config URL** you were given for that website. It is a full
   address beginning with `https://`.
4. Click **On**.

The first time, Chrome asks:

> "Intl TMS" wants to: Read and change your data on *that website*

That is Chrome's standard wording for "this extension may run on this one
website". Click **Allow**. The extension uses it to outline the text on the
page and to save your edits through the website, as you. It is asked once per
website, and only for that website.

The page reloads once, and every piece of translated text gets an outline.

## Sign in

A website lets only its Editors edit. Sign in to the website in an ordinary
tab, with whatever sign-in method your organisation has set up, then go back
to the tab you were editing in. The page reloads once by itself and the text
gets its outlines. You do not need to click anything else.

The extension says nothing about signing in: it never shows a sign-in address
or anything the website says when it turns you away. Whoever gave you the
Config URL can tell you where to sign in.

While you are signed in, the extension's window and the side panel say
`Editing as <your name>`.

### Once a day

Signing in lasts at most a working day (10 hours). After that saving fails
with `401` (see [Troubleshooting](./troubleshooting)). Anything you
typed stays in the panel: sign in again in another tab, go back to the tab and
press **Save all** again. The page is not reloaded, so nothing you typed is
lost.

### Signed in, but nothing is outlined

Your account may not have permission to edit. Ask whoever manages your access
to this website. Once they have given you permission it can take up to an hour
before it works.

### Signing in from Storybook

In Storybook the panel asks you to sign in too. Press **Sign in**: a small
window opens where you sign in with whatever sign-in method your organisation
has set up. It closes by itself, and the panel then shows your name. If you
were already signed in to the website, the window closes straight away.

If the panel says the browser blocked the window, allow pop-ups for the
Storybook's address and press **Sign in** again. Signing in lasts at most 10
hours there too, and closing the Storybook tab signs you out of it.

## Switch it off

Click the **Intl TMS** icon and click **Off**. The outlines disappear at once.
The next time the page loads it is exactly what every other visitor sees.

## Withdraw access

Switching Off keeps Chrome's permission, so switching On again does not ask.
To take the permission back:

1. Open `chrome://extensions`.
2. Find **Intl TMS** and click **Details**.
3. Under **Site access**, remove the website.

Edit mode goes off there at once.
