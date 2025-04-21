// src/components/HomePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newJobs, setNewJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownResults, setDropdownResults] = useState({ jobs: [], companies: [] });
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNewJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const response = await axios.get('http://localhost:5000/api/jobs', config);
        console.log('Fetched new jobs:', response.data);
        setNewJobs(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        console.error('Error fetching new jobs:', error);
      }
    };

    const fetchTopCompanies = () => {
      const staticCompanies = [
        { name: "CV Raman", rating: 4.8, link: "/CVRamanProfile" },
        { name: "LeapFrog Private Limited", rating: 4.5, link: "/LeapFrogProfile" },
        { name: "Data Works Private", rating: 4.7, link: "/DataWorksProfile" },
        { name: "Cotiviti", rating: 4.6, link: "/CotivitiProfile" },
      ];

      const profiles = JSON.parse(localStorage.getItem('companyProfiles')) || [];
      let dynamicCompanies = [];
      if (profiles.length > 0) {
        const sortedProfiles = profiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestProfile = sortedProfiles[0];
        const reviews = JSON.parse(localStorage.getItem(`companyReviews_${latestProfile.id}`)) || [];
        const averageRating = reviews.length > 0
          ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
          : 0;

        dynamicCompanies = [
          {
            name: latestProfile.name,
            rating: averageRating,
            link: `/company-prof/${latestProfile.id}`,
          },
        ];
      }

      const allCompanies = [...dynamicCompanies, ...staticCompanies];
      setTopCompanies(allCompanies);
      setFilteredCompanies(allCompanies);
    };

    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUserRole = localStorage.getItem("userRole");
      const storedUserId = localStorage.getItem("userId");
      const storedUserName = localStorage.getItem("userName");

      if (storedAuth) {
        setIsLoggedIn(true);
        setUserRole(storedUserRole || "");
        setUserId(storedUserId || null);
      } else {
        setIsLoggedIn(false);
        setUserRole("");
        setUserId(null);
      }
    };

    fetchNewJobs();
    fetchTopCompanies();
    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    const filteredJobResults = newJobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
    setFilteredJobs(filteredJobResults);

    const filteredCompanyResults = topCompanies.filter(company =>
      company.name.toLowerCase().includes(query)
    );
    setFilteredCompanies(filteredCompanyResults);

    const dropdownJobs = newJobs
      .filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      )
      .slice(0, 3);
    
    const dropdownCompanies = topCompanies
      .filter(company => company.name.toLowerCase().includes(query))
      .slice(0, 3);

    setDropdownResults({ jobs: dropdownJobs, companies: dropdownCompanies });
    setShowDropdown(query.length > 0 && (dropdownJobs.length > 0 || dropdownCompanies.length > 0));
  }, [searchQuery, newJobs, topCompanies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    console.log("Searching for:", searchQuery);
    setShowDropdown(false);
  };

  const handleGenerateCV = () => {
    navigate("/CV");
  };

  const handlePostJobClick = () => {
    navigate("/JobPost");
  };

  const handleSetupCompanyClick = () => {
    navigate("/CompanySU");
  };

  const handleCreateCompanyProfileClick = () => {
    navigate("/CompanySetupForm");
  };

  const handleJobClick = (jobId) => {
    console.log("Navigating to job description with ID:", jobId);
    setShowDropdown(false);
    navigate(`/description/${jobId}`); // Updated to match BrowseJobs route
  };

  const handleCompanyClick = (link) => {
    setShowDropdown(false);
    navigate(link);
  };

  return (
    <div className="min-h-screen bg-teal-50 text-teal-900">
      <Header />

      <div className="container mx-auto px-4 py-20 pt-20 text-center">
        <h1 className="text-5xl font-bold text-teal-900">Welcome to OpportuNET</h1>
        <p className="mt-6 text-lg text-teal-700">Your one-stop platform to find your dream job or hire top talent.</p>

        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for jobs or companies"
              className="w-full py-2 px-4 rounded-lg border-2 border-teal-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button
              onClick={handleSearchClick}
              className="ml-4 bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
            >
              Search
            </button>
          </div>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white text-teal-900 shadow-lg rounded-lg max-h-96 overflow-y-auto z-10"
            >
              {dropdownResults.jobs.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-teal-800 border-b border-teal-200 pb-1">Jobs</h3>
                  {dropdownResults.jobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => handleJobClick(job._id)}
                      className="p-2 hover:bg-teal-100 cursor-pointer rounded"
                    >
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                      <p className="text-xs text-gray-500">Job ID: {job._id}</p>
                    </div>
                  ))}
                </div>
              )}

              {dropdownResults.companies.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-teal-800 border-b border-teal-200 pb-1">Companies</h3>
                  {dropdownResults.companies.map((company, index) => (
                    <div
                      key={index}
                      onClick={() => handleCompanyClick(company.link)}
                      className="p-2 hover:bg-teal-100 cursor-pointer rounded"
                    >
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-gray-600">Rating: {company.rating} / 5</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {isLoggedIn && userRole === "employer" && (
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={handlePostJobClick}
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
            >
              Post a Job
            </button>
            <button
              onClick={handleSetupCompanyClick}
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
            >
              Setup Company
            </button>
            <button
              onClick={handleCreateCompanyProfileClick}
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
            >
              Create Company Profile
            </button>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-teal-800">Companies</h2>
          {filteredCompanies.length === 0 ? (
            <p className="mt-6 text-lg text-teal-700">No companies match your search.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <Link to={company.link} key={index}>
                  <div
                    className="bg-white text-teal-700 p-6 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                  >
                    <h3 className="text-xl font-bold">{company.name}</h3>
                    <p className="mt-2 text-gray-600">Rating: {company.rating} / 5</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-teal-800">New Jobs</h2>
          {filteredJobs.length === 0 ? (
            <p className="mt-6 text-lg text-teal-700">No jobs match your search.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="relative bg-gradient-to-br from-teal-100 to-teal-200 text-teal-900 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute top-0 left-0 w-16 h-16 bg-teal-600 rounded-br-full opacity-20"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                    <p className="text-teal-800 font-medium">{job.company}</p>
                    <p className="text-teal-700 mb-3">{job.location}</p>
                    <div className="flex flex-wrap gap-10 mb-3">
                      <span className="bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {job.jobType}
                      </span>
                      <span className="bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Rs. {job.salary}
                      </span>
                      <span className="bg-teal-400 text-teal-900 text-xs font-semibold px-2 py-1 rounded-full">
                        {job.noOfPositions} Position{job.noOfPositions !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Link to={`/description/${job._id}`} className="w-1/2"></Link>
                    <p className="text-teal-800 text-sm line-clamp-2 mb-4">{job.description}</p>
                    <button className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition">
                      <Link to={`/description/${job._id}`} className="w-1/2">
                      Apply Now
                      </Link>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerateCV}
          className="fixed bottom-6 right-6 bg-teal-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-teal-600 transition transform hover:scale-110"
        >
          Generate a CV
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;