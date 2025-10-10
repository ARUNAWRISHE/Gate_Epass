import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchRequests, createRequest } from "../api";
import CreateRequestPopup from "./CreateRequestPopup";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { CSVLink } from "react-csv";
import "./PrincipalRequests.css";

function HodHome() {
  const location = useLocation();
  const user = location.state?.user || {};
  const [requests, setRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Pagination (page is zero-based)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch Requests (useCallback to prevent unnecessary re-renders)
  const loadRequests = useCallback(async () => {
    if (!user.id) return; // Ensure user ID is available

    try {
      setLoading(true);
      const response = await fetchRequests(user.id);

      if (response?.data) {
        setRequests(response.data);
      } else {
        console.warn("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching requests:", error.message || error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Departments list can be derived from requests or fetched separately; derive here
  const departments = Array.from(new Set(requests.map((r) => r.department).filter(Boolean)));

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
    setPage(0);
  };

  const handleDepartmentFilter = (e) => {
    setSelectedDepartment(e.target.value);
    setPage(0);
  };

  const filterByTab = (items) => {
    const tab = selectedTab;
    if (tab === "pending") return items.filter((i) => !i.status || /pending/i.test(i.status));
    if (tab === "approved") return items.filter((i) => /accepted|approved/i.test(i.status));
    if (tab === "past") return items.filter((i) => /rejected|past/i.test(i.status));
    return items;
  };

  const filteredRequests = filterByTab(requests).filter((req) => {
    const matchesSearch =
      !search || req.event_name?.toLowerCase().includes(search) || req.name?.toLowerCase().includes(search) || req.guest_name?.toLowerCase().includes(search);
    const matchesDept = !selectedDepartment || req.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const indexOfFirst = page * rowsPerPage;
  const indexOfLast = indexOfFirst + rowsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);

  // Handle New Request Submission
  const handleNewRequest = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await createRequest({ ...formData, hod_id: user.id });
      setRequests((prevRequests) => [...prevRequests, response.data]);
      setShowPopup(false);
    } catch (error) {
      console.error("Error creating request:", error.response || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // Status field (Styled Badges)
  const getStatusBadge = (status) => {
    const statusColors = {
      accepted: { background: "#28a745", textColor: "#ffffff" }, // Green
      pending: { background: "#ffc107", textColor: "#000000" }, // Yellow
      rejected: { background: "#dc3545", textColor: "#ffffff" },
      "principal approved": { background: "#ffc107", textColor: "#000000" }, // Red
    };

    const { background, textColor } = statusColors[status?.toLowerCase()] || {
      background: "#6c757d",
      textColor: "#ffffff",
    };

    return (
      <Box
        sx={{
          backgroundColor: background,
          color: textColor,
          fontWeight: "bold",
          textAlign: "center",
          borderRadius: "8px",
          padding: "6px 12px",
          display: "inline-block",
          minWidth: "120px",
          boxShadow: "0px 2px 6px rgba(9, 96, 237, 0.2)",
        }}
      >
        {status || "Unknown"}
      </Box>
    );
  };

  return (
    <div className="princ-root">
      <header className="princ-header">
        <h1>HOD of {user.department} department dashboard</h1>
        <div className="tabs">
          <button className={`tab ${selectedTab === "pending" ? "active" : ""}`} onClick={() => setSelectedTab("pending")}>Pending</button>
          <button className={`tab ${selectedTab === "approved" ? "active" : ""}`} onClick={() => setSelectedTab("approved")}>Approved</button>
          <button className={`tab ${selectedTab === "past" ? "active" : ""}`} onClick={() => setSelectedTab("past")}>Logs</button>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline-light" onClick={() => setShowPopup(true)}>
            <AddIcon sx={{ mr: 1 }} /> Create Request
          </button>
          <button className="btn btn-outline-light inline-logout-btn" onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }}>
            Logout
          </button>
        </div>
      </header>


      <main className="princ-main">
        <div className="controls">
          <select className="select" value={selectedDepartment} onChange={handleDepartmentFilter}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input className="search" placeholder="Search by name, event, guest" value={search} onChange={handleSearch} />
          <CSVLink data={filteredRequests} filename="hod-requests.csv" className="download">Download CSV</CSVLink>
        </div>

        {loading ? (
          <div className="loader">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty">No requests found.</div>
        ) : (
          <div className="requests-grid">
            {currentRequests.map((req) => (
              <div className="card" key={req.id}>
                <div className="card-head">
                  <div className="id">{req.id}</div>
                  <div className="status">{req.status}</div>
                </div>
                <div className="card-body">
                  <h3 className="event">{req.event_name}</h3>
                  <p className="meta">{req.event_date}</p>
                  <p className="faculty">{req.guest_name} — {req.department}</p>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary">Details</button>
                  <div className="action-row">
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="footer-bar">
          <div className="pagination">
            <button onClick={() => handleChangePage(null, Math.max(0, page-1))} disabled={page===0} className="pg">Prev</button>
            <span className="page-info">Page {page+1} of {Math.max(1, Math.ceil(filteredRequests.length / rowsPerPage))}</span>
            <button onClick={() => handleChangePage(null, Math.min(Math.ceil(filteredRequests.length / rowsPerPage)-1, page+1))} disabled={page>=Math.ceil(filteredRequests.length / rowsPerPage)-1} className="pg">Next</button>
          </div>
          <div />
        </div>

        {showPopup && (
          <CreateRequestPopup isOpen={showPopup} onClose={() => setShowPopup(false)} onSubmit={handleNewRequest} hodId={user.id} />
        )}
      </main>
    </div>
  );
}

// *Styled Components*
const styles = {
  container: {
    marginTop: 5,
    padding: 3,
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "3px solid #004080",
    paddingBottom: "10px",
    marginBottom: "20px",
  },
  userName: {
    fontWeight: "bold",
    color: "#004080",
  },
  createBtn: {
    backgroundColor: "#004080",
    "&:hover": {
      backgroundColor: "#003366",
    },
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    textTransform: "none",
  },
  tableContainer: {
    marginTop: "20px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  th: {
    backgroundColor: "#004080",
    color: "white",
    fontWeight: "bold",
    textAlign: "left",
  },
  row: {
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  loadingContainer: {
    textAlign: "center",
    padding: "20px",
  },
  noData: {
    textAlign: "center",
    fontStyle: "italic",
    color: "gray",
    padding: "20px",
  },
};

export default HodHome;
