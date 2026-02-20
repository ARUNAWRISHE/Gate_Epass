import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateRequestPopup.css";

// Helper function to format time (e.g., 9:05 AM)
const formatTime = (hour, minute, period) => {
  const formattedHour = hour.toString();
  const formattedMinute = minute.toString().padStart(2, '0');
  return `${formattedHour}:${formattedMinute} ${period}`;
};

// Helper function to parse time (e.g., "1:30 PM" -> {h: 1, m: 30, p: 'PM'})
const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 1, minute: 0, period: 'AM' };
    const [time, period] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    return {
        hour: parseInt(hourStr, 10) || 1,
        minute: parseInt(minuteStr, 10) || 0,
        period: period || 'AM',
    };
};

const CreateRequestPopup = ({ isOpen, onClose, onSubmit, hodId }) => {
  const [formData, setFormData] = useState({
    name: "",
    event_name: "",
    event_date: "",
    time_in: "1:00 AM", // Initialized for manual time clarity
    time_out: "1:00 AM", // Initialized for manual time clarity
    guest_name: "",
    company_detail: "",
    purpose: "",
    guest_email: "",
    guest_phone: "",
    approvalLetter: null,
    appreciation_letter: null,
    image: null,
    hod_id: hodId || "",
    modeOfTransport: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [accompanyPersons, setAccompanyPersons] = useState([]);
  const [showAccompanyFields, setShowAccompanyFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isHackathon, setIsHackathon] = useState(false); // Renamed for clarity

  // Separate states for manual time components
  const [manualTimeIn, setManualTimeIn] = useState(parseTime(formData.time_in));
  const [manualTimeOut, setManualTimeOut] = useState(parseTime(formData.time_out));

  // Sync manual time state with formData
  useEffect(() => {
    if (isHackathon) {
        setFormData(prevData => ({
            ...prevData,
            time_in: formatTime(manualTimeIn.hour, manualTimeIn.minute, manualTimeIn.period),
            time_out: formatTime(manualTimeOut.hour, manualTimeOut.minute, manualTimeOut.period),
        }));
    }
  }, [manualTimeIn, manualTimeOut, isHackathon]);


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
    if (!formData.modeOfTransport) newErrors.modeOfTransport = "Please select a Mode of Transport.";
    if (formData.modeOfTransport === "own") {
        if (!formData.vehicleType) newErrors.vehicleType = "Please select a Vehicle Type.";
        if (!formData.vehicleNumber) newErrors.vehicleNumber = "Please enter the Vehicle Number.";
    }

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
    if (!formData.time_in) return [];

    try {
      // Parse the input time (format: "H:MM AM/PM")
      const [timeStr, period] = formData.time_in.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const options = [];

      // Start from 30 minutes after the in-time
      let currentHour = hours;
      let currentMinute = minutes + 30;

      if (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }

      // Generate time slots until 7:00 PM (19:00)
      while (currentHour < 19 || (currentHour === 19 && currentMinute === 0)) {
        // Convert back to 12-hour format
        const displayHour = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
        const displayPeriod = currentHour >= 12 ? 'PM' : 'AM';
        const formattedMinute = currentMinute.toString().padStart(2, '0');

        options.push(`${displayHour}:${formattedMinute} ${displayPeriod}`);

        // Move to next 30-minute slot
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
      }

      return options;
    } catch (error) {
      console.error('Error generating out time options:', error);
      return [];
    }
  };

  const handleAccompanyPersonChange = (index, field, value) => {
    const updatedPersons = [...accompanyPersons];
    updatedPersons[index][field] = value;
    setAccompanyPersons(updatedPersons);
  };

  // New handler for manual time changes
  const handleManualTimeChange = (timeField, part, value) => {
    const setter = timeField === 'in' ? setManualTimeIn : setManualTimeOut;
    setter(prev => ({
        ...prev,
        [part]: part === 'minute' || part === 'hour' ? parseInt(value, 10) : value
    }));
  };

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
        "http://127.0.0.1:5001/create-hod-request",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccessMessage("Request Created Successfully!");
      setTimeout(() => {
        // Close the popup instead of reloading the page
        if (isOpen) {
          onClose(); // Close the popup
          // Refresh the requests list without losing login
          if (onSubmit) onSubmit(response.data);
        }
      }, 1000);
      alert("Request Created Successfully!");

      if (accompanyPersons.length > 0) {
        // Assuming the backend handles saving accompany persons after request creation
        // Note: The original logic here was a separate POST request, which is preserved.
        await axios.post(
          "http://127.0.0.1:5001/add-accompany-persons",
          { requestId: response.data.request_id, accompanyPersons },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      onClose(); // Close the popup after successful submission
      // Reset form data for a clean slate
      setFormData({
        name: "",
        event_name: "",
        event_date: "",
        time_in: isHackathon ? "1:00 AM" : getOutTimeOptions()[0] || "",
        time_out: isHackathon ? "1:00 AM" : getOutTimeOptions()[0] || "",
        guest_name: "",
        company_detail: "",
        purpose: "",
        guest_email: "",
        guest_phone: "",
        approvalLetter: null,
        appreciation_letter: null,
        image: null,
        hod_id: hodId || "",
        modeOfTransport: "",
        vehicleType: "",
        vehicleNumber: "",
      });
      setAccompanyPersons([]);
      setManualTimeIn(parseTime("1:00 AM"));
      setManualTimeOut(parseTime("1:00 AM"));

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

          {/* Checkbox to toggle between default and manual time selection */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isHackathon}
                onChange={() => setIsHackathon(!isHackathon)} // Use isHackathon state
              />
                Is This Hackathon (Enable flexible time selection)
            </label>
          </div>

          {!isHackathon ? (
            <>
              {/* Default Time Selection (Dropdowns) - Limited Slots */}
              <div className="form-group">
                <label>In Time:</label>
                <select
                  value={formData.time_in}
                  onChange={(e) => {
                    const newTimeIn = e.target.value;
                    const options = getOutTimeOptions();
                    setFormData({
                      ...formData,
                      time_in: newTimeIn,
                      time_out: options.length > 0 ? options[0] : "", // Auto-adjust Out Time
                    });
                  }}
                >
                  <option value="">Select In Time</option>
                  {Array.from({ length: 14 }, (_, i) => {
                    const hour = i + 6;
                    const period = hour >= 12 ? "PM" : "AM";
                    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return [`${displayHour}:00 ${period}`, `${displayHour}:30 ${period}`];
                  })
                    .flat()
                    .slice(0, 27) // To limit up to 6:30 PM (or adjust as needed)
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
                {errors.time_in && <p className="error">{errors.time_in}</p>}
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
                    <option value="">Select Out Time</option>
                  {getOutTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.time_out && <p className="error">{errors.time_out}</p>}
              </div>
            </>
          ) : (
            <>
              {/* Manual Time Selection (Alarm-like Time Picker) */}
              <div className="form-group">
                <label>In Time:</label>
                <div className="time-picker">
                  <select
                    value={manualTimeIn.hour}
                    onChange={(e) => handleManualTimeChange('in', 'hour', e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>

                  <select
                    value={manualTimeIn.minute}
                    onChange={(e) => handleManualTimeChange('in', 'minute', e.target.value)}
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                      (min) => (
                        <option key={min} value={parseInt(min, 10)}>
                          {min}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={manualTimeIn.period}
                    onChange={(e) => handleManualTimeChange('in', 'period', e.target.value)}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {errors.time_in && <p className="error">{errors.time_in}</p>}
              </div>

              <div className="form-group">
                <label>Out Time:</label>
                <div className="time-picker">
                  <select
                    value={manualTimeOut.hour}
                    onChange={(e) => handleManualTimeChange('out', 'hour', e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>

                  <select
                    value={manualTimeOut.minute}
                    onChange={(e) => handleManualTimeChange('out', 'minute', e.target.value)}
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                      (min) => (
                        <option key={min} value={parseInt(min, 10)}>
                          {min}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={manualTimeOut.period}
                    onChange={(e) => handleManualTimeChange('out', 'period', e.target.value)}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {errors.time_out && <p className="error">{errors.time_out}</p>}
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

          <div className="form-group">
            <label>Mode of Transport:</label>
            <select
              name="modeOfTransport"
              value={formData.modeOfTransport || ""}
              onChange={(e) => setFormData({ ...formData, modeOfTransport: e.target.value })}
            >
              <option value="">Select Mode</option>
              <option value="own">Own</option>
              <option value="taxi">Taxi</option>
            </select>
            {errors.modeOfTransport && <p className="error">{errors.modeOfTransport}</p>}
          </div>

          {/* Show additional fields only if "own" is selected */}
          {formData.modeOfTransport === "own" && (
            <>
              <div className="form-group">
                <label>Vehicle Type:</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType || ""}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="two-wheeler">Two-Wheeler</option>
                  <option value="four-wheeler">Four-Wheeler</option>
                </select>
                {errors.vehicleType && <p className="error">{errors.vehicleType}</p>}
              </div>

              <div className="form-group">
                <label>Vehicle Number:</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber || ""}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                />
                {errors.vehicleNumber && <p className="error">{errors.vehicleNumber}</p>}
              </div>
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