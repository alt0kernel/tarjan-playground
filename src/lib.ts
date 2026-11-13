import { K, type Step } from './types';
export interface GNode { id: number; x: number; y: number }
export interface GraphData { nodes: GNode[]; edges: [number, number][] }
export const PAL = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#84cc16','#f97316','#6366f1'];
export const CODE = ['for each v in V:','  if v.index is undefined: strongconnect(v)','','strongconnect(v):',
  '  v.index = v.low = index++','  S.push(v); v.onStack = true','  for each edge (v → w):',
  '    if w.index is undefined:','      strongconnect(w)','      v.low = min(v.low, w.low)',
  '    else if w.onStack:','      v.low = min(v.low, w.index)','  if v.low == v.index:','    pop S until v; each is one SCC'];
const g = (p: number[][], e: [number, number][]): GraphData => ({ nodes: p.map((q, i) => ({ id: i, x: q[0], y: q[1] })), edges: e });
export const PRESETS: { name: string; g: GraphData }[] = [
  { name: 'Classic (3 SCCs + extras)', g: g([[90,90],[250,70],[170,200],[400,100],[520,70],[600,200],[460,230],[300,340]],
    [[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3],[2,7],[7,6],[6,5],[6,7]]) },
  { name: 'Two cycles linked', g: g([[100,150],[230,70],[230,240],[520,70],[520,240],[650,150]],
    [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]) },
  { name: 'One big cycle', g: g([[380,50],[600,150],[600,320],[380,410],[160,320],[160,150]],
    [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]) },
  { name: 'DAG (all singletons)', g: g([[100,230],[260,100],[260,360],[480,100],[480,360],[660,230]],
    [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[1,4]]) },
  { name: 'Cross-edge trap', g: g([[120,100],[320,100],[520,100],[220,300],[420,300]],
    [[0,1],[1,0],[2,1],[2,4],[4,3],[3,2],[0,3],[3,1]]) },
];
export function randomGraph(): GraphData {
  const n = 6 + Math.floor(Math.random() * 4);
  const nodes = Array.from({ length: n }, (_, i) => ({ id: i, x: 380 + 260 * Math.cos(i / n * 6.283), y: 230 + 170 * Math.sin(i / n * 6.283) }));
  const edges: [number, number][] = [];
  for (let t = 0; edges.length < Math.round(n * 1.5) && t < 200; t++) {
    const a = Math.floor(Math.random() * n), b = Math.floor(Math.random() * n);
    if (a !== b && !edges.some(e => e[0] === a && e[1] === b)) edges.push([a, b]);
  }
  return { nodes, edges };
}

export function message(s: Step | null, L: (i: number) => number, ok = true): string {
  if (!s) return 'Press Step or Play.';
  const v = L(s.cur), w = L(s.eb);
  switch (s.kind) {
    case K.OUTER: return `Outer loop: consider node ${v}.`;
    case K.CALL: return `${v} is unvisited → strongconnect(${v}).`;
    case K.VISIT: return `Visit ${v}: index = low = ${s.idx[s.cur]}.`;
    case K.PUSH: return `Push ${v} onto S.`;
    case K.EDGE: return `Examine edge ${v} → ${w}.`;
    case K.TREE: return `${w} is unvisited → tree edge; recurse into ${w}.`;
    case K.RETURN: return `Back in ${v}: low = min(${s.old}, low[${w}]=${s.low[s.eb]}) = ${s.low[s.cur]}.`;
    case K.BACK: return `${w} is on the stack → back edge: low[${v}] = min(${s.old}, index[${w}]=${s.idx[s.eb]}) = ${s.low[s.cur]}.`;
    case K.CROSS: return `${w} is already in a finished SCC → ignore (cross edge).`;
    case K.ROOT: return `low[${v}] = index[${v}] → ${v} is a root. Pop S down to ${v}: SCC #${s.comp[s.cur] + 1} = {${s.members.map(L).join(', ')}}.`;
    case K.NOTROOT: return `low[${v}]=${s.low[s.cur]} ≠ index[${v}]=${s.idx[s.cur]} → ${v} is not a root; it stays on S.`;
    default: return ok ? 'Done. Verified against an independent reachability check ✓' : 'Done, but verification FAILED ✗';
  }
}
