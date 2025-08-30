import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const MAX_PICKS = 14;
const SAMPLE_CANDIDATES = Array.from({ length: 50 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Candidate ${i + 1}`,
  party: ["Independent", "Green", "Labour", "Democratic"][i % 4],
  tagline: `Platform highlight #${i + 1}`,
}));

export default function VotingPage({ token }) {
  const [validToken, setValidToken] = useState(null);
  const [candidates] = useState(SAMPLE_CANDIDATES);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState(null);
  const dragIndex = useRef(null);

  // Check token validity
  useEffect(() => {
    axios.get(`/api/vote/check?token=${token}`)
      .then(res => setValidToken(res.data.valid))
      .catch(() => setValidToken(false));
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return candidates;
    return candidates.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.party.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  if (validToken === false) return <div className="p-6 text-red-600">Invalid or used token.</div>;
  if (validToken === null) return <div className="p-6 text-slate-700">Validating token...</div>;

  // --- Candidate selection ---
  const addCandidate = (id) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= MAX_PICKS) return flashMessage("Maximum 14 picks reached", "warn");
    setSelectedIds([...selectedIds, id]);
  };

  const removeCandidate = (id) => setSelectedIds(selectedIds.filter(x => x !== id));

  // --- Drag-and-drop ranking ---
  const onDragStart = (e, idx) => { dragIndex.current = idx; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = e => e.preventDefault();
  const onDrop = (e, idx) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === idx) return;
    const copy = [...selectedIds];
    const [item] = copy.splice(from, 1);
    copy.splice(idx, 0, item);
    setSelectedIds(copy);
    dragIndex.current = null;
  };

  // --- Submit vote ---
  const submitVote = () => {
    if (selectedIds.length !== MAX_PICKS) return flashMessage(`Pick exactly ${MAX_PICKS} candidates`, "warn");
    axios.post("/api/vote", { token, ballot: selectedIds })
      .then(() => flashMessage("Vote submitted successfully", "ok"))
      .catch(() => flashMessage("Submission failed", "warn"));
  };

  // --- Flash messages ---
  const flashMessage = (text, type) => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 2600);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-slate-50 text-slate-900">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Ranked Vote — pick 14 of 50</h1>
        <span className="text-sm text-slate-600">{selectedIds.length}/{MAX_PICKS} selected</span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Candidate Grid */}
        <section className="lg:col-span-2">
          <div className="flex mb-3 gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, party, or tagline..."
              className="flex-1 p-2 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-300"
            />
            <button className="px-3 py-2 rounded bg-white border" onClick={() => setQuery("")}>Clear</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => {
              const isSelected = selectedIds.includes(c.id);
              const rank = isSelected ? selectedIds.indexOf(c.id)+1 : null;
              return (
                <motion.div
                  key={c.id}
                  layout
                  className={`p-3 rounded-lg bg-white shadow flex flex-col justify-between border ${isSelected ? "ring-2 ring-indigo-300" : "border-transparent"}`}
                >
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.party} • {c.tagline}</p>
                  </div>
                  <div className="flex mt-2 gap-2">
                    <button
                      className={`flex-1 py-1 rounded ${isSelected ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                      onClick={() => addCandidate(c.id)}
                    >{isSelected ? `Rank ${rank}` : "Add"}</button>
                    {isSelected && <button className="py-1 px-2 rounded bg-red-50 text-red-600" onClick={() => removeCandidate(c.id)}>Remove</button>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Ranked list */}
        <aside className="bg-white p-3 rounded-lg shadow flex flex-col gap-3">
          <h2 className="font-semibold">Your Ranked List (Drag to reorder)</h2>
          <AnimatePresence>
            {selectedIds.map((id, idx) => {
              const c = candidates.find(x => x.id===id);
              return (
                <motion.div
                  key={id}
                  layout
                  className="flex items-center gap-2 bg-slate-50 p-2 rounded"
                  draggable
                  onDragStart={e => onDragStart(e, idx)}
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, idx)}
                >
                  <div className="w-6 text-sm font-medium">{idx+1}</div>
                  <div className="flex-1 text-sm">{c.name}</div>
                  <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded" onClick={() => removeCandidate(id)}>Remove</button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <button className="mt-2 py-2 bg-emerald-600 text-white rounded" onClick={submitVote}>Submit Vote</button>
        </aside>
      </div>

      {flash && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-4 right-4 p-3 rounded shadow ${flash.type==="warn" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
        >
          {flash.text}
        </motion.div>
      )}
    </div>
  );
}

