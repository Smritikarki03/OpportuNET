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
      {/* Header Section */}
      <div className="bg-teal-600 text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            {profile.logo && (
              <img
                src={profile.logo}
                alt={`${profile.name} logo`}
                className="w-24 h-24 object-contain rounded-lg bg-white p-2"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="mt-1 text-lg opacity-90">{profile.industry}</p>
              {averageRating > 0 && (
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        color={index < averageRating ? "#ffc107" : "#e4e5e9"}
                        size={20}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-lg">({averageRating})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">About Us</h2>
              <p className="text-gray-700">{profile.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                  <p className="mt-1">{profile.industry}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1">{profile.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Established</h3>
                  <p className="mt-1">{new Date(profile.establishedDate).toLocaleDateString()}</p>
                </div>
                {profile.employeeCount && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Employees</h3>
                    <p className="mt-1">{profile.employeeCount}</p>
                  </div>
                )}
                {profile.website && (
                  <div className="md:col-span-2">
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
            </div>

            {/* Reviews Section */}
            <CompanyReviews companyId={profile._id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
                  <p className="text-2xl font-semibold">{reviews.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          color={index < averageRating ? "#ffc107" : "#e4e5e9"}
                          size={20}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-xl font-semibold">{averageRating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate(`/EditCompanyProfile/${profile._id}`)}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/jobs/new')}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200"
                >
                  Post a Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;