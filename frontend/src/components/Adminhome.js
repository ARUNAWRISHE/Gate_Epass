import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faClock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const AdminHome = () => {
  const [stats, setStats] = useState({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
  });

  const chartRef = useRef(null); // Reference to canvas element
  const chartInstanceRef = useRef(null); // Store Chart instance

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Initialize Chart.js
  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new Chart instance
    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Total Requests", "Pending Requests", "Approved Requests"],
        datasets: [
          {
            data: [stats.total_requests, stats.pending_requests, stats.approved_requests],
            backgroundColor: ["#007bff", "#ffc107", "#28a745"],
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [stats]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* Statistics Cards */}
      <div className="row">
        <div className="col-md-4">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title">Total Requests</h5>
                <h3>{stats.total_requests}</h3>
              </div>
              <FontAwesomeIcon icon={faList} size="3x" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title">Pending Requests</h5>
                <h3>{stats.pending_requests}</h3>
              </div>
              <FontAwesomeIcon icon={faClock} size="3x" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title">Approved Requests</h5>
                <h3>{stats.approved_requests}</h3>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} size="3x" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="row mt-4">
        <div className="col-md-6 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center">Request Statistics</h5>
              <canvas ref={chartRef}></canvas> {/* Ref instead of ID */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
