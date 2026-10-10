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

1. Open the website you want to edit and sign in as you normally do.
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
