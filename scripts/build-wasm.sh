$()$(
  bash
  #!/usr/bin/env bash
  # Requires the Emscripten SDK (em++) on PATH
  set -e

  em++ cpp/src/wasm_api.cpp -Icpp/include -std=c++17 -O2 \
    -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME=createTarjanModule \
    -sEXPORTED_FUNCTIONS=_tarjan_run -sEXPORTED_RUNTIME_METHODS=ccall \
    -sENVIRONMENT=web,worker -sALLOW_MEMORY_GROWTH=1 \
    -o src/wasm/tarjan.js

  echo "built src/wasm/tarjan.js + tarjan.wasm"
)$()
