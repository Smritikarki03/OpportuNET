// src/components/CompanySetupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanySetupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    industry: '',
    location: '',
    establishedDate: '',
    employeeCount: '',
    website: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.industry || !formData.description) {
      alert('Please fill in all required fields (Name, Industry, Description).');
      return;
    }
    // Add createdAt timestamp and unique ID
    const newProfile = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    // Fetch existing profiles or initialize an empty array
    const existingProfiles = JSON.parse(localStorage.getItem('companyProfiles')) || [];
    // Add new profile to the array
    const updatedProfiles = [newProfile, ...existingProfiles];
    // Save updated profiles to localStorage
    localStorage.setItem('companyProfiles', JSON.stringify(updatedProfiles));
    // Save the latest profile for CompanyProf (optional, for single profile view)
    localStorage.setItem('companyProfile', JSON.stringify(newProfile));
    alert('Company profile created!');
    navigate('/company-prof');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Create Company Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
            {formData.logo && (
              <img src={formData.logo} alt="Logo Preview" className="mt-2 h-20 rounded-full" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry *</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Established Date</label>
            <input
              type="date"
              name="establishedDate"
              value={formData.establishedDate}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Count</label>
            <input
              type="number"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              rows="4"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySetupForm;