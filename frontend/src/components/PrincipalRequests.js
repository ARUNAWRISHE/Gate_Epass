import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";
import "./PrincipalRequests.css";

function PrincipalRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedTab, setSelectedTab] = useState("pending"); // Pending or past
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchDepartments();
  }, [selectedTab]);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      let status = "";
      if (selectedTab === "pending") {
        status = "Pending";
      } else if (selectedTab === "past") {
        status = "Past";
      } else if (selectedTab === "approved") {
        status = "Principal Approved";
      }

      const response = await axios.get("http://127.0.0.1:5001/all-requests", {
        params: { status },
      });

      let sortedData = response.data.requests.sort(
        (a, b) => new Date(b.created_time) - new Date(a.created_time)
      );

      if (selectedTab === "approved") {
        // Filter requests with future event dates
        const currentDate = new Date();
        sortedData = sortedData.filter(
          (req) => new Date(req.event_date) > currentDate
        );
      }

      setRequests(sortedData);
      setFilteredRequests(sortedData);
      console.log("Fetched requests:", response.data.requests);
    } catch (err) {
      setError("Failed to fetch requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLetter = (letterPath) => {
    if (letterPath) {
      window.open(`http://127.0.0.1:5001/uploads/${letterPath}`, "_blank");
    } else {
      alert("No approval letter available.");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (status === "Remarks by Principal") {
      setSelectedRequestId(id);
      setShowCommentBox(true);
      return;
    }

    try {
      const confirmUpdate = await Swal.fire({
        title: `Are you sure?`,
        text: `You want to mark this request as ${status}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, proceed!",
        cancelButtonText: "No, cancel",
      });

      if (!confirmUpdate.isConfirmed) return;

      // Show loading alert
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we update the request.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.put(`http://127.0.0.1:5001/principal-requests/${id}`, { status });

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: `Request has been ${status.toLowerCase()} successfully!`,
          icon: "success",
        });
        fetchRequests();
      } else {
        throw new Error("Failed to update status.");
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update the request status. Please try again.",
        icon: "error",
      });
    }
  };

  const handleSubmitRemarks = async () => {
    if (!comment.trim()) {
      alert("Please enter remarks before submitting.");
      return;
    }

    try {
      const response = await axios.put(`http://127.0.0.1:5001/principal-requests/${selectedRequestId}`, {
        status: "Remarks by Principal",
        remarks: comment,
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Remarks submitted successfully!",
          icon: "success",
        });
        setShowCommentBox(false);
        setComment("");
        fetchRequests();
      } else {
        throw new Error("Failed to submit remarks.");
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to submit remarks. Please try again.",
        icon: "error",
      });
    }
  };

  const handleViewDetails = (request) => {
    setModalData(request);
    setShowModal(true);
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5001/api/departments");
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    filterData(value, selectedDepartment);
  };

  const handleDepartmentFilter = (e) => {
    const value = e.target.value;
    setSelectedDepartment(value);
    filterData(search, value);
  };

  const filterData = (searchValue, departmentValue) => {
    const filtered = requests.filter((req) => {
      const matchesSearch =
        req.name.toLowerCase().includes(searchValue) ||
        req.event_name.toLowerCase().includes(searchValue);
      const matchesDepartment = departmentValue
        ? req.department === departmentValue
        : true;

      return matchesSearch && matchesDepartment;
    });
    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  const handlePagination = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (
      direction === "next" &&
      currentPage < Math.ceil(filteredRequests.length / requestsPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="princ-root">
      <header className="princ-header">
        <h1>Principal Dashboard</h1>
        <div className="tabs">
          <button
            className={`tab ${selectedTab === "pending" ? "active" : ""}`}
            onClick={() => setSelectedTab("pending")}
          >
            Pending
          </button>
          <button
            className={`tab ${selectedTab === "approved" ? "active" : ""}`}
            onClick={() => setSelectedTab("approved")}
          >
            Approved
          </button>
          <button
            className={`tab ${selectedTab === "past" ? "active" : ""}`}
            onClick={() => setSelectedTab("past")}
          >
            Logs
          </button>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-outline-light inline-logout-btn"
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }}
          >
            Logout
          </button>
        </div>

      </header>

      <main className="princ-main">
        <div className="controls">
          <select value={selectedDepartment} onChange={handleDepartmentFilter} className="select">
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <input
            className="search"
            placeholder="Search by name or event"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="error">{error}</div>}

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
                  <p className="meta">{req.event_date} • {req.time_in} - {req.time_out}</p>
                  <p className="faculty">{req.name} — {req.department}</p>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => handleViewDetails(req)}>Details</button>
                  <button className="btn btn-outline" onClick={() => handleViewLetter(req.approval_letter)}>Letter</button>
                  {selectedTab === "pending" && (
                    <div className="action-row">
                      <button className="btn approve" onClick={() => handleStatusUpdate(req.id, "Principal Approved")}>Approve</button>
                      <button className="btn reject" onClick={() => handleStatusUpdate(req.id, "Principal Rejected")}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="footer-bar">
          <div className="pagination">
            <button onClick={() => handlePagination('prev')} disabled={currentPage===1} className="pg">Prev</button>
            <span>Page {currentPage} of {Math.ceil(filteredRequests.length / requestsPerPage)}</span>
            <button onClick={() => handlePagination('next')} disabled={currentPage===Math.ceil(filteredRequests.length / requestsPerPage)} className="pg">Next</button>
          </div>
          <CSVLink data={filteredRequests} filename="requests.csv" className="download">Download CSV</CSVLink>
        </div>
      </main>

      {/* Comment box and modal reuse the same logic; keeping them intact */}
      {showCommentBox && (
        <div className="comment-box">
          <textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Enter remarks"></textarea>
          <div className="comment-actions">
            <button className="btn btn-primary" onClick={handleSubmitRemarks}>Submit</button>
            <button className="btn btn-secondary" onClick={()=>setShowCommentBox(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div className="modal-details">
              <p><strong>ID:</strong> {modalData.id}</p>
              <p><strong>Faculty:</strong> {modalData.name}</p>
              <p><strong>Department:</strong> {modalData.department}</p>
              <p><strong>Event:</strong> {modalData.event_name}</p>
              <p><strong>Date:</strong> {modalData.event_date}</p>
              <p><strong>Guest:</strong> {modalData.guest_name}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PrincipalRequests;