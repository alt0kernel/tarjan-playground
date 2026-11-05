// Core of the project: Tarjan's strongly connected components algorithm.
// Pure standard C++17, no Emscripten dependency, so it can be unit-tested natively.
// The algorithm records a trace (one snapshot per visible step) that the UI replays.
#pragma once
#include <algorithm>
#include <array>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

namespace tarjan {

enum Kind { OUTER, CALL, VISIT, PUSH, EDGE, TREE, RETURN, BACK, CROSS, ROOT, NOTROOT, DONE };
enum EdgeType { TREE_EDGE = 1, BACK_EDGE = 2, CROSS_EDGE = 3 };

struct Step {
  int kind = 0, line = -1, cur = -1, ea = -1, eb = -1, old = 0;
  std::vector<int> idx, low, on, stack, calls, comp, members;
  std::vector<std::array<int, 3>> et;  // {from, to, EdgeType}
};

struct Result {
  std::vector<Step> steps;
  std::vector<std::vector<int>> sccs;  // in order of discovery (reverse topological)
  std::vector<int> comp;               // node -> scc id
  bool verified = false;               // cross-checked against reachability closure
};

class Tracer {
 public:
  Tracer(int n, const std::vector<std::pair<int, int>>& edges)
      : n_(n), adj_(n), idx_(n, -1), low_(n, 0), on_(n, 0), comp_(n, -1) {
    for (const auto& e : edges) adj_[e.first].push_back(e.second);
    for (auto& a : adj_) {
      std::sort(a.begin(), a.end());
      a.erase(std::unique(a.begin(), a.end()), a.end());
    }
  }

  Result run() {
    for (int v = 0; v < n_; ++v) {                 // for each v in V
      emit(OUTER, 0, v);
      if (idx_[v] < 0) { emit(CALL, 1, v); strong(v); }
    }
    emit(DONE, -1, -1);
    Result r;
    r.steps = std::move(steps_);
    r.sccs = sccs_;
    r.comp = comp_;
    r.verified = verify();
    return r;
  }

 private:
  int n_;
  std::vector<std::vector<int>> adj_;
  std::vector<int> idx_, low_, on_, comp_, stack_, calls_;
  std::vector<std::vector<int>> sccs_;
  std::vector<std::array<int, 3>> et_;
  std::vector<Step> steps_;
  int counter_ = 0;

  void setType(int a, int b, int t) {
    for (auto& e : et_) if (e[0] == a && e[1] == b) { e[2] = t; return; }
    et_.push_back({a, b, t});
  }

  void emit(int kind, int line, int cur, int ea = -1, int eb = -1, int old = 0,
            std::vector<int> members = {}) {
    Step s;
    s.kind = kind; s.line = line; s.cur = cur; s.ea = ea; s.eb = eb; s.old = old;
    s.idx = idx_; s.low = low_; s.on = on_; s.stack = stack_; s.calls = calls_;
    s.comp = comp_; s.members = std::move(members); s.et = et_;
    steps_.push_back(std::move(s));
  }

  void strong(int v) {
    calls_.push_back(v);
    idx_[v] = low_[v] = counter_++;
    emit(VISIT, 4, v);
    stack_.push_back(v); on_[v] = 1;
    emit(PUSH, 5, v);
    for (int w : adj_[v]) {
      emit(EDGE, 6, v, v, w);
      if (idx_[w] < 0) {                                   // tree edge
        setType(v, w, TREE_EDGE);
        emit(TREE, 7, v, v, w);
        strong(w);
        int o = low_[v];
        low_[v] = std::min(low_[v], low_[w]);
        emit(RETURN, 9, v, v, w, o);
      } else if (on_[w]) {                                 // back edge
        setType(v, w, BACK_EDGE);
        int o = low_[v];
        low_[v] = std::min(low_[v], idx_[w]);
        emit(BACK, 11, v, v, w, o);
      } else {                                             // cross edge into finished SCC
        setType(v, w, CROSS_EDGE);
        emit(CROSS, 10, v, v, w);
      }
    }
    if (low_[v] == idx_[v]) {                              // v is the root of an SCC
      std::vector<int> c;
      int w;
      do { w = stack_.back(); stack_.pop_back(); on_[w] = 0; c.push_back(w); } while (w != v);
      std::reverse(c.begin(), c.end());
      int id = static_cast<int>(sccs_.size());
      for (int x : c) comp_[x] = id;
      sccs_.push_back(c);
      emit(ROOT, 13, v, -1, -1, 0, c);
    } else {
      emit(NOTROOT, 12, v);
    }
    calls_.pop_back();
  }

  // Independent check: u,v share a component  <=>  u reaches v and v reaches u.
  bool verify() const {
    std::vector<std::vector<char>> r(n_, std::vector<char>(n_, 0));
    for (int i = 0; i < n_; ++i) { r[i][i] = 1; for (int j : adj_[i]) r[i][j] = 1; }
    for (int k = 0; k < n_; ++k)
      for (int i = 0; i < n_; ++i)
        if (r[i][k]) for (int j = 0; j < n_; ++j) if (r[k][j]) r[i][j] = 1;
    for (int a = 0; a < n_; ++a) {
      if (comp_[a] < 0) return false;
      for (int b = 0; b < n_; ++b)
        if ((r[a][b] && r[b][a]) != (comp_[a] == comp_[b])) return false;
    }
    return true;
  }
};

inline Result run(int n, const std::vector<std::pair<int, int>>& edges) {
  return Tracer(n, edges).run();
}

inline void put(std::ostringstream& o, const std::vector<int>& v) {
  o << '[';
  for (size_t i = 0; i < v.size(); ++i) { if (i) o << ','; o << v[i]; }
  o << ']';
}

inline std::string to_json(const Result& r) {
  std::ostringstream o;
  o << "{\"verified\":" << (r.verified ? "true" : "false") << ",\"comp\":";
  put(o, r.comp);
  o << ",\"sccs\":[";
  for (size_t i = 0; i < r.sccs.size(); ++i) { if (i) o << ','; put(o, r.sccs[i]); }
  o << "],\"steps\":[";
  for (size_t i = 0; i < r.steps.size(); ++i) {
    const Step& s = r.steps[i];
    if (i) o << ',';
    o << "{\"kind\":" << s.kind << ",\"line\":" << s.line << ",\"cur\":" << s.cur
      << ",\"ea\":" << s.ea << ",\"eb\":" << s.eb << ",\"old\":" << s.old;
    o << ",\"idx\":";     put(o, s.idx);
    o << ",\"low\":";     put(o, s.low);
    o << ",\"on\":";      put(o, s.on);
    o << ",\"stack\":";   put(o, s.stack);
    o << ",\"calls\":";   put(o, s.calls);
    o << ",\"comp\":";    put(o, s.comp);
    o << ",\"members\":"; put(o, s.members);
    o << ",\"et\":[";
    for (size_t j = 0; j < s.et.size(); ++j) {
      if (j) o << ',';
      o << '[' << s.et[j][0] << ',' << s.et[j][1] << ',' << s.et[j][2] << ']';
    }
    o << "]}";
  }
  o << "]}";
  return o.str();
}

}  // namespace tarjan
