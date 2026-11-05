import { useRef } from 'react';
import type { Step } from './types';
import { PAL, type GNode } from './lib';

const R = 22;
export type Mode = 'move' | 'add' | 'edge' | 'delete';
interface Props {
  nodes: GNode[]; edges: [number, number][]; step: Step | null; mode: Mode; sel: number | null;
  onNode: (i: number) => void; onBg: (x: number, y: number) => void;
  onEdge: (a: number, b: number) => void; onMove: (i: number, x: number, y: number) => void;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function path(A: GNode, B: GNode, off: number) {
  const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1;
  const c = { x: (A.x + B.x) / 2 - dy / l * off, y: (A.y + B.y) / 2 + dx / l * off };
  const to = (p: GNode, d: number) => { const x = c.x - p.x, y = c.y - p.y, m = Math.hypot(x, y) || 1; return { x: p.x + x / m * d, y: p.y + y / m * d }; };
  const s = to(A, R), e = to(B, R + 4);
  return `M${s.x} ${s.y}Q${c.x} ${c.y} ${e.x} ${e.y}`;
}

export default function Graph({ nodes, edges, step, mode, sel, onNode, onBg, onEdge, onMove }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef<number | null>(null);
  const pt = (e: React.PointerEvent) => {
    const svg = ref.current!, p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const et = new Map((step?.et ?? []).map(([a, b, t]) => [`${a}>${b}`, t]));
  const ix = new Map(nodes.map((n, i) => [n.id, i]));
  const mk = (id: string, c: string) => (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style={{ fill: c }} /></marker>);
  return (
    <svg ref={ref} viewBox="0 0 760 460" className="graph"
      onPointerDown={e => { if (e.target === e.currentTarget) { const p = pt(e); onBg(p.x, p.y); } }}
      onPointerMove={e => { if (drag.current !== null) { const p = pt(e); onMove(drag.current, clamp(p.x, 30, 730), clamp(p.y, 40, 430)); } }}
      onPointerUp={() => { drag.current = null; }}>
      <defs>{mk('a0', 'var(--gr)')}{mk('a1', 'var(--ac)')}{mk('a2', 'var(--tx)')}{mk('a3', 'var(--pu)')}</defs>
      {edges.map(([ida, idb]) => {
        const a = ix.get(ida)!, b = ix.get(idb)!, t = et.get(`${a}>${b}`);
        const act = step !== null && step.ea === a && step.eb === b;
        const off = edges.some(e => e[0] === idb && e[1] === ida) ? 26 : 0;
        let stroke = 'var(--gr)', w = 1.8, dash = '', m = 'a0';
        if (t === 1) { stroke = 'var(--tx)'; w = 2.4; m = 'a2'; }
        if (t === 2) { stroke = 'var(--pu)'; w = 2.4; dash = '6 4'; m = 'a3'; }
        if (t === 3) dash = '3 4';
        if (act) { stroke = 'var(--ac)'; w = 4; dash = ''; m = 'a1'; }
        const d = path(nodes[a], nodes[b], off);
        return (<g key={`${ida}>${idb}`}>
          <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} markerEnd={`url(#${m})`} />
          <path d={d} fill="none" stroke="transparent" strokeWidth={14} style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }}
            onPointerDown={() => mode === 'delete' && onEdge(ida, idb)} />
        </g>);
      })}
      {nodes.map((n, i) => {
        const vis = step ? step.idx[i] >= 0 : false, c = step && step.comp[i] >= 0 ? PAL[step.comp[i] % PAL.length] : null;
        const cur = step?.cur === i, on = step?.on[i] === 1;
        return (<g key={n.id} style={{ cursor: mode === 'move' ? 'grab' : 'pointer' }}
          onPointerDown={e => { e.stopPropagation(); if (mode === 'move') { drag.current = i; ref.current!.setPointerCapture(e.pointerId); } else onNode(i); }}>
          {on && <circle cx={n.x} cy={n.y} r={R + 5} fill="none" stroke="var(--bl)" strokeWidth={3} />}
          <circle cx={n.x} cy={n.y} r={R} fill={c ?? (vis ? 'var(--node)' : 'var(--card)')}
            stroke={cur ? 'var(--ac)' : sel === i ? 'var(--bl)' : 'var(--tx)'} strokeWidth={cur ? 5 : 2} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={15} fontWeight={700} style={{ fill: c ? '#fff' : 'var(--tx)', pointerEvents: 'none' }}>{n.id}</text>
          {vis && <text x={n.x} y={n.y - R - 9} textAnchor="middle" fontSize={12} style={{ fill: 'var(--tx)', pointerEvents: 'none' }}>i={step!.idx[i]} l={step!.low[i]}</text>}
        </g>);
      })}
    </svg>
  );
}
