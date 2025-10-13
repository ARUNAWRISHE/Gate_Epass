import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import AdminHome from "./Adminhome"; // Dashboard/Home component
import AddHodAndShowHodsPage from "./AddHodAndShowHodsPage"; // HOD Management
import AdminLog from "./Adminlog";
import AdminPassReset from "./Adminpassreset"; // Assuming this is your new component

const AdminPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#0f52fc', color: 'white' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center text-white" to="/admin">
            <i className="bi bi-shield-lock me-2"></i>
            <span>Admin Dashboard</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center text-white" to="/admin">
                  <i className="bi bi-house-door me-1"></i>
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center text-white" to="/admin/add-show-hods">
                  <i className="bi bi-people me-1"></i>
                  <span>HOD Management</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center text-white" to="/admin/all-requests">
                  <i className="bi bi-list-check me-1"></i>
                  <span>All Requests</span>
                </Link>
              </li>
              {/* NEW: Password Reset Button */}
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center text-white" to="/admin/password-reset">
                  <i className="bi bi-key me-1"></i>
                  <span>Password Reset</span>
                </Link>
              </li>
              {/* END NEW */}
            </ul>
          </div>

        </div>
        <div className="header-actions">
          <button className="btn btn-outline-light inline-logout-btn" onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }}>
            Logout
          </button>
        </div>
      </nav>

      <main className="princ-main">
        <Routes>
          <Route path="/" element={<AdminHome />} /> {/* Default Home */}
          <Route path="/add-show-hods" element={<AddHodAndShowHodsPage />} />
          <Route path="/all-requests" element={<AdminLog/>} />
          {/* NEW: Password Reset Route */}
          <Route path="/password-reset" element={<AdminPassReset />} />
          {/* END NEW */}
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;