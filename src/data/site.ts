// Central site configuration. Everything a non-developer might want to change lives here.

export const site = {
  name: 'Dima Publishing',
  shortName: 'Dima',
  url: 'https://dimapub.com',
  tagline: 'Publishing for the way we learn today.',
  description:
    'Dima Publishing creates books, interactive textbooks, and digital learning experiences that connect what students learn to what they will actually do.',
  email: 'info@dimapub.com',
  readerUrl: 'https://database-textbook.dimapublishing.com/',
  supabase: {
    url: 'https://gohailemaywvobzumoej.supabase.co',
    // Publishable (browser-safe) key. Row-level security protects every table.
    key: 'sb_publishable_2BU1O35wrzNAOd0Jg8PN5A_nnKaJSE0',
  },
};

export const nav = [
  { label: 'Books', href: '/books/' },
  { label: 'Learn', href: '/learn/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const book = {
  slug: 'using-data-to-drive-business-performance',
  title: 'Using Data to Drive Business Performance',
  subtitle: 'Databases and Management Information Systems',
  author: 'Dr. Nimrod Dvir',
  format: 'Interactive digital textbook',
  chapters: 16,
  // Set a price (for example '$59') to show it on the book page; leave null to show "request pricing".
  price: null as string | null,
  readerUrl: site.readerUrl,
};
