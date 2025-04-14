import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBriefcase, FaUsers, FaFileAlt, FaBell } from "react-icons/fa";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import Sidebar from "../../Components/Sidebar"; // Ensure this path is correct

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([
    { id: 1, company: "Leapforg", title: "Frontend Developer" },
    { id: 2, company: "Cotiviti", title: "Backend Engineer" },
  ]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const approveJob = (id) => setJobs(jobs.filter((job) => job.id !== id));
  const rejectJob = (id) => setJobs(jobs.filter((job) => job.id !== id));

  // Fetch job seekers and employees periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch job seekers
        const jobSeekersRes = await fetch("http://localhost:3000/jobseekers");
        if (!jobSeekersRes.ok) throw new Error("Failed to fetch job seekers");
        const jobSeekersData = await jobSeekersRes.json();
        setJobSeekers(jobSeekersData);

        // Fetch employees
        const employeesRes = await fetch("http://localhost:3000/employees");
        if (!employeesRes.ok) throw new Error("Failed to fetch employees");
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 15 seconds for updates
    const interval = setInterval(fetchData, 15000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Use the imported Sidebar component */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-teal-800">Admin Dashboard</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total Job Seekers</h3>
            <p className="text-2xl font-semibold text-teal-800">{jobSeekers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
            <p className="text-2xl font-semibold text-teal-800">{employees.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
            <p className="text-2xl font-semibold text-teal-800">{jobs.length}</p>
          </div>
        </div>

        {/* Job Seekers Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Job Seekers</h3>
          {loading ? (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-3 border-teal-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : jobSeekers.length === 0 ? (
            <p className="text-gray-600">No job seekers found.</p>
          ) : (
            <table className="w-full table-auto">
              <thead className="bg-teal-50 text-teal-800">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobSeekers.map((seeker) => (
                  <tr key={seeker.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{seeker.name}</td>
                    <td className="py-3 px-4">{seeker.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Employees Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Employees</h3>
          {loading ? (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-3 border-teal-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : employees.length === 0 ? (
            <p className="text-gray-600">No employees found.</p>
          ) : (
            <table className="w-full table-auto">
              <thead className="bg-teal-50 text-teal-800">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{employee.name}</td>
                    <td className="py-3 px-4">{employee.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Job Approvals Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Pending Job Approvals</h3>
          {jobs.length === 0 ? (
            <p className="text-gray-600">No pending job approvals.</p>
          ) : (
            <table className="w-full table-auto">
              <thead className="bg-teal-50 text-teal-800">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium">Company</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Job Title</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{job.company}</td>
                    <td className="py-3 px-4">{job.title}</td>
                    <td className="py-3 px-4 flex space-x-3">
                      <button
                        onClick={() => approveJob(job.id)}
                        className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition flex items-center text-sm"
                      >
                        <MdCheckCircle className="mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => rejectJob(job.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center text-sm"
                      >
                        <MdCancel className="mr-1" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;