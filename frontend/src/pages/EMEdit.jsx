import React, { useState } from "react";

const EditEMProfile = () => {
  // Initial state for the employer's profile
  const [employer, setEmployer] = useState({
    name: "Purnika Sharma",
    company: "Leapfrog Private Limited",
    jobRole: "Hiring Manager",
    email: "purnika@techinnovators.com",
    phone: "+977 9876543210",
    location: "Kathmandu, Nepal",
    skills: "Leadership, Team Management, Recruitment",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile Updated!");
    console.log(employer); // For demonstration purposes
  };

  return (
    <div className="min-h-screen bg-teal-700 flex justify-center items-center py-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6 text-center">
          Edit Employer Profile
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={employer.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Full Name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-1">Company Name</label>
            <input
              type="text"
              name="company"
              value={employer.company}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Company Name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-1">Job Role</label>
            <input
              type="text"
              name="jobRole"
              value={employer.jobRole}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Job Role"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={employer.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={employer.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Phone Number"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-teal-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={employer.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Location"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-teal-700 mb-1">Skills</label>
            <input
              type="text"
              name="skills"
              value={employer.skills}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Skills (comma separated)"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-800 transition duration-200"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => alert("Cancel clicked!")}
              className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEMProfile;
