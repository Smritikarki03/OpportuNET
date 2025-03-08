import React, { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "", // Optional, kept for potential future use
    password: "",
    confirmPassword: "", // Added to match backend requirement
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // State for error display

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
    console.log("Signup: Input changed", { name, value, formData: { ...formData, [name]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous error

    // Combine firstName and lastName into name
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    console.log("Signup: Submitting form data", { name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword });

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name, // Combined name
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          // Removed phoneNumber and role as they are not expected by the backend for jobseeker
        }),
      });

      const result = await response.json();
      console.log("Signup: Server response", { status: response.status, result });

      if (response.ok) {
        alert("Signup successful! Please login.");
        window.location.href = "/login";
      } else {
        setError(result.message || "An error occurred during signup.");
      }
    } catch (error) {
      console.error("Signup: Network error", error);
      setError("Network error. Please try again later.");
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
          <h2 className="text-2xl font-bold text-center text-teal-800">Signup</h2>
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
                // Not required since backend doesn't use it for jobseeker
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
              {isLoading ? "Signing up..." : "Signup"}
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