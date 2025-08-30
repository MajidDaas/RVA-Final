import React, { useState, useEffect } from "react";
import VotingPage from "./VotingPage.jsx";
import AdminPage from "./AdminPage.jsx";
import LoginModal from "./LoginModal.jsx";

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const tokenParam = new URLSearchParams(window.location.search).get("token");
    if (tokenParam) setUserToken(tokenParam);
  }, []);

  if (!userToken && !isAdmin) return <LoginModal setIsAdmin={setIsAdmin} />;
  if (isAdmin) return <AdminPage />;
  return <VotingPage token={userToken} />;
}

