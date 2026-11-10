/** Build-time layout of a project's "How it works" flow into plain geometry for two SVGs: stages as columns (wide) or rows (phone). No runtime measuring. */
export interface FlowNode { id: string; label: string; note?: string; kind?: 'source' | 'process' | 'store' | 'output' }
export interface FlowEdge { from: string; to: string; label?: string; main?: boolean }
export interface Flow { title: string; intro?: string; stages: { label: string; nodes: FlowNode[] }[]; edges: FlowEdge[] }

export interface Box { id: string; stage: number; kind: NonNullable<FlowNode['kind']>; x: number; y: number; w: number; h: number; label: string[]; note: string[]; ly: number; ny: number }
export interface Link { from: string; to: string; stage: number; main: boolean; title: string; d: string; head: string }
export interface Layout { w: number; h: number; boxes: Box[]; links: Link[]; stages: { text: string; x: number; y: number; ruleX: number; ruleW: number; ruleY: number }[] }

const LABEL = 15, NOTE = 13, LH_L = 19, LH_N = 16, PAD = 12, GLYPH = 16, GAP_Y = 22;
// text is estimated, not measured (the page ships no build-time font metrics): a slightly wide factor keeps wraps safe
const wrap = (text: string, px: number, fs: number, f: number, where: string, max: number) => {
  const per = Math.max(4, Math.floor(px / (fs * f))), lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > per) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  if (lines.some((l) => l.length > per)) throw new Error(`flow: "${where}" has a word too long for the node: reword it`);
  if (lines.length > max) throw new Error(`flow: "${where}" needs ${lines.length} lines (max ${max}): shorten it`);
  return lines;
};

