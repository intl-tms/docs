import {defineConfig} from 'vitepress';

const org = 'https://github.com/intl-tms';

export default defineConfig({
  title: 'Intl TMS',
  description: "Edit a website's translations directly on the rendered page.",
  // Organization site: the GitHub repository must be named intl-tms.github.io.
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['README.md'],

  themeConfig: {
    nav: [
      {text: 'Developers', link: '/developers/', activeMatch: '^/developers/'},
      {text: 'Editors', link: '/editors/', activeMatch: '^/editors/'},
      {text: 'Demo app', link: `${org}/demo-app`},
      {
        text: 'About',
        items: [
          {text: 'Credits', link: '/credits'},
          {text: 'Privacy', link: '/privacy'}
        ]
      }
    ],

    sidebar: {
      '/developers/': [
        {
          text: 'Introduction',
          items: [
            {text: 'How it works', link: '/developers/'},
            {text: 'Getting started with Next.js', link: '/developers/getting-started'},
            {text: 'Try the demo app', link: '/developers/demo-app'}
          ]
        },
        {
          text: 'Integrating a website',
          items: [
            {text: 'Configuration', link: '/developers/configuration'},
            {text: 'Storage adapter', link: '/developers/storage-adapter'},
            {text: 'Wire contract', link: '/developers/wire-contract'},
            {text: 'Signing Editors in', link: '/developers/editors-login'},
            {text: 'Security', link: '/developers/security'},
            {text: 'What marking does to strings', link: '/developers/marking'},
            {text: 'Shared translations', link: '/developers/shared-translations'}
          ]
        },
        {
          text: 'Editing tools',
          items: [
            {text: 'The Extension', link: '/developers/extension'},
            {text: 'The Storybook addon', link: '/developers/storybook'}
          ]
        },
        {
          text: 'Reference',
          items: [
            {text: 'Entry points', link: '/developers/entry-points'},
            {text: 'Design decisions', link: '/developers/decisions'}
          ]
        }
      ],
      '/editors/': [
        {
          text: 'Editor guide',
          items: [
            {text: 'Overview', link: '/editors/'},
            {text: 'Install and switch on', link: '/editors/install'},
            {text: 'Edit and save', link: '/editors/editing'},
            {text: 'Troubleshooting', link: '/editors/troubleshooting'}
          ]
        }
      ]
    },

    socialLinks: [{icon: 'github', link: `${org}/demo-app`}],
    search: {provider: 'local'},
    editLink: {
      pattern: `${org}/intl-tms.github.io/edit/main/:path`,
      text: 'Edit this page on GitHub'
    },
    outline: [2, 3],
    footer: {
      message:
        'Under development, not for production. Released under the MIT License. ' +
        '<a href="/credits">Credits</a> · <a href="/privacy">Privacy</a>'
    }
  }
});
