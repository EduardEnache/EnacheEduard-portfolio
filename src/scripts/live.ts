import { site } from '../data/site';

/** GET `${PUBLIC_API_BASE}${path}` as JSON; null when unset, slow (timeout) or failing. */
export async function fetchLive<T = Record<string, string | number>>(path: string, timeoutMs = 4000): Promise<T | null> {
  if (!site.apiBase) return null;
  try {
    const res = await fetch(site.apiBase.replace(/\/$/, '') + path, { signal: AbortSignal.timeout(timeoutMs) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Fill every [data-field] inside each [data-live="/path"] block; on failure keep the static fallback text. */
export async function hydrateLive(root: ParentNode = document) {
  await Promise.all(
    [...root.querySelectorAll<HTMLElement>('[data-live]')].map(async (block) => {
      const data = await fetchLive(block.dataset.live!);
      if (!data) return;
      block.querySelectorAll<HTMLElement>('[data-field]').forEach((el) => {
        const v = data[el.dataset.field!];
        if (v !== undefined) el.textContent = String(v);
      });
      block.dataset.state = 'live';
      block.querySelector('[data-status]')!.textContent = 'Live';
    }),
  );
}
