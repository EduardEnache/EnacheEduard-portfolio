---
order: 4
title: "Grafana observability"
tagline: "One command-centre dashboard with a row per project."
status: live
year: 2026

stack:
  - { group: Metrics and logs, items: [Prometheus, Loki, Alloy, cAdvisor] }
  - { group: Dashboards, items: [Grafana, "Custom exporters"] }
facts:
  - { label: Dashboard, value: "one command centre, a row per project" }
screenshots: []
---
Prometheus, Loki and Alloy collect metrics and logs from every stack, cAdvisor covers the containers and custom
exporters cover the projects. Grafana ties it together in a single command-centre dashboard with a row per project.
