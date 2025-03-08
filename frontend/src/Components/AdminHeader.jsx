import React from "react";
import { Link } from "react-router-dom";

const AdminHeader = () => {
  return (
    <header className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold">Opportunet</div>

        {/* Admin Info & Navigation */}
        <div className="flex items-center space-x-6">
          <div className="text-sm">
            <span className="font-semibold">Admin</span>
          </div>

          <nav className="space-x-4">
            <Link to="/admin/dashboard" className="hover:bg-blue-700 p-2 rounded">
              Dashboard
            </Link>
            <Link to="/admin/manage-jobs" className="hover:bg-blue-700 p-2 rounded">
              Manage Jobs
            </Link>
            <Link to="/admin/manage-users" className="hover:bg-blue-700 p-2 rounded">
              Manage Users
            </Link>
            <Link to="/admin/settings" className="hover:bg-blue-700 p-2 rounded">
              Settings
            </Link>
          </nav>

          {/* Logout Button */}
          <button className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
