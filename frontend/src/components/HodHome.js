import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchRequests, createRequest } from "../api";
import CreateRequestPopup from "./CreateRequestPopup";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function HodHome() {
  const location = useLocation();
  const user = location.state?.user || {};
  const [requests, setRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch Requests (useCallback to prevent unnecessary re-renders)
  const loadRequests = useCallback(async () => {
    if (!user.id) return; // Ensure user ID is available

    try {
      setLoading(true);
      const response = await fetchRequests(user.id);

      if (response?.data) {
        setRequests(response.data);
      } else {
        console.warn("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching requests:", error.message || error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Handle New Request Submission
  const handleNewRequest = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await createRequest({ ...formData, hod_id: user.id });
      setRequests((prevRequests) => [...prevRequests, response.data]);
      setShowPopup(false);
    } catch (error) {
      console.error("Error creating request:", error.response || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // Status field (Styled Badges)
  const getStatusBadge = (status) => {
    const statusColors = {
      accepted: { background: "#28a745", textColor: "#ffffff" }, // Green
      pending: { background: "#ffc107", textColor: "#000000" }, // Yellow
      rejected: { background: "#dc3545", textColor: "#ffffff" },
      "principal approved": { background: "#ffc107", textColor: "#000000" }, // Red
    };

    const { background, textColor } = statusColors[status?.toLowerCase()] || {
      background: "#6c757d",
      textColor: "#ffffff",
    };

    return (
      <Box
        sx={{
          backgroundColor: background,
          color: textColor,
          fontWeight: "bold",
          textAlign: "center",
          borderRadius: "8px",
          padding: "6px 12px",
          display: "inline-block",
          minWidth: "120px",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        {status || "Unknown"}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h4" sx={styles.userName}>
          Welcome, {user.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowPopup(true)}
          disabled={isSubmitting}
          sx={styles.createBtn}
        >
          {isSubmitting ? "Creating..." : "Create Request"}
        </Button>
      </Box>

      {/* Popup Dialog for Creating Request */}
      {showPopup && (
        <CreateRequestPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onSubmit={handleNewRequest}
          hodId={user.id}
        />
      )}

      {/* Request Table */}
      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.th}>ID</TableCell>
              <TableCell sx={styles.th}>Event Name</TableCell>
              <TableCell sx={styles.th}>Guest Name</TableCell>
              <TableCell sx={styles.th}>Event Date</TableCell>
              <TableCell sx={styles.th}>Remarks</TableCell>
              <TableCell sx={styles.th}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} sx={styles.loadingContainer}>
                  <CircularProgress size={30} color="primary" />
                </TableCell>
              </TableRow>
            ) : requests.length > 0 ? (
              requests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((req) => (
                  <TableRow key={req.id} sx={styles.row}>
                    <TableCell>{req.id}</TableCell>
                    <TableCell>{req.event_name}</TableCell>
                    <TableCell>{req.guest_name}</TableCell>
                    <TableCell>{req.event_date}</TableCell>
                    <TableCell>{req.remarks || "No Remarks"}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={styles.noData}>
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={requests.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
}

// *Styled Components*
const styles = {
  container: {
    marginTop: 5,
    padding: 3,
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "3px solid #004080",
    paddingBottom: "10px",
    marginBottom: "20px",
  },
  userName: {
    fontWeight: "bold",
    color: "#004080",
  },
  createBtn: {
    backgroundColor: "#004080",
    "&:hover": {
      backgroundColor: "#003366",
    },
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    textTransform: "none",
  },
  tableContainer: {
    marginTop: "20px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  th: {
    backgroundColor: "#004080",
    color: "white",
    fontWeight: "bold",
    textAlign: "left",
  },
  row: {
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  loadingContainer: {
    textAlign: "center",
    padding: "20px",
  },
  noData: {
    textAlign: "center",
    fontStyle: "italic",
    color: "gray",
    padding: "20px",
  },
};

export default HodHome;
