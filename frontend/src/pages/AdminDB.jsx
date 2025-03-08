import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([
    { id: 1, company: "Leapforg", title: "Frontend Developer" },
    { id: 2, company: "Cotiviti", title: "Backend Engineer" },
  ]);

  const approveJob = (id) => setJobs(jobs.filter(job => job.id !== id));
  const rejectJob = (id) => setJobs(jobs.filter(job => job.id !== id));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-teal-700 text-white p-5">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">⚡ Admin Panel</h2>
          </div>
          <ul>
            <li className="mb-4 hover:bg-teal-600 p-2 rounded flex items-center">
              📊 <NavLink to="/dashboard" className="ml-2">Dashboard</NavLink>
            </li>
            <li className="mb-4 hover:bg-teal-600 p-2 rounded flex items-center">
              💼 <NavLink to="/manage-jobs" className="ml-2">Manage Jobs</NavLink>
            </li>
            <li className="mb-4 hover:bg-teal-600 p-2 rounded flex items-center">
              👥 <NavLink to="/users" className="ml-2">User Management</NavLink>
            </li>
            <li className="mb-4 hover:bg-teal-600 p-2 rounded flex items-center">
              📑 <NavLink to="/reports" className="ml-2">Reports</NavLink>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-teal-700">🚀 Admin Dashboard</h1>
          </div>

          {/* Job Approvals Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-2xl font-semibold text-teal-700 mb-4">📌 Pending Job Approvals</h3>
            <table className="w-full table-auto">
              <thead className="border-b bg-teal-700 text-white">
                <tr>
                  <th className="py-2 text-left p-3">🏢 Company</th>
                  <th className="py-2 text-left p-3">💼 Job Title</th>
                  <th className="py-2 text-left p-3">✅ Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className="border-b hover:bg-gray-100">
                    <td className="py-2 p-3">{job.company}</td>
                    <td className="py-2 p-3">{job.title}</td>
                    <td className="py-2 p-3 flex space-x-4">
                      <button onClick={() => approveJob(job.id)} className="text-green-600 hover:text-green-800 text-lg">✔️ Approve</button>
                      <button onClick={() => rejectJob(job.id)} className="text-red-600 hover:text-red-800 text-lg">❌ Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
