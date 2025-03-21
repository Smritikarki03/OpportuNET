import { useState } from "react";
import axios from "axios";

const CompanySetupModal = ({ employerId, onClose }) => {
  const [companyData, setCompanyData] = useState({
    name: "",
    industry: "",
    location: "",
    logo: "",
    description: "",
    website: "",
  });

  const handleChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/employer/setup-company", {
        employerId,
        ...companyData,
      });
      alert("Company profile created successfully!");
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error("Error setting up company:", error);
      alert("Failed to set up company. Please try again.");
    }
  };

  // Sample industry options
  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Energy",
    "Manufacturing",
    "Retail",
    "Other",
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Set Up Your Company</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-teal-700 font-medium">Company Name</label>
            <input
              type="text"
              name="name"
              value={companyData.name}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-300 border-teal-600"
              required
            />
          </div>
          <div>
            <label className="block text-teal-700 font-medium">Industry</label>
            <select
              name="industry"
              value={companyData.industry}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-300 border-teal-600"
              required
            >
              <option value="" disabled>Select an Industry</option>
              {industries.map((industry, index) => (
                <option key={index} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-teal-700 font-medium">Location (City, Country)</label>
            <input
              type="text"
              name="location"
              value={companyData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-300 border-teal-600"
              required
            />
          </div>
          <div>
            <label className="block text-teal-700 font-medium">Company Logo (URL)</label>
            <input
              type="text"
              name="logo"
              value={companyData.logo}
              onChange={handleChange}
              placeholder="Logo URL (optional)"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-300 border-teal-600"
            />
          </div>
          <div>
            <label className="block text-teal-700 font-medium">Company Description</label>
            <textarea
              name="description"
              value={companyData.description}
              onChange={handleChange}
              placeholder="Company Description"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-300 border-teal-600 h-24"
              required
            />
          </div>
          <div>
            <label className="block text-teal-700 font-medium">Company Website (Optional)</label>
            <input
              type="text"
              name="website"
              value={companyData.website}
              onChange={handleChange}
              placeholder="Website"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-300 border-teal-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
          >
            Create Company
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanySetupModal;