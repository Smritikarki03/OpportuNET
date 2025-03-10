import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';


const BrowseJobs = () => {
  // Sample job data
  const jobs = [
    {
      id: 1,
      title: 'Front-end Developer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
    },
    {
      id: 2,
      title: 'Back-end Developer',
      company: 'Code Masters',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $100,000',
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Design Co',
      location: 'San Francisco, CA',
      type: 'Part-time',
      salary: '$50,000 - $70,000',
    },
    {
      id: 4,
      title: 'Project Manager',
      company: 'Build It Inc',
      location: 'Chicago, IL',
      type: 'Contract',
      salary: '$90,000 - $110,000',
    },
  ];

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [salaryRange, setSalaryRange] = useState('all');

  // Predefined location options
  const locationOptions = [
    'All Locations',
    'Chabahil',
    'Bouddha',
    'Naxal',
    'Remote',
    'New York, NY',
    'San Francisco, CA',
    'Chicago, IL',
  ];

  // Filtered jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    return (
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (jobType === 'all' || job.type === jobType) &&
      (locationFilter === 'all' || job.location === locationFilter) &&
      (salaryRange === 'all' || job.salary.includes(salaryRange))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-teal-700">Browse Jobs</h1>
        <p className="text-gray-600">Find your next opportunity at OpportuNET</p>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-teal-700 mb-4">Filters</h2>

          {/* Job Type Filter */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {locationOptions.map((location, index) => (
                <option key={index} value={location === 'All Locations' ? 'all' : location}>
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Salaries</option>
              <option value="$50,000">$50,000+</option>
              <option value="$70,000">$70,000+</option>
              <option value="$90,000">$90,000+</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="w-full lg:w-3/4">
          {/* Search Bar */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-bold text-teal-700 mb-2">{job.title}</h2>
                <p className="text-gray-600 mb-2">{job.company}</p>
                <p className="text-gray-600 mb-2">{job.location}</p>
                <p className="text-gray-600 mb-2">{job.type}</p>
                <p className="text-gray-600 mb-4">{job.salary}</p>
                <button className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition duration-300">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseJobs;