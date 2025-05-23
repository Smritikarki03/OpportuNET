import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/auth";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaIndustry, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const AdminNotifications = () => {
  const [auth] = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

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

        let notifs = [];
        if (response.data && Array.isArray(response.data.notifications)) {
          notifs = response.data.notifications;
        } else if (Array.isArray(response.data)) {
          notifs = response.data;
        }
        setNotifications(notifs);
        
        // If no notifications, fetch pending employers
        if (!notifs || notifs.length === 0) {
          await fetchPendingEmployers();
        }
      } catch (err) {
        setNotifications([]);
        await fetchPendingEmployers();
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingEmployers = async () => {
      try {
        setLoading(true);
        setError("");
        const token = auth?.token;
        if (!token) return;
        const response = await axios.get("http://localhost:5000/api/adminroute/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          const pending = response.data.filter(
            (user) => user.role === "employer" && !user.isApproved
          );
          setPendingEmployers(pending);
        }
      } catch (err) {
        setPendingEmployers([]);
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
        `http://localhost:5000/api/adminroute/approve-reject`,
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
        `http://localhost:5000/api/adminroute/approve-reject`,
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

  // Mark notification as read, update UI, and navigate if needed
  const handleNotificationClick = async (notification) => {
    try {
      const token = auth?.token;
      if (!token) return;
      await axios.put(
        `http://localhost:5000/api/adminroute/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
      // Navigate to contact messages if it's a contact notification
      if (notification.type === 'contact') {
        window.location.href = '/admin/contact-messages';
      }
    } catch (err) {
      // Optionally handle error
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

      <button
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        onClick={() => setShowRead((prev) => !prev)}
      >
        {showRead ? 'Hide Read' : 'View Read'}
      </button>

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

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : notifications.length === 0 && pendingEmployers.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
          No pending notifications.
        </div>
      ) : (
        <ul className="space-y-6">
          {unreadNotifications.map((notification) => {
            if (notification.type === 'contact') {
              const nameMatch = notification.message.match(/from ([^(]+) \(/);
              const senderName = nameMatch ? nameMatch[1].trim() : 'Unknown';
              return (
                <li
                  key={notification._id}
                  className={`p-6 rounded-2xl shadow border transition-colors cursor-pointer bg-blue-50 border-blue-100`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                    <FaEnvelope className="text-blue-600" /> Contact Message
                  </div>
                  <div className="mt-2 text-blue-800">
                    New contact message from <span className="font-bold">{senderName}</span>
                  </div>
                </li>
              );
            }
            if (notification.type === 'employer_approval') {
              return (
                <li
                  key={notification._id}
                  className="p-6 rounded-2xl shadow border transition-colors cursor-pointer bg-yellow-50 border-yellow-200"
                  onClick={() => {
                    handleNotificationClick(notification);
                    window.location.href = '/admin/manage-users';
                  }}
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-yellow-900">
                    <span role="img" aria-label="Employer">🏢</span> Employer Approval
                  </div>
                  <div className="mt-2 text-yellow-800">
                    {notification.message}
                  </div>
                </li>
              );
            }
            return null;
          })}
          {notifications.length === 0 && pendingEmployers.map((user) => (
            <li key={user._id} className="p-6 bg-teal-50 rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between border border-teal-100">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold text-teal-900">
                  <FaUser className="text-teal-600" /> {user.name}
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Pending Approval</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                  <div className="flex items-center gap-2"><FaEnvelope className="text-teal-400" /> {user.email}</div>
                  <div className="flex items-center gap-2"><FaPhone className="text-teal-400" /> {user.phone || "-"}</div>
                  {user.companyName && <div className="flex items-center gap-2"><FaBuilding className="text-teal-400" /> {user.companyName}</div>}
                  {user.industry && <div className="flex items-center gap-2"><FaIndustry className="text-teal-400" /> {user.industry}</div>}
                  {user.location && <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-teal-400" /> {user.location}</div>}
                  {user.createdAt && <div className="flex items-center gap-2"><FaClock className="text-teal-400" /> {new Date(user.createdAt).toLocaleString()}</div>}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:ml-8">
                <button
                  onClick={() => handleApprove(user._id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
                  disabled={loading}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showRead && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Read Notifications</h3>
          <ul className="space-y-6">
            {readNotifications.length === 0 && (
              <li className="text-gray-400">No read notifications.</li>
            )}
            {readNotifications.map((notification) => {
              // Show contact message notifications
              if (notification.type === 'contact') {
                const nameMatch = notification.message.match(/from ([^(]+) \(/);
                const senderName = nameMatch ? nameMatch[1].trim() : 'Unknown';
                return (
                  <li
                    key={notification._id}
                    className="p-6 rounded-2xl shadow border bg-gray-100 border-gray-200 text-gray-400"
                  >
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FaEnvelope className="text-blue-400" /> Contact Message
                    </div>
                    <div className="mt-2">New contact message from <span className="font-bold">{senderName}</span></div>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
