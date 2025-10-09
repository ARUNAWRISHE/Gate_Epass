import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import CreateAORequestPopup from "./CreateAORequestPopup";
import Swal from "sweetalert2";
import "./PrincipalRequests.css";

function Requests() {
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
const [recreateRequestId, setRecreateRequestId] = useState(null);
const [selectedRequestId, setSelectedRequestId] = useState(null);

  // States for the popup modal
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
        status = "Principal Approved";
      } else if (selectedTab === "past") {
        status = "Past";
      } else if (selectedTab === "approved") {
        status = "Accepted";
      }
  
      const response = await axios.get("http://127.0.0.1:5000/all-requests", {
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
      window.open(`http://127.0.0.1:5000/uploads/${letterPath}`, "_blank");
    } else {
      alert("No approval letter available.");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (status === "Give Remarks") {
        setRecreateRequestId(id);
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

        const response = await axios.put(`http://127.0.0.1:5000/requests/${id}`, { status });

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

// Function to submit remarks
const submitRemarks = async (id) => {
    if (!comment.trim()) {
        alert("Please enter a remark.");
        return;
    }

    try {
        const response = await axios.put(`http://127.0.0.1:5000/requests/${id}/remarks`, { remarks: comment });

        if (response.status === 200) {
            alert("Remarks submitted successfully!");
            setComment("");
            setRecreateRequestId(null); // Hide the input box after submission
            fetchRequests();
        } else {
            throw new Error("Failed to submit remarks.");
        }
    } catch (err) {
        alert("Failed to submit remarks. Please try again.");
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment before submitting.");
      return;
    }
  
    try {
      const response = await axios.put(`http://127.0.0.1:5000/requests/${selectedRequestId}`, {
        status: "Give Remarks",
        comment: comment,
      });
  
      if (response.status === 200) {
        alert("Remark has been submitted successfully!");
        setShowCommentBox(false);
        setComment(""); 
        fetchRequests();
      } else {
        throw new Error("Failed to submit remarks.");
      }
    } catch (err) {
      console.error("Error submitting remarks:", err);
      alert("Failed to submit remarks. Please try again.");
    }
  };
  
  const handleViewDetails = (request) => {
    setModalData(request);
    setShowModal(true);
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/departments");
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

  // Function to handle popup open
  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to handle popup close
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="princ-root">
      <header className="princ-header">
        <h1>AO Dashboard</h1>
        <div className="tabs">
          <button className={`tab ${selectedTab === "pending" ? "active" : ""}`} onClick={() => setSelectedTab("pending")}>Pending</button>
          <button className={`tab ${selectedTab === "approved" ? "active" : ""}`} onClick={() => setSelectedTab("approved")}>Approved</button>
          <button className={`tab ${selectedTab === "past" ? "active" : ""}`} onClick={() => setSelectedTab("past")}>Logs</button>
        </div>
      </header>

      <main className="princ-main">
        <div className="controls">
          <button className="btn btn-success" onClick={openPopup}>Create AO Request</button>
          <select className="select" value={selectedDepartment} onChange={handleDepartmentFilter}>
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <input className="search" placeholder="Search by name or event" value={search} onChange={handleSearch} />
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
                  {selectedTab === "pending" && req.status === "Principal Approved" && (
                    <div className="action-row">
                      <button className="btn approve" onClick={() => handleStatusUpdate(req.id, "Accepted")}>Approve</button>
                      <button className="btn reject" onClick={() => handleStatusUpdate(req.id, "Rejected")}>Reject</button>
                      <button className="btn" onClick={() => handleStatusUpdate(req.id, "Give Remarks")}>ReCreate</button>
                    </div>
                  )}
                </div>
                {recreateRequestId === req.id && (
                  <div className="mt-2">
                    <textarea className="form-control" placeholder="Enter your remarks..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button className="btn btn-primary btn-sm mt-2" onClick={() => submitRemarks(req.id)}>Submit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showCommentBox && (
          <div className="comment-box">
            <textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Enter remarks"></textarea>
            <div className="comment-actions">
              <button className="btn btn-primary" onClick={handleSubmitComment}>Submit</button>
              <button className="btn btn-secondary" onClick={()=>setShowCommentBox(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="footer-bar">
          <div className="pagination">
            <button onClick={() => handlePagination('prev')} disabled={currentPage===1} className="pg">Prev</button>
            <span className="page-info">Page {currentPage} of {Math.ceil(filteredRequests.length / requestsPerPage)}</span>
            <button onClick={() => handlePagination('next')} disabled={currentPage===Math.ceil(filteredRequests.length / requestsPerPage)} className="pg">Next</button>
          </div>
          <CSVLink data={filteredRequests} filename="requests.csv" className="download">Download CSV</CSVLink>
        </div>

        {/* Modal for Viewing Details */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Request Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalData && (
              <div className="modal-details">
                <p><strong>ID:</strong> {modalData.id}</p>
                <p><strong>Faculty Name:</strong> {modalData.name}</p>
                <p><strong>Department:</strong> {modalData.department}</p>
                <p><strong>Event Name:</strong> {modalData.event_name}</p>
                <p><strong>Event Date:</strong> {modalData.event_date}</p>
                <p><strong> Guest Name:</strong> {modalData.guest_name}</p>
                <p><strong>Actual Intime</strong> {modalData.Actual_intime}</p>
                <p><strong>Actual Outtime</strong> {modalData.Actual_outtime}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        <CreateAORequestPopup isOpen={isPopupOpen} onClose={closePopup} onSubmit={(data) => console.log("Form submitted:", data)} />
      </main>
    </div>
  );
}

export default Requests;
