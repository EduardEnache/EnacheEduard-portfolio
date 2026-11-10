---
order: 3
title: "ONE·WAY"
tagline: "An Instagram follow-graph analyzer that runs entirely in your browser."
status: live
year: 2026
live: oneway
numbers:
  - { value: 0, label: "network requests during analysis" }
  - { value: 0, label: "build steps: plain files, nginx" }
  - { value: 20, label: "bytes per account in a saved snapshot" }
  - { value: 8, label: "anonymous event names, demo" }
stack:
  - { group: Frontend, items: ["Vanilla JS (ES modules)", CSS, "Browser DecompressionStream"] }
  - { group: Delivery, items: [nginx, Docker, "Cloudflare Pages (public demo)"] }
  - { group: Quality, items: ["In-browser test runner", "Strict CSP"] }
facts:
  - { label: Privacy, value: "nothing is uploaded" }
  - { label: Enforced by, value: "CSP connect-src 'none'" }
story:
  - label: Problem
    title: "Free, and without handing over your data"
    text: "Sites that show who does not follow you back put the useful views behind a paywall and ask for a login or an upload of personal data. I wanted every view free, with no account, and with a privacy claim the visitor can check instead of trusting me."
    shot: "oneway/landing.webp | ONE·WAY landing screen in dark mode: a drop zone for the Instagram export, a note that it runs in this tab with no upload, and four steps to request the export"
  - label: How it works
    title: "The browser does all the work"
    text: "You drop Instagram's export zip on the page. The browser unpacks it with its built-in decompression API, plain JavaScript analyzes the JSON, and the app shows non-followers, fans, mutuals, requests, blocked accounts and changes between two exports. The server only ever sends static files."
    shot: "oneway/dashboard.webp | ONE·WAY dashboard: follower and following counts, a followers-over-time chart and a breakdown of mutuals, non-followers and fans,"
  - label: The hard part
    title: "Privacy the browser enforces, and honest limits"
    text: "The server sends a content security policy with connect-src 'none', so the browser blocks every outgoing request from the page, and you can confirm it in the network tab. The export has no stable account IDs, so 'unfollowed you' is a guess: I flag likely renames by matching follow timestamps and label the result as probable. Contact matching shows its confidence and reasons and defaults to high-confidence matches only."
  - label: Result
    title: "A public demo that keeps the promise"
    text: "A public demo runs the same app files with a relaxed policy that allows only an analytics beacon and an error tunnel. It records eight event names, bucketed counts and no usernames, file names or cookies, and the self-hosted image keeps the strict policy. The parser has an in-browser test suite, and I checked counts against a real export."
    shot: "oneway/non-followers.webp | ONE·WAY non-followers list in light mode: a searchable table of accounts with the date each was followed, using scrambled sample names"
screenshots:
  - "oneway/landing.webp | ONE·WAY landing screen in dark mode: a drop zone for the Instagram export, a note that it runs in this tab with no upload, and four steps to request the export"
  - "oneway/dashboard.webp | ONE·WAY dashboard: follower and following counts, a followers-over-time chart and a breakdown of mutuals, non-followers and fans,"
  - "oneway/non-followers.webp | ONE·WAY non-followers list in light mode: a searchable table of accounts with the date each was followed, using scrambled sample names"
---
ONE·WAY reads an Instagram data export and shows who does not follow back. Everything happens in the page: the content
security policy sets `connect-src 'none'`, so the app cannot send your data anywhere even if it wanted to.
