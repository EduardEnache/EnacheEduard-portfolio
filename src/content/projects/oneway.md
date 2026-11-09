---
order: 3
title: "ONE·WAY"
tagline: "An Instagram follow-graph analyzer that runs entirely in your browser."
status: live
year: 2026

stack:
  - { group: Frontend, items: [Vanilla JS, "No build step"] }
facts:
  - { label: Privacy, value: "nothing is uploaded" }
  - { label: Enforced by, value: "CSP connect-src 'none'" }
screenshots: [oneway/landing.webp, oneway/dashboard.webp, oneway/non-followers.webp]
---
ONE·WAY reads an Instagram data export and shows who does not follow back. Everything happens in the page: the content
security policy sets `connect-src 'none'`, so the app cannot send your data anywhere even if it wanted to.
