import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import AdminHome from "./Adminhome"; // Dashboard/Home component
import AddHodAndShowHodsPage from "./AddHodAndShowHodsPage"; // HOD Management
import AdminLog from "./Adminlog";


const AdminPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/admin">Admin Dashboard</Link>
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
                <Link className="nav-link" to="/admin">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/add-show-hods">HOD Management</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/all-requests">All Requests</Link>
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
