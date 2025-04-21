import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaBriefcase, 
  FaUsers, 
  FaFileAlt, 
  FaBell,
  FaChartLine,
  FaUserCheck,
  FaUserTimes,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaGraduationCap,
  FaCheck
} from "react-icons/fa";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import Sidebar from "../../Components/Sidebar";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApprovals: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
    totalUsers: 0
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  const approveJob = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== id));
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
          activeJobs: prev.activeJobs + 1
        }));
      }
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const rejectJob = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== id));
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1
        }));
      }
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch all data in parallel
        const [jobsRes, jobSeekersRes, employeesRes, statsRes] = await Promise.all([
          fetch("http://localhost:5000/api/jobs/pending", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/users/jobseekers", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/users/employers", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const [jobsData, jobSeekersData, employeesData, statsData] = await Promise.all([
          jobsRes.json(),
          jobSeekersRes.json(),
          employeesRes.json(),
          statsRes.json()
        ]);

        // Calculate total counts
        const totalJobSeekers = jobSeekersData.length;
        const totalEmployers = employeesData.length;
        const totalUsers = totalJobSeekers + totalEmployers;

        setJobs(jobsData);
        setJobSeekers(jobSeekersData);
        setEmployees(employeesData);
        setStats(prev => ({
          ...prev,
          ...statsData,
          totalJobSeekers,
          totalEmployers,
          totalUsers
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-800">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div
              className="relative cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/AdminNotifications")}
            >
              <FaBell className="text-3xl text-teal-800" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                3
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <FaUsers className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBriefcase className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeJobs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaFileAlt className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaChartLine className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">User Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <span className="text-gray-600">Job Seekers</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">{stats.totalJobSeekers}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <FaUserTie className="text-xl" />
                  </div>
                  <span className="text-gray-600">Employers</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">{stats.totalEmployers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">Job Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <FaCheck className="text-xl" />
                  </div>
                  <span className="text-gray-600">Active Jobs</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">{stats.activeJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                    <FaFileAlt className="text-xl" />
                  </div>
                  <span className="text-gray-600">Pending Approvals</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">{stats.pendingApprovals}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/ManageUsers")}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <FaUsers className="text-2xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("/ManageJob")}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBriefcase className="text-2xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Jobs</h3>
                <p className="text-sm text-gray-600">View and manage all jobs</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("/AdminNotifications")}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaBell className="text-2xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">View all notifications</p>
              </div>
            </div>
          </button>
        </div>

        {/* Pending Approvals Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-teal-800">Pending Job Approvals</h3>
              <div className="flex items-center space-x-4">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Jobs</option>
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-6 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-6 text-center text-gray-600">
                      No pending job approvals found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
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
                            <div className="text-sm text-gray-500">{job.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.type}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => navigate(`/description/${job._id}`)}
                            className="text-teal-600 hover:text-teal-900 font-medium text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => approveJob(job._id)}
                            className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition flex items-center text-sm"
                          >
                            <MdCheckCircle className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => rejectJob(job._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center text-sm"
                          >
                            <MdCancel className="mr-1" /> Reject
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

export default AdminDashboard;