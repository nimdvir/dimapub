// Content for "Using Data to Drive Business Performance".

export const differences = [
  {
    icon: 'compass',
    title: 'Questions first. Design second.',
    body: 'Most database books open with theory and diagrams and hope you stay long enough to see why it matters. This one opens with the questions a manager actually asks. Halfway through, the book turns around: you have used databases, now you design one from real requirements and business rules.',
  },
  {
    icon: 'query',
    title: 'SQL you actually run',
    body: 'Not screenshots of code. You write and run SQL in the reader, starting with simple lookups and working up to joins, CTEs, CASE logic, date analysis, window functions and views. It feels like a real job, not a worksheet.',
  },
  {
    icon: 'layers',
    title: 'Two systems that grow with you',
    body: 'The Grading Database is your guided lab. PetVax, a veterinary clinic, is where you show you can do it on your own. Instead of fifty unrelated exercises, you watch two complete information systems mature over the semester.',
  },
  {
    icon: 'chart',
    title: 'It doesn’t stop at the query',
    body: 'A result set is not a decision. You build reports, read KPIs, check for context and bias, and write the memo that turns evidence into action. That last step is where most courses stop and where this one gets interesting.',
  },
  {
    icon: 'spark',
    title: 'AI, earned',
    body: 'Embeddings, retrieval and AI-ready data show up after you understand schemas, data quality, security and governance. AI is treated as a consumer of well-built data, not a decorative sidebar.',
  },
  {
    icon: 'shield',
    title: 'Built for the AI-era classroom',
    body: 'Every chapter pairs a short reading check with a transfer lab. Students hand in things they have to explain: diagrams, schemas, SQL portfolios, reports and decision memos. That kind of work is hard to fake with a chatbot.',
  },
];

export const rhythm = [
  { n: '01', title: 'Core Concepts', body: 'The main ideas, explained with business stakes up front.' },
  { n: '02', title: 'Let’s Build', body: 'Guided, hands-on work in the Grading Database.' },
  { n: '03', title: 'Review & Reflection', body: 'Connect the pieces and explain what they mean for a manager.' },
  { n: '04', title: 'Terms Treasury', body: 'The vocabulary that matters, with real examples.' },
  { n: '05', title: 'Reading Assessment', body: 'A quick readiness check before the applied work.' },
  { n: '06', title: 'Lab', body: 'Transfer it to PetVax, a new scenario, or the capstone.' },
];

export const arc = ['Data', 'Tables', 'Relationships', 'Queries', 'Analytics', 'Decisions'];

export const read = [
  { letter: 'R', word: 'Recognize', body: 'Spot the business question hiding in the noise.' },
  { letter: 'E', word: 'Extract', body: 'Pull the right data, and only the right data.' },
  { letter: 'A', word: 'Analyze', body: 'Turn rows into patterns you can defend.' },
  { letter: 'D', word: 'Decide', body: 'Make the call, and explain why.' },
];

export const parts = [
  {
    part: 'Part I',
    title: 'Why data matters',
    chapters: [
      { n: 1, title: 'From Data to Decisions', note: 'The R.E.A.D. framework and the Grading Database' },
      { n: 2, title: 'Foundations of Information Systems', note: 'Inputs, processes, outputs, and the KPIs that judge them' },
      { n: 3, title: 'Data Fundamentals', note: 'Types, quality, governance and the data lifecycle' },
    ],
  },
  {
    part: 'Part II',
    title: 'Using databases',
    chapters: [
      { n: 4, title: 'Introduction to Databases', note: 'From spreadsheets to structured systems' },
      { n: 5, title: 'SQL Foundations', note: 'Selecting, filtering, sorting, joining, summarizing' },
      { n: 6, title: 'The Relational Model', note: 'Keys, relationships and integrity' },
      { n: 7, title: 'Normalization', note: 'From flat files to reliable relational design' },
      { n: 8, title: 'Midpoint Review', note: 'Pulling the first half together' },
    ],
  },
  {
    part: 'Part III',
    title: 'Building reliable systems',
    chapters: [
      { n: 9, title: 'Database Design', note: 'The pivot: requirements, business rules and data models' },
      { n: 10, title: 'Advanced SQL for Business Analysis', note: 'CTEs, CASE logic, dates, window functions and views' },
      { n: 11, title: 'Database Administration', note: 'Security, transactions, recovery and performance' },
    ],
  },
  {
    part: 'Part IV',
    title: 'From data to decisions',
    chapters: [
      { n: 12, title: 'Business Intelligence & Reporting', note: 'Dashboards, KPIs and honest interpretation' },
      { n: 13, title: 'Strategy & Judgment', note: 'Competitive advantage, ethics and the decision memo' },
      { n: 14, title: 'Data Infrastructure for the AI Era', note: 'Cloud databases, APIs, JSON, embeddings and retrieval' },
      { n: 15, title: 'Capstone Project', note: 'One complete system, from requirements to recommendations' },
      { n: 16, title: 'Your Career in Data', note: 'Turning what you built into résumé lines and interview stories' },
    ],
  },
];

export const appendices = [
  { title: 'Microsoft Access', note: 'A complete, beginner-friendly pathway: 12 parts, 38 figures and a full project' },
  { title: 'Airtable', note: 'Relational thinking in a modern no-code tool' },
  { title: 'Tableau', note: 'From query results to visual stories' },
  { title: 'DBCode', note: 'Working with databases from a code editor' },
];

export const faqs = [
  {
    q: 'Is this a PDF?',
    a: 'No. It is an interactive web book that works on a laptop, tablet or phone. You read, run SQL and check your understanding in one place, and the content is updated as tools change.',
  },
  {
    q: 'Do students need to install anything?',
    a: 'For most of the book, no. SQL runs right in the reader. The optional Microsoft Access appendix needs Access, which many campuses provide.',
  },
  {
    q: 'Who is it for?',
    a: 'Undergraduate business students taking an introductory database or MIS course, including those who have never written a line of code. It also works for Accounting Information Systems, business analytics and applied SQL courses.',
  },
  {
    q: 'Can I use only part of it?',
    a: 'Yes. Chapters 1–8 work as a business data-literacy course, Chapters 9–16 as an applied database and BI course, and the Access appendix stands on its own as a skills pathway.',
  },
  {
    q: 'I’m an instructor. Can I review it?',
    a: 'Absolutely. Request a review copy and we will set you up with the full reader, the chapter structure, labs and assessment materials.',
  },
];
