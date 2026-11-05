import createTarjanModule from './wasm/tarjan.js';
import type { Trace } from './types';

let mod: ReturnType<typeof createTarjanModule> | null = null;

/** Runs the C++ (WebAssembly) Tarjan implementation. Nodes are 0..n-1. */
export async function runTarjan(n: number, edges: [number, number][]): Promise<Trace> {
  mod ??= createTarjanModule();
  const m = await mod;
  const input = `${n} ${edges.length} ${edges.map(e => e.join(' ')).join(' ')}`;
  return JSON.parse(m.ccall('tarjan_run', 'string', ['string'], [input]));
}
