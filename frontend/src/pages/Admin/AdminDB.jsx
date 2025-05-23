import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { 
  FaBell,
  FaChartLine,
  FaUserCheck,
  FaUserTimes,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaGraduationCap,
  FaUsers,
  FaBriefcase,
  FaFileAlt
} from "react-icons/fa";
import Sidebar from "../../Components/Sidebar";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminDashboard = () => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    totalApplications: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
    totalUsers: 0,
    pendingNotifications: 0
  });
  const [adminNotifications, setAdminNotifications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  // Chart data for user distribution (modern teal & blue)
  const userDistributionData = {
    labels: ['Job Seekers', 'Employers'],
    datasets: [
      {
        data: [stats.totalJobSeekers, stats.totalEmployers],
        backgroundColor: [
          '#14b8a6', // Teal
          '#3b82f6', // Blue
        ],
        borderColor: [
          '#14b8a6',
          '#3b82f6',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for job status (Bar chart)
  const jobStatusBarData = {
    labels: ['Active Jobs', 'Inactive Jobs'],
    datasets: [
      {
        label: 'Jobs',
        data: [stats.activeJobs, stats.inactiveJobs],
        backgroundColor: [
          '#00B8D9', // Bright Blue
          '#6554C0', // Purple
        ],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  // Chart options with doughnut cutout and improved legend/title
  const chartOptions = {
    responsive: true,
    cutout: '70%', // Doughnut style
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 16, weight: 'bold' },
          color: '#333',
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: '',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#222',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percent}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#222',
        font: {
          weight: 'bold',
          size: 16,
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percent = total ? ((value / total) * 100).toFixed(1) : 0;
          return `${percent}%`;
        }
      }
    }
  };

  // Bar chart options
  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Job Status',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#222',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.x;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#eee' },
        ticks: { color: '#333', font: { size: 14, weight: 'bold' } },
      },
      y: {
        grid: { color: '#eee' },
        ticks: { color: '#333', font: { size: 16, weight: 'bold' } },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth?.token) {
          throw new Error('No authentication token found');
        }

        const statsRes = await fetch("http://localhost:5000/api/adminroute/user-stats", {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statsRes.ok) {
          const errorData = await statsRes.json();
          throw new Error(`Failed to fetch stats: ${errorData.message || statsRes.statusText}`);
        }

        const statsData = await statsRes.json();
        console.log('Fetched stats:', statsData);
        setStats(statsData);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 10 seconds instead of 30
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [auth?.token]);

  // Fetch admin notifications for the bell icon
  useEffect(() => {
    const fetchAdminNotifications = async () => {
      try {
        const token = auth?.token;
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/adminroute/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAdminNotifications(data.notifications || []);
      } catch (err) {
        setAdminNotifications([]);
      }
    };
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 10000);
    return () => clearInterval(interval);
  }, [auth?.token]);

  const unreadAdminNotifications = adminNotifications.filter(n => !n.read);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-teal-800">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className="relative cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate("/AdminNotifications")}
              >
                <FaBell className="text-3xl text-teal-800" />
                {unreadAdminNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadAdminNotifications.length}
                  </span>
                )}
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
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
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
                <div className="p-3 rounded-full bg-slate-100 text-slate-600">
                  <FaFileAlt className="text-2xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inactiveJobs}</p>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 mt-4">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[350px]">
              <h2 className="text-lg font-semibold mb-4 self-start">User Distribution</h2>
              <div className="flex justify-center items-center w-full" style={{ maxWidth: 350, minHeight: 250 }}>
                <Pie data={userDistributionData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[350px]">
              <h2 className="text-lg font-semibold mb-4 self-start">Job Status</h2>
              <div className="flex justify-center items-center w-full" style={{ maxWidth: 350, minHeight: 250 }}>
                <Bar data={jobStatusBarData} options={barOptions} />
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
                      <FaBriefcase className="text-xl" />
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
                    <span className="text-gray-600">Inactive Jobs</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">{stats.inactiveJobs}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;