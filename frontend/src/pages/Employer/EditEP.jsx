import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditEmployerProfile = () => {
  const navigate = useNavigate();
  const [employer, setEmployer] = useState({
    fullName: "John Doe",
    email: "johndoe@gmail.com",
    phone: "+977 9800000000",
    companyName: "Tech Solutions",
    industry: "Software Development",
    location: "Kathmandu",
    companyDescription: "Leading tech company specializing in AI solutions.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Employer Profile Updated Successfully!");
    navigate("/EmployerProfile"); // Redirect to Employer Profile page
  };

  return (
    <div className="min-h-screen bg-teal-700 flex justify-center items-center py-10">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 space-y-6">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6 text-center">
          Edit Employer Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="fullName"
            value={employer.fullName}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="email"
            value={employer.email}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Email"
            required
          />
          <input
            type="text"
            name="phone"
            value={employer.phone}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Phone Number"
            required
          />
          <input
            type="text"
            name="companyName"
            value={employer.companyName}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Company Name"
            required
          />
          <input
            type="text"
            name="industry"
            value={employer.industry}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Industry"
            required
          />
          <input
            type="text"
            name="location"
            value={employer.location}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Location"
            required
          />
          <textarea
            name="companyDescription"
            value={employer.companyDescription}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-32"
            placeholder="Company Description"
            required
          ></textarea>
          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="bg-teal-700 text-white px-6 py-3 rounded-lg text-lg hover:bg-teal-800 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate("/EmployerProfile")}
              className="bg-gray-400 text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployerProfile;
