import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/auth";

const AdminNotifications = () => {
  const [auth] = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = auth?.token;
        if (!token) {
          setError("Unauthorized access. Please log in.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", response.data); // Debugging response

        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        } else if (Array.isArray(response.data.notifications)) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications([]);
          setError("Unexpected API response format.");
        }
      } catch (err) {
        setError("Failed to fetch notifications. Ensure you are logged in as admin.");
        console.error(err);
      }
    };

    fetchNotifications();
  }, [auth]);

// Handle employer approval
const handleApprove = async (employerId) => {
  try {
    const token = auth?.token;
    if (!token) {
      setError("Unauthorized action. Please log in.");
      return;
    }

    await axios.post(
      `http://localhost:5000/api/admin/approve-reject`,
      { employerId, action: 'approve' },  // Sending both employerId and action
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotifications(notifications.filter((n) => n.employerId !== employerId));
    setSuccess("Employer approved successfully.");
    setError("");
  } catch (err) {
    setError("Failed to approve employer.");
    console.error(err);
  }
};

// Handle employer rejection
const handleReject = async (employerId) => {
  try {
    const token = auth?.token;
    if (!token) {
      setError("Unauthorized action. Please log in.");
      return;
    }

    await axios.post(
      `http://localhost:5000/api/admin/approve-reject`,
      { employerId, action: 'reject' },  // Sending both employerId and action
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotifications(notifications.filter((n) => n.employerId !== employerId));
    setSuccess("Employer rejected successfully.");
    setError("");
  } catch (err) {
    setError("Failed to reject employer.");
    console.error(err);
  }
};


  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-teal-800">Admin Notifications</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {notifications.length === 0 ? (
        <p>No pending notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification._id} className="p-4 bg-teal-50 rounded-lg shadow">
              <p>
                New Employer <strong>{notification?.message?.split(" ")[2] || "Unknown"}</strong> is awaiting approval.
              </p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleApprove(notification.employerId)}
                  className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(notification.employerId)}
                  className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-500"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNotifications;
