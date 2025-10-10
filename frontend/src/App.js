import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import StaffHome from "./components/StaffHome";
import AllRequests from "./components/AllRequests";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPage from "./components/AdminPage";
import HodHome from "./components/HodHome";
import Security from "./components/Security";
import PrincipalRequests from "./components/PrincipalRequests";

function App() {
  const [user, setUser] = useState(null); // Handle user state (staff details)

  // 🔒 Advanced Inspect Element Blocking
  useEffect(() => {
    const disableInspect = (e) => e.preventDefault();

    // 🔹 Disable Right Click
    document.addEventListener("contextmenu", disableInspect);

    // 🔹 Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "U") ||
        (e.ctrlKey && e.key === "S") ||
        (e.ctrlKey && e.key === "J") ||
        (e.ctrlKey && e.key === "H") ||
        (e.ctrlKey && e.key === "C")
      ) {
        e.preventDefault();
      }
    });

    // 🔹 Detect DevTools and Block Access
    const checkDevTools = setInterval(() => {
      const before = new Date().getTime();
      debugger;
      const after = new Date().getTime();
      if (after - before > 100) {
        alert("DevTools Detected! Access Blocked.");
        window.close();
      }
    }, 1000);

    return () => {
      document.removeEventListener("contextmenu", disableInspect);
      clearInterval(checkDevTools);
    };
  }, []);

  // We need to use location/navigation hooks which must be inside Router
  // Create an inner component to render routes and the logout button
  function AppRoutes() {
    return (
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<StaffHome user={user} />} />
        <Route path="/all-requests" element={<AllRequests user={user} />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/hod-home" element={<HodHome />} />
        <Route path="/security" element={<Security />} />
        <Route path="/principal-home" element={<PrincipalRequests />} />
      </Routes>
    );
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
