import React, { useState, useEffect } from "react";
import axios from "axios";

const ShowRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [perPage] = useState(10);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/requests?page=${page}&per_page=${perPage}&filter=${filter}`
      );
      setRequests(response.data.data);
      setTotalRequests(response.data.total);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, filter]);

  const handleSearchChange = (e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="container mt-5">
      <h3>All Requests</h3>
      <div className="row">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Department"
            value={filter}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-md-8 text-right">
          <button className="btn btn-primary">Show All Requests</button>
        </div>
      </div>
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Guest Name</th>
            <th>Event Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.event_name}</td>
              <td>{req.guest_name}</td>
              <td>{req.event_date}</td>
              <td>{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          className="btn btn-secondary"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          className="btn btn-secondary"
          onClick={() => handlePageChange(page + 1)}
          disabled={page * perPage >= totalRequests}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShowRequestsPage;
