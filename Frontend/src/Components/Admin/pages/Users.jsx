import React, { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Member",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          role: "Admin",
          createdAt: "2023-01-01T00:00:00",
          lastLogin: "2023-05-01T00:00:00",
        },
        {
          id: "2",
          username: "staff1",
          email: "staff1@example.com",
          role: "Staff",
          createdAt: "2023-02-01T00:00:00",
          lastLogin: "2023-05-02T00:00:00",
        },
        {
          id: "3",
          username: "member1",
          email: "member1@example.com",
          role: "Member",
          createdAt: "2023-03-01T00:00:00",
          lastLogin: "2023-05-03T00:00:00",
        },
      ];

      setUsers(mockUsers);
      setError("");
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Mock API call - replace with actual endpoint
      // await axios.post("http://localhost:5098/api/Admin/users", newUser);

      // Add to local state for demo
      const mockNewUser = {
        id: (users.length + 1).toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date().toISOString(),
        lastLogin: "-",
      };

      setUsers([...users, mockNewUser]);
      setSuccess("User created successfully");
      setDialogOpen(false);

      // Reset form
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "Member",
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to create user. Please try again.");
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (dateString === "-") return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md">
          {success}
        </div>
      )}

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      <div className="rounded-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "Staff"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-2">Create New User</h3>
            <p className="text-gray-500 mb-4">
              Add a new user to the system. They will receive an email with
              login instructions.
            </p>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Member">Member</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
