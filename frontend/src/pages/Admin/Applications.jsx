import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import Sidebar from "../../Components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Applications = () => {
  const [auth] = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/adminroute/applications", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setApplications(data.applications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to fetch applications");
        setLoading(false);
      }
    };
    if (auth?.token) fetchApplications();
  }, [auth?.token]);

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? application.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status) => {
    let color = "bg-gray-100 text-gray-800";
    if (status === "pending") color = "bg-yellow-100 text-yellow-800";
    if (status === "accepted") color = "bg-green-100 text-green-800";
    if (status === "rejected") color = "bg-red-100 text-red-800";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-teal-700 mb-1">Applications</h1>
            <p className="text-gray-500">View and manage all job applications</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 gap-2">
            <input
              type="text"
              placeholder="Search by job title, applicant name, company, or email..."
              className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="w-full md:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500 border-solid"></div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredApplications.map((application, idx) => (
                      <tr key={application._id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{application.jobTitle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-teal-700 font-semibold">{application.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base text-gray-900 font-semibold">{application.applicantName}</div>
                          <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{statusBadge(application.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(application.appliedDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(application.resumeUrl, '_blank')}
                              className="px-3 py-1 rounded border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition"
                            >
                              Resume
                            </button>
                            <button
                              onClick={() => window.open(application.coverLetterUrl, '_blank')}
                              className="px-3 py-1 rounded border border-indigo-200 text-indigo-700 font-medium hover:bg-indigo-50 transition"
                            >
                              Cover Letter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Applications; 