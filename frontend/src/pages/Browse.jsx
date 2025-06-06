import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';
import { useAuth } from "../context/auth";

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth] = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);

  const locationOptions = [
    "All Locations",
    "Chabahil",
    "Bouddha",
    "Naxal",
    "Remote",
    "Baluwatar",
    "Pokhara",
    "Lalitpur",
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        let response;

        // Try authenticated endpoint first if user is logged in
        if (auth?.token) {
          try {
            response = await axios.get('http://localhost:5000/api/jobs', {
              headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (authError) {
            console.error('Error fetching authenticated jobs:', authError);
            // If authenticated request fails, fall back to public endpoint
            response = await axios.get('http://localhost:5000/api/jobs/public');
          }
        } else {
          // If no auth token, use public endpoint
          response = await axios.get('http://localhost:5000/api/jobs/public');
        }

        console.log('Fetched jobs:', response.data);
        setJobs(response.data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();

    // Fetch saved jobs for jobseeker
    const fetchSavedJobs = async () => {
      if (auth?.user?.role !== 'jobseeker' || !auth?.token) return;
      try {
        const response = await axios.get('http://localhost:5000/api/auth/saved-jobs', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setSavedJobs(response.data.savedJobs || []);
      } catch (error) {
        setSavedJobs([]);
      }
    };
    fetchSavedJobs();
  }, [auth]);

  const handleSaveForLater = async (jobId) => {
    try {
      if (!auth?.token) {
        alert('Please log in to save jobs.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/auth/saved-jobs',
        { jobId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      alert('Job saved for later!');
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Failed to save job: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper to check if job is already saved
  const isJobSaved = (jobId) => savedJobs.some(job => job._id === jobId);

  const filteredJobs = jobs.filter((job) => {
    // Convert salary to a number for comparison
    const salaryValue = parseInt(job.salary, 10);
    const salaryFilterValue = salaryRange === "all" ? 0 : parseInt(salaryRange.replace("Rs.", "").replace(",", ""), 10);

    return (
      job.status === "Active" && // Only show active jobs
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (jobType === "all" || job.jobType === jobType) &&
      (locationFilter === "all" || job.location === locationFilter) &&
      (salaryRange === "all" || salaryValue >= salaryFilterValue)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      <br />
      <br />
      <br />
      {/* Main Content */}
      <div className="container mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-teal-700">Browse Jobs</h1>
          <p className="text-gray-600 mt-2">Find your next opportunity at OpportuNET</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4 bg-white p-6 rounded-2xl shadow-xl backdrop-blur-lg">
            <h2 className="text-xl font-bold text-teal-700 mb-4">Filters</h2>

            {/* Job Type Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {locationOptions.map((location, index) => (
                  <option key={index} value={location === "All Locations" ? "all" : location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary Range Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Salary Range</label>
              <select
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Salaries</option>
                <option value="Rs.50,000">Rs.50,000+</option>
                <option value="Rs.70,000">Rs.70,000+</option>
                <option value="Rs.90,000">Rs.90,000+</option>
              </select>
            </div>
          </div>

          {/* Job Listings */}
          <div className="w-full lg:w-3/4">
            {/* Search Bar */}
            <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
              <input
                type="text"
                placeholder="🔍 Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Job Cards */}
            {loading && <p className="text-teal-700 text-center">Loading jobs...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && filteredJobs.length === 0 && (
              <p className="text-teal-700 text-center">No jobs available.</p>
            )}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition duration-300"
                  >
                    <Link to={`/description/${job._id}`}>
                      <h2 className="text-xl font-bold text-teal-700 hover:underline">{job.title}</h2>
                    </Link>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-gray-500">{job.location}</p>
                    <p className="text-gray-500">{job.jobType}</p>
                    <p className="text-gray-700 font-semibold">Rs.{job.salary}</p>
                    <div className="flex space-x-4 mt-4">
                      <Link to={`/description/${job._id }`} className="w-1/2">
                        <button className="w-full bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-teal-200 transition duration-300">
                          Details
                        </button>
                      </Link>
                      <button
                        onClick={() => handleSaveForLater(job._id)}
                        className="w-1/2 bg-teal-800 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                        style={{ display: auth?.user?.role === 'employer' ? 'none' : undefined }}
                        disabled={isJobSaved(job._id)}
                      >
                        {isJobSaved(job._id) ? 'Already Saved for Later' : 'Save for Later'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BrowseJobs;