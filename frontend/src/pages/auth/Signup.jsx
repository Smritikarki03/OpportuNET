import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phoneNumber,
        role: "jobseeker"
      });
      if (response.data) {
        alert("Signup successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-teal-700 flex items-center justify-center">
        <div className="text-white text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Join OpportuNET!</h1>
          <p className="text-lg">Sign up today to explore amazing opportunities.</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-sm bg-teal-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-teal-800">Job Seeker Signup</h2>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-teal-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-teal-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-teal-700">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-teal-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-teal-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-teal-700 text-white py-2 px-4 rounded-lg ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-600 transition"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-sm text-teal-600 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-teal-500 hover:underline font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;