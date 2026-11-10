import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'retired', 'archived']),
    year: z.number(),
    url: z.url().optional(),
    flagship: z.boolean().optional(),
    stack: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
    // paths relative to design/assets/projects/, e.g. "oneway/landing.webp"
    screenshots: z.array(z.string()).default([]),
    numbers: z.array(z.object({ value: z.number(), prefix: z.string().optional(), suffix: z.string().optional(), label: z.string() })).max(4).optional(),
    // 3-4 scenes; `shot` is "path | alt" and its path must be one of this entry's screenshots
    story: z.array(z.object({ label: z.string(), title: z.string(), text: z.string(), shot: z.string().optional() })).min(3).max(4).optional(),
    // "How it works" flow map: stages left to right (top to bottom on phones); edges only point to a later stage. Generic role names only, never hosts, IPs, ports or people.
    flow: z.object({
      title: z.string(),
      intro: z.string().optional(),
      stages: z.array(z.object({
        label: z.string(),
        nodes: z.array(z.object({ id: z.string(), label: z.string(), note: z.string().optional(), kind: z.enum(['source', 'process', 'store', 'output']).optional() })).min(1),
      })).min(3).max(6),
      edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional(), main: z.boolean().optional() })).min(3),
    }).optional(),
    live: z.enum(['anuntulcasei', 'minecraft', 'health', 'monitoring', 'oneway', 'faelles', 'copenhagen-pass-maximizer', 'bucuresti-bites-vibes']).optional(),
  }).refine(
    (d) => (d.story ?? []).every((s) => !s.shot || d.screenshots.some((x) => x.split(' | ')[0].trim() === s.shot!.split(' | ')[0].trim())),
    { message: 'story.shot must be one of the entry screenshots' },
  ),
});

const cv = defineCollection({
  loader: file('./src/content/cv.json'),
  schema: z.object({
    summary: z.string(),
    roles: z.array(z.object({ title: z.string(), org: z.string(), place: z.string().optional(), start: z.string(), end: z.string(), bullets: z.array(z.string()).default([]), tools: z.string().optional() })),
    education: z.array(z.object({ title: z.string(), org: z.string(), start: z.string(), end: z.string(), detail: z.string().optional() })),
    skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    certifications: z.array(z.string()),
    workshops: z.array(z.string()).default([]),
    homelab: z.array(z.string()).default([]),
    languages: z.array(z.object({ name: z.string(), level: z.string() })),
  }),
});

export const collections = { projects, cv };
