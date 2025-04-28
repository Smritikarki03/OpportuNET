// src/components/CompanySetupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear error when user makes changes
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    setError(''); // Clear error when user makes changes
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check all required fields
    if (!formData.name || !formData.industry || !formData.location || !formData.establishedDate || !formData.description) {
      setError('Please fill in all required fields (Name, Industry, Location, Established Date, and Description).');
      setLoading(false);
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        setError('Please log in to create a company profile');
        navigate('/login');
        return;
      }

      const { token } = JSON.parse(authData);
      
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('industry', formData.industry);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('establishedDate', formData.establishedDate);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('employeeCount', formData.employeeCount);
      formDataToSend.append('website', formData.website);
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await axios.post('http://localhost:5000/api/company', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        alert('Company profile created successfully!');
        navigate(`/company-prof/${response.data.company._id}`);
      }
    } catch (error) {
      console.error('Error creating company profile:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('auth');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('Only approved employers can create a company profile. Please wait for admin approval.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Please fill in all required fields correctly.');
      } else {
        setError('Error creating company profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <br/>
      <br/>
      <br/>
      <br/>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-teal-800 mb-6">Create Company Profile</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

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
              <label className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Established Date *</label>
              <input
                type="date"
                name="establishedDate"
                value={formData.establishedDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                required
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
                disabled={loading}
                className={`bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompanySetupForm;