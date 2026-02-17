import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Component
 * Prevents unauthorized access to pages
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ element, user, allowedRoles = [] }) => {
  // Check if user is logged in (has user data in state)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role (if specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;
