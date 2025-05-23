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
  const [showMoreCompanies, setShowMoreCompanies] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNewJobs = async () => {
      try {
        console.log('Starting fetchNewJobs...');
        let response;
        const authData = localStorage.getItem('auth');
        
        if (authData) {
          try {
        const parsedAuthData = JSON.parse(authData);
            if (!parsedAuthData || !parsedAuthData.token) {
              throw new Error('Invalid auth data');
        }

            console.log('Making authenticated API request...');
            response = await axios.get('http://localhost:5000/api/jobs', {
          headers: {
                'Authorization': `Bearer ${parsedAuthData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
            console.log('Authenticated request successful');
          } catch (authError) {
            console.error('Error with authenticated request:', authError);
            // Clear invalid auth data
            if (authError.response?.status === 401) {
              console.log('Clearing invalid auth data...');
          localStorage.removeItem('auth');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          setIsLoggedIn(false);
          setUserRole('');
          setUserId(null);
        }
          }
        }

        // If no auth data or authenticated request failed, try public endpoint
        if (!response?.data) {
          console.log('Making public API request');
          response = await axios.get('http://localhost:5000/api/jobs/public');
        }

        if (response?.data) {
          console.log('Fetched jobs:', response.data);
          console.log('Number of jobs fetched:', response.data.length);
          setNewJobs(response.data);
          setFilteredJobs(response.data);
        } else {
          console.error('No data received from either endpoint');
          // Don't clear existing jobs if we already have them
          if (!newJobs.length) {
            setNewJobs([]);
            setFilteredJobs([]);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Don't clear existing jobs if we already have them
        if (!newJobs.length) {
        setNewJobs([]);
        setFilteredJobs([]);
        }
      }
    };

    const fetchTopCompanies = async () => {
      try {
        // Updated endpoint URL
        const response = await axios.get('http://localhost:5000/api/company/all');
        const companies = response.data;

        // Transform and sort companies
        const transformedCompanies = companies.map(company => ({
          id: company._id,
          name: company.name,
          rating: company.averageRating,
          link: `/company-prof/${company._id}`,
          logo: company.logo,
          industry: company.industry,
          location: company.location,
          reviewCount: company.totalReviews,
          employeeCount: company.employeeCount,
          description: company.description,
          establishedDate: company.establishedDate,
          website: company.website
        }));

        // Sort companies by rating and then by number of reviews
        const sortedCompanies = transformedCompanies.sort((a, b) => {
          if (b.rating === a.rating) {
            return b.reviewCount - a.reviewCount;
          }
          return b.rating - a.rating;
        });

        setTopCompanies(sortedCompanies);
        setFilteredCompanies(sortedCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setTopCompanies([]);
        setFilteredCompanies([]);
      }
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

    const fetchCompanyData = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        const storedUserRole = localStorage.getItem("userRole");
        if (!storedAuth || storedUserRole !== "employer") return;
        const { token } = JSON.parse(storedAuth);
        const response = await axios.get(
          `http://localhost:5000/api/company`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && response.data._id) {
          setUserCompanyId(response.data._id);
        } else {
          setUserCompanyId(null);
        }
      } catch (error) {
        setUserCompanyId(null);
      }
    };

    fetchNewJobs();
    fetchTopCompanies();
    checkAuth();
    fetchCompanyData();

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
    navigate("/post-job");
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

  const top3Companies = filteredCompanies.slice(0, 3);
  const moreCompanies = filteredCompanies.slice(3);

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
            {userCompanyId === null && (
              <button
                onClick={handleCreateCompanyProfileClick}
                className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
              >
                Create Company Profile
              </button>
            )}
          </div>
        )}

        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Featured Companies</h2>
            <p className="text-teal-600">Discover opportunities with top companies</p>
          </div>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-teal-700">No companies match your search.</p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-3 px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {top3Companies.map((company, index) => (
                  <Link
                    to={company.link}
                    key={company.id || index}
                    className="flex items-center bg-white/90 rounded-full shadow hover:shadow-lg hover:scale-[1.03] transition-all px-3 py-4 gap-4 w-full cursor-pointer border border-teal-100 hover:border-teal-400"
                    style={{ minWidth: '0' }}
                  >
                    {company.logo ? (
                      <img
                        src={`http://localhost:5000${company.logo}`}
                        alt={`${company.name} logo`}
                        className="w-9 h-9 object-cover rounded-full border-2 border-teal-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-lg font-bold text-teal-600">
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <span className="flex-1 text-base font-medium text-teal-900 truncate">{company.name}</span>
                    <div className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </Link>
                ))}
                {showMoreCompanies && moreCompanies.map((company, index) => (
                  <Link
                    to={company.link}
                    key={company.id || index}
                    className="flex items-center bg-white/90 rounded-full shadow hover:shadow-lg hover:scale-[1.03] transition-all px-3 py-4 gap-4 w-full cursor-pointer border border-teal-100 hover:border-teal-400"
                    style={{ minWidth: '0' }}
                  >
                    {company.logo ? (
                      <img
                        src={`http://localhost:5000${company.logo}`}
                        alt={`${company.name} logo`}
                        className="w-9 h-9 object-cover rounded-full border-2 border-teal-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-lg font-bold text-teal-600">
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <span className="flex-1 text-base font-medium text-teal-900 truncate">{company.name}</span>
                    <div className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
              {moreCompanies.length > 0 && (
                <button
                  className="mt-4 mb-1 px-4 py-2 bg-teal-100 text-teal-800 rounded-full font-semibold hover:bg-teal-200 transition self-center"
                  onClick={() => setShowMoreCompanies((prev) => !prev)}
                >
                  {showMoreCompanies ? 'Show Less' : `Show More (${moreCompanies.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-teal-800">New Jobs</h2>
          {filteredJobs.length === 0 ? (
            <p className="mt-6 text-lg text-teal-700">No jobs match your search.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(userRole === "employer"
                ? filteredJobs.filter(job => job.status === "Active")
                : filteredJobs
              ).map((job) => (
                <div
                  key={job._id}
                  className="relative bg-gradient-to-br from-teal-100 to-teal-200 text-teal-900 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute top-0 left-0 w-16 h-16 bg-teal-600 rounded-br-full opacity-20"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                    <p className="text-teal-800 font-medium">{job.company}</p>
                    <p className="text-teal-700 mb-3">{job.location}</p>
                    <div className="flex justify-center items-center gap-3 mb-3">
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