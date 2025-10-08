import React, { useState } from "react";
import axios from "axios";
import "./CreateaoRequestPopup.css";

const CreateAORequestPopup = ({ isOpen, onClose, onSubmit, hodId }) => {
  const [formData, setFormData] = useState({
    name: "AO",
    department: "AO",
    event_name: "",
    event_date: "",
    time_in: "",
    time_out: "",
    guest_name: "",
    company_detail: "",
    purpose: "",
    guest_email: "",
    guest_phone: "",
    approvalLetter: null,
    hod_id: hodId || "",
  });

  const [accompanyPersons, setAccompanyPersons] = useState([]);
  const [showAccompanyFields, setShowAccompanyFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];
    const eventDate = formData.event_date;

    if (!formData.event_name) newErrors.event_name = "Please fill in the Event Name.";
    if (!formData.event_date) newErrors.event_date = "Please fill in the Event Date.";
    else if (eventDate < today) newErrors.event_date = "Event date cannot be in the past.";
    if (!formData.time_in) newErrors.time_in = "Please select the In Time.";
    if (!formData.time_out) newErrors.time_out = "Please select the Out Time.";
    if (!formData.guest_name) newErrors.guest_name = "Please fill in the Guest Name.";
    if (!formData.company_detail) newErrors.company_detail = "Please fill in the Company Detail.";
    if (!formData.purpose) newErrors.purpose = "Please fill in the Purpose.";
    if (!formData.guest_email) newErrors.guest_email = "Please fill in the Guest Email.";
    if (!formData.guest_phone) newErrors.guest_phone = "Please fill in the Guest Phone.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");
  
    const form = new FormData();
  
    for (let key in formData) {
      form.append(key, formData[key]);
    }
  
    // Append accompanyPersons correctly
    accompanyPersons.forEach((person) => {
      form.append("accompanyPersons[]", `${person.name},${person.phone}`);
    });
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/create-ao-request", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setSuccessMessage("Request created successfully!");
      setFormData({
        name: "AO",
        department: "AO",
        event_name: "",
        event_date: "",
        time_in: "",
        time_out: "",
        guest_name: "",
        company_detail: "",
        purpose: "",
        guest_email: "",
        guest_phone: "",
        approvalLetter: null,
        hod_id: hodId || "",
      });
  
      setAccompanyPersons([]);
      onSubmit(response.data);
      onClose();
  
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrors({ submit: err.response.data.message || "Invalid request. Please check your input." });
      } else {
        setErrors({ submit: "Failed to create request. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`modal ${isOpen ? "show" : ""}`} style={{ display: isOpen ? "block" : "none" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create AO Request</h5>
            <button type="button" className="close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="event_name">Event Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="event_name"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                />
                {errors.event_name && <div className="text-danger">{errors.event_name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="event_date">Event Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="event_date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                />
                {errors.event_date && <div className="text-danger">{errors.event_date}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="time_in">Time In</label>
                <input
                  type="time"
                  className="form-control"
                  id="time_in"
                  name="time_in"
                  value={formData.time_in}
                  onChange={handleInputChange}
                />
                {errors.time_in && <div className="text-danger">{errors.time_in}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="time_out">Time Out</label>
                <input
                  type="time"
                  className="form-control"
                  id="time_out"
                  name="time_out"
                  value={formData.time_out}
                  onChange={handleInputChange}
                />
                {errors.time_out && <div className="text-danger">{errors.time_out}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="guest_name">Guest Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="guest_name"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={handleInputChange}
                />
                {errors.guest_name && <div className="text-danger">{errors.guest_name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="company_detail">Company Detail</label>
                <input
                  type="text"
                  className="form-control"
                  id="company_detail"
                  name="company_detail"
                  value={formData.company_detail}
                  onChange={handleInputChange}
                />
                {errors.company_detail && <div className="text-danger">{errors.company_detail}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose</label>
                <input
                  type="text"
                  className="form-control"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                />
                {errors.purpose && <div className="text-danger">{errors.purpose}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="guest_email">Guest Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="guest_email"
                  name="guest_email"
                  value={formData.guest_email}
                  onChange={handleInputChange}
                />
                {errors.guest_email && <div className="text-danger">{errors.guest_email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="guest_phone">Guest Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  id="guest_phone"
                  name="guest_phone"
                  value={formData.guest_phone}
                  onChange={handleInputChange}
                />
                {errors.guest_phone && <div className="text-danger">{errors.guest_phone}</div>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              {errors.submit && <div className="text-danger mt-2">{errors.submit}</div>}
              {successMessage && <div className="text-success mt-2">{successMessage}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAORequestPopup;
