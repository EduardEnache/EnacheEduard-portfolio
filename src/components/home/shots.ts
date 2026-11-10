import type { ImageMetadata } from 'astro';

export interface CardShot { src: ImageMetadata; alt: string }
const images = import.meta.glob<ImageMetadata>('/design/assets/projects/*/*.webp', { eager: true, import: 'default' });

/** Resolve a project's "path | alt" screenshot entries to imported images. */
export function shotsOf(entries: string[]): CardShot[] {
  return entries
    .map((s) => { const [path, alt] = s.split(' | '); return { src: images[`/design/assets/projects/${path}`], alt: alt ?? '' }; })
    .filter((s) => s.src);
}
