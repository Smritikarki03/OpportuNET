import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationBell = ({ onNotificationClick }) => {
  const [count, setCount] = useState(0);

  const fetchNotificationCount = async () => {
    try {
      setCount(0); // Always reset before fetching
      const authData = localStorage.getItem('auth');
      if (!authData) return;

      const { token } = JSON.parse(authData);
      // Fetch notifications
      const response = await fetch('http://localhost:5000/api/adminroute/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let data = await response.json();
      let notifs = [];
      if (data && Array.isArray(data.notifications)) {
        notifs = data.notifications;
      } else if (Array.isArray(data)) {
        notifs = data;
      }
      if (notifs.length > 0) {
        setCount(notifs.length);
      } else {
        // Fallback: fetch pending employers
        const usersRes = await fetch('http://localhost:5000/api/adminroute/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await usersRes.json();
        const pending = Array.isArray(users)
          ? users.filter(u => u.role === 'employer' && !u.isApproved)
          : [];
        setCount(pending.length);
      }
    } catch (error) {
      setCount(0);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onNotificationClick}
        className="p-2 text-gray-600 hover:text-teal-600 transition-colors duration-200 relative"
      >
        <FaBell className="w-6 h-6" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell; 