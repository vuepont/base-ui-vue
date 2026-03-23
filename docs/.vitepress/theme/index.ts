import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ComponentPreview from '../components/ComponentPreview.vue'
import Layout from '../custom/Layout.vue'
import './style.css'
import './tailwind.css'

const regex = /\/(\w+)\.vue/
const baseModules = import.meta.glob('../../components/*.vue', { eager: true })

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    for (const path in baseModules)
      app.component(path.match(regex)?.[1] ?? '', (baseModules[path] as any)?.default)

    app.component('ComponentPreview', ComponentPreview)
  },
} satisfies Theme
