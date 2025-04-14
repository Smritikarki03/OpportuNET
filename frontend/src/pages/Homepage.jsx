// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newJobs, setNewJobs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const navigate = useNavigate();

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
      } catch (error) {
        console.error('Error fetching new jobs:', error);
      }
    };

    const fetchTopCompanies = () => {
      // Hardcoded companies
      const staticCompanies = [
        { name: "CV Raman", rating: 4.8, link: "/CVRamanProfile" },
        { name: "LeapFrog Private Limited", rating: 4.5, link: "/LeapFrogProfile" },
        { name: "Data Works Private", rating: 4.7, link: "/DataWorksProfile" },
        { name: "Cotiviti", rating: 4.6, link: "/CotivitiProfile" },
      ];

      // Fetch dynamic companies from localStorage
      const profiles = JSON.parse(localStorage.getItem('companyProfiles')) || [];
      let dynamicCompanies = [];
      if (profiles.length > 0) {
        const sortedProfiles = profiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestProfile = sortedProfiles[0];
        
        // Calculate rating based on reviews
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

      setTopCompanies([...dynamicCompanies, ...staticCompanies]);
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    console.log("Searching for:", searchQuery);
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

  return (
    <div className="min-h-screen bg-teal-50 text-teal-900">
      <Header />

      <div className="container mx-auto px-4 py-20 pt-20 text-center">
        <h1 className="text-5xl font-bold text-teal-900">Welcome to OpportuNET</h1>
        <p className="mt-6 text-lg text-teal-700">Your one-stop platform to find your dream job or hire top talent.</p>

        <div className="mt-8 max-w-xl mx-auto flex items-center">
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
          {topCompanies.length === 0 ? (
            <p className="mt-6 text-lg text-teal-700">No companies available yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {topCompanies.map((company, index) => (
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
          {newJobs.length === 0 ? (
            <p className="mt-6 text-lg text-teal-700">No new jobs available.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newJobs.map((job) => (
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
                    <p className="text-teal-800 text-sm line-clamp-2 mb-4">{job.description}</p>
                    <button className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition">
                      Apply Now
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