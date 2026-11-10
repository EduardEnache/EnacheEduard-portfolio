export const site = {
  name: 'Eduard Enache',
  role: 'QA Engineer',
  org: 'Orange Services, Bucharest',
  title: 'Eduard Enache | QA engineer and builder',
  description: 'Eduard Enache, QA engineer who builds things end to end: data pipelines, dashboards and self-hosted products.',
  pitch: 'QA engineer who builds things end to end: data pipelines, dashboards and self-hosted products, from the scraper to the monitoring.',
  subline: 'MSc Mobile Communications, 6G thesis graded 10/10.',
  coordinates: '55.67 N 12.57 E',
  // placeholder until the domain and mailbox exist
  email: 'hello@eduardenache.ro',
  linkedin: 'https://www.linkedin.com/in/eduard-florentin-enache',
  github: 'https://github.com/EduardEnache',
  cvPdf: '/cv/Eduard-Enache-CV.pdf',
  // From the build environment; empty means offline fallbacks / mailto
  apiBase: import.meta.env.PUBLIC_API_BASE ?? '',
  contactEndpoint: import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? '',
};

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'CV', href: '/cv/' },
  { label: 'Live', href: '/live/' },
  { label: 'Contact', href: '/contact/' },
];
