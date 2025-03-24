import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
const EditCompanyProfile = () => {
  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    location: '',
    logo: null,
  });
  const [existingLogo, setExistingLogo] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) {
          navigate('/Login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`http://localhost:5000/api/companies/user/${userId}`, config);
        setCompanyData({
          name: response.data.name,
          description: response.data.description,
          location: response.data.location,
          logo: null,
        });
        setExistingLogo(response.data.logo);
      } catch (err) {
        setError('Failed to load company profile.');
        console.error('Error:', err);
      }
    };

    fetchCompanyProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setCompanyData((prev) => ({ ...prev, logo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', companyData.name);
      formData.append('description', companyData.description);
      formData.append('location', companyData.location);
      formData.append('userId', localStorage.getItem('userId'));
      if (companyData.logo) {
        formData.append('logo', companyData.logo);
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      await axios.post('http://localhost:5000/api/companies', formData, config);
      navigate('/company-profile');
    } catch (err) {
      setError('Failed to update company profile. Please try again.');
      console.error('Error updating company:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50">
      <Header />
      <div className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-teal-700 mb-4">Edit Company Profile</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Company Name</label>
              <input
                type="text"
                name="name"
                value={companyData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={companyData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={companyData.location}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Company Logo</label>
              {existingLogo && (
                <div className="mb-2">
                  <img
                    src={`http://localhost:5000${existingLogo}`}
                    alt="Current Logo"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
              <input
                type="file"
                name="logo"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                accept="image/*"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditCompanyProfile;