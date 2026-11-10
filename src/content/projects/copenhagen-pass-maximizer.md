---
order: 7
title: "Copenhagen Pass Maximizer"
tagline: "A trip planner that works out which city card pays off."
status: retired
year: 2026
live: copenhagen-pass-maximizer
numbers:
  - { value: 73, label: "automated tests" }
  - { value: 5, label: "itinerary variants per trip" }
  - { value: 96, suffix: " h", label: "card validity it is built around" }
stack:
  - { group: App, items: [Vite, React, TypeScript, "React Router"] }
  - { group: Offline, items: ["PWA service worker"] }
  - { group: Quality, items: [Vitest, "Data integrity tests"] }
  - { group: Delivery, items: [nginx, Docker] }
facts:
  - { label: Tests, value: "73" }
  - { label: Retired, value: "October 2026" }
story:
  - label: Problem
    title: "A city card only pays off if the plan is feasible"
    text: "City passes are sold on 'save up to X%'. Whether they save money depends on opening hours, one-visit-per-attraction rules, transit times and the exact minute the card expires, and nobody checks those. I built a planner that checks them for one real trip."
    shot: "copenhagen/overview.webp | Copenhagen Pass Maximizer trip overview in light mode: departure and card-expiry cards, a card validity bar and a side panel with top warnings"
  - label: How it works
    title: "Research as typed data, rules as pure functions"
    text: "Every attraction, price, opening hour and pass rule is a typed constant with a source link. Pass expiry, feasibility and the warning engine are pure functions with no I/O, and the React UI only displays their results. Five itinerary variants, such as rainy day or low energy, can be switched per day."
    shot: "copenhagen/itinerary-dark.webp | Itinerary page in dark mode: plan variant buttons, day tabs and a day timeline with a confirmed-flight notice and a warning"
  - label: The hard part
    title: "Edge cases that quietly cost money"
    text: "Does a train count if the journey ends after the card expires, and does a daylight-saving change shift the expiry? I wrote tests for expiry, exclusivity, DST and the 72-hour versus 96-hour difference. A data integrity suite fails if any fact lacks a source citation or a fallback block points nowhere, so the research is checked like code."
    shot: "copenhagen/calculator.webp | Calculator page in light mode: inputs for party size, card type, duration and activation time beside a pass status panel"
  - label: Result
    title: "Usable on patchy roaming data"
    text: "The finished app is an installable offline PWA, so it keeps working abroad on a weak connection, and it has 73 automated tests. Its warning engine flagged visits outside opening hours and unverified facts before the trip. After the trip I retired it."
    shot: "copenhagen/mobile.webp | Mobile itinerary view with the day header, plan variant chips and a bottom navigation bar"
screenshots:
  - "copenhagen/overview.webp | Copenhagen Pass Maximizer trip overview in light mode: departure and card-expiry cards, a card validity bar and a side panel with top warnings"
  - "copenhagen/calculator.webp | Calculator page in light mode: inputs for party size, card type, duration and activation time beside a pass status panel"
  - "copenhagen/itinerary-dark.webp | Itinerary page in dark mode: plan variant buttons, day tabs and a day timeline with a confirmed-flight notice and a warning"
  - "copenhagen/mobile.webp | Mobile itinerary view with the day header, plan variant chips and a bottom navigation bar"
---
A trip planner for Copenhagen that works out which city card pays off for the attractions you actually plan to see.
Retired after the trip.
