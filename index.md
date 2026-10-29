---
layout: home

hero:
  name: Intl TMS
  text: Edit translations on the page they appear on
  tagline: An in-context translation management system. Alt-click any text on your website, edit it in every language, and save.
  actions:
    - theme: brand
      text: Developer docs
      link: /developers/
    - theme: alt
      text: Editor guide
      link: /editors/
    - theme: alt
      text: Demo app on GitHub
      link: https://github.com/intl-tms/demo-app

features:
  - title: A layer on your i18n library
    details: Intl TMS does not translate, format or route anything. Your i18n library still does all of that. Intl TMS only adds a way to edit and save the messages it renders.
  - title: Call sites never change
    details: Marking happens once, on the assembled message Catalog, before your i18n library sees it.
  - title: You own storage and authorization
    details: The Core defines the seam and never crosses it. You write the storage adapter and the authorization check; neither has a default.
  - title: Off means off
    details: With editing switched off, your output is byte-for-byte what it would be without Intl TMS.
  - title: On the website and in Storybook
    details: Editors use a Chrome extension on the running website. Developers can switch the same editing on in Storybook with an addon configured in code.
  - title: No runtime dependencies
    details: Web-standard APIs only. The request handler is one function from a Request to a Response.
---

::: danger Under development, not for production
The API can change between any two releases, and some protections are not
built yet. Use it on local and test environments only.
[Read why](/developers/security#not-ready-for-production).
:::

## What it is, and what it is not

Intl TMS is **not an internationalization library**. It does not load
messages, pick a locale, format plurals or dates, or route between languages.
Your i18n library does all of that, exactly as it did before.

Intl TMS is a thin layer on top of it that adds one thing: an Editor can click
a text on the rendered page, change it in every language, and save it.

| | Who does it |
| --- | --- |
| Loading messages, choosing the locale, formatting, routing | Your i18n library |
| Finding which message a text on the page came from | Intl TMS |
| Editing a message on the page and saving it | Intl TMS |
| Storing the saved value | Your storage adapter |

The guides and the demo app use [next-intl](https://next-intl.dev) as that
library.

## Where to go

- **You are integrating Intl TMS into a website.** Start with
  [How it works](/developers/), then follow the step-by-step
  [Next.js guide](/developers/getting-started).
- **You want to see it running first.** Clone the
  [demo app](https://github.com/intl-tms/demo-app) and follow its
  [README](https://github.com/intl-tms/demo-app#running-it).
- **You edit translations.** Go to the [Editor guide](/editors/).

## Credits

The guides and the demo app are built on [next-intl](https://next-intl.dev),
the internationalization library for Next.js created by
[Jan Amann](https://github.com/amannn). It does the real work of
internationalization in everything shown here. See [Credits](/credits).
