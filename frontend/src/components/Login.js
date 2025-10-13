import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { toast, ToastContainer } from "react-toastify";
import { FaLock, FaBuilding, FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [role, setRole] = useState("hod");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (role === "hod" && !department.trim()) {
      toast.error("Department is required for HOD.");
      setLoading(false);
      return;
    }

    try {
      const loginData = { password, role };
      if (role === "hod") loginData.department = department;

      const response = await loginUser(loginData);
      toast.success(`Welcome, ${role.toUpperCase()}!`, { autoClose: 1000 });

      setTimeout(() => {
        setLoading(false);
        const routes = {
          hod: "/hod-home",
          ao: "/all-requests",
          principal: "/principal-home",
          admin: "/admin",
          security: "/security",
        };
        navigate(routes[role], { state: { user: response.data.user } });
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 flex-column"
      style={{
        background: "linear-gradient(to right, #ffffff, #f0f0f0)",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* College Header with Logo */}
      <header className="text-center mb-3">
        <a href="https://www.kgkite.ac.in/" target="_blank" rel="noopener noreferrer">
          <img
            src={require("./logo.webp")}
            alt="KGiSL Institute of Technology Logo"
            className="mb-3"
            style={{ width: "120px", cursor: "pointer" }}
          />
        </a>
        <h2 className="text-primary fw-bold">KGISL</h2>
        <p className="text-secondary">Empowering Innovation & Excellence</p>
      </header>

      <div
        className="card shadow-lg p-4 rounded"
        style={{
          width: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h3 className="text-center text-primary mb-4 fw-bold">Login</h3>
        <form onSubmit={handleLogin}>
          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Role</label>
            <select
              className="form-select bg-white text-dark border"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="hod">HOD</option>
              <option value="ao">AO</option>
              <option value="principal">Principal</option>
              <option value="admin">Admin</option>
              <option value="security">Security</option>
            </select>
          </div>

          {/* Department Dropdown (Only for HOD) */}
          {role === "hod" && (
            <div className="mb-3">
              <label className="form-label text-dark fw-semibold">Department</label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <FaBuilding />
                </span>
                <select
                  className="form-select bg-white text-dark"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="AI&DS">AI&DS</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="CSBS">CSBS</option>
                  <option value="AI&ML">AI&ML</option>
                  <option value="CYS">CYS</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>
            </div>
          )}

          {/* Password Input with Show/Hide Feature */}
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* Eye Icon with Advanced UI */}
              <span
                className="input-group-text"
                style={{
                  background: "transparent",
                  borderLeft: "none",
                  cursor: "pointer",
                  transition: "0.3s ease",
                  color: showPassword ? "#007bff" : "#6c757d",
                  fontSize: "1.2rem",
                }}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => (e.target.style.color = "#007bff")}
                onMouseLeave={(e) => (e.target.style.color = showPassword ? "#007bff" : "#6c757d")}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button
            className="btn btn-primary w-100 fw-bold"
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(to right, #007bff, #0056b3)",
              border: "none",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "8px",
              transition: "all 0.3s ease-in-out",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Footer Section */}
      <footer
  className="text-center mt-4 p-2"
  style={{
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #ddd",
    fontSize: "14px",
    position: "absolute",
    bottom: 0,
  }}
>
  <a href="https://in.linkedin.com/company/ips-tech-community" target="_blank" rel="noopener noreferrer">
    <img
      src={require("./IPS WHITE batch.png")}
      alt="Company Logo"
      style={{ width: "50px", cursor: "pointer" }}
    />
  </a>
  <span className="text-secondary ms-2">IPS TECH COMMUNITY</span>
</footer>
    </div>
  );
}

export default Login;