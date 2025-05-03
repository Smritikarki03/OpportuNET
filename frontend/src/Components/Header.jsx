// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { toast } from "react-hot-toast";

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [userCompanyId, setUserCompanyId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const storedAuth = localStorage.getItem("auth");
      if (!storedAuth) return;

      const { token } = JSON.parse(storedAuth);
      const response = await axios.get(
        `http://localhost:5000/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Only set unread notifications
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUserName = localStorage.getItem("userName");
      const storedUserRole = localStorage.getItem("userRole");
      const storedUserId = localStorage.getItem("userId");

      if (storedAuth && storedUserName) {
        setIsLoggedIn(true);
        setUserName(storedUserName);
        setUserRole(storedUserRole || "");
        setUserId(storedUserId || null);
        
        console.log('User authenticated:', {
          userName: storedUserName,
          role: storedUserRole,
          userId: storedUserId
        });
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
        setUserId(null);
      }
    };

    const fetchCompanyData = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (!storedAuth) return;
        
        const { token } = JSON.parse(storedAuth);
        const response = await axios.get(
          `http://localhost:5000/api/company`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          const companyData = response.data;
          setUserCompanyId(companyData._id);
          
          const profiles = JSON.parse(localStorage.getItem("companyProfiles")) || [];
          const updatedProfiles = profiles.filter(p => p.userId !== userId);
          updatedProfiles.push(companyData);
          
          localStorage.setItem("companyProfiles", JSON.stringify(updatedProfiles));
        }
      } catch (error) {
        console.error("Error fetching company data:", error.response?.data || error);
        if (error.response?.status === 404) {
          const profiles = JSON.parse(localStorage.getItem("companyProfiles")) || [];
          const updatedProfiles = profiles.filter(p => p.userId !== userId);
          localStorage.setItem("companyProfiles", JSON.stringify(updatedProfiles));
          setUserCompanyId(null);
        }
      }
    };

    checkAuth();

    // Only fetch company data if user is an employer
    if (userId && userRole === "employer") {
      fetchCompanyData();
    }

    // Fetch notifications if user is logged in
    if (userId) {
      console.log('Initial notification fetch for user:', userId);
      fetchNotifications();
    }

    // Listen for notification updates
    const handleNotificationUpdate = () => {
      console.log('Notification update event received');
      if (userId) {
        fetchNotifications();
      }
    };

    window.addEventListener("updateNotifications", handleNotificationUpdate);
    
    return () => {
      window.removeEventListener("updateNotifications", handleNotificationUpdate);
    };
  }, [userId, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("companyProfiles");
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");
    setUserId(null);
    setUserCompanyId(null);
    setDropdownVisible(false);
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdownVisible((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    if (isMarkingRead) return; // Prevent double-clicks
    
    try {
      setIsMarkingRead(true);
      const storedAuth = localStorage.getItem("auth");
      if (!storedAuth) return;

      const { token } = JSON.parse(storedAuth);
      
      // Mark notification as read first
      await axios.put(
        `http://localhost:5000/api/notifications/${notification._id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove this notification from the list immediately
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      
      // Close the dropdown
      setNotificationDropdownVisible(false);

      // For review notifications, navigate to the company profile
      if (notification.type === 'review' && notification.companyId) {
        console.log('Navigating to company profile:', notification.companyId);
        navigate(`/company-prof/${notification.companyId}`, { state: { scrollToReviews: true } });
      }
    } catch (error) {
      console.error("Error handling notification:", error);
      toast.error("Error handling notification. Please try again.");
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <nav className="bg-teal-700 py-4 fixed top-0 w-full z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">OpportuNET</div>
        <ul className="flex space-x-6 items-center">
          <li>
            <Link to="/" className="text-white hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:underline">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/Browse" className="text-white hover:underline">
              Browse
            </Link>
          </li>
          <li>
            <Link to="/help" className="text-white hover:underline">
              Help
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-white hover:underline">
              Contact
            </Link>
          </li>
          {isLoggedIn && (
            <li className="relative">
              <button
                onClick={toggleNotificationDropdown}
                className="text-white hover:underline focus:outline-none"
              >
                <FaBell className="text-xl" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notificationDropdownVisible && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-teal-900 shadow-lg rounded-lg p-2 space-y-2 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-2">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification._id}
                        onClick={() => !isMarkingRead && handleNotificationClick(notification)}
                        className={`p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${isMarkingRead ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </li>
          )}
          <li className="relative">
            {isLoggedIn ? (
              <>
                <button
                  onClick={toggleDropdown}
                  className="text-white hover:underline focus:outline-none flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-user fa-lg"></i>
                  <span>{userName}</span>
                </button>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-teal-900 shadow-lg rounded-lg p-2 space-y-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-teal-100 rounded"
                      onClick={() => setDropdownVisible(false)}
                    >
                      View Profile
                    </Link>
                    {userRole === "employer" && (
                      userCompanyId ? (
                        <Link
                          to={`/company-prof/${userCompanyId}`}
                          className="block px-4 py-2 hover:bg-teal-100 rounded"
                          onClick={() => setDropdownVisible(false)}
                        >
                          My Company Profile
                        </Link>
                      ) : (
                        <Link
                          to="/create-company"
                          className="block px-4 py-2 hover:bg-teal-100 rounded"
                          onClick={() => setDropdownVisible(false)}
                        >
                          Create Company Profile
                        </Link>
                      )
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-teal-100 rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={toggleDropdown}
                  className="text-white hover:underline focus:outline-none"
                >
                  Connect
                </button>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-teal-900 shadow-lg rounded-lg p-2 space-y-2">
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-teal-100 rounded"
                      onClick={() => setDropdownVisible(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/selectSignup"
                      className="block px-4 py-2 hover:bg-teal-100 rounded"
                      onClick={() => setDropdownVisible(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header