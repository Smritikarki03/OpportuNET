// src/components/EditCompanyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { useAuth } from '../context/auth';

const EditCompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    establishedDate: '',
    employeeCount: '',
    website: '',
    description: '',
    logo: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    fetchCompanyData();
  }, [id, auth, navigate]);

  const fetchCompanyData = async () => {
    try {
      if (!auth?.token) {
        throw new Error('Authentication token not found');
      }

      console.log('Current auth user:', {
        userId: auth?.user?.id,
        role: auth?.user?.role
      });

      const response = await axios.get(`http://localhost:5000/api/company/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const companyData = response.data;
      
      // Get the company's user ID, handling both string and object formats
      const companyUserId = typeof companyData.userId === 'object' 
        ? companyData.userId._id 
        : companyData.userId;

      console.log('Company data received:', {
        companyId: companyData._id,
        companyUserId: companyUserId,
        authUserId: auth?.user?.id
      });
      
      // Check if the logged-in user is authorized to edit this profile
      if (!auth?.user?.id || auth.user.id !== companyUserId) {
        console.log('Authorization failed:', {
          authUserId: auth?.user?.id,
          companyUserId: companyUserId,
          match: auth?.user?.id === companyUserId
        });
        setAuthorized(false);
        throw new Error('You are not authorized to edit this profile');
      }

      setAuthorized(true);
      setFormData({
        name: companyData.name || '',
        logo: companyData.logo || '',
        industry: companyData.industry || '',
        location: companyData.location || '',
        establishedDate: companyData.establishedDate ? companyData.establishedDate.split('T')[0] : '',
        employeeCount: companyData.employeeCount || '',
        website: companyData.website || '',
        description: companyData.description || '',
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError(error.message || 'Failed to fetch company data');
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!auth?.token) {
      setError('You must be logged in to update your company profile.');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'logo' || !logoFile) {
          submitData.append(key, value || '');
        }
      });

      // Add new logo if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      console.log('Submitting update with data:', Object.fromEntries(submitData));

      const response = await axios.put(
        `http://localhost:5000/api/company/${id}`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Update response:', response.data);

      // Update local storage with new company data
      const companyProfiles = JSON.parse(localStorage.getItem('companyProfiles') || '[]');
      const updatedProfiles = companyProfiles.map(profile => 
        profile._id === id ? response.data.company : profile
      );
      localStorage.setItem('companyProfiles', JSON.stringify(updatedProfiles));

      // Show success message and redirect
      alert('Company profile updated successfully!');
      navigate(`/company-prof/${id}`);
    } catch (error) {
      console.error('Error updating company profile:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Your session has expired. Please log in again.');
            setTimeout(() => navigate('/login'), 2000);
            break;
          case 403:
            setError('You do not have permission to edit this company profile.');
            break;
          case 404:
            setError('Company profile not found.');
            break;
          default:
            setError(error.response.data.message || 'An error occurred while updating the profile.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/company-prof/${id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6 flex items-center justify-center">
          <div className="text-xl text-teal-800">Loading...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6 flex items-center justify-center">
          <div className="text-xl text-red-600 text-center">
            <p>{error}</p>
            <p className="text-sm mt-2">Redirecting...</p>
          </div>
        </div>
      </>
    );
  }

  if (!authorized) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6 flex items-center justify-center">
          <div className="text-xl text-red-600 text-center">
            <p>You are not authorized to edit this profile.</p>
            <p className="text-sm mt-2">Redirecting to company profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-6 pt-24">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-teal-800 mb-6">Edit Company Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {formData.logo && (
                  <img 
                    src={formData.logo.startsWith('data:') ? formData.logo : `http://localhost:5000${formData.logo}`}
                    alt="Logo Preview" 
                    className="mt-2 h-20 w-20 object-cover rounded-full"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Date *</label>
                <input
                  type="date"
                  name="establishedDate"
                  value={formData.establishedDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees *</label>
                <input
                  type="number"
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditCompanyProfile;