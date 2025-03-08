import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="bg-teal-700 min-h-screen flex">
      {/* Navigation Bar */}
      <nav className="bg-teal-700 text-white py-4 w-full">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="text-xl font-bold">OpportuNET Employer</div>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/services" className="hover:underline">Browse</Link></li>
            <li><Link to="/help" className="hover:underline">Help</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/employer-dashboard" className="hover:underline">Profile</Link></li>
          </ul>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="w-64 bg-teal-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Employer Dashboard</h2>
        <ul>
          <li className="mb-4 hover:bg-gray-600 p-2 rounded">
            <a href="#">Dashboard</a>
          </li>
          <li className="mb-4 hover:bg-gray-600 p-2 rounded">
            <a href="#">Job Listings</a>
          </li>
          <li className="mb-4 hover:bg-gray-600 p-2 rounded">
            <a href="#">Applications</a>
          </li>
          <li className="mb-4 hover:bg-gray-600 p-2 rounded">
            <a href="#">Company Profile</a>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-6">Welcome, Employer!</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Active Job Listings</h3>
            <p className="text-3xl font-bold">10</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Total Applicants</h3>
            <p className="text-3xl font-bold">50</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Pending Applications</h3>
            <p className="text-3xl font-bold">5</p>
          </div>
        </div>

        {/* Latest Job Applications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Latest Job Applications</h3>
          <table className="w-full table-auto">
            <thead className="border-b">
              <tr>
                <th className="py-2 text-left">Applicant</th>
                <th className="py-2 text-left">Job Title</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Sam</td>
                <td className="py-2">Software Engineer</td>
                <td className="py-2 text-green-500">Approved</td>
                <td className="py-2">02/09/2025</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Jane</td>
                <td className="py-2">Product Manager</td>
                <td className="py-2 text-yellow-500">Pending</td>
                <td className="py-2">02/08/2025</td>
              </tr>
              {/* More rows can be added here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
