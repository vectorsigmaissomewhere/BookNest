import React, { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "Tech Store",
    storeEmail: "support@techstore.com",
    storePhone: "+1 (555) 987-6543",
    storeAddress: "456 Tech Avenue, Silicon Valley, CA 67890",
    currency: "USD",
    timezone: "America/Los_Angeles",
  });


  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@mybookstore.com",
    smtpPassword: "••••••••••••",
    senderName: "My Bookstore",
    senderEmail: "notifications@mybookstore.com",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({ ...generalSettings, [name]: value });
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({ ...emailSettings, [name]: value });
  };

  const saveGeneralSettings = () => {
    try {
      // Mock API call - replace with actual endpoint
      // await axios.put("http://localhost:5098/api/Admin/settings/general", generalSettings);
      setSuccess("General settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const saveEmailSettings = () => {
    try {
      // Mock API call - replace with actual endpoint
      // await axios.put("http://localhost:5098/api/Admin/settings/email", emailSettings);
      setSuccess("Email settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your bookstore settings and preferences.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      <div>
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("general")}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === "general"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === "email"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === "appearance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Appearance
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "general" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-1">General Settings</h2>
              <p className="text-gray-500 mb-6">
                Manage your store information and regional settings.
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="storeName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Store Name
                    </label>
                    <input
                      id="storeName"
                      name="storeName"
                      value={generalSettings.storeName}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="storeEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Store Email
                    </label>
                    <input
                      id="storeEmail"
                      name="storeEmail"
                      type="email"
                      value={generalSettings.storeEmail}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="storePhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Store Phone
                    </label>
                    <input
                      id="storePhone"
                      name="storePhone"
                      value={generalSettings.storePhone}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={generalSettings.currency}
                      onChange={handleGeneralChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="storeAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Store Address
                  </label>
                  <textarea
                    id="storeAddress"
                    name="storeAddress"
                    value={generalSettings.storeAddress}
                    onChange={handleGeneralChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={generalSettings.timezone}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={saveGeneralSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-1">Email Settings</h2>
              <p className="text-gray-500 mb-6">
                Configure your email server settings for notifications.
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="smtpServer"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SMTP Server
                    </label>
                    <input
                      id="smtpServer"
                      name="smtpServer"
                      value={emailSettings.smtpServer}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="smtpPort"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SMTP Port
                    </label>
                    <input
                      id="smtpPort"
                      name="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="smtpUsername"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SMTP Username
                    </label>
                    <input
                      id="smtpUsername"
                      name="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="smtpPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SMTP Password
                    </label>
                    <input
                      id="smtpPassword"
                      name="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="senderName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sender Name
                    </label>
                    <input
                      id="senderName"
                      name="senderName"
                      value={emailSettings.senderName}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="senderEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sender Email
                    </label>
                    <input
                      id="senderEmail"
                      name="senderEmail"
                      type="email"
                      value={emailSettings.senderEmail}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={saveEmailSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-1">Appearance Settings</h2>
              <p className="text-gray-500 mb-6">
                Customize the look and feel of your bookstore.
              </p>

              <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">Appearance settings coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
