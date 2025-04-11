import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CompanySU() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    employeeCount: '',
    description: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    console.log(e.target.name, e.target.value); // Log changes
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData); // Log form data
      await axios.post('http://localhost:5000/api/company', formData);
      navigate('/CompanyProfile'); // Redirect to CompanyProfile
    } catch (err) {
      console.error('Error creating company profile:', err);
      alert('API failed, but showing mock data for testing. Check your backend!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {profile ? 'Edit Company Profile' : 'Company Setup'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'industry', 'location', 'employeeCount', 'description'].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
              {field === 'description' ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              ) : (
                <input
                  type={field === 'employeeCount' ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min={field === 'employeeCount' ? '1' : undefined}
                  required
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
          >
            {profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </form>
      </div>

      {profile && (
        <div className="mt-8 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">{profile.name}</h2>
          {['Industry', 'Location', 'Employees', 'Description'].map((field, index) => (
            <p key={index} className="text-gray-700">
              <strong>{field}:</strong> {profile[field.toLowerCase()]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanySU;