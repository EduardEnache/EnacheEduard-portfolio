import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'retired', 'archived']),
    year: z.number(),
    url: z.string().url().optional(),
    stack: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
    // paths relative to design/assets/projects/, e.g. "oneway/landing.webp"
    screenshots: z.array(z.string()).default([]),
  }),
});

const cv = defineCollection({
  loader: file('./src/content/cv.json'),
  schema: z.object({
    roles: z.array(z.object({ title: z.string(), org: z.string(), place: z.string().optional(), start: z.string(), end: z.string() })),
    education: z.array(z.object({ title: z.string(), org: z.string(), start: z.string(), end: z.string(), detail: z.string().optional() })),
    skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    certifications: z.array(z.string()),
    languages: z.array(z.object({ name: z.string(), level: z.string() })),
  }),
});

export const collections = { projects, cv };
