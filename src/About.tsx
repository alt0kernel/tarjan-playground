import { FEATURES, toUrl, type FeatureKey, type Features } from './features';
import { PAL } from './lib';


const GITHUB_URL = 'https://github.com/alt0kernel/tarjan-playground.git';
const WIKI = 'https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm';
const CPA = 'https://cp-algorithms.com/graph/strongly-connected-components.html';
const GH = (t: string) => GITHUB_URL ? <a href={GITHUB_URL}>{t}</a> : <>{t}</>;

const Sw = ({ style, children }: { style: React.CSSProperties; children: React.ReactNode }) =>
  <li><i className="sw" style={style} />{children}</li>;

export default function About({ features, toggle }: { features: Features; toggle: (k: FeatureKey) => void }) {
  return (
    <article id="about" className="about">
      <section>
        <h3>Um, What Is Tarjan’s Algorithm?</h3>
        <p>It’s a technique for splitting a directed graph into its <b>strongly connected components</b> (SCCs): maximal groups of
          nodes where every node can reach every other node by following edges. It does this with a single depth-first search,
          so it runs in time proportional to the number of nodes plus edges. First, every node is visited at most once and stamped
          with a discovery number, its <code>index</code>. Next, each node keeps track of the earliest node it can get back to
          through the stack, its <code>low</code> value. Finally, whenever a node can’t reach anything earlier than itself, it is
          the root of a component and everything above it on the stack is popped off as one SCC. For a more detailed walk-through,
          the <a href={WIKI}>Wikipedia article</a> is a good place to start. For worked code, try the <a href={CPA}>CP-Algorithms
          page</a>. The original paper is Robert E. Tarjan’s <i>Depth-First Search and Linear Graph Algorithms</i> (SIAM Journal on
          Computing, 1972).</p>
      </section>

      <section>
        <h3>What Are index and low?</h3>
        <p><code>index[v]</code> is the order in which DFS first reached <code>v</code>. <code>low[v]</code> is the smallest index
          reachable from <code>v</code> using any number of tree edges followed by at most one back edge to a node still on the
          stack. If <code>low[v] == index[v]</code>, nothing in <code>v</code>’s subtree escapes upward, so <code>v</code> and
          everything above it on the stack form a component.</p>
        <p>An edge to a node that already belongs to a finished SCC is ignored. That is the “cross edge” case, and it is the reason
          the algorithm needs the <code>onStack</code> flag at all. Try the <b>Cross-edge trap</b> graph to see it happen.</p>
      </section>

      <section>
        <h3>This Is Cool, Can I Repurpose It?</h3>
        <p>Please do! {GH('The source is on GitHub')}{GITHUB_URL} with the hope that it can make
          graph algorithms a little easier to learn. I've also provided some controls below to enable you to tailor the playground
          to a specific topic or lesson. Just choose which features you’d like to be visible, then save <a href={toUrl(features)}>this
          link</a>, or <a href="" onClick={e => { e.preventDefault(); location.reload(); }}>refresh</a> the page.</p>
        <div className="toggles">
          {FEATURES.map(f => <label key={f.key}><input type="checkbox" checked={features[f.key]} onChange={() => toggle(f.key)} />{f.label}</label>)}
        </div>
      </section>

      <section>
        <h3>What Do All the Colors Mean?</h3>
        <p>Colors are used in a few different ways, so here is the full key.</p>
        <ul className="key">
          <Sw style={{ borderTop: '4px solid var(--ac)' }}><b>Current edge:</b> the edge being examined right now. The node with the thick amber outline is the one the DFS is working on.</Sw>
          <Sw style={{ borderTop: '3px solid var(--tx)' }}><b>Tree edge:</b> leads to an unvisited node, so the DFS recurses into it.</Sw>
          <Sw style={{ borderTop: '3px dashed var(--pu)' }}><b>Back edge:</b> leads to a node that is still on the stack. This is what lowers <code>low</code> values.</Sw>
          <Sw style={{ borderTop: '3px dotted var(--gr)' }}><b>Cross edge:</b> leads into an SCC that is already finished. It is ignored.</Sw>
          <Sw style={{ border: '3px solid var(--bl)', borderRadius: '50%', height: 16, width: 16 }}><b>Blue ring:</b> the node is currently on the stack S.</Sw>
          <Sw style={{ background: 'var(--node)', border: '2px solid var(--tx)', borderRadius: '50%', height: 16, width: 16 }}><b>Grey fill:</b> visited, but not yet assigned to a component.</Sw>
        </ul>
        <p>Once a component is popped, all of its nodes are filled with the same color, and the matching chip appears under “SCCs found”.
          The palette cycles after ten components:</p>
        <div>{PAL.map((c, i) => <span key={c} className="chip" style={{ background: c, color: '#fff', borderColor: 'transparent' }}>#{i + 1}</span>)}</div>
      </section>

      <section>
        <h3>What Library Are You Using?</h3>
        <p>There isn’t one for the algorithm itself. Tarjan’s algorithm is written from scratch in C++ and compiled to WebAssembly with
          Emscripten. It records every step of the run as a trace, and the page simply replays that trace. The interface is React and
          TypeScript, built with Vite. Each result is also checked against an independent reachability test, which is where the
          “verified” badge comes from.</p>
      </section>

      <section>
        <h3>Credits</h3>
        <p>Tarjan’s algorithm was published by Robert E. Tarjan in 1972. This playground is inspired by the interactive style of
          <a href="https://playground.tensorflow.org"> TensorFlow Playground</a> by Daniel Smilkov and Shan Carter.</p>
      </section>
    </article>
  );
}
