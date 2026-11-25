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
      // Keep private and utility pages out of the sitemap.
      filter: (page) => !['/login/', '/portal/', '/404'].some((p) => page.includes(p)),
      lastmod: new Date(),
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/') item.priority = 1.0;
        else if (path.startsWith('/books/')) item.priority = 0.9;
        else if (['/privacy/', '/terms/', '/refunds/', '/dima/'].includes(path)) item.priority = 0.3;
        else item.priority = 0.7;
        return item;
      },
    }),
  ],
});
