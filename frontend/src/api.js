import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:5000" });

export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);
export const fetchRequests = (staffId) => API.get(`/requests/${staffId}`);
export const getStaffRequests = (staffId) => API.get(`/requests/${staffId}`);
export const createRequest = (formData) => API.post("/create-request", formData);
export const deleteRequest = (id) => API.delete(`/requests/${id}`);

// Admin: Create HOD login credentials
export const createHodCredentials = (data) => API.post("/create-hod", data);

// Fetch all requests for admin or higher roles
export const fetchAllRequests = () => API.get("/all-requests");

// Update request status (for approvals or rejections)
export const updateRequestStatus = (id, status) => 
  API.put(`/requests/${id}`, { status });

// 🔹 API to update remarks for a request
export const updateRemarks = (id, remarks) =>
  API.put(`/requests/${id}/remarks`, { remarks });

export const forgotPassword = async (email, newPassword) => {
  try {
    const response = await axios.post("/forgot-password", { email, new_password: newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Password reset failed";
  }
};

export async function validateEmailForReset(email) {
  const response = await fetch("/api/validate-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Email not found");
  }

  return await response.json();
}

export default API;
