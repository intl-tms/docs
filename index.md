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
  - title: Call sites never change
    details: Marking happens once, on the assembled message Catalog, before your i18n library sees it.
  - title: You own storage and authorization
    details: The Core defines the seam and never crosses it. You write the storage adapter and the authorization check; neither has a default.
  - title: Off means off
    details: With editing switched off, your output is byte-for-byte what it would be without Intl TMS.
  - title: No runtime dependencies
    details: Web-standard APIs only. The request handler is one function from a Request to a Response.
---

## Where to go

- **You are integrating Intl TMS into a website.** Start with
  [How it works](/developers/), then [Getting started](/developers/getting-started).
- **You want to see it running first.** Clone the
  [demo app](https://github.com/intl-tms/demo-app) and follow
  [Try the demo app](/developers/demo-app).
- **You edit translations.** Go to the [Editor guide](/editors/).
