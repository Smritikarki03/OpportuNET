import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: '', comment: '' });
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
          const reviewsRes = await axios.get(`http://localhost:5000/api/company/reviews/${response.data._id}`);
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

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to submit a review');
        navigate('/login');
        return;
      }

      const res = await axios.post(
        'http://localhost:5000/api/company/reviews',
        {
          companyId: profile._id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([res.data.review, ...reviews]);
      setReviewForm({ rating: '', comment: '' });
    } catch (err) {
      setError(err.response?.data.message || 'Error submitting review');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Section */}
      <div className="bg-teal-600 text-white py-6 px-8 shadow-lg">
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="mt-1 text-lg opacity-90">{profile.industry}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
          {/* Company Details Card */}
          <div className="space-y-4">
            {profile.logo && (
              <img
                src={profile.logo}
                alt={`${profile.name} logo`}
                className="w-24 h-24 object-contain mb-4"
              />
            )}
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"
                />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Industry</h2>
                <p className="text-gray-600">{profile.industry}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Location</h2>
                <p className="text-gray-600">{profile.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Established Date</h2>
                <p className="text-gray-600">
                  {new Date(profile.establishedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Employee Count</h2>
                <p className="text-gray-600">{profile.employeeCount || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Website</h2>
                <p className="text-gray-600">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                      {profile.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Description</h2>
                <p className="text-gray-600">{profile.description}</p>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleReviewSubmit} className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (1–5)</label>
                <input
                  type="number"
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  min="1"
                  max="5"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-200"
              >
                Submit Review
              </button>
            </form>
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <p className="font-semibold">{review.userName}</p>
                    <p className="flex items-center">
                      {review.rating} <FaStar className="ml-1 text-yellow-400" />
                    </p>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;