// src/components/EditCompanyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditCompanyProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the company ID from the URL
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

  // Fetch the existing profile data
  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem('companyProfiles')) || [];
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      setFormData({
        name: profile.name || '',
        logo: profile.logo || '',
        industry: profile.industry || '',
        location: profile.location || '',
        establishedDate: profile.establishedDate || '',
        employeeCount: profile.employeeCount || '',
        website: profile.website || '',
        description: profile.description || '',
      });
    } else {
      alert('Company profile not found.');
      navigate('/dashboard');
    }
  }, [id, navigate]);

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
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please log in again.');
      navigate('/login');
      return;
    }

    const updatedProfile = {
      ...formData,
      id: id,
      createdAt: formData.createdAt || new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const existingProfiles = JSON.parse(localStorage.getItem('companyProfiles')) || [];
    const updatedProfiles = existingProfiles.map((p) =>
      p.id === id ? updatedProfile : p
    );
    localStorage.setItem('companyProfiles', JSON.stringify(updatedProfiles));
    localStorage.setItem('companyProfile', JSON.stringify(updatedProfile));
    alert('Company profile updated!');
    navigate(`/company-prof/${id}`); // Redirect back to the profile page
  };

  const handleCancel = () => {
    navigate(`/company-prof/${id}`); // Redirect back without saving
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Edit Company Profile</h1>
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
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyProfile;