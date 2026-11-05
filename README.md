# Tarjan SCC Playground — C++ core, React UI

```
cpp/include/tarjan.hpp   ← the algorithm (pure C++17) + trace/JSON output
cpp/src/wasm_api.cpp     ← tarjan_run("n m a b ...") → JSON, exported to WebAssembly
cpp/test/test.cpp        ← native tests (5000 random graphs vs. reachability check)
src/                     ← React + TypeScript (Vite) UI that replays the C++ trace
```

## 1. Test the C++ core (needs g++)
    npm run test:cpp

## 2. Compile C++ → WebAssembly (needs Emscripten: https://emscripten.org)
    npm run build:wasm      # writes src/wasm/tarjan.js and src/wasm/tarjan.wasm

## 3. Run the UI
    npm install
    npm run dev

## 4. Deploy to Vercel
Vercel's build machines have no `emcc`, so **commit the generated `src/wasm/tarjan.js` and
`src/wasm/tarjan.wasm`** to git. Then import the repo in Vercel (Framework: Vite; build `npm run build`;
output `dist`) or run `npx vercel --prod`. Re-run `npm run build:wasm` and commit whenever the C++ changes.
