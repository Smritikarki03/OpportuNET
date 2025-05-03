import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBriefcase, FaUsers, FaFileAlt, FaSignOutAlt, FaClipboardList } from "react-icons/fa";

const Sidebar = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Adjust key based on your auth setup
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-teal-800 text-white shadow-xl flex flex-col z-50">
      {/* Logo/Title */}
      <div className="flex items-center justify-center h-24 border-b border-teal-900">
        <span className="text-2xl font-bold tracking-wide">OpportuNET</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-8">
        <ul className="space-y-4">
          {children || (
            <>
              <li>
                <NavLink
                  to="/AdminDB"
                  className={({ isActive }) =>
                    `flex items-center px-8 py-4 rounded-lg transition-colors font-medium text-lg gap-4 ${
                      isActive ? "bg-white text-teal-800 shadow-md" : "hover:bg-teal-700 hover:text-white"
                    }`
                  }
                >
                  <FaTachometerAlt className="h-6 w-6" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ManageJob"
                  className={({ isActive }) =>
                    `flex items-center px-8 py-4 rounded-lg transition-colors font-medium text-lg gap-4 ${
                      isActive ? "bg-white text-teal-800 shadow-md" : "hover:bg-teal-700 hover:text-white"
                    }`
                  }
                >
                  <FaBriefcase className="h-6 w-6" />
                  Manage Jobs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ManageUsers"
                  className={({ isActive }) =>
                    `flex items-center px-8 py-4 rounded-lg transition-colors font-medium text-lg gap-4 ${
                      isActive ? "bg-white text-teal-800 shadow-md" : "hover:bg-teal-700 hover:text-white"
                    }`
                  }
                >
                  <FaUsers className="h-6 w-6" />
                  User Management
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/applications"
                  className={({ isActive }) =>
                    `flex items-center px-8 py-4 rounded-lg transition-colors font-medium text-lg gap-4 ${
                      isActive ? "bg-white text-teal-800 shadow-md" : "hover:bg-teal-700 hover:text-white"
                    }`
                  }
                >
                  <FaClipboardList className="h-6 w-6" />
                  Applications
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Reviews"
                  className={({ isActive }) =>
                    `flex items-center px-8 py-4 rounded-lg transition-colors font-medium text-lg gap-4 ${
                      isActive ? "bg-white text-teal-800 shadow-md" : "hover:bg-teal-700 hover:text-white"
                    }`
                  }
                >
                  <FaFileAlt className="h-6 w-6" />
                  Reviews
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      {/* Logout Button */}
      <div className="p-6 border-t border-teal-900">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-4 rounded-lg bg-teal-700 hover:bg-teal-600 transition-colors font-medium text-lg gap-4"
        >
          <FaSignOutAlt className="h-6 w-6" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;