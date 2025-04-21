import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";

const EmployerProfile = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!auth || !auth.token) {
        navigate('/Login');
        return false;
      }
      return true;
    };

    const fetchData = async () => {
      try {
        if (!checkAuth()) return;

        setLoading(true);
        setError(null);

        console.log("Starting to fetch data with token:", auth.token);

        // Fetch employer data
        const employerResponse = await axios.get('http://localhost:5000/api/auth/userInfo', {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Employer data:', employerResponse.data);

        // Get the employer ID from the response
        const employerId = employerResponse.data._id || employerResponse.data.id;
        if (!employerId) {
          console.error("No employer ID found in response");
          setError("Failed to get employer information");
          return;
        }

        // Fetch jobs data
        console.log("Fetching jobs for userId:", employerId);
        const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          },
          params: {
            userId: employerId
          }
        });
        console.log('Jobs response:', jobsResponse);
        console.log('Jobs data:', jobsResponse.data);

        // Ensure jobs data is an array
        const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : 
                    (jobsResponse.data.jobs ? jobsResponse.data.jobs : []);

        // Combine the data
        const employerData = {
          ...employerResponse.data,
          postedJobs: jobs
        };

        console.log('Final employer data with jobs:', employerData);
        setEmployer(employerData);
      } catch (err) {
        console.error('Error in fetchData:', err);
        if (err.response?.status === 401) {
          // If unauthorized, clear auth and redirect to login
          navigate('/Login');
        } else {
          setError(err.message || "Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth, navigate]);

  const handleDeleteJob = async (jobId) => {
    if (!auth?.token) {
      navigate('/Login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update the local state to remove the deleted job
      setEmployer(prev => ({
        ...prev,
        postedJobs: prev.postedJobs.filter(job => job._id !== jobId)
      }));
    } catch (err) {
      console.error('Error deleting job:', err);
      if (err.response?.status === 401) {
        navigate('/Login');
      } else {
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!auth?.token) {
      navigate('/Login');
    }
  }, [auth, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!employer) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">No employer data found. Please log in again.</p>
        <Link 
          to="/Login" 
          className="mt-4 inline-block bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-teal-700 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">OpportuNET</div>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/Browse" className="hover:underline">Browse</Link></li>
            <li><Link to="/help" className="hover:underline">Help</Link></li>
            <li><Link to="/Contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
      </nav>

      {/* Employer Profile Section */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="flex items-center space-x-4">
          <img
            className="w-48 h-48 rounded-lg border object-cover"
            src={employer.image ? `http://localhost:5000${employer.image}` : "https://via.placeholder.com/200"}
            alt="Profile"
          />
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{employer.name}</h2>
                <p className="text-gray-600">{employer.companyName}</p>
                <p className="text-sm text-gray-500">📧 {employer.email}</p>
                <p className="text-sm text-gray-500">📞 {employer.phone}</p>
                <p className="text-sm text-gray-500">📍 {employer.location}</p>
              </div>
              <Link
                to="/EditProfilePage"
                className="bg-teal-500 text-white py-1 px-4 rounded-lg hover:bg-teal-600 h-fit"
              >
                Edit Profile
              </Link>
            </div>
            
            {/* Skills Section */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {employer.skills?.map((skill, index) => (
                  <span key={index} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Posted Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-teal-700">Posted Jobs</h2>
            <Link
              to="/JobPost"
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              + Post New Job
            </Link>
          </div>

          {employer.postedJobs && employer.postedJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Title</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Location</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Salary</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employer.postedJobs.map((job) => (
                    <tr key={job._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{job.title}</td>
                      <td className="py-3 px-4">{job.location}</td>
                      <td className="py-3 px-4">{job.salary}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                          ${job.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-3">
                        <Link
                          to={`/description/${job._id}`}
                          className="text-teal-600 hover:text-teal-800 text-sm"
                        >
                          View
                        </Link>
                        <Link
                          to={`/jobs/edit/${job._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No jobs posted yet. Click "Post New Job" to get started!
            </p>
          )}
        </div>

        {/* Job Applicants Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-6">Job Applicants</h2>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Job Role</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">CV</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 text-gray-500" colSpan="5">
                  No applicants yet.
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
