import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditJobSeekerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "Smriti Karki",
    email: "smritikarki@gmail.com",
    phone: "+977 9800000000",
    location: "Bouddha",
    experience: "Experienced with 2 years in FullStack Development",
    skills: "React, Node.js, MongoDB, GraphQL",
    cv: "smritikarkicv.pdf",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile Updated Successfully!");
    navigate("/PJobSeeker"); // Redirect to Job Seeker Profile
  };

  return (
    <div className="min-h-screen bg-teal-600 flex justify-center items-center py-6">
      <div className="bg-white p-4 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-teal-700 mb-4 text-center">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-medium text-teal-700">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Full Name"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-teal-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Email"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="phone" className="text-xs font-medium text-teal-700">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Phone Number"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="location" className="text-xs font-medium text-teal-700">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={user.location}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Location"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="experience" className="text-xs font-medium text-teal-700">Experience</label>
            <input
              type="text"
              id="experience"
              name="experience"
              value={user.experience}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Experience"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="skills" className="text-xs font-medium text-teal-700">Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={user.skills}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Skills (comma-separated)"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="cv" className="text-xs font-medium text-teal-700">CV Link</label>
            <input
              type="text"
              id="cv"
              name="cv"
              value={user.cv}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="CV Link"
              required
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="bg-teal-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-800 transition duration-200"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate("/PJobSeeker")}
              className="bg-gray-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-500 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobSeekerProfile;
