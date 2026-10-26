# docs

The documentation site for Intl TMS, built with [VitePress](https://vitepress.dev).
Every page is a Markdown file.

```
pnpm install
pnpm dev       # local site with live reload
pnpm build     # static site in .vitepress/dist
pnpm preview   # serve the built site
```

- `developers/` is the implementation documentation.
- `editors/` is the guide for people who edit translations.
- `.vitepress/config.ts` holds the navigation and sidebars. A new page needs an
  entry there to show up in a sidebar.

Pushing to `main` builds and publishes the site to GitHub Pages
(`.github/workflows/deploy.yml`). The site is served from `/docs/`; change
`base` in the config if it moves.

## License

[MIT](./LICENSE)
