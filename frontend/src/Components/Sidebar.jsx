import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBriefcase, FaUsers, FaFileAlt, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Adjust key based on your auth setup
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-teal-800 text-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-8">Admin Panel</h2>
      <ul>
        <li className="mb-4">
          <NavLink
            to="/AdminDB"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive ? "bg-teal-700" : "hover:bg-teal-700"
              }`
            }
          >
            <FaTachometerAlt className="mr-3" />
            Dashboard
          </NavLink>
        </li>
        <li className="mb-4">
          <NavLink
            to="/ManageJob"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive ? "bg-teal-700" : "hover:bg-teal-700"
              }`
            }
          >
            <FaBriefcase className="mr-3" />
            Manage Jobs
          </NavLink>
        </li>
        <li className="mb-4">
          <NavLink
            to="/ManageUsers"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive ? "bg-teal-700" : "hover:bg-teal-700"
              }`
            }
          >
            <FaUsers className="mr-3" />
            User Management
          </NavLink>
        </li>
        <li className="mb-4">
          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive ? "bg-teal-700" : "hover:bg-teal-700"
              }`
            }
          >
            <FaFileAlt className="mr-3" />
            Reviews
          </NavLink>
        </li>
        {/* Logout Button */}
        <li className="mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg transition-colors w-full text-left hover:bg-teal-700"
          >
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;