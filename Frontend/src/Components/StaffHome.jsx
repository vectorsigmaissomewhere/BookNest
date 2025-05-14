

import React, { useState, useEffect } from 'react';
import { Search, LogOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const StaffHome = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5098";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async () => {
    if (!claimCode) {
      setError("Please enter a claim code.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/order/${claimCode}/process`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process order");
      }
      const data = await response.json();
      setSuccess(data.message);
      setClaimCode("");
      fetchOrders(); // Refresh orders list
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to logout");
      }
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.claimCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white">Staff Order Processing</h1>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className={`flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg shadow-lg hover:bg-pink-700 transition-all duration-200 disabled:bg-pink-400 disabled:cursor-not-allowed`}
        >
          <LogOut size={16} />
          {logoutLoading ? "Logging out..." : "Logout"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md">{success}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by claim code or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Enter claim code"
            value={claimCode}
            onChange={(e) => setClaimCode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleProcessOrder}
            className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600"
          >
            Process Order
          </button>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claim Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.claimCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffHome;