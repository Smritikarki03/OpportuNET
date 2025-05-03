// src/components/CompanyProf.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompanyProf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [editingReview, setEditingReview] = useState(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('userRole');
        const storedAuth = localStorage.getItem('auth');
        
        setUserRole(role);
        if (!userId || !storedAuth) {
          navigate('/login');
          return;
        }

        const { token } = JSON.parse(storedAuth);

        // Fetch company details
        const response = await axios.get(
          `http://localhost:5000/api/company/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setCompany(response.data);

        // Fetch reviews
        const reviewsResponse = await axios.get(
          `http://localhost:5000/api/reviews/company/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setReviews(reviewsResponse.data || []);
        setLoading(false);

        // Scroll to reviews if coming from a notification
        if (location.state?.scrollToReviews && reviewsRef.current) {
          console.log('Scrolling to reviews section');
          setTimeout(() => {
            reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        setError(error.response?.data?.message || 'Error loading company details');
        setLoading(false);
      }
    };

    fetchCompanyDetails();
    const userName = localStorage.getItem('userName') || 'Anonymous User';
    setCurrentUser(userName);
  }, [id, navigate, location]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }

    try {
      const storedAuth = localStorage.getItem("auth");
      if (!storedAuth) {
        toast.error('Please log in to submit a review');
        return;
      }

      const { token, user } = JSON.parse(storedAuth);
      
      if (editingReview && !editingReview._id) {
        console.error('Invalid editing review:', editingReview);
        toast.error('Cannot edit this review at the moment');
        return;
      }

      // If editing, update the review; otherwise create a new one
      const url = editingReview 
        ? `http://localhost:5000/api/reviews/${editingReview._id}`
        : 'http://localhost:5000/api/reviews';

      console.log('Review operation:', {
        isEditing: !!editingReview,
        reviewId: editingReview?._id,
        userId: user?._id,
        url,
        method: editingReview ? 'put' : 'post',
        data: editingReview ? { rating, comment } : { companyId: company._id, rating, comment }
      });
      
      const method = editingReview ? 'put' : 'post';
      const data = editingReview 
        ? { rating, comment }
        : { companyId: company._id, rating, comment };

      const response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Review response:', response.data);

      // Fetch updated reviews
      const reviewsResponse = await axios.get(
        `http://localhost:5000/api/reviews/company/${company._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReviews(reviewsResponse.data || []);
      setRating(0);
      setHover(0);
      setComment('');
      setShowReviewForm(false);
      setEditingReview(null);

      // Show success message
      toast.success(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error with review:', error);
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        reviewId: editingReview?._id
      });
      toast.error(error.response?.data?.message || 'Failed to process review');
    }
  };

  const handleEditReview = (review) => {
    console.log('Editing review:', {
      review,
      reviewId: review?._id,
      userId: review?.userId,
      currentUserId: JSON.parse(localStorage.getItem('auth'))?.user?._id
    });
    
    if (!review || !review._id) {
      console.error('Invalid review object:', review);
      toast.error('Cannot edit this review at the moment');
      return;
    }
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
    reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <>
      <Header />
      <ToastContainer />
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
              {(
                (company.userId && (
                  company.userId === localStorage.getItem('userId') ||
                  (company.userId._id && company.userId._id === localStorage.getItem('userId'))
                )) ||
                (company.createdBy && company.createdBy === localStorage.getItem('userId'))
              ) && (
                <button
                  onClick={() => navigate(`/EditCompanyProfile/${company._id || company.id}`)}
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

          <div 
            ref={reviewsRef}
            className="bg-white rounded-2xl shadow-xl p-8 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold text-teal-800 mb-6 border-b-2 border-teal-200 pb-2">
              Reviews
            </h2>
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
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-8 space-y-4">
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <button
                            type="button"
                            key={ratingValue}
                            className={`text-3xl focus:outline-none transition-colors ${
                              ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            onClick={() => setRating(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                          >
                            <FaStar />
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows="4"
                    ></textarea>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
                      >
                        {editingReview ? 'Update Review' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false);
                          setEditingReview(null);
                          setRating(0);
                          setComment('');
                        }}
                        className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <div className="space-y-6">
                  {reviews.map((review) => {
                    const authData = JSON.parse(localStorage.getItem('auth'));
                    const currentUserId = authData?.userId || authData?.user?._id || authData?.user?.userId;
                    const reviewUserId = (typeof review.userId === 'object' && review.userId !== null)
                      ? String(review.userId._id)
                      : String(review.userId);
                    const isUserReview = reviewUserId && currentUserId && reviewUserId === String(currentUserId);
                    
                    console.log('Review mapping:', {
                      reviewId: review._id,
                      reviewUserId: review.userId,
                      currentUserId: currentUser?._id,
                      isUserReview
                    });

                    return (
                      <div
                        key={review._id}
                        className="bg-teal-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-teal-800">{review.userName}</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((star, index) => (
                                <FaStar
                                  key={index}
                                  size={20}
                                  color={index < Math.round(review.rating) ? '#FFD700' : '#e4e5e9'}
                                />
                              ))}
                            </div>
                            {isUserReview && (
                              <button
                                onClick={() => handleEditReview(review)}
                                className="text-teal-600 hover:text-teal-800 transition-colors"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                  {!showReviewForm && (
                    <button
                      onClick={() => {
                        setShowReviewForm(true);
                        setEditingReview(null);
                        setRating(0);
                        setComment('');
                      }}
                      className="mt-4 bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
                    >
                      Add Another Review
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProf;