import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ensure this file exists

// Create root and render App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
