# Cengage two-page brief

`brief.html` is the source of the two-page brief at
`public/using-data-prospectus/pdf/Using-Data-to-Drive-Business-Performance-Cengage-Brief.pdf`
(the same file is copied into `public/using-data-prospectus/cengage-review/claude-v6/pdf/`).

To regenerate it, open `brief.html` in Chrome and print to PDF on US Letter with background
graphics on, or run Playwright's `page.pdf({ format: 'Letter', printBackground: true, preferCSSPageSize: true })`.
It must stay at two pages.
