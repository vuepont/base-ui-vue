export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: 'Base UI Vue',
  },

  compatibilityDate: '2025-07-15',

  content: {
    database: {
      type: 'd1',
      bindingName: 'base_ui_vue',
    },
    // Avoid better-sqlite3 errors during build/deploy on Cloudflare.
    experimental: {
      sqliteConnector: 'native',
    },
  },

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: 'base-ui-vue',
        d1_databases: [
          {
            binding: 'base_ui_vue',
            database_name: 'base-ui-vue',
            database_id: '2305a633-2adf-43a3-9998-d66315488655',
          },
        ],
      },
    },
  },

  llms: {
    domain: 'https://base-ui-vue.com',
    title: 'Base UI Vue',
    description: 'Unstyled UI components for building accessible user interfaces.',
    full: {
      title: 'Base UI Vue',
      description: 'Unstyled UI components for building accessible user interfaces.',
    },
  },
})
