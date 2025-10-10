import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import AdminHome from "./Adminhome"; // Dashboard/Home component
import AddHodAndShowHodsPage from "./AddHodAndShowHodsPage"; // HOD Management
import AdminLog from "./Adminlog";


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
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<AdminHome />} /> {/* Default Home */}
          <Route path="/add-show-hods" element={<AddHodAndShowHodsPage />} />
          <Route path="/all-requests" element={<AdminLog/>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
