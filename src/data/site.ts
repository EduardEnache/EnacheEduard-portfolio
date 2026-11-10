export const site = {
  name: 'Eduard Enache',
  wordmark: 'Portfolio', // header link text; the name itself is in the hero, footer and meta
  role: 'QA Engineer',
  org: 'Orange Services, Bucharest',
  title: 'Eduard Enache | QA engineer and builder',
  description: 'Eduard Enache, QA engineer who builds things end to end: data pipelines, dashboards and self-hosted products.',
  pitch: 'QA engineer who builds things end to end: data pipelines, dashboards and self-hosted products, from the scraper to the monitoring.',
  subline: 'MSc Mobile Communications, 6G thesis graded 10/10.',
  coordinates: '55.67 N 12.57 E',
  email: 'eduardenache100@gmail.com',
  phone: '+40770826665', // international format; shown with spaces via phoneDisplay
  linkedin: 'https://www.linkedin.com/in/eduard-florentin-enache',
  github: 'https://github.com/EduardEnache',
  cvPdf: '/cv/Eduard-Enache-CV.pdf',
  // From the build environment; empty means offline fallbacks / mailto
  apiBase: import.meta.env.PUBLIC_API_BASE ?? '',
  contactEndpoint: import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? '',
};

export const phoneDisplay = site.phone.replace(/^(\+40)(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4');

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'CV', href: '/cv/' },
  { label: 'Live', href: '/live/' },
  { label: 'Contact', href: '/contact/' },
];
