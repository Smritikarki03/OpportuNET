import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CompanySU() {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    establishedDate: '',
    description: '',
    employeeCount: '',
    website: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCompanyExists = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in first');
          navigate('/login');
          return;
        }
        // Check if company exists
        const companyRes = await axios.get('http://localhost:5000/api/company', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (companyRes.data._id) {
          navigate('/company-profile');
        }
      } catch (err) {
        // If no company exists, stay on this page; otherwise, handle errors
        if (err.response?.status !== 404) {
          setError(err.response?.data.message || 'Error checking company');
        }
      }
    };
    checkCompanyExists();
  }, [navigate]);

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const requiredFields = ['name', 'industry', 'location', 'establishedDate', 'description'];
    const emptyFields = requiredFields.filter((field) => !formData[field]);
    if (emptyFields.length > 0) {
      setError(`Please fill in: ${emptyFields.join(', ')}`);
      setLoading(false);
      return;
    }

    if (new Date(formData.establishedDate) > new Date()) {
      setError('Established date cannot be in the future');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataWithFile = new FormData();
      for (const key in formData) {
        if (formData[key]) {
          formDataWithFile.append(key, formData[key]);
        }
      }
      if (document.querySelector('input[type="file"]').files[0]) {
        formDataWithFile.append('logo', document.querySelector('input[type="file"]').files[0]);
      }

      const res = await axios.post('http://localhost:5000/api/company', formDataWithFile, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Company created:', res.data);
      navigate('/company-profile');
    } catch (err) {
      console.error('Error creating company:', err);
      setError(err.response?.data.message || 'Could not create company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Company Setup</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Established Date</label>
            <input
              type="date"
              name="establishedDate"
              value={formData.establishedDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Count</label>
            <input
              type="number"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <input
              type="file"
              name="logo"
              accept="image/jpeg,image/png"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompanySU;