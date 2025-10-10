import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import AdminHome from "./Adminhome"; // Dashboard/Home component
import AddHodAndShowHodsPage from "./AddHodAndShowHodsPage"; // HOD Management
import AdminLog from "./Adminlog";


const AdminPage = () => {
  return (
    <div>
      <header className="princ-header">
        <h1>Admin Dashboard</h1>
        <div className="tabs">
          <Link className="tab" to="/admin">Home</Link>
          <Link className="tab" to="/admin/add-show-hods">HOD Management</Link>
          <Link className="tab" to="/admin/all-requests">All Requests</Link>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline-light inline-logout-btn" onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }}>
            Logout
          </button>
        </div>
      </header>

      <main className="princ-main">
        <Routes>
          <Route path="/" element={<AdminHome />} /> {/* Default Home */}
          <Route path="/add-show-hods" element={<AddHodAndShowHodsPage />} />
          <Route path="/all-requests" element={<AdminLog/>} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;
