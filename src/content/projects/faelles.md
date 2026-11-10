---
order: 6
title: "fælles."
tagline: "A shared trip photo and video app with resumable uploads and a map."
status: retired
year: 2026
live: faelles
numbers:
  - { value: 146, label: "automated tests" }
  - { value: 2, label: "phone families tested" }
  - { value: 1, label: "container, one Node + SQLite" }
stack:
  - { group: Backend, items: [Node 22, Fastify, "tus resumable uploads", "SQLite (WAL)"] }
  - { group: Media, items: [exiftool, libvips, ffmpeg] }
  - { group: Frontend, items: ["React 19", Vite, Zustand, MapLibre] }
  - { group: Quality, items: [Vitest, Playwright] }
facts:
  - { label: Tests, value: "146" }
  - { label: Retired, value: "October 2026" }
story:
  - label: Problem
    title: "A group chat squeezes every photo"
    text: "On a trip to Denmark with two iPhones and two Androids, the group chat compressed everything and videos failed over roaming data. I built one shared album of originals that opens with a link and a four-digit PIN, with no accounts."
    shot: "faelles/library.webp | fælles. library on a phone: a trip summary, a featured memory film, filter chips and a day section with a row of thumbnails above a bottom navigation bar"
  - label: How it works
    title: "One container, one database file"
    text: "A Fastify server accepts resumable uploads, queues each file in a durable job queue, and uses exiftool, libvips and ffmpeg to read the capture time and GPS and make thumbnails and previews. Everything sits in one SQLite file and one storage folder. Server-sent events push new items to every phone, and a map groups photos by where they were taken."
    shot: "faelles/pin.webp | fælles. PIN screen: a welcome heading, four code boxes and a numeric keypad"
  - label: The hard part
    title: "Four phones, four ways to fail"
    text: "iOS can take a long time to copy originals out of the photo library, so each pick keeps its own file input alive until the upload ends. On Android I moved the upload bytes to the browser's download manager so they continue with the screen locked, and copied files into plain blobs because Chrome sent empty bodies for input-backed files. Photos from iOS 26 had no previews until I moved the image to a base that ships a newer HEIC library."
  - label: Result
    title: "Tested end to end, then retired"
    text: "146 automated tests cover the server and the upload flow, with end-to-end runs at phone and desktop sizes. Capture times are tested against synthetic files for each phone family, PIN attempts are throttled and uploads are refused before the disk fills. The trip ended and I retired the app and archived the repository."
    shot: "faelles/who.webp | fælles. 'Who's this?' screen: four circular avatars with placeholder names to choose from"
screenshots:
  - "faelles/library.webp | fælles. library on a phone: a trip summary, a featured memory film, filter chips and a day section with a row of thumbnails above a bottom navigation bar"
  - "faelles/pin.webp | fælles. PIN screen: a welcome heading, four code boxes and a numeric keypad"
  - "faelles/who.webp | fælles. 'Who's this?' screen: four circular avatars with placeholder names to choose from"
flow:
  title: "From a phone to a shared album"
  intro: "One container and one database file. Originals go in, and every phone in the group sees them arrive."
  stages:
    - label: Phone
      nodes:
        - { id: phone, label: Pick photos and videos, note: "Opened with a link and a four-digit PIN, no accounts", kind: source }
    - label: Upload
      nodes:
        - { id: tus, label: Resumable upload, note: "Continues after a dropped connection", kind: process }
    - label: Process
      nodes:
        - { id: media, label: Media processing, note: "Queued; reads capture time and GPS, makes previews", kind: process }
    - label: Store
      nodes:
        - { id: store, label: SQLite file + storage folder, note: "Originals untouched", kind: store }
    - label: Show
      nodes:
        - { id: sse, label: Live updates, note: "Server-sent events to every phone", kind: output }
        - { id: map, label: Map, note: "Photos grouped by where they were taken", kind: output }
        - { id: lib, label: Library, note: "By day, full-size originals", kind: output }
  edges:
    - { from: phone, to: tus, main: true }
    - { from: tus, to: media, main: true }
    - { from: media, to: store, main: true }
    - { from: store, to: sse, main: true }
    - { from: store, to: map }
    - { from: store, to: lib }
---
Built for a trip to Denmark: everyone uploads photos and videos, uploads resume after a dropped connection, and a map
shows where each photo was taken. Retired after the trip.
