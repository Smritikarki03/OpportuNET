import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

const CompanyReviews = ({ companyId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [companyId]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reviews/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data);
      
      // Check if user has already reviewed
      const userId = JSON.parse(localStorage.getItem('user'))._id;
      const existingReview = response.data.find(review => review.userId._id === userId);
      if (existingReview) {
        setUserReview(existingReview);
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError('Please provide both a rating and comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = userReview 
        ? `http://localhost:5000/api/reviews/${userReview._id}`
        : 'http://localhost:5000/api/reviews';
      
      const response = await (userReview 
        ? axios.put(endpoint, { rating, comment }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        : axios.post(endpoint, { companyId, rating, comment }, {
            headers: { Authorization: `Bearer ${token}` }
          })
      );

      setUserReview(response.data);
      fetchReviews();
      setError('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${userReview._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserReview(null);
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">
          {userReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, index) => {
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
                    className="cursor-pointer"
                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                    size={24}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this company..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows="4"
          />
          <div className="flex justify-end space-x-4">
            {userReview && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-800"
              >
                Delete Review
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              {userReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{review.userId.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        color={index < review.rating ? "#ffc107" : "#e4e5e9"}
                        size={16}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyReviews; 