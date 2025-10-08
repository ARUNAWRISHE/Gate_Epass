import React, { useState } from "react";
import axios from "axios";
import "./CreateRequestPopup.css";

const CreateRequestPopup = ({ isOpen, onClose, onSubmit, hodId }) => {
  const [formData, setFormData] = useState({
    name: "",
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
    appreciation_letter: null,
    image:null,
    hod_id: hodId || "",
  });

  const [accompanyPersons, setAccompanyPersons] = useState([]);
  const [showAccompanyFields, setShowAccompanyFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]; 
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: file, // Store the file object
      }));
    }
  };
  


  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];
    const eventDate = formData.event_date;

    if (!formData.name) newErrors.name = "Please fill in the Name.";
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
    if (!formData.approvalLetter) newErrors.approvalLetter = "Please upload the Approval Letter.";
    if (!formData.appreciation_letter) newErrors.appreciation_letter = "Please upload the Appreciation Letter.";
    if (!formData.image) newErrors.image = "Please upload the Image.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccompanySelection = (value) => {
    setShowAccompanyFields(value === "Yes");
    setAccompanyPersons([]);
  };

  const handleAddAccompanyPerson = (num) => {
    const persons = Array.from({ length: num }, () => ({ name: "", phone: "" }));
    setAccompanyPersons(persons);
  };
  const getOutTimeOptions = () => {
    const [hour, minute, period] = formData.time_in.split(/[: ]/);
    let inHour = parseInt(hour);
    let inPeriod = period;

    // Convert to 24-hour format for easy comparison
    if (inPeriod === "PM" && inHour !== 12) inHour += 12;
    if (inPeriod === "AM" && inHour === 12) inHour = 0;

    const options = [];
    for (let h = inHour + 1; h <= 19; h++) {
      let displayHour = h > 12 ? h - 12 : h;
      let displayPeriod = h >= 12 ? "PM" : "AM";
      options.push(`${displayHour}:00 ${displayPeriod}`);
      options.push(`${displayHour}:30 ${displayPeriod}`);
    }
    return options;
  };
  
  const handleAccompanyPersonChange = (index, field, value) => {
    const updatedPersons = [...accompanyPersons];
    updatedPersons[index][field] = value;
    setAccompanyPersons(updatedPersons);
  };
  const [manualTime, setManualTime] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    const formPayload = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        formPayload.append(key, formData[key]);
      }
    }
  
    // Append accompanying persons if they exist
    if (accompanyPersons.length > 0) {
      formPayload.append("accompanyPersons", JSON.stringify(accompanyPersons));
    }
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/create-hod-request",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      setSuccessMessage("Request Created Successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      alert("Request Created Successfully!");
      onSubmit(response.data);
  
      if (accompanyPersons.length > 0) {
        await axios.post(
          "http://127.0.0.1:5000/add-accompany-persons",
          { requestId: response.data.requestId, accompanyPersons },
          { headers: { "Content-Type": "application/json" } }
        );
      }
  
      onClose();
      setFormData({
        name: "",
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
        appreciation_letter: null, // Reset file input
        image: null, // Reset guest image field
        hod_id: hodId || "",
      });
      setAccompanyPersons([]);
    } catch (error) {
      console.log("Error Response:", error.response?.data); // Debugging
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || "An unknown error occurred.";
      setErrors({ server: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`popup-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-container">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Create HOD Request</h2>
        <form onSubmit={handleSubmit}>
          {errors.server && <p className="error">{errors.server}</p>}
          <input type="hidden" name="hod_id" value={formData.hod_id} />
  
          {/* Existing Fields */}
          <div className="form-group">
            <label>Faculty Incharge Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
  
          <div className="form-group">
            <label>Event Date:</label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            />
            {errors.event_date && <p className="error">{errors.event_date}</p>}
          </div>
  
          <div className="form-group">
            <label>Event Name:</label>
            <input
              type="text"
              name="event_name"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
            />
            {errors.event_name && <p className="error">{errors.event_name}</p>}
          </div>
  
          {/* Checkbox to toggle manual time selection */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={manualTime}
                onChange={() => setManualTime(!manualTime)}
              />
                Is This Hackathon
            </label>
          </div>
  
          {!manualTime ? (
            <>
              {/* Default Time Selection (Dropdowns) */}
              <div className="form-group">
                <label>In Time:</label>
                <select
                  value={formData.time_in}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_in: e.target.value,
                      time_out: getOutTimeOptions()[0], // Auto-adjust Out Time
                    })
                  }
                >
                  {Array.from({ length: 14 }, (_, i) => {
                    const hour = i + 6;
                    const period = hour >= 12 ? "PM" : "AM";
                    const displayHour = hour > 12 ? hour - 12 : hour;
                    return [`${displayHour}:00 ${period}`, `${displayHour}:30 ${period}`];
                  })
                    .flat()
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
              </div>
  
              <div className="form-group">
                <label>Out Time:</label>
                <select
                  value={formData.time_out}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_out: e.target.value,
                    })
                  }
                >
                  {getOutTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Manual Time Selection */}
              <div className="form-group">
                <label>In Time:</label>
                <div className="time-picker">
                  <select
                    value={formData.time_in?.split(":")[0] || "1"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_in: `${e.target.value}:${formData.time_in?.split(":")[1] || "00"} ${
                          formData.time_in?.split(" ")[1] || "AM"
                        }`,
                      })
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
  
                  <select
                    value={formData.time_in?.split(":")[1]?.split(" ")[0] || "00"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_in: `${formData.time_in?.split(":")[0] || "1"}:${e.target.value} ${
                          formData.time_in?.split(" ")[1] || "AM"
                        }`,
                      })
                    }
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                      (min) => (
                        <option key={min} value={min}>
                          {min}
                        </option>
                      )
                    )}
                  </select>
  
                  <select
                    value={formData.time_in?.split(" ")[1] || "AM"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_in: `${formData.time_in?.split(":")[0] || "1"}:${
                          formData.time_in?.split(":")[1]?.split(" ")[0] || "00"
                        } ${e.target.value}`,
                      })
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
  
              <div className="form-group">
                <label>Out Time:</label>
                <div className="time-picker">
                  <select
                    value={formData.time_out?.split(":")[0] || "1"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_out: `${e.target.value}:${formData.time_out?.split(":")[1] || "00"} ${
                          formData.time_out?.split(" ")[1] || "AM"
                        }`,
                      })
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
  
                  <select
                    value={formData.time_out?.split(":")[1]?.split(" ")[0] || "00"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_out: `${formData.time_out?.split(":")[0] || "1"}:${e.target.value} ${
                          formData.time_out?.split(" ")[1] || "AM"
                        }`,
                      })
                    }
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                      (min) => (
                        <option key={min} value={min}>
                          {min}
                        </option>
                      )
                    )}
                  </select>
  
                  <select
                    value={formData.time_out?.split(" ")[1] || "AM"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_out: `${formData.time_out?.split(":")[0] || "1"}:${
                          formData.time_out?.split(":")[1]?.split(" ")[0] || "00"
                        } ${e.target.value}`,
                      })
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </>
          )}
  
          <div className="form-group">
            <label>Guest Name:</label>
            <input
              type="text"
              name="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
            />
            {errors.guest_name && <p className="error">{errors.guest_name}</p>}
          </div>
        
  

          <div className="form-group">
            <label>Company Detail:</label>
            <input
              type="text"
              name="company_detail"
              value={formData.company_detail}
              onChange={(e) => setFormData({ ...formData, company_detail: e.target.value })}
            />
            {errors.company_detail && <p className="error">{errors.company_detail}</p>}
          </div>
          <div className="form-group">
            <label>Purpose:</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            ></input>
            {errors.purpose && <p className="error">{errors.purpose}</p>}
          </div>
          <div className="form-group">
            <label>Guest Email:</label>
            <input
              type="email"
              name="guest_email"
              value={formData.guest_email}
              onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
            />
            {errors.guest_email && <p className="error">{errors.guest_email}</p>}
          </div>

          <div className="form-group">
            <label>Guest Phone:</label>
            <input
              type="text"
              name="guest_phone"
              value={formData.guest_phone}
              onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
            />
            {errors.guest_phone && <p className="error">{errors.guest_phone}</p>}
          </div>
          <label>Mode of Transport:</label>
          <select
            name="modeOfTransport"
            value={formData.modeOfTransport || ""}
            onChange={(e) => setFormData({ ...formData, modeOfTransport: e.target.value })}
            required
          >
            <option value="">Select Mode</option>
            <option value="own">Own</option>
            <option value="taxi">Taxi</option>
          </select>

          {/* Show additional fields only if "own" is selected */}
          {formData.modeOfTransport === "own" && (
            <>
              <label>Vehicle Type:</label>
              <select
                name="vehicleType"
                value={formData.vehicleType || ""}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="two-wheeler">Two-Wheeler</option>
                <option value="four-wheeler">Four-Wheeler</option>
              </select>

              <label>Vehicle Number:</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber || ""}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                required
              />
            </>
          )}


          <div className="form-group">
            <label>Approval Letter:</label>
            <input
              type="file"
              name="approvalLetter"
              accept=".jpg, .jpeg, .png, .pdf"
              onChange={(e) => handleFileChange(e, "approvalLetter")}
            />
            {errors.approvalLetter && <p className="error">{errors.approvalLetter}</p>}
          </div>
          <div className="form-group">
  <label>Appreciation Letter:</label>
  <input
    type="file"
    name="appreciation_letter"
    accept=".jpg, .jpeg, .png, .pdf"
    onChange={(e) => handleFileChange(e, "appreciation_letter")}
  />
  {errors.appreciation_letter && <p className="error">{errors.appreciation_letter}</p>}
</div>
<div className="form-group">
  <label>Guest Image:</label>
  <input
    type="file"
    name="image"
    accept=".jpg, .jpeg, .png"
    onChange={(e) => handleFileChange(e, "image")}
  />
  {errors.image && <p className="error">{errors.image}</p>}
</div>

{/* Accompanying Person Logic */}
<div className="form-group">
            <label>Accompanying Person:</label>
            <select
              onChange={(e) => handleAccompanySelection(e.target.value)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {showAccompanyFields && (
            <div className="form-group">
              <label>Number of Persons:</label>
              <select
                onChange={(e) => handleAddAccompanyPerson(Number(e.target.value))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          )}

          {accompanyPersons.map((person, index) => (
            <div key={index} className="form-group">
              <label>Person {index + 1} Name:</label>
              <input
                type="text"
                value={person.name}
                onChange={(e) => handleAccompanyPersonChange(index, "name", e.target.value)}
              />
              <label>Person {index + 1} Phone:</label>
              <input
                type="text"
                value={person.phone}
                onChange={(e) => handleAccompanyPersonChange(index, "phone", e.target.value)}
              />
            </div>
          ))}

          <button type="submit" className = "submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>

        {successMessage && <p className="success">{successMessage}</p>}
      </div>
    </div>
  );
};

export default CreateRequestPopup;
