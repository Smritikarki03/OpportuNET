import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/auth";

const AdminNotifications = () => {
  const [auth] = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = auth?.token;
        if (!token) {
          setError("Unauthorized access. Please log in.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/adminroute/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data.notifications)) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications([]);
          setError("No notifications found.");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.response?.data?.message || "Failed to fetch notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [auth]);

  // Handle employer approval
  const handleApprove = async (employerId) => {
    try {
      setLoading(true);
      const token = auth?.token;
      if (!token) {
        setError("Unauthorized action. Please log in.");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/admin/approve-reject`,
        { employerId, action: 'approve' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.employerId !== employerId)
      );
      setSuccess("Employer approved successfully.");
      setError("");
    } catch (err) {
      console.error("Error approving employer:", err);
      setError(err.response?.data?.message || "Failed to approve employer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle employer rejection
  const handleReject = async (employerId) => {
    try {
      setLoading(true);
      const token = auth?.token;
      if (!token) {
        setError("Unauthorized action. Please log in.");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/admin/approve-reject`,
        { employerId, action: 'reject' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.employerId !== employerId)
      );
      setSuccess("Employer rejected successfully.");
      setError("");
    } catch (err) {
      console.error("Error rejecting employer:", err);
      setError(err.response?.data?.message || "Failed to reject employer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear success message after a few seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-teal-800">Admin Notifications</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
          No pending notifications.
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification._id} className="p-4 bg-teal-50 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-800">
                    New Employer <strong>{notification.employerId?.name || "Unknown"}</strong> is awaiting approval.
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Company: {notification.employerId?.companyName || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Industry: {notification.employerId?.industry || "Not specified"}
                  </p>
                </div>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleApprove(notification.employerId._id)}
                    className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-500 transition-colors"
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(notification.employerId._id)}
                    className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-500 transition-colors"
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNotifications;
