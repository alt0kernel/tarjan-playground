import { CODE, PAL, type GNode } from './lib';
import { K, type Step, type Trace } from './types';

export function CodePanel({ line }: { line: number }) {
  return <pre>{CODE.map((t, i) => <div key={i} className={i === line ? 'hl' : ''}>{t || ' '}</div>)}</pre>;
}

const Empty = () => <span style={{ color: 'var(--mu)' }}>empty</span>;

export function StatePanel({ nodes, step, trace }: { nodes: GNode[]; step: Step | null; trace: Trace | null }) {
  const L = (i: number) => nodes[i]?.id;
  const groups: number[][] = [];
  step?.comp.forEach((c, i) => { if (c >= 0) (groups[c] ??= []).push(i); });
  return (<>
    <div className="card"><h2>Stack S (bottom → top)</h2>
      <div className="stk">{step?.stack.length ? step.stack.map(v => <span key={v} className="chip" style={{ borderColor: 'var(--bl)' }}>{L(v)}</span>) : <Empty />}</div>
      <h2 style={{ marginTop: 10 }}>Recursion call stack</h2>
      <div className="stk">{step?.calls.length ? step.calls.map((v, k) => <span key={k} className="chip">{L(v)}</span>) : <Empty />}</div>
      <h2 style={{ marginTop: 10 }}>SCCs found {step?.kind === K.DONE && trace &&
        <span className="badge" style={{ background: trace.verified ? 'var(--ok)' : '#dc2626' }}>{trace.verified ? '✓ verified' : '✗ mismatch'}</span>}</h2>
      <div>{groups.length ? groups.map((g, i) => g && <span key={i} className="chip" style={{ background: PAL[i % PAL.length], color: '#fff', borderColor: 'transparent' }}>{'{' + g.map(L).join(', ') + '}'}</span>) : <span style={{ color: 'var(--mu)' }}>none yet</span>}</div>
    </div>
    <div className="card"><h2>Node state</h2>
      <table><thead><tr><th>node</th><th>index</th><th>low</th><th>onStack</th><th>SCC</th></tr></thead>
        <tbody>{nodes.map((n, i) => {
          const seen = step && step.idx[i] >= 0;
          return <tr key={n.id} className={step?.cur === i ? 'act' : ''}><td><b>{n.id}</b></td><td>{seen ? step!.idx[i] : '–'}</td>
            <td>{seen ? step!.low[i] : '–'}</td><td>{seen ? (step!.on[i] ? '✓' : '✗') : '–'}</td><td>{step && step.comp[i] >= 0 ? '#' + (step.comp[i] + 1) : '–'}</td></tr>;
        })}</tbody></table>
    </div>
  </>);
}
