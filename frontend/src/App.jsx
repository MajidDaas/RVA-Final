import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Generate 50 sample candidates
const SAMPLE_CANDIDATES = Array.from({ length: 50 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Candidate ${i + 1}`,
  party: ["Independent", "Green", "Labour", "Democratic"][i % 4],
  tagline: `Platform highlight #${i + 1}`,
}));

export default function App() {
  const [candidates] = useState(SAMPLE_CANDIDATES);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const dragIndex = useRef(null);
  const MAX_PICKS = 14;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  const flash = useFlash();

  function addCandidate(id) {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= MAX_PICKS) {
      flash.warn(`You've reached the maximum of ${MAX_PICKS} picks.`);
      return;
    }
    setSelectedIds((s) => [...s, id]);
  }

  function removeCandidate(id) {
    setSelectedIds((s) => s.filter((x) => x !== id));
  }

  function onDragStart(e, idx) {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(e, idx) {
    e.preventDefault();
    const from = dragIndex.current;
    const to = idx;
    if (from == null || from === to) return;
    setSelectedIds((s) => {
      const copy = [...s];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    dragIndex.current = null;
  }

  function submitVote() {
    if (selectedIds.length !== MAX_PICKS) {
      flash.warn(`Please pick exactly ${MAX_PICKS} candidates. You have ${selectedIds.length}.`);
      return;
    }
    const payload = selectedIds.map((id, idx) => ({
      rank: idx + 1,
      candidateId: id,
    }));
    console.log("SUBMIT VOTE", payload);
    flash.ok("Vote submitted — check console (demo).");
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Ranked Vote — pick 14 of 50</h1>
            <p className="mt-1 text-slate-600">
              Rank 1 casts the strongest preference, rank 14 the weakest. Order matters.
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow-sm">
              <strong className="text-sm">Selections</strong>
              <span className="text-xs text-slate-500">{selectedIds.length}/{MAX_PICKS}</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate grid */}
          <section className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, party, or tagline..."
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button onClick={() => setQuery("")} className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                Clear
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <strong className="block">Why order matters</strong>
              <p className="text-sm text-slate-600 mt-1">
                Higher ranks are consulted first. Lower ranks only used if top choices can't win.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const rank = isSelected ? selectedIds.indexOf(c.id) + 1 : null;
                return (
                  <motion.article
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className={`bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between border ${isSelected ? "ring-2 ring-indigo-200" : "border-transparent"}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{c.name}</h3>
                          <p className="text-sm text-slate-500">{c.party} • {c.tagline}</p>
                        </div>
                        <div className="ml-2 text-right">
                          {isSelected ? <div className="text-xs text-slate-600">Rank {rank}</div> : <div className="text-xs text-slate-400">Not selected</div>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => addCandidate(c.id)}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${isSelected ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                      >
                        {isSelected ? "Selected" : "Add"}
                      </button>
                      {isSelected && (
                        <button onClick={() => removeCandidate(c.id)} className="px-3 py-2 rounded-lg bg-red-50 text-red-600">
                          Remove
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* Ranked list */}
          <aside className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Your Ranked List</h2>
              <div className="text-sm text-slate-500">Drag to reorder</div>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {selectedIds.map((id, idx) => {
                  const c = candidates.find((x) => x.id === id);
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, margin: 0 }}
                      className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg"
                      draggable
                      onDragStart={(e) => onDragStart(e, idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDrop={(e) => onDrop(e, idx)}
                    >
                      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white border">{idx + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.party}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeCandidate(id)} className="px-3 py-1 rounded-lg text-sm bg-red-50 text-red-600">
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {selectedIds.length === 0 && <div className="text-sm text-slate-500">No selections yet — click "Add" on the left to choose candidates.</div>}
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Selected <strong>{selectedIds.length}</strong> / {MAX_PICKS}. Top ranks carry more weight.
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={submitVote} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Submit vote
              </button>
              <button onClick={() => setSelectedIds([])} className="px-4 py-2 rounded-xl bg-white border">
                Clear
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* Flash hook */
function useFlash() {
  const [flash, setFlash] = useState(null);
  function warn(text) {
    setFlash({ type: "warn", text });
    setTimeout(() => setFlash(null), 2600);
  }
  function ok(text) {
    setFlash({ type: "ok", text });
    setTimeout(() => setFlash(null), 2600);
  }
  return { warn, ok };
}
