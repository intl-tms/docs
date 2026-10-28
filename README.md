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

## Publishing at https://intl-tms.github.io/

This configuration targets the organization website at
<https://intl-tms.github.io/>. GitHub requires its repository to be named
`intl-tms.github.io`; a repository named `docs` publishes at `/docs/` instead.
Changing VitePress's `base` alone cannot change that GitHub routing rule.

### One-time GitHub setup

1. In the current `intl-tms/docs` repository, open **Settings → General** and
   rename the repository to **intl-tms.github.io**. This keeps the documentation
   and its Git history together. Do not create an empty replacement repository.
2. Open **Settings → Pages → Build and deployment** and set **Source** to
   **GitHub Actions**. Publishing the Markdown source using **Deploy from a
   branch** runs GitHub's default Jekyll process, which does not use the
   VitePress menu, sidebar, theme, or search configuration.
3. Commit and push this configuration to `main`. Update your checkout's remote:

   ```sh
   git remote set-url origin https://github.com/intl-tms/intl-tms.github.io.git
   ```

4. In **Actions**, check **Deploy docs to GitHub Pages**. If the latest commit
   did not start a run, select **Run workflow** on `main`. Both the `build` and
   `deploy` jobs must succeed. If the `github-pages` environment requires a
   reviewer, approve the deployment there.
5. Open <https://intl-tms.github.io/>. Check **Developers** and **Editors** in
   the top menu, their sidebars, the search dialog, and the **About** menu.
   Open <https://intl-tms.github.io/developers/getting-started> directly to
   verify that a page also loads without first visiting the homepage.

The local folder can still be called `docs`; it does not determine the public
URL. The former `/docs/` website URL is not automatically redirected by a
repository rename, so update links and bookmarks pointing to it.

### What the workflow publishes

Pushing to `main` builds the VitePress site and publishes **`.vitepress/dist`**
through `.github/workflows/deploy.yml`. Pull requests build the complete site
for validation without deploying it. Do not publish the raw repository root
as the website. The `index.md` home layout and the navigation settings only
become the intended documentation site after VitePress builds them.

The configuration uses `base: '/'` for the organization website. Footer and
edit links also target the organization website and renamed repository.
Navigation, developer and editor sidebars, local search, and mobile navigation
are provided by the existing VitePress theme.

### Diagnosing a single page or a 404

- **Plain page with missing menu:** check that Pages uses **GitHub Actions**
  and that the last successful deployment came from this repository's
  **Deploy docs to GitHub Pages** workflow. A branch/Jekyll deployment does
  not build the configured VitePress application.
- **`/docs/` works but `/` returns 404:** confirm that the repository is named
  exactly `intl-tms.github.io`. A successful project-site build alone cannot
  make the organization's root website exist.
- **Missing styles or broken internal links:** verify `base: '/'`, rebuild,
  and check that the deployed artifact is `.vitepress/dist`.
- **Build or deploy failed:** inspect the failed step in **Actions**. A local
  `pnpm build` checks VitePress compilation; it cannot validate GitHub Pages
  settings or environment approval rules.

References: [GitHub Pages site types](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
and [VitePress deployment](https://vitepress.dev/guide/deploy).

## License

[MIT](./LICENSE)
