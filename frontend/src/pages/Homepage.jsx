import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import CompanySetupModal from "../Components/CompanySetupModal";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newJobs, setNewJobs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showCompanySetupModal, setShowCompanySetupModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial job listings (replace with API call to backend in production)
    setNewJobs([
      { title: "Software Engineer", company: "TechCorp", location: "Bouddha", category: "Engineering" },
      { title: "Product Manager", company: "InnovateInc", location: "Baluwatar", category: "Management" },
      { title: "Data Scientist", company: "DataWorks", location: "Naxal", category: "Data Science" },
    ]);

    // Check login state and role
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUserRole = localStorage.getItem("userRole");
      const storedUserId = localStorage.getItem("userId");
      const storedIsCompanySetup = localStorage.getItem("isCompanySetup");

      if (storedAuth) {
        setIsLoggedIn(true);
        setUserRole(storedUserRole || "");
        setUserId(storedUserId || null);

        // If the user is an employer, check if they’ve set up their company
        if (storedUserRole === "employer" && storedUserId) {
          if (storedIsCompanySetup === "false") {
            setShowCompanySetupModal(true); // Show the modal if company setup is not complete
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserRole("");
        setUserId(null);
      }
    };

    checkAuth(); // Run on mount

    // Listen for storage changes (e.g., logout)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
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

  // Sample top companies data
  const topCompanies = [
    { name: "TechCorp", rating: 4.8 },
    { name: "InnovateInc", rating: 4.5 },
    { name: "DataWorks", rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-teal-50 text-teal-900">
      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 pt-20 text-center">
        <h1 className="text-5xl font-bold text-teal-900">Welcome to OpportuNET</h1>
        <p className="mt-6 text-lg text-teal-700">Your one-stop platform to find your dream job or hire top talent.</p>

        {/* Search Bar */}
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

        {/* Post a Job Button (Visible only to logged-in employers) */}
        {isLoggedIn && userRole === "employer" && (
          <div className="mt-12">
            <button
              onClick={handlePostJobClick}
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
            >
              Post a Job
            </button>
          </div>
        )}

        {/* Top Companies Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-teal-800">Top Companies</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCompanies.map((company, index) => (
              <div
                key={index}
                className="bg-white text-teal-700 p-6 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                <h3 className="text-xl font-bold">{company.name}</h3>
                <p className="mt-2 text-gray-600">Rating: {company.rating} / 5</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Jobs Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-teal-800">New Jobs</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {newJobs.map((job, index) => (
              <div
                key={index}
                className="bg-white text-teal-700 p-6 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  <p className="text-gray-500">{job.location}</p>
                </div>
                <div className="mt-4">
                  <span className="text-teal-500 font-semibold">{job.category}</span>
                </div>
              </div>
            ))}
            {/* Floating "Generate a CV" Button */}
            <button
              onClick={handleGenerateCV}
              className="fixed bottom-6 right-6 bg-teal-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-teal-600 transition transform hover:scale-110"
            >
              Generate a CV
            </button>
          </div>
        </div>
      </div>

      {/* Company Setup Modal (Visible only for first-time employer login) */}
      {showCompanySetupModal && (
        <CompanySetupModal
          userId={userId}
          onClose={() => {
            setShowCompanySetupModal(false);
            localStorage.setItem("isCompanySetup", "true"); // Update localStorage after setup
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default HomePage;