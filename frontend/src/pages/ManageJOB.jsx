import React, { useState } from "react";
import { FaCheck, FaTimes, FaClipboardList } from "react-icons/fa";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: "Software Engineer", company: "Tech Corp", status: "Pending" },
    { id: 2, title: "Product Manager", company: "Innovate Ltd.", status: "Pending" },
    { id: 3, title: "Data Scientist", company: "AI Labs", status: "Pending" },
  ]);

  const handleApprove = (id) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "Approved" } : job));
  };

  const handleReject = (id) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "Rejected" } : job));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-teal-700 mb-6 flex items-center gap-2">
        <FaClipboardList /> Manage Job Listings
      </h1>
      <div className="bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-gray-700">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="p-3 border">Job Title</th>
              <th className="p-3 border">Company</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="text-center border hover:bg-gray-100 transition duration-200">
                <td className="p-3 border font-medium">{job.title}</td>
                <td className="p-3 border">{job.company}</td>
                <td className={`p-3 border font-bold ${job.status === "Approved" ? "text-green-600" : job.status === "Rejected" ? "text-red-600" : "text-yellow-600"}`}>{job.status}</td>
                <td className="p-3 border flex justify-center space-x-4">
                  <button onClick={() => handleApprove(job.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition duration-200 shadow-md">
                    <FaCheck /> Approve
                  </button>
                  <button onClick={() => handleReject(job.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition duration-200 shadow-md">
                    <FaTimes /> Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>  
    </div>
  );
};

export default ManageJobs;
