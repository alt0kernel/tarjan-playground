declare module '*/wasm/tarjan.js' {
  const create: (opts?: object) => Promise<{ ccall: (n: string, r: string, t: string[], a: unknown[]) => string }>;
  export default create;
}
