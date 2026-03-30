import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'
import { version } from '../../package.json'
import {
  discord,
  github,
  releases,
  siteDescription,
  siteName,
  siteShortName,
} from './meta'
import ComponentPreviewPlugin from './plugins/ComponentPreview'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  cleanUrls: true,
  title: siteName,
  description: siteDescription,
  titleTemplate: siteShortName,
  lastUpdated: true,
  srcDir: 'content',
  markdown: {
    theme: 'github-dark',
    preConfig(md) {
      md.use(ComponentPreviewPlugin)
    },
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons)
    },
  },
  vite: {
    plugins: [tailwindcss(), llmstxt()],
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
      { text: 'Docs', link: '/docs/overview/quick-start' },
      { text: 'Components', link: '/docs/components/accordion' },
      {
        text: `v${version}`,
        items: [{ text: 'Release Notes', link: releases }],
      },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Quick Start', link: '/docs/overview/quick-start' },
          { text: 'Accessibility', link: '/docs/overview/accessibility' },
          { text: 'Releases', link: 'https://github.com/vuepont/base-ui-vue/releases' },
          { text: 'About', link: '/docs/overview/about' },
        ],
      },
      {
        text: 'Handbook',
        items: [
          { text: 'Styling', link: '/docs/handbook/styling' },
          { text: 'Animation', link: '/docs/handbook/animation' },
          { text: 'Composition', link: '/docs/handbook/composition' },
          { text: 'Customization', link: '/docs/handbook/customization' },
          { text: 'Forms', link: '/docs/handbook/forms' },
          { text: 'TypeScript', link: '/docs/handbook/typescript' },
          { text: 'llms.txt', link: '/llms.txt' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Accordion', link: '/docs/components/accordion' },
          { text: 'Avatar', link: '/docs/components/avatar' },
          { text: 'Button', link: '/docs/components/button' },
          { text: 'Checkbox', link: '/docs/components/checkbox' },
          { text: 'Checkbox Group', link: '/docs/components/checkbox-group' },
          { text: 'Collapsible', link: '/docs/components/collapsible' },
          { text: 'Field', link: '/docs/components/field' },
          { text: 'Fieldset', link: '/docs/components/fieldset' },
          { text: 'Form', link: '/docs/components/form' },
          { text: 'Toolbar', link: '/docs/components/toolbar' },
        ],
      },
      {
        text: 'Utils',
        items: [
          { text: 'Direction Provider', link: '/docs/utils/direction-provider' },
          { text: 'useRender', link: '/docs/utils/use-render' },
          { text: 'mergeProps', link: '/docs/utils/merge-props' },
        ],
      },
    ],

    outline: { level: [2, 3] },
    search: { provider: 'local' },
    editLink: {
      pattern:
        'https://github.com/vuepont/base-ui-vue/edit/main/docs/content/:path',
    },
    socialLinks: [{ icon: 'github', link: github }, { icon: 'discord', link: discord }],
  },
})
