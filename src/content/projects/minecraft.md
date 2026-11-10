---
order: 5
title: "Minecraft SMP"
tagline: "A Fabric vanilla+ server for friends, with live status from the homelab."
status: live
year: 2026
live: minecraft
numbers:
  - { value: 6, suffix: " h", label: "between world backups" }
  - { value: 7, suffix: " days", label: "of snapshots kept" }
  - { value: 95, suffix: "%", label: "less backup disk (incremental)" }
  - { value: 1, label: "server-side mod written by me" }
stack:
  - { group: Server, items: [Fabric, "Vanilla+", "Java 25", Datapacks] }
  - { group: Mods, items: [Lithium, FerriteCore, Chunky, BlueMap, "Own villager and chunk-loading mod"] }
  - { group: Operations, items: [restic, "Telegram bot", "Python sidecar", Docker] }
facts:
  - { label: Map, value: "public BlueMap" }
  - { label: Leaderboard, value: "deaths" }
  - { label: Backups, value: "every 6 hours, 7 days kept" }
story:
  - label: Problem
    title: "Vanilla survival that nobody has to install anything for"
    text: "Friends wanted a survival server that plays like the real game. I picked Fabric with server-side-only mods instead of Paper, because Paper changes redstone and duplication behaviour, and nobody needs a client mod to join."
    shot: "minecraft/bluemap.webp | The public BlueMap web map seen from above: forests, olive plateaus, rivers and a large bay, with a marker at the world spawn"
  - label: How it works
    title: "A sidecar that reads the log"
    text: "A small Python service with no dependencies tails the server log. It posts joins and deaths to a Telegram group, builds the death leaderboard and playtime stats, and checks server status with the game's own list ping, cached for 15 seconds. Failures degrade one feature at a time, and it never crash-loops. BlueMap renders the public map, and the Live page of this site reads the same status and leaderboard."
  - label: The hard part
    title: "Changing the game without breaking it"
    text: "I wrote a server-side mod so zombies always convert villagers and cured villagers give shared discounts. I tested the conversion 10 times out of 10 before trusting it. Because the mod has to be rebuilt for each Minecraft version, upgrades go through a script that checks mod readiness first, and the weekly auto-update skips this stack. Everyone joins from the same local address behind the tunnel, so I turned off login sessions to stop one player taking over another's name."
  - label: Result
    title: "Backups that fit the disk"
    text: "Backups had grown to 99 GB, because each full archive included the rendered map. I switched to incremental snapshots, left the map render out, and the folder dropped to 4.6 GB. I restored a full world from a snapshot to prove it works, and snapshots now run every 6 hours and are kept for 7 days."
screenshots:
  - "minecraft/bluemap.webp | The public BlueMap web map seen from above: forests, olive plateaus, rivers and a large bay, with a marker at the world spawn"
flow:
  title: "From the game log to the map and the feed"
  intro: "The server itself stays plain vanilla+. A small sidecar reads what it writes and turns that into a feed, a leaderboard, a status and backups."
  stages:
    - label: Play
      nodes:
        - { id: server, label: Fabric server, note: "Vanilla+, server-side mods only", kind: source }
    - label: Record
      nodes:
        - { id: log, label: Server log, kind: store }
        - { id: world, label: World data, kind: store }
    - label: Process
      nodes:
        - { id: sidecar, label: Python sidecar, note: "Tails the log; checks status with the game's list ping", kind: process }
        - { id: bluemap, label: BlueMap render, kind: process }
        - { id: backup, label: Incremental backups, note: "Every 6 hours, 7 days kept", kind: output }
    - label: Publish
      nodes:
        - { id: tg, label: Telegram feed, note: "Joins and deaths", kind: output }
        - { id: board, label: Leaderboard and status, note: "Read by the Live page of this site", kind: output }
        - { id: map, label: Public map, kind: output }
  edges:
    - { from: server, to: log, main: true }
    - { from: server, to: world }
    - { from: log, to: sidecar, main: true }
    - { from: world, to: bluemap }
    - { from: world, to: backup }
    - { from: sidecar, to: tg, main: true }
    - { from: sidecar, to: board }
    - { from: bluemap, to: map }
---
A vanilla+ survival server for friends with a public BlueMap, a death leaderboard, a Telegram feed of server events and
backups. Its live status and leaderboard are served from the homelab to the Live page of this site.
