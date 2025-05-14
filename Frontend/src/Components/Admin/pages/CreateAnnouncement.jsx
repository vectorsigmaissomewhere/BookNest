import React, { useState } from "react";
import axios from "axios";

export default function CreateAnnouncement() {
  const [formData, setFormData] = useState({
    message: "",
    startDate: "",
    endDate: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Assuming token is stored here
      await axios.post("http://localhost:5098/api/admin/announcements", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Announcement created successfully!");
      setFormData({ message: "", startDate: "", endDate: "" });
    } catch (error) {
      setMessage("Error creating announcement. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <input
            type="text"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
}