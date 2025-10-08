import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2";

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

      const response = await axios.put(`http://127.0.0.1:5000/principal-requests/${id}`, { status });

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
      const response = await axios.put(`http://127.0.0.1:5000/principal-requests/${selectedRequestId}`, {
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

  return (
    <div className="container mt-5">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <h1 className="m-2">Principal Dashboard</h1>
          </span>
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn ${
                selectedTab === "pending" ? "btn-primary" : "btn-outline-primary"
              } rounded-pill px-4 py-2`}
              onClick={() => setSelectedTab("pending")}
            >
              Pending Requests
            </button>
            <button
              className={`btn ${
                selectedTab === "past" ? "btn-primary" : "btn-outline-primary"
              } rounded-pill px-4 py-2`}
              onClick={() => setSelectedTab("past")}
            >
              Logs
            </button>
            <button
              className={`btn ${
                selectedTab === "approved" ? "btn-primary" : "btn-outline-primary"
              } rounded-pill px-4 py-2`}
              onClick={() => setSelectedTab("approved")}
            >
              Approved Requests
            </button>
          </div>
        </div>
      </nav>

      <h2 className="text-center mb-4">All Requests</h2>
      <div className="d-flex justify-content-between mb-3"></div>

      <div className="row mb-3">
        <div className="col-md-6">
          <select
            className="form-select bg-white"
            value={selectedDepartment}
            onChange={handleDepartmentFilter}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6 text-end">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or event"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center mt-3">
          <h5>No requests are pending.</h5>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                {selectedTab === "approved" && (
                  <>
                    <th>Actual In Time</th>
                    <th>Actual Out Time</th>
                  </>
                )}
                {selectedTab !== "approved" && (
                  <>
                    <th>Faculty Name</th>
                    <th>Department</th>
                    <th>View Details</th>
                    <th>Approval Letter</th>
                    <th>Status</th>
                    {selectedTab === "pending" && <th>Actions</th>}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.event_name}</td>
                  <td>{req.event_date}</td>
                  <td>{req.time_in}</td>
                  <td>{req.time_out}</td>
                  {selectedTab === "approved" && (
                    <>
                      <td>{req.Actual_intime}</td>
                      <td>{req.Actual_outtime}</td>
                    </>
                  )}
                  {selectedTab !== "approved" && (
                    <>
                      <td>{req.name}</td>
                      <td>{req.department}</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleViewDetails(req)}
                        >
                          View Details
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleViewLetter(req.approval_letter)}
                        >
                          View Letter
                        </button>
                      </td>
                      <td>{req.status}</td>
                      {selectedTab === "pending" && (
                        <td>
                          <button
                            className="btn btn-success btn-sm fixed-btn me-2 mt-2 w-50"
                            onClick={() =>
                              handleStatusUpdate(req.id, "Principal Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm fixed-btn me-2 mt-2 w-50"
                            onClick={() =>
                              handleStatusUpdate(req.id, "Principal Rejected")
                            }
                          >
                            Reject
                          </button>
                          <button
                            className="btn btn-warning btn-sm fixed-btn me-2 mt-2 w-50"
                            onClick={() =>
                              handleStatusUpdate(req.id, "Remarks by Principal")
                            }
                          >
                            Recreate with Remarks
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCommentBox && (
        <div className="mt-3">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter your remarks here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <button
            className="btn btn-primary mt-2"
            onClick={handleSubmitRemarks}
          >
            Submit Remarks
          </button>
          <button
            className="btn btn-secondary mt-2 ms-2"
            onClick={() => setShowCommentBox(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => handlePagination("prev")}
          disabled={currentPage === 1}
        >
          &laquo; Previous
        </button>
        <span>
          Page {currentPage} of{" "}
          {Math.ceil(filteredRequests.length / requestsPerPage)}
        </span>
        <button
          className="btn btn-outline-primary"
          onClick={() => handlePagination("next")}
          disabled={
            currentPage === Math.ceil(filteredRequests.length / requestsPerPage)
          }
        >
          Next &raquo;
        </button>
      </div>

      <CSVLink
        data={filteredRequests}
        filename="requests.csv"
        className="btn btn-success mt-3"
      >
        Download CSV
      </CSVLink>

      {/* Modal for Viewing Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData && (
            <div>
              <p>
                <strong>ID:</strong> {modalData.id}
              </p>
              <p>
                <strong>Faculty Name:</strong> {modalData.name}
              </p>
              <p>
                <strong>Department:</strong> {modalData.department}
              </p>
              <p>
                <strong>Event Name:</strong> {modalData.event_name}
              </p>
              <p>
                <strong>Event Date:</strong> {modalData.event_date}
              </p>
              <p>
                <strong>Guest Name:</strong> {modalData.guest_name}
              </p>
              <p>
                <strong>Actual Intime:</strong> {modalData.Actual_intime}
              </p>
              <p>
                <strong>Actual Outtime:</strong> {modalData.Actual_outtime}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PrincipalRequests;