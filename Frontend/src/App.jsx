import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./Components/ProtectedRoute";

import Login from "./Components/Login";
import Register from "./Components/Register";
import StaffHome from "./Components/StaffHome";
import LandingPage from "./Components/LandingPage";

// Member imports
import UserHome from "./Components/Member/UserHome";
import NewArrivals from "./Components/Member/NewArrivals";
import BrowseBooks from "./Components/Member/BrowseBooks";
import BookDetail from "./Components/Member/BookDetail";

// Admin imports
import AdminLayout from "../src/Components/Admin/layout/AdminLayout";
import Dashboard from "../src/Components/Admin/Dashboard";
import CreateBook from "./Components/Admin/pages/Create";
import CreateAnnouncement from "./Components/Admin/pages/CreateAnnouncement";
import EditBook from "./Components/Admin/pages/Edit";
import Users from "./Components/Admin/pages/Users";
import Orders from "./Components/Admin/pages/Order";
import Settings from "./Components/Admin/Settings";
import AddAuthor from "./Components/Admin/pages/AddAuthor";
import AddGenre from "./Components/Admin/pages/AddGenre";
import Books from "./Components/Admin/pages";
import Offers from "./Components/Member/Offers";

function App() {
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 5000; // 5 seconds

  useEffect(() => {
    const connectWebSocket = () => {
      // Skip if already connected
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket already connected, skipping...");
        return;
      }

      console.log("Attempting to connect WebSocket...");
      socketRef.current = new WebSocket("ws://localhost:5098/ws");

      socketRef.current.onopen = () => {
        console.log("WebSocket connected, ID:", Math.random());
        reconnectAttemptsRef.current = 0;
      };

      socketRef.current.onmessage = (event) => {
        const message = event.data;
        console.log("Message received:", message);
        toast.success(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          toastId: message, // Prevent duplicate toasts for the same message
        });
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket closed");
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setTimeout(() => {
            console.log(
              `Attempting to reconnect (${
                reconnectAttemptsRef.current + 1
              }/${maxReconnectAttempts})...`
            );
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, reconnectInterval);
        } else {
          console.error("Max reconnect attempts reached.");
        }
      };
    };

    connectWebSocket();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/staff-home"
            element={
              <ProtectedRoute requiredRole="Staff">
                <StaffHome />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="books/create" element={<CreateBook />} />
            <Route path="books/edit/:id" element={<EditBook />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
            <Route path="authors/create" element={<AddAuthor />} />
            <Route path="genres/create" element={<AddGenre />} />
            <Route path="announcements/create" element={<CreateAnnouncement />} />
          </Route>
          {/* Admin Routes */}

          {/* Member Routes */}
          <Route
            path="/userHome"
            element={
              <ProtectedRoute requiredRole="Member">
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new/arrivals"
            element={
              <ProtectedRoute requiredRole="Member">
                <NewArrivals />
              </ProtectedRoute>
            }
          />
          <Route path="bookdetail/" element={<BookDetail/>} requiredRole = "Memer"/>
          <Route
            path="/browse/books"
            element={
              <ProtectedRoute requiredRole="Member">
                <BrowseBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute requiredRole="Member">
                <Offers />
              </ProtectedRoute>
            }
          />
          {/* Member Routes */}
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
