// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [userCompanyId, setUserCompanyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUserName = localStorage.getItem("userName");
      const storedUserRole = localStorage.getItem("userRole");
      const storedUserId = localStorage.getItem("userId");

      if (storedAuth && storedUserName) {
        setIsLoggedIn(true);
        setUserName(storedUserName);
        setUserRole(storedUserRole || "");
        setUserId(storedUserId || null);
        console.log("Auth Data:", {
          userName: storedUserName,
          userRole: storedUserRole,
          userId: storedUserId
        });
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
        setUserId(null);
      }
    };

    const fetchCompanyData = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (!storedAuth) return;

        const { token } = JSON.parse(storedAuth);
        console.log("Fetching company data for user:", userId);
        
        // First try to get from localStorage
        const profiles = JSON.parse(localStorage.getItem("companyProfiles")) || [];
        const storedProfile = profiles.find(p => p.userId === userId);
        
        if (storedProfile) {
          console.log("Found company in localStorage:", storedProfile);
          setUserCompanyId(storedProfile._id);
          return;
        }

        // If not in localStorage, fetch from API
        const response = await axios.get(
          `http://localhost:5000/api/company`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response:", response.data);

        if (response.data) {
          const companyData = response.data;
          setUserCompanyId(companyData._id);
          
          // Update localStorage
          const updatedProfiles = [...profiles];
          const existingProfileIndex = profiles.findIndex(p => p._id === companyData._id);
          
          if (existingProfileIndex !== -1) {
            updatedProfiles[existingProfileIndex] = companyData;
          } else {
            updatedProfiles.push(companyData);
          }
          
          localStorage.setItem("companyProfiles", JSON.stringify(updatedProfiles));
          console.log("Updated company profiles in localStorage");
        }
      } catch (error) {
        console.error("Error fetching company data:", error.response?.data || error);
        // If API call fails, try to get from localStorage as fallback
        const profiles = JSON.parse(localStorage.getItem("companyProfiles")) || [];
        const storedProfile = profiles.find(p => p.userId === userId);
        if (storedProfile) {
          console.log("Fallback: Found company in localStorage:", storedProfile);
          setUserCompanyId(storedProfile._id);
        }
      }
    };

    checkAuth();
    if (userId && userRole === "employer") {
      console.log("Employer detected, fetching company data");
      fetchCompanyData();
    }

    const handleStorageChange = () => {
      checkAuth();
      if (userId && userRole === "employer") {
        fetchCompanyData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userId, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");
    setUserId(null);
    setUserCompanyId(null);
    setDropdownVisible(false);
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  return (
    <nav className="bg-teal-700 py-4 fixed top-0 w-full z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">OpportuNET</div>
        <ul className="flex space-x-6 items-center">
          <li>
            <Link to="/" className="text-white hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:underline">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/Browse" className="text-white hover:underline">
              Browse
            </Link>
          </li>
          <li>
            <Link to="/help" className="text-white hover:underline">
              Help
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-white hover:underline">
              Contact
            </Link>
          </li>
          <li className="relative">
            {isLoggedIn ? (
              <>
                <button
                  onClick={toggleDropdown}
                  className="text-white hover:underline focus:outline-none flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-user fa-lg"></i>
                  <span>{userName}</span>
                </button>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-teal-900 shadow-lg rounded-lg p-2 space-y-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-teal-100 rounded"
                      onClick={() => setDropdownVisible(false)}
                    >
                      View Profile
                    </Link>
                    {userRole === "employer" && (
                      userCompanyId ? (
                        <Link
                          to={`/company-prof/${userCompanyId}`}
                          className="block px-4 py-2 hover:bg-teal-100 rounded"
                          onClick={() => setDropdownVisible(false)}
                        >
                          My Company Profile
                        </Link>
                      ) : (
                        <Link
                          to="/create-company"
                          className="block px-4 py-2 hover:bg-teal-100 rounded"
                          onClick={() => setDropdownVisible(false)}
                        >
                          Create Company Profile
                        </Link>
                      )
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-teal-100 rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={toggleDropdown}
                  className="text-white hover:underline focus:outline-none"
                >
                  Connect
                </button>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-teal-900 shadow-lg rounded-lg p-2 space-y-2">
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-teal-100 rounded"
                      onClick={() => setDropdownVisible(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/selectSignup"
                      className="block px-4 py-2 hover:bg-teal-100 rounded"
                      onClick={() => setDropdownVisible(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;