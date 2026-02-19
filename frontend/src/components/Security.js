import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsQR from 'jsqr';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const QRScanner = () => {
    const [otp, setOtp] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [activeRequests, setActiveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (showScanner) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [showScanner]);

    useEffect(() => {
        return () => {
            stopCamera(); // Cleanup when the component unmounts
        };
    }, []);

    useEffect(() => {
        fetchActiveRequests();
    }, []);

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                // Start scanning automatically
                intervalRef.current = setInterval(captureAndScan, 500);
            } catch (error) {
                Swal.fire('Error!', 'Error accessing camera. Please grant permission.', 'error');
                console.error('Error accessing camera:', error);
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const captureAndScan = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                setOtp(code.data);
                verifyOTP(code.data);
                stopCamera(); // Stop the camera after successfully scanning
                setShowScanner(false); // Hide the scanner
            }
        }
    };

    const verifyOTP = async (otp) => {
        Swal.fire({
            title: 'Verifying...',
            text: 'Please wait while we verify the OTP.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
    
        try {
            const response = await axios.post('http://localhost:5001/verify-otp', { otp });
    
            Swal.close(); // Close loading alert
    
            if (response.data.success) {
                if (response.data.message === "Time already updated for this OTP") {
                    Swal.fire('Info', 'Time already updated for this OTP.', 'info');
                    return;
                }
    
                const { guest_name, department, event_name, time_in, actual_intime,guest_image } = response.data.request;
    
                const currentTime = new Date();
                const formattedCurrentTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
                console.log("Database Time In:", time_in);
                console.log("Current Scanned Time:", formattedCurrentTime);
    
                // Convert stored time_in and current time into Date objects for comparison
                const parseTime = (timeStr) => {
                    const [time, period] = timeStr.split(" ");
                    const [hour, minute] = time.split(":").map(Number);
                    let hours = period === "PM" && hour !== 12 ? hour + 12 : hour;
                    hours = period === "AM" && hour === 12 ? 0 : hours;
                    return new Date().setHours(hours, minute, 0, 0);
                };
    
                const storedTimeValue = parseTime(time_in);
                const currentTimeValue = parseTime(formattedCurrentTime);
    
                // Compare scanned time with database `time_in`
                if (currentTimeValue < storedTimeValue) {
                    Swal.fire({
                        title: "Too Early!",
                        text: `You are early. Please wait until ${time_in} to check in.`,
                        icon: "warning",
                    });
                    return;
                }
    
                // Show guest details and ask to mark in-time
                await Swal.fire({
                    title: 'Guest Details',
                    html: `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        ${guest_image ? `
                            <img src="${guest_image}" alt="Guest Image" onclick="window.open('${guest_image}', '_blank')"
                                style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; cursor: pointer;" />
                        ` : '<p>No Image Available</p>'}
                        <p><strong>Guest Name:</strong> ${guest_name}</p>
                        <p><strong>Department:</strong> ${department}</p>
                        <p><strong>Event Name:</strong> ${event_name}</p>
                        <p><strong>Campus:</strong> Kite</p>
                    </div>
                `,
                icon: 'info',
                });
    
                if (actual_intime === "Not Arrived") {
                    const { isConfirmed } = await Swal.fire({
                        title: "Mark In-Time?",
                        text: "Do you want to mark the in-time for this guest?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Yes, mark in-time",
                        cancelButtonText: "No",
                    });
    
                    if (isConfirmed) {
                        await axios.post('http://localhost:5001/update-time', { otp, action: 'arrived' });
                        Swal.fire('Success!', 'In-time updated successfully!', 'success');
                    }
                }
    
                if (actual_intime !== "Not Arrived" && response.data.request.actual_outtime === "Not Arrived") {
                    const { isConfirmed } = await Swal.fire({
                        title: "Mark Out-Time?",
                        text: "Do you want to mark the out-time for this guest?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Yes, mark out-time",
                        cancelButtonText: "No",
                    });
    
                    if (isConfirmed) {
                        Swal.fire({
                            title: 'Updating...',
                            text: 'Please wait while we update the out-time.',
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            },
                        });
                        await axios.post('http://localhost:5001/update-time', { otp, action: 'left' });
                        Swal.close();
                        Swal.fire('Success!', 'Out-time updated successfully!', 'success');
                    }
                }
            }
        } catch (error) {
            Swal.fire('Error!', 'Error verifying OTP. Please try again.', 'error');
            console.error('Error:', error);
        }
    };
    
    const fetchActiveRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/active-requests');
            setActiveRequests(response.data);
        } catch (error) {
            console.error("Error fetching active requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#0f52fc', color: 'white' }}>
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center text-white" to="/security">
                        <i className="bi bi-shield-check me-2"></i>
                        <span>Security Dashboard</span>
                    </Link>
                    <div className="header-actions ms-auto">
                        <button 
                            className="btn btn-outline-light inline-logout-btn" 
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <h2 className="text-center fw-bold mb-4 text-primary">Security QR Scanner</h2>

            <div className="d-flex justify-content-center mb-4">
                <button 
                    onClick={() => setShowScanner(!showScanner)} 
                    className={`btn ${showScanner ? 'btn-danger' : 'btn-success'} px-4 py-2`}
                >
                    {showScanner ? 'Stop Scanner' : 'Start Scanner'}
                </button>
            </div>

            {showScanner && (
                <div className="scanner-card card shadow-lg p-3 text-center">
                    <video ref={videoRef} width="100%" autoPlay playsInline className="rounded"></video>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            )}

            {/* Active Requests Table */}
            <div className="table-responsive mt-4">
                <h3 className="text-center text-secondary">Active Requests</h3>
                {loading ? (
                    <div className="text-center my-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <table className="table table-hover shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Guest Name</th>
                                <th>Phone</th>
                                <th>Event Name</th>
                                <th>Actual In-Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeRequests.length > 0 ? (
                                activeRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.id}</td>
                                        <td>{req.guest_name}</td>
                                        <td>{req.guest_phone}</td>
                                        <td>{req.event_name}</td>
                                        <td>{req.Actual_intime}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">No active requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <style jsx>{`
                .scanner-card {
                    width: 100%;
                    max-width: 500px;
                    margin: auto;
                    border-radius: 10px;
                    background: white;
                    transition: 0.3s ease-in-out;
                }
                .scanner-card video {
                    border: 2px solid #007bff;
                    border-radius: 8px;
                }
            `}</style>
            </div>
        </div>
    );
};

export default QRScanner;
