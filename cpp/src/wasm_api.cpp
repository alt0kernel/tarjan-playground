#include <sstream>
#include <string>
#include <utility>
#include <vector>
#include "tarjan.hpp"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

extern "C" EMSCRIPTEN_KEEPALIVE const char* tarjan_run(const char* input) {
  static std::string out;
  std::istringstream in(input);
  int n = 0, m = 0;
  in >> n >> m;
  std::vector<std::pair<int, int>> edges;
  for (int i = 0; i < m; ++i) {
    int a, b;
    if (!(in >> a >> b)) break;
    if (a >= 0 && a < n && b >= 0 && b < n) edges.emplace_back(a, b);
  }
  out = tarjan::to_json(tarjan::run(n < 0 ? 0 : n, edges));
  return out.c_str();
}
