import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash, FaSearch, FaEdit, FaTrash } from "react-icons/fa";

const AddHodAndShowHodsPage = () => {
  const [hodData, setHodData] = useState({
    name: "",
    department: "",
    password: "",
  });

  const [hods, setHods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHod, setEditingHod] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetching HODs
  useEffect(() => {
    const fetchHods = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/hods");
        setHods(response.data);
      } catch (error) {
        console.error("Error fetching HODs:", error);
      }
    };

    fetchHods();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHodData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitHod = async (e) => {
    e.preventDefault();
    try {
      if (editingHod) {
        await axios.put(`http://localhost:5001/api/update-hod/${editingHod.id}`, hodData);
      } else {
        await axios.post("http://localhost:5001/api/create-hod", hodData);
      }

      alert(`HOD ${editingHod ? "Updated" : "Added"} Successfully`);
      setShowModal(false);
      setEditingHod(null);
      setHodData({ name: "", department: "", password: "" });
    } catch (error) {
      alert("Error saving HOD");
    }
  };

  const handleEditHod = (hod) => {
    setEditingHod(hod);
    setHodData({
      name: hod.name,
      department: hod.department,
      password: hod.password,
    });
    setShowModal(true);
  };

  const handleDeleteHod = async (hodId) => {
    if (window.confirm("Are you sure you want to delete this HOD?")) {
      try {
        await axios.delete(`http://localhost:5001/api/delete-hod/${hodId}`);
        alert("HOD Deleted Successfully");
      } catch (error) {
        alert("Error deleting HOD");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">HOD Management</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New HOD
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-3 d-flex">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Name or Department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-secondary" className="ms-2">
          <FaSearch />
        </Button>
      </div>

      {/* HODs Table */}
      <Table striped bordered hover>
        <thead className="bg-primary text-white">
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hods
            .filter(
              (hod) =>
                hod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hod.department.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((hod) => (
              <tr key={hod.id}>
                <td>{hod.name}</td>
                <td>{hod.department}</td>
                <td>*******</td>
                <td>
                  <Button variant="warning" className="me-2" onClick={() => handleEditHod(hod)}>
                    <FaEdit />
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteHod(hod.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* Modal for Adding/Editing HOD */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingHod ? "Edit HOD" : "Add New HOD"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitHod}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter Name"
                value={hodData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                name="department"
                placeholder="Enter Department"
                value={hodData.department}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  value={hodData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingHod ? "Update HOD" : "Add HOD"}
            </Button>
            <Button variant="secondary" className="ms-2" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddHodAndShowHodsPage;
