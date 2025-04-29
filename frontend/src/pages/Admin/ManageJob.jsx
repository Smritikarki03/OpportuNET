import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaTrash, FaEye, FaFilter, FaPlus, FaBriefcase, FaCheck, FaTimes } from "react-icons/fa";
import Sidebar from "../../Components/Sidebar";

const ManageJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, Active, Inactive, rejected

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchJobs();
  }, [navigate]);

  const checkAuthAndFetchJobs = async () => {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        throw new Error('No authentication data found');
      }

      const { user, token } = JSON.parse(authData);
      
      if (!user || !token) {
        throw new Error('Missing user or token');
      }

      if (user.role.toLowerCase() !== 'admin') {
        throw new Error('Unauthorized access');
      }

      await fetchJobs(token);
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message);
      navigate('/login');
    }
  };

  const fetchJobs = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/jobs", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem('auth');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(errorData.message || 'Failed to fetch jobs');
      }

      const data = await response.json();
      const jobsData = Array.isArray(data) ? data : data.jobs || [];
      
      // More detailed debug logs
      console.log('Unique status values:', [...new Set(jobsData.map(job => job.status))]);
      console.log('Status distribution:', jobsData.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {}));
      
      setJobs(jobsData);
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
      const authData = localStorage.getItem('auth');
      if (!authData) {
        throw new Error('No authentication data found');
      }

      const { token } = JSON.parse(authData);
      
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete job');
      }

      // Remove the deleted job from the state
      setJobs(jobs.filter(job => job._id !== id));
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error deleting job:", error);
      setError(error.message || "Failed to delete job");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token'); // Get token directly from localStorage
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('token'); // Also remove token on logout
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to update job status');
      }

      setJobs(jobs.map(job => 
        job._id === id ? { ...job, status: newStatus } : job
      ));
      alert('Job status updated successfully');
    } catch (error) {
      console.error("Error updating job status:", error);
      alert(error.message || "Failed to update job status. Please try again.");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || job.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20';
      case 'Inactive':
        return 'bg-slate-100 text-slate-800 ring-1 ring-slate-600/20';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 ring-1 ring-rose-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />;
      case 'Inactive':
        return <div className="w-2 h-2 rounded-full bg-slate-500 mr-2" />;
      case 'rejected':
        return <div className="w-2 h-2 rounded-full bg-rose-500 mr-2" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500 mr-2" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-8">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-teal-800">Manage Jobs</h1>
                  <p className="text-gray-600">View and manage all job listings</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                  </div>
                  <div className="relative w-full sm:w-48">
                    <select
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm appearance-none bg-white"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Jobs</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <FaFilter className="absolute left-4 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
                    </div>
                    <div className="bg-teal-100 p-3 rounded-lg">
                      <FaBriefcase className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {jobs.filter(job => job.status === 'Active').length}
                      </p>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-lg">
                      <FaCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Inactive Jobs</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {jobs.filter(job => job.status === 'Inactive').length}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <FaTimes className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaTimes className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Jobs Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex justify-center">
                              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="text-gray-500 text-lg">No jobs found</div>
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map((job) => (
                          <tr key={job._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-2">
                                  <div className="text-sm font-medium text-gray-900">{job.company}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-500">{job.type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{job.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(job.status)}`}>
                                {getStatusIcon(job.status)}
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => navigate(`/description/${job._id}`)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 hover:bg-indigo-50 rounded-lg"
                                  title="View Job"
                                >
                                  <FaEye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job._id)}
                                  className="text-rose-600 hover:text-rose-900 transition-colors duration-200 p-2 hover:bg-rose-50 rounded-lg"
                                  title="Delete Job"
                                >
                                  <FaTrash className="w-5 h-5" />
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageJob;