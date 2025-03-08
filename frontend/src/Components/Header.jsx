// Components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      const storedUserName = localStorage.getItem("userName");
      if (storedAuth && storedUserName) {
        setIsLoggedIn(true);
        setUserName(storedUserName);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserName("");
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
            <Link to="/services" className="text-white hover:underline">
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
                  <i className="fas fa-user fa-lg"></i> {/* Font Awesome person icon */}
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