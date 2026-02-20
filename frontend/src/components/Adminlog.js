import React, { useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function AdminLog() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchDepartments();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://127.0.0.1:5001/all-requests", {
        params: { status: "Past" },
      });

      let sortedData = response.data.requests.sort(
        (a, b) => new Date(b.created_time) - new Date(a.created_time)
      );

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
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Logs</h2>
      <div className="d-flex justify-content-between mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
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
          <h5>No past requests found.</h5>
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
                <th>Faculty Name</th>
                <th>Department</th>
                <th>View Details</th>
                <th>Approval Letter</th>
                <th>Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
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
        filename="admin_logs.csv"
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
              <p><strong>ID:</strong> {modalData.id}</p>
              <p><strong>Faculty Name:</strong> {modalData.name}</p>
              <p><strong>Department:</strong> {modalData.department}</p>
              <p><strong>Event Name:</strong> {modalData.event_name}</p>
              <p><strong>Event Date:</strong> {modalData.event_date}</p>
              <p><strong>Time In:</strong> {modalData.time_in}</p>
              <p><strong>Time Out:</strong> {modalData.time_out}</p>
              <p><strong>otp</strong> {modalData.otp}</p>

              {/* Add more details if needed */}
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

export default AdminLog;