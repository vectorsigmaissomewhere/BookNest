// src/Components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // 1. Not logged in? Redirect to login, preserving where they were heading.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If a role is required and it doesn't match, also kick them out.
  if (requiredRole && role !== requiredRole) {
    // you could also redirect to a “Not Authorized” page
    return <Navigate to="/login" replace />;
  }

  // 3. All good → render the protected children
  return children;
}
