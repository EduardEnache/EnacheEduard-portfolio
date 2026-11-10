---
order: 4
title: "Grafana observability"
tagline: "One command-centre dashboard with a row per project."
status: live
year: 2026
live: health
numbers:
  - { value: 63, label: "panels on the command-centre dashboard" }
  - { value: 8, label: "rows, one per area or project" }
  - { value: 14, suffix: " days", label: "of metric history kept" }
  - { value: 6, label: "Prometheus scrape jobs" }
stack:
  - { group: Metrics and logs, items: [Prometheus, Loki, Alloy, cAdvisor, "node-exporter"] }
  - { group: Custom exporters, items: ["Python (standard library only)"] }
  - { group: Dashboards, items: [Grafana, "Provisioned from JSON in git", "SQL and PromQL panels"] }
facts:
  - { label: Dashboard, value: "one command centre, a row per project" }
  - { label: Retention, value: "14 days of metrics" }
story:
  - label: Problem
    title: "docker ps is not observability"
    text: "Several projects share one machine, and I wanted one screen that says whether all of it is fine, including a display that runs unattended on the hypervisor. I also wanted the same view to show what each project is doing, not only CPU and RAM."
    shot: "grafana/command-center.webp | Grafana command-center dashboard in dark mode: stat tiles for running services, targets up, CPU, memory and disk, then a table of running services by stack with CPU, memory and network, and graphs of CPU and memory per stack"
  - label: How it works
    title: "Standard collectors plus two small exporters"
    text: "Prometheus scrapes the containers, the VM and the Proxmox host. I wrote two exporters in plain Python: one turns the AnunțulCasei crawler status into metrics, the other reports traffic and errors for the public ONE·WAY demo. Alloy ships container logs to Loki, and Grafana loads dashboards and data sources from JSON files in git."
  - label: The hard part
    title: "Making it cheap and self-maintaining"
    text: "One cAdvisor metric group made the disk read hundreds of MB per second and pushed the load above 20 under its memory cap, so I switched it off after checking that no panel used it. Container panels filter on the Compose project label, so a new stack appears on its own and ad-hoc containers stay off. When the end-of-life log shipper was replaced by Alloy I kept the same labels, so no dashboard query had to change."
  - label: Result
    title: "Plain-language panels, edited in git"
    text: "The command centre has 63 panels in 8 rows, from the VM and Proxmox host to each project. A second dashboard for AnunțulCasei has a table that states in words what looks off, for example overdue or blocked crawlers, and it compares counts rather than percentages while the numbers are small. Dashboard edits go into git, because changes made only in the UI would sit in a volume without a backup."
screenshots:
  - "grafana/command-center.webp | Grafana command-center dashboard in dark mode: stat tiles for running services, targets up, CPU, memory and disk, then a table of running services by stack with CPU, memory and network, and graphs of CPU and memory per stack"
---
Prometheus, Loki and Alloy collect metrics and logs from every stack, cAdvisor covers the containers and custom
exporters cover the projects. Grafana ties it together in a single command-centre dashboard with a row per project.
