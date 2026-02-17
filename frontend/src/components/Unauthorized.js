import React from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 flex-column">
      <div className="card shadow-lg p-5 text-center" style={{ width: "500px" }}>
        <h1 className="text-danger mb-3">🔒 Access Denied</h1>
        <p className="fs-5 mb-4">
          You don't have permission to access this page.
        </p>
        <p className="text-muted mb-4">
          Only authorized users can view this content.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/", { replace: true })}
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
