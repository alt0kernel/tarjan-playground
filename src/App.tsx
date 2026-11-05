import { useEffect, useMemo, useState } from 'react';
import { runTarjan } from './wasm';
import type { Trace } from './types';
import { PRESETS, randomGraph, message, type GraphData } from './lib';
import Graph, { type Mode } from './Graph';
import { CodePanel, StatePanel } from './Panels';

const HINT: Record<Mode, string> = { move: 'drag nodes', add: 'click empty space to add a node', edge: 'click a node, then another, to add an edge', delete: 'click a node or an edge to delete it' };

export default function App() {
  const [g, setG] = useState<GraphData>(() => structuredClone(PRESETS[0].g));
  const [trace, setTrace] = useState<Trace | null>(null);
  const [pos, setPos] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [mode, setMode] = useState<Mode>('move');
  const [sel, setSel] = useState<number | null>(null);
  const [err, setErr] = useState('');

  // Re-run the C++ algorithm only when topology changes (not when nodes are dragged).
  const key = useMemo(() => JSON.stringify([g.nodes.map(n => n.id), g.edges]), [g]);
  useEffect(() => {
    let dead = false; setPos(-1); setPlaying(false);
    if (!g.nodes.length) { setTrace({ steps: [], sccs: [], comp: [], verified: true }); return; }
    const ix = new Map(g.nodes.map((n, i) => [n.id, i]));
    const dense = g.edges.map(([a, b]) => [ix.get(a)!, ix.get(b)!] as [number, number]);
    runTarjan(g.nodes.length, dense).then(t => { if (!dead) { setTrace(t); setErr(''); } })
      .catch(e => { if (!dead) setErr(String(e)); });
    return () => { dead = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const last = (trace?.steps.length ?? 0) - 1;
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPos(p => Math.min(p + 1, last)), 1100 - speed * 100);
    return () => clearInterval(t);
  }, [playing, speed, last]);
  useEffect(() => { if (pos >= last) setPlaying(false); }, [pos, last]);

  const step = trace && pos >= 0 ? trace.steps[pos] : null;
  const label = (i: number) => g.nodes[i]?.id;
  const edit = (f: (d: GraphData) => GraphData) => { setG(f); setSel(null); };
  const pick = (m: Mode) => { setMode(m); setSel(null); };

  const onNode = (i: number) => {
    const id = g.nodes[i].id;
    if (mode === 'delete') edit(d => ({ nodes: d.nodes.filter(n => n.id !== id), edges: d.edges.filter(e => e[0] !== id && e[1] !== id) }));
    else if (mode === 'edge') {
      if (sel === null) setSel(id);
      else { const a = sel; edit(d => a === id || d.edges.some(e => e[0] === a && e[1] === id) ? d : { ...d, edges: [...d.edges, [a, id]] }); }
    }
  };
  const onBg = (x: number, y: number) => {
    if (mode === 'add') edit(d => ({ ...d, nodes: [...d.nodes, { id: Math.max(-1, ...d.nodes.map(n => n.id)) + 1, x, y }] }));
    else setSel(null);
  };

  return (<>
    <header><h1>Tarjan’s Strongly Connected Components</h1>
      <span>Algorithm in C++ → WebAssembly · UI in React</span></header>
    <div className="bar">
      <button className="p" disabled={!trace} onClick={() => { if (pos >= last) setPos(-1); setPlaying(p => !p); }}>{playing ? '⏸ Pause' : '▶ Play'}</button>
      <button disabled={!trace} onClick={() => { setPlaying(false); setPos(p => Math.min(p + 1, last)); }}>Step ⏭</button>
      <button disabled={!trace} onClick={() => { setPlaying(false); setPos(last); }}>Run to end</button>
      <button onClick={() => { setPlaying(false); setPos(-1); }}>⟲ Reset</button>
      <label>Speed <input type="range" min={1} max={10} value={speed} onChange={e => setSpeed(+e.target.value)} /></label>
      <span className="sep" />
      <label>Graph <select onChange={e => edit(() => structuredClone(PRESETS[+e.target.value].g))}>{PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select></label>
      <button onClick={() => edit(randomGraph)}>🎲 Random</button>
      <span className="sep" />
      {([['move', '✥ Move'], ['add', '＋ Node'], ['edge', '→ Edge'], ['delete', '✕ Delete']] as [Mode, string][]).map(([m, t]) =>
        <button key={m} className={mode === m ? 'on' : ''} onClick={() => pick(m)}>{t}</button>)}
    </div>
    {err && <div className="err">Could not load the WebAssembly module: {err}. Did you run <code>npm run build:wasm</code>?</div>}
    <main>
      <div className="card"><h2>Graph — {HINT[mode]}</h2>
        <Graph nodes={g.nodes} edges={g.edges} step={step} mode={mode} sel={sel === null ? null : g.nodes.findIndex(n => n.id === sel)}
          onNode={onNode} onBg={onBg}
          onEdge={(a, b) => edit(d => ({ ...d, edges: d.edges.filter(e => !(e[0] === a && e[1] === b)) }))}
          onMove={(i, x, y) => setG(d => ({ ...d, nodes: d.nodes.map((n, k) => k === i ? { ...n, x, y } : n) }))} />
        <div className="msg">{message(step, label, trace?.verified)}</div>
        <div className="legend"><span><i style={{ borderColor: 'var(--ac)' }} />current edge</span><span><i style={{ borderColor: 'var(--tx)' }} />tree edge</span>
          <span><i style={{ borderColor: 'var(--pu)', borderTopStyle: 'dashed' }} />back edge</span><span><i style={{ borderColor: 'var(--gr)', borderTopStyle: 'dashed' }} />cross edge (ignored)</span></div>
      </div>
      <div className="side">
        <div className="card"><h2>Pseudocode</h2><CodePanel line={step?.line ?? -1} /></div>
        <StatePanel nodes={g.nodes} step={step} trace={trace} />
      </div>
    </main>
  </>);
}
