// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dimapub.com',
  trailingSlash: 'always',
  // The login page used to live at /portal/; keep old links working.
  redirects: {
    '/portal': '/login/',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/login/') && !page.includes('/portal/'),
    }),
  ],
});
