import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newJobs, setNewJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    category: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Initial job listings
    setNewJobs([
      { title: "Software Engineer", company: "TechCorp", location: "Bouddha", category: "Engineering" },
      { title: "Product Manager", company: "InnovateInc", location: "Baluwatar", category: "Management" },
      { title: "Data Scientist", company: "DataWorks", location: "Naxal", category: "Data Science" },
    ]);

    // Check login state and role
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUserRole = localStorage.getItem("userRole");
      if (storedAuth) {
        setIsLoggedIn(true);
        setUserRole(storedUserRole || "");
      } else {
        setIsLoggedIn(false);
        setUserRole("");
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

  // Handle job form input changes
  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle job posting submission
  const handleJobSubmit = (e) => {
    e.preventDefault();
    const newJob = { ...jobForm };
    setNewJobs((prevJobs) => [newJob, ...prevJobs]); // Add new job to the top of the list
    setJobForm({ title: "", company: "", location: "", category: "" }); // Reset form
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

        {/* Job Posting Form (Visible only to logged-in employers) */}
        {isLoggedIn && userRole === "employer" && (
          <div className="mt-12">
            <h2 className="text-3xl font-semibold text-teal-800">Post a New Job</h2>
            <form onSubmit={handleJobSubmit} className="mt-6 max-w-lg mx-auto space-y-4">
              <input
                type="text"
                name="title"
                value={jobForm.title}
                onChange={handleJobFormChange}
                placeholder="Job Title"
                className="w-full py-2 px-4 rounded-lg border-2 border-teal-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              />
              <input
                type="text"
                name="company"
                value={jobForm.company}
                onChange={handleJobFormChange}
                placeholder="Company Name"
                className="w-full py-2 px-4 rounded-lg border-2 border-teal-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              />
              <input
                type="text"
                name="location"
                value={jobForm.location}
                onChange={handleJobFormChange}
                placeholder="Location"
                className="w-full py-2 px-4 rounded-lg border-2 border-teal-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              />
              <input
                type="text"
                name="category"
                value={jobForm.category}
                onChange={handleJobFormChange}
                placeholder="Category (e.g., Engineering)"
                className="w-full py-2 px-4 rounded-lg border-2 border-teal-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              />
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
              >
                Post Job
              </button>
            </form>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;