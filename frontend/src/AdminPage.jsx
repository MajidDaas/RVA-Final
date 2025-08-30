import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPage() {
  const [votes, setVotes] = useState([]);
  const [tokens, setTokens] = useState([]);
  const token = localStorage.getItem("admin_jwt");

  const fetchVotes = async () => {
    const res = await axios.get("/api/admin/votes", { headers: { Authorization: `Bearer ${token}` } });
    setVotes(res.data);
  };

  const generateTokens = async () => {
    const count = parseInt(prompt("How many tokens to generate?", "10"));
    if (!count) return;
    const res = await axios.post("/api/tokens/generate", { count }, { headers: { Authorization: `Bearer ${token}` } });
    setTokens(res.data.codes);
  };

  useEffect(() => { fetchVotes(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={generateTokens}>Generate Tokens</button>
        <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={fetchVotes}>Refresh Votes</button>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold">Generated Tokens:</h2>
        <ul className="list-disc pl-5">
          {tokens.map(t => <li key={t} className="text-sm">{t}</li>)}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Votes:</h2>
        <ul className="space-y-2">
          {votes.map(v => <li key={v.id} className="text-sm border p-2 rounded bg-slate-50">{v.ballot}</li>)}
        </ul>
      </div>
    </div>
  );
}