export function layoutFlow(flow: Flow, mode: 'h' | 'v'): Layout {
  const n = flow.stages.length, H = mode === 'h', PORT = H ? 12 : 8; // PORT: spacing between edges that share a node side
  const W = H ? 1040 : 320, GX = n > 5 ? 48 : 72, G = 40; // G: left gutter that carries the arcs on phones
  const nodeW = H ? (W - (n - 1) * GX) / n : W - G;
  const ids = new Map<string, { s: number; node: FlowNode }>();
  flow.stages.forEach((st, s) => st.nodes.forEach((node) => { if (ids.has(node.id)) throw new Error(`flow: duplicate node ${node.id}`); ids.set(node.id, { s, node }); }));
  for (const e of flow.edges) {
    const a = ids.get(e.from), b = ids.get(e.to);
    if (!a || !b) throw new Error(`flow: edge ${e.from}->${e.to} names an unknown node`);
    if (b.s <= a.s) throw new Error(`flow: edge ${e.from}->${e.to} must point to a later stage`);
  }
  const inN = (id: string) => flow.edges.filter((e) => e.to === id).length, outN = (id: string) => flow.edges.filter((e) => e.from === id).length;

  const boxes: Box[] = [];
  flow.stages.forEach((st, s) => st.nodes.forEach((node) => {
    const label = wrap(node.label, nodeW - 2 * PAD - GLYPH, LABEL, 0.56, node.id, 3);
    const note = node.note ? wrap(node.note, nodeW - 2 * PAD, NOTE, 0.52, node.id + ' note', 5) : [];
    const slots = H ? Math.max(inN(node.id), outN(node.id)) : inN(node.id) + outN(node.id);
    const h = Math.max(PAD * 2 + label.length * LH_L + note.length * LH_N + (note.length ? 4 : 0), 22 + PORT * Math.max(slots - 1, 0), 40);
    boxes.push({ id: node.id, stage: s, kind: node.kind ?? 'process', x: 0, y: 0, w: nodeW, h, label, note, ly: 0, ny: 0 });
  }));

  const stages: Layout['stages'] = [];
  let total = 0;
  if (H) {
    const HEAD = 34, cols = flow.stages.map((_, s) => boxes.filter((b) => b.stage === s));
    const colH = cols.map((c) => c.reduce((a, b) => a + b.h, 0) + GAP_Y * (c.length - 1)), max = Math.max(...colH);
    cols.forEach((c, s) => {
      let y = HEAD + (max - colH[s]) / 2;
      c.forEach((b) => { b.x = s * (nodeW + GX); b.y = y; y += b.h + GAP_Y; });
      stages.push({ text: `${String(s + 1).padStart(2, '0')} ${flow.stages[s].label}`, x: s * (nodeW + GX), y: 12, ruleX: s * (nodeW + GX), ruleW: nodeW, ruleY: HEAD - 12 });
    });
    total = HEAD + max + 4;
  } else {
    let y = 0;
    flow.stages.forEach((st, s) => {
      stages.push({ text: `${String(s + 1).padStart(2, '0')} ${st.label}`, x: G, y: y + 12, ruleX: G, ruleW: nodeW, ruleY: y + 20 });
      y += 34;
      boxes.filter((b) => b.stage === s).forEach((b) => { b.x = G; b.y = y; y += b.h + 10; });
      y += 24;
    });
    total = y - 24 + 4;
  }
  for (const b of boxes) { b.ly = b.y + PAD + LABEL; b.ny = b.ly + (b.label.length - 1) * LH_L + 6 + NOTE; }

  const box = (id: string) => boxes.find((b) => b.id === id)!, cy = (b: Box) => b.y + b.h / 2;
  // port y on a node side: several edges spread around the middle, ordered by where the other end sits (fewer crossings)
  const spread = (b: Box, k: number, i: number) => b.y + b.h / 2 + (i - (k - 1) / 2) * Math.min(PORT, (b.h - 20) / Math.max(k - 1, 1));
  const links: Link[] = flow.edges.map((e) => {
    const a = box(e.from), t = box(e.to);
    let y1: number, y2: number;
    if (H) {
      const outs = flow.edges.filter((x) => x.from === e.from).sort((p, q) => cy(box(p.to)) - cy(box(q.to)));
      const ins = flow.edges.filter((x) => x.to === e.to).sort((p, q) => cy(box(p.from)) - cy(box(q.from)));
      y1 = spread(a, outs.length, outs.indexOf(e)); y2 = spread(t, ins.length, ins.indexOf(e));
    } else {
      const slot = (b: Box) => {
        const ins = flow.edges.filter((x) => x.to === b.id).sort((p, q) => cy(box(p.from)) - cy(box(q.from)));
        const outs = flow.edges.filter((x) => x.from === b.id).sort((p, q) => cy(box(p.to)) - cy(box(q.to)));
        return [...ins, ...outs];
      };
      const sa = slot(a), st = slot(t);
      y1 = spread(a, sa.length, sa.indexOf(e)); y2 = spread(t, st.length, st.indexOf(e));
    }
    const f = (v: number) => +v.toFixed(1);
    const nm = (id: string) => ids.get(id)!.node.label;
    let d: string, head: string;
    if (H) {
      const x1 = a.x + a.w, x2 = t.x, c = (x2 - x1) * 0.5;
      d = `M${f(x1)} ${f(y1)}C${f(x1 + c)} ${f(y1)} ${f(x2 - c)} ${f(y2)} ${f(x2)} ${f(y2)}`;
      head = `M${f(x2 - 6)} ${f(y2 - 3.5)}L${f(x2)} ${f(y2)}L${f(x2 - 6)} ${f(y2 + 3.5)}`;
    } else {
      const x = G, dx = Math.min(G - 10, 12 + 0.1 * Math.abs(y2 - y1));
      d = `M${x} ${f(y1)}C${x - f(dx)} ${f(y1)} ${x - f(dx)} ${f(y2)} ${x} ${f(y2)}`;
      head = `M${x - 6} ${f(y2 - 3.5)}L${x} ${f(y2)}L${x - 6} ${f(y2 + 3.5)}`;
    }
    return { from: e.from, to: e.to, stage: ids.get(e.from)!.s, main: !!e.main, title: `${nm(e.from)} to ${nm(e.to)}${e.label ? `: ${e.label}` : ''}`, d, head };
  });
  return { w: W, h: Math.ceil(total), boxes, links, stages };
}

/** The same story as text, in stage order: the text alternative to the drawing. */
export function flowSteps(flow: Flow) {
  const name = new Map(flow.stages.flatMap((s) => s.nodes.map((n) => [n.id, n.label] as const)));
  return flow.stages.flatMap((s) => s.nodes.map((n) => {
    const to = flow.edges.filter((e) => e.from === n.id);
    return { stage: s.label, label: n.label, note: n.note, to: to.map((e) => name.get(e.to) + (e.label ? ` (${e.label})` : '')) };
  }));
}
