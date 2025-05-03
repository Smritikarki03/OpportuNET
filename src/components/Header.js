import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/notifications/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          OpportuNET
        </Link>
        <nav className="nav">
          <Link to="/jobs">Jobs</Link>
          <Link to="/companies">Companies</Link>
          {user ? (
            <>
              {user.role === 'jobseeker' && (
                <>
                  <Link to="/my-applications">My Applications</Link>
                  <Link to="/my-profile">My Profile</Link>
                </>
              )}
              {user.role === 'employer' && (
                <>
                  <Link to="/post-job">Post Job</Link>
                  <Link to="/my-company-profile">My Company Profile</Link>
                </>
              )}
              <div className="notification-container">
                <button 
                  className="notification-button"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  🔔 {notifications.filter(n => !n.read).length > 0 && 
                    <span className="notification-badge">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  }
                </button>
                {showNotifications && (
                  <div className="notification-dropdown">
                    {notifications.length === 0 ? (
                      <div className="notification-item">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification._id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          {notification.message}
                          <span className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 