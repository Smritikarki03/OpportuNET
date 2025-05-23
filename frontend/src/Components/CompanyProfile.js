import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import CompanyReviews from './CompanyReviews';

function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in first');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/company', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);

        if (response.data._id) {
          const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/company/${response.data._id}`);
          setReviews(reviewsRes.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company profile:', err);
        setError(err.response?.data.message || 'No company profile found. Please set up your company.');
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !profile?._id) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/CompanySU')}
          className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200"
        >
          Set Up Company Profile
        </button>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
          {profile.logo && (
            <img
              src={profile.logo}
              alt={`${profile.name} logo`}
              className="w-28 h-28 object-contain rounded-full bg-gray-100 mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-1 text-center">{profile.name}</h1>
          <p className="text-lg text-gray-600 mb-6 text-center">{profile.industry}</p>
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6 justify-items-center">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Industry</h3>
              <p className="mt-1">{profile.industry}</p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1">{profile.location}</p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Established</h3>
              <p className="mt-1">{new Date(profile.establishedDate).toLocaleDateString()}</p>
            </div>
            {profile.employeeCount && (
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">Employees</h3>
                <p className="mt-1">{profile.employeeCount}</p>
              </div>
            )}
            {profile.website && (
              <div className="md:col-span-2 text-center">
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-teal-600 hover:text-teal-800"
                >
                  {profile.website}
                </a>
              </div>
            )}
          </div>
          {/* Description Section */}
          <div className="w-full mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{profile.description}</p>
          </div>
          {/* Reviews Section */}
          <div className="w-full">
            <CompanyReviews companyId={profile._id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;