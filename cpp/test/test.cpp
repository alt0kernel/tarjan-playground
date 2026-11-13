#include <cassert>
#include <cstdio>
#include <random>
#include "tarjan.hpp"

int main() {
  {
    std::vector<std::pair<int,int>> e = {{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3},{2,7},{7,6},{6,5},{6,7}};
    auto r = tarjan::run(8, e);
    assert(r.verified && r.sccs.size() == 3);
    assert(r.comp[0] == r.comp[1] && r.comp[1] == r.comp[2]);
    assert(r.comp[3] == r.comp[4] && r.comp[4] == r.comp[5]);
    assert(r.comp[6] == r.comp[7] && r.comp[0] != r.comp[3] && r.comp[3] != r.comp[6]);
  }
  assert(tarjan::run(0, {}).sccs.empty());
  assert(tarjan::run(5, {}).sccs.size() == 5);

  std::mt19937 rng(12345);
  for (int t = 0; t < 5000; ++t) {
    int n = 1 + rng() % 14, m = rng() % (n * 3 + 1);
    std::vector<std::pair<int,int>> e;
    for (int i = 0; i < m; ++i) e.emplace_back(rng() % n, rng() % n);
    auto r = tarjan::run(n, e);
    assert(r.verified);
    for (auto& ed : e)
      if (r.comp[ed.first] != r.comp[ed.second]) assert(r.comp[ed.second] < r.comp[ed.first]);
    size_t total = 0; for (auto& c : r.sccs) total += c.size();
    assert(total == (size_t)n);
    assert(!tarjan::to_json(r).empty());
  }
  std::puts("all C++ tests passed");
}
