import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import { github, releases, siteDescription, siteName, siteShortName } from './meta'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  cleanUrls: true,
  title: siteName,
  description: siteDescription,
  titleTemplate: siteShortName,
  lastUpdated: true,
  srcDir: 'content',
  vite: {
    resolve: {
      alias: {
        'base-ui-vue': resolve(__dirname, '../../packages/core/src/index.ts'),
      },
    },
  },
  themeConfig: {
    logo: '/logo.svg',

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Docs', link: '/docs/overview/getting-started' },
      { text: 'Components', link: '/docs/components/' },
      {
        text: `v${version}`,
        items: [
          { text: 'Release Notes', link: releases },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Getting Started', link: '/docs/overview/getting-started' },
          { text: 'Installation', link: '/docs/overview/installation' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Introduction', link: '/docs/components/' },
          { text: 'Button', link: '/docs/components/button' },
        ],
      },
    ],

    outline: { level: [2, 3] },
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/vuepont/base-ui-vue/edit/main/docs/content/:path',
    },
    socialLinks: [
      { icon: 'github', link: github },
    ],
  },
})
