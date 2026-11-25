// Builds /llms.txt and /llms-full.txt: plain-text guides that help AI assistants and agents
// understand the site (format: https://llmstxt.org). Content comes from the same data files as the pages.
import { site, book } from '../data/site';
import { differences, rhythm, read, parts, appendices, faqs } from '../data/book';

const u = (path: string) => new URL(path, site.url).href;
const bookUrl = u(`/books/${book.slug}/`);

const pages = [
  { title: 'Home', path: '/', note: 'Who Dima Publishing is and what it publishes.' },
  { title: 'Books', path: '/books/', note: 'The catalog of Dima Publishing titles.' },
  { title: book.title, path: `/books/${book.slug}/`, note: `${book.subtitle}: features, table of contents, FAQ.` },
  { title: 'Learn', path: '/learn/', note: 'How the books teach and how the interactive reader works.' },
  { title: 'Resources', path: '/resources/', note: 'Review copies, syllabus guides, labs, reader help, campus licensing.' },
  { title: 'About', path: '/about/', note: 'The press, its values, and how to publish with us.' },
  { title: 'Contact', path: '/contact/', note: 'Review copies, course adoption, reader support, partnerships.' },
];

const legal = [
  { title: 'Privacy Policy', path: '/privacy/' },
  { title: 'Terms of Service', path: '/terms/' },
  { title: 'Refund Policy', path: '/refunds/' },
];

export function llmsTxt() {
  return `# ${site.name}

> ${site.description} Our current title is "${book.title}: ${book.subtitle}" by ${book.author}, an interactive, business-first database and MIS textbook for undergraduates.

Key facts:
- Publisher: ${site.name}, an independent educational publisher. Website: ${site.url}/
- Contact: ${site.email} or ${u('/contact/')}
- Main title: ${book.title} (${book.chapters} chapters, ${book.format.toLowerCase()}), read online at ${book.readerUrl}
- Pricing: ${book.price ?? 'course and individual pricing on request via the contact page'}
- Instructors can request a review copy: ${u('/contact/?topic=instructor')}

## Pages

${pages.map((p) => `- [${p.title}](${u(p.path)}): ${p.note}`).join('\n')}

## Books

- [${book.title}](${bookUrl}): ${book.subtitle}. ${book.chapters} chapters across four parts, with SQL that runs in the browser, two running case systems, labs and reading assessments.
- [Interactive reader](${book.readerUrl}): where students read the book and run SQL.

## Optional

- [Full site content for LLMs](${u('/llms-full.txt')}): the main content of the public pages in one file.
${legal.map((p) => `- [${p.title}](${u(p.path)})`).join('\n')}
- [Sitemap](${u('/sitemap-index.xml')})
`;
}

export function llmsFullTxt() {
  return `# ${site.name}: full site content

> ${site.description}

Website: ${site.url}/ · Email: ${site.email} · Contact form: ${u('/contact/')}

## About ${site.name}

${site.name} is an independent educational publisher. It makes books, interactive textbooks and digital learning experiences. The press publishes few titles on purpose, and every title is written by someone who teaches the course. Chapters are taught, revised and taught again before publication. Reading, practice and assessment live in one place, so students do not juggle a theory text, a software manual and separate homework platforms. The press works with instructors who want to turn their teaching into a book (${u('/contact/?topic=authors')}).

## ${book.title}

- Subtitle: ${book.subtitle}
- Author: ${book.author}
- Publisher: ${site.name}
- Format: ${book.format}; works in any modern browser on a laptop, tablet or phone. Not a PDF.
- Length: ${book.chapters} chapters in four parts, plus ${appendices.length} appendices
- Level: undergraduate; no prior coding needed
- Courses: introductory database or MIS courses; also Accounting Information Systems, business analytics and applied SQL
- Pricing: ${book.price ?? 'course and individual pricing on request'}
- Book page: ${bookUrl}
- Read it: ${book.readerUrl}
- Review copy for instructors: ${u('/contact/?topic=instructor')}

A database course for people who will make decisions with data, not just store it. Students write real SQL from the first weeks, build two complete systems, and finish able to turn rows of data into a recommendation they can defend.

### What makes it different

${differences.map((d) => `- **${d.title}** ${d.body}`).join('\n')}

### The R.E.A.D. framework

${read.map((r) => `- **${r.word}:** ${r.body}`).join('\n')}

### How every chapter is built

${rhythm.map((r) => `${Number(r.n)}. **${r.title}:** ${r.body}`).join('\n')}

### Table of contents

${parts
  .map(
    (p) =>
      `#### ${p.part}: ${p.title}\n\n${p.chapters.map((c) => `- Chapter ${c.n}. ${c.title}: ${c.note}`).join('\n')}`,
  )
  .join('\n\n')}

#### Appendices

${appendices.map((a) => `- ${a.title}: ${a.note}`).join('\n')}

### Frequently asked questions

${faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}

## Resources

- Instructors: review copy, chapter map and syllabus guide (16 chapters mapped to a 15-week semester, plus shorter paths), transfer labs, Reading Assessment Tests and grading guidance. Request at ${u('/contact/?topic=instructor')}.
- Students: open the reader at ${book.readerUrl}; get reader help at ${u('/contact/?topic=support')}.
- Programs and partners: section, department and institutional licensing at ${u('/contact/?topic=bulk')}.

## Contact

Email ${site.email} or use ${u('/contact/')}. Topics: review copies, course adoption, reader support, bulk and campus licensing, partnerships, and publishing with us.

## Policies

${legal.map((p) => `- ${p.title}: ${u(p.path)}`).join('\n')}
`;
}
