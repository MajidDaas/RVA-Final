import React, { useState } from "react";
import axios from "axios";

export default function LoginModal({ setIsAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/admin/login", { email, password });
      localStorage.setItem("admin_jwt", res.data.token);
      setIsAdmin(true);
    } catch (e) {
      alert("Login failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-lg font-semibold mb-4">Admin Login</h2>
        <input className="w-full p-2 mb-2 border rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-2 mb-4 border rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full py-2 bg-indigo-600 text-white rounded" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

