import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Sidebar from "../../Components/Sidebar";

const ManageJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchJobs();
  }, [navigate]);

  const checkAuthAndFetchJobs = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchJobs(user.token);
  };

  const fetchJobs = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/admin/jobs", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error.message || "Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token || user.role !== 'admin') {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to delete job');
      }

      setJobs(jobs.filter(job => job._id !== id));
      alert('Job deleted successfully');
    } catch (error) {
      console.error("Error deleting job:", error);
      alert(error.message || "Failed to delete job. Please try again.");
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-800">Manage Jobs</h1>
          <p className="text-gray-600">View and manage all job postings</p>
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 px-6 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 px-6 text-center text-gray-600">
                      {error ? 'Error loading jobs' : 'No jobs found.'}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.type}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={job.companyLogo || "https://via.placeholder.com/40"}
                              alt={job.company}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{job.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {job.location}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {job.status || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => navigate(`/description/${job._id}`)}
                            className="text-teal-600 hover:text-teal-900"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-job/${job._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageJob;