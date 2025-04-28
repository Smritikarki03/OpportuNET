// src/components/CompanyProf.jsx
import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const CompanyProf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState('Anonymous User');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        if (!userId) {
          navigate('/login');
          return;
        }

        // First try to get from local storage
        const profiles = JSON.parse(localStorage.getItem('companyProfiles')) || [];
        let selectedCompany = null;

        if (id) {
          // Try to find by exact ID match first
          selectedCompany = profiles.find(profile => profile._id === id || profile.id === id);
        } else {
          selectedCompany = JSON.parse(localStorage.getItem('companyProfile'));
        }

        // If found in localStorage and user is authorized
        if (selectedCompany) {
          if (selectedCompany.createdBy && selectedCompany.createdBy !== userId) {
            // Redirect to the user's own profile or setup page
            const userProfile = profiles.find((profile) => profile.createdBy === userId);
            if (userProfile) {
              navigate(`/company-prof/${userProfile._id || userProfile.id}`);
            } else {
              navigate('/company-setup');
            }
            return;
          }
          setCompany(selectedCompany);
          const savedReviews = JSON.parse(localStorage.getItem(`companyReviews_${selectedCompany._id || selectedCompany.id}`)) || [];
          setReviews(savedReviews);
          setLoading(false);
          return;
        }

        // If not in localStorage, try API
        const response = await axios.get(`http://localhost:5000/api/company/${id}`);
        setCompany(response.data);
        const savedReviews = JSON.parse(localStorage.getItem(`companyReviews_${id}`)) || [];
        setReviews(savedReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching company details:', error);
        setError(error.response?.data?.message || 'Error loading company details');
        setLoading(false);
      }
    };

    fetchCompanyDetails();
    const userName = localStorage.getItem('userName') || 'Anonymous User';
    setCurrentUser(userName);
  }, [id, navigate]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5.');
      return;
    }
    if (!comment.trim()) {
      alert('Please enter a comment.');
      return;
    }
    const newReview = {
      _id: Date.now().toString(),
      userName: currentUser,
      rating: rating,
      comment: comment,
      createdAt: new Date().toISOString(),
    };
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`companyReviews_${company._id || company.id}`, JSON.stringify(updatedReviews));
    setRating(0);
    setHover(0);
    setComment('');
    setShowReviewForm(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <>
      <Header />
      <br/>
      <br/>
      <br/>
      <br/>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 font-sans">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-opacity-10 bg-black opacity-30 z-0"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <img
              src={`http://localhost:5000${company.logo || 'https://via.placeholder.com/150'}`}
              alt={`${company.name} logo`}
              className="w-32 h-32 object-contain rounded-full border-4 border-white shadow-lg mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold tracking-tight">{company.name}</h1>
            <p className="mt-2 text-lg opacity-80">{company.industry}</p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-teal-800 border-b-2 border-teal-200 pb-2">About {company.name}</h2>
              {userRole === "employer" && (
                <button
                  onClick={() => {
                    console.log('Edit button clicked, company ID:', company._id || company.id);
                    navigate(`/EditCompanyProfile/${company._id || company.id}`);
                  }}
                  className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-teal-700 transition duration-300"
                  disabled={!company}
                >
                  Edit Company Profile
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 group">
                <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Industry</h3>
                  <p className="text-gray-600">{company.industry}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                  <p className="text-gray-600">{company.location || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Established</h3>
                  <p className="text-gray-600">
                    {company.establishedDate ? new Date(company.establishedDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Employees</h3>
                  <p className="text-gray-600">{company.employeeCount || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Website</h3>
                  <p className="text-gray-600">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                        {company.website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{company.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {reviews.length === 0 && !showReviewForm ? (
              <div className="text-center">
                <p className="text-gray-600 italic mb-4">No reviews yet for this company.</p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
                >
                  Add a Review
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-teal-800 mb-6 border-b-2 border-teal-200 pb-2">Reviews</h2>
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-8 space-y-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((star, index) => {
                          const ratingValue = index + 1;
                          return (
                            <label key={index}>
                              <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => setRating(ratingValue)}
                                className="hidden"
                              />
                              <FaStar
                                className="cursor-pointer transition-colors duration-200"
                                size={30}
                                color={ratingValue <= (hover || rating) ? '#FFD700' : '#e4e5e9'}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(rating)}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Your Comment</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                        rows="4"
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {reviews.length === 0 ? (
                  <p className="text-gray-600 italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-teal-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-teal-800">{review.userName}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((star, index) => (
                              <FaStar
                                key={index}
                                size={20}
                                color={index < Math.round(review.rating) ? '#FFD700' : '#e4e5e9'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {!showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-4 bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
                      >
                        Add Another Review
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProf;