import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchRequests, createRequest } from "../api";
import CreateRequestPopup from "./CreateRequestPopup";

function StaffHome() {
  const location = useLocation();
  const user = location.state?.user || {}; // Safeguard if user is undefined
  const [requests, setRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load requests for the logged-in staff
  useEffect(() => {
    const loadRequests = async () => {
      try {
        console.log(`Fetching requests for staff ID: ${user.id}`); // Debug log
        const response = await fetchRequests(user.id);
        console.log("Requests received:", response.data); // Debug log
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error.response || error.message);
      }
    };

    if (user.id) {
      loadRequests();
    }
  }, [user.id]);

  // Handle new request submission
  const handleNewRequest = async (formData) => {
    setIsSubmitting(true); // Set loading state to true
    try {
      console.log("Submitting new request:", formData); // Debug log
      const response = await createRequest({ ...formData, staff_id: user.id });
      console.log("Request submitted successfully:", response.data); // Debug log

      // Update the request list with the new request
      setRequests((prevRequests) => [...prevRequests, response.data]);
      setShowPopup(false); // Close the popup
    } catch (error) {
      console.error("Error creating request:", error.response || error.message);
    } finally {
      setIsSubmitting(false); // Reset loading state after submission
    }
  };

  return (
    <div className="container mt-5">
      <h2>Welcome, {user.name}</h2>
      {/* <h1>{user.id}</h1> */}

      {/* Button to show the popup */}
      <button
        className="btn btn-primary"
        onClick={() => setShowPopup(true)}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Request..." : "Create New Request"}
      </button>

      {/* Create Request Popup */}
      <CreateRequestPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSubmit={handleNewRequest}
        staffId={user.id}
      />

      {/* Display the requests in a table */}
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
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.event_name}</td>
                <td>{req.guest_name}</td>
                <td>{req.event_date}</td>
                <td>{req.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                {requests.length === 0 ? "No requests found" : "Loading..."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StaffHome;
