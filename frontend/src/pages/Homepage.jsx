import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(false);
  const [newJobs, setNewJobs] = useState([]);  // Added state for new jobs
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setIsLoggedIn(true);
    }
    // Simulate fetching new job listings for now
    setNewJobs([
      { title: "Software Engineer", company: "TechCorp", location: "Bouddha", category: "Engineering" },
      { title: "Product Manager", company: "InnovateInc", location: "Baluwatar", category: "Management" },
      { title: "Data Scientist", company: "DataWorks", location: "Naxal", category: "Data Science" },
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleJobAlerts = () => {
    setJobAlertsEnabled((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleSearchClick = () => {
    // You can implement the search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-teal-700 text-white">
      {/* Navigation Bar */}
      <nav className="bg-teal-700 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">OpportuNET</div>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/services" className="hover:underline">Browse</Link></li>
            <li><Link to="/services" className="hover:underline">Help</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li className="relative">
              <button onClick={toggleDropdown} className="hover:underline focus:outline-none">Connect</button>
              {dropdownVisible && (
                <ul className="absolute text-gray-800 bg-white shadow-lg rounded mt-2 p-2 space-y-2">
                  {!isLoggedIn ? (
                    <>
                      <li><Link to="/login" className="block px-4 py-2 hover:bg-gray-200">Login</Link></li>
                      <li><Link to="/selectSignup" className="block px-4 py-2 hover:bg-gray-200">Sign Up</Link></li>
                    </>
                  ) : (
                    <li>
                      <button onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-200 w-full text-left">Logout</button>
                    </li>
                  )}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold">Welcome to OpportuNET</h1>
        <p className="mt-6 text-lg">Your one-stop platform to find your dream job or hire top talent.</p>

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

        {/* Job Alerts Section */}
        {isLoggedIn && (
          <div className="mt-8">
            <p className="text-lg">Stay updated with job alerts!</p>
            <button
              onClick={toggleJobAlerts}
              className={`mt-4 py-2 px-6 rounded-lg font-semibold ${jobAlertsEnabled ? "bg-teal-600" : "bg-teal-800"} hover:bg-teal-600 transition`}
            >
              {jobAlertsEnabled ? "Disable Job Alerts" : "Enable Job Alerts"}
            </button>
          </div>
        )}

        {/* New Jobs Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold">New Jobs</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {newJobs.map((job, index) => (
              <div key={index} className="bg-white text-teal-700 p-6 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105">
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
          </div>
        </div>

        {/* <div className="mt-8">
          {!isLoggedIn ? (
            <Link to="/selectSignup" className="bg-white text-teal-700 py-2 px-6 rounded-lg font-semibold hover:bg-teal-600 hover:text-white transition">
              Get Started
            </Link>
          ) : (
            <p className="text-lg">You're logged in!</p>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default HomePage;
