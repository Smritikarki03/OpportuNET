import React, { useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const BrowseJobs = () => {
  const jobs = [
    {
      id: 1,
      title: "Front-end Developer",
      company: "Tech Corp",
      location: "Remote",
      type: "Full-time",
      salary: "Rs.70,000 - Rs.90,000",
    },
    {
      id: 2,
      title: "Back-end Developer",
      company: "Code Masters",
      location: "New York, NY",
      type: "Full-time",
      salary: "Rs.80,000 - Rs.100,000",
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "Design Co",
      location: "San Francisco, CA",
      type: "Part-time",
      salary: "Rs.50,000 - Rs.70,000",
    },
    {
      id: 4,
      title: "Project Manager",
      company: "Build It Inc",
      location: "Chicago, IL",
      type: "Contract",
      salary: "Rs.90,000 - Rs.110,000",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");

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

  const filteredJobs = jobs.filter((job) => {
    return (
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (jobType === "all" || job.type === jobType) &&
      (locationFilter === "all" || job.location === locationFilter) &&
      (salaryRange === "all" || job.salary.includes(salaryRange))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      <br></br>
      <br></br>
      <br></br>
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
                <option value="Rs.70,000">RS.70,000+</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition duration-300"
                >
                  <h2 className="text-xl font-bold text-teal-700">{job.title}</h2>
                  <p className="text-gray-600">{job.company}</p>
                  <p className="text-gray-500">{job.location}</p>
                  <p className="text-gray-500">{job.type}</p>
                  <p className="text-gray-700 font-semibold">{job.salary}</p>
                  <button className="w-full mt-4 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition duration-300">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BrowseJobs;
