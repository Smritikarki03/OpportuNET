import React, { useState } from "react";

const SignUpEmployer = () => {
  const [formData, setFormData] = useState({
    fullname: "",           
    email: "",
    contactnumber: "",      
    password: "",
    confirmpassword: "",   
    companyname: "",        
    industry: "",
    companylocation: "",    
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form data change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (formData.password !== formData.confirmpassword) { // Updated to match formData key
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/employerRegister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          contactnumber: formData.contactnumber,
          password: formData.password,
          confirmpassword: formData.confirmpassword,
          companyname: formData.companyname,
          industry: formData.industry,
          companylocation: formData.companylocation,
          role: "employer", // Explicitly set the role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Employer registered successfully.");
        setError("");
        setFormData({
          fullname: "",
          email: "",
          contactnumber: "",
          password: "",
          confirmpassword: "",
          companyname: "",
          industry: "",
          companylocation: "",
        });
      } else {
        setError(data.message || "An error occurred.");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while registering.");
      setSuccess("");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-full md:w-1/2 bg-teal-700 flex items-center justify-center py-12 px-6">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Become a Part of Our Network</h1>
          <p className="text-lg">
            Sign up as an employer and connect with talented candidates ready to contribute to your business.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md bg-teal-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-teal-800 mb-6">Employer Sign Up</h2>

          {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullname" className="block text-teal-700 font-semibold">Full Name</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-teal-700 font-semibold">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Contact Number Field */}
            <div>
              <label htmlFor="contactnumber" className="block text-teal-700 font-semibold">Contact Number</label>
              <input
                type="text"
                id="contactnumber"
                name="contactnumber"
                value={formData.contactnumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your contact number"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-teal-700 font-semibold">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmpassword" className="block text-teal-700 font-semibold">Confirm Password</label>
              <input
                type="password"
                id="confirmpassword"
                name="confirmpassword"
                value={formData.confirmpassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Confirm your password"
              />
            </div>

            {/* Company Name Field */}
            <div>
              <label htmlFor="companyname" className="block text-teal-700 font-semibold">Company Name</label>
              <input
                type="text"
                id="companyname"
                name="companyname"
                value={formData.companyname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your company name"
              />
            </div>

            {/* Industry Field */}
            <div>
              <label htmlFor="industry" className="block text-teal-700 font-semibold">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter the industry of your company"
              />
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="companylocation" className="block text-teal-700 font-semibold">Company Location</label>
              <input
                type="text"
                id="companylocation"
                name="companylocation"
                value={formData.companylocation}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter the company location"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full bg-teal-700 text-white py-2 rounded-md hover:bg-teal-600 transition"
              >
                Sign Up
              </button>
            </div>
          </form>

          <p className="mt-4 text-sm text-center text-teal-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-teal-500 hover:underline font-medium"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpEmployer;