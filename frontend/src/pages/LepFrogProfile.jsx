import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

function LeapFrogProfile() {
  const company = {
    name: 'LeapFrog Private Limited',
    logo: 'https://images.unsplash.com/photo-1620287346935-61a1a3b27254?q=80&w=2070&auto=format&fit=crop', // Placeholder logo
    industry: 'Technology',
    location: 'Mumbai, India',
    establishedDate: '2010-03-22',
    employeeCount: 300,
    website: 'https://leapfrog.com',
    description: 'LeapFrog Private Limited specializes in innovative tech solutions for global markets.',
  };

  const [reviews, setReviews] = useState([
    { _id: '1', userName: 'Alice Brown', rating: 4.2, comment: 'Innovative company with great projects.', createdAt: '2024-08-20' },
    { _id: '2', userName: 'Bob Wilson', rating: 4.8, comment: 'Supportive team, but work-life balance could improve.', createdAt: '2024-07-10' },
  ]);

  const [currentUser, setCurrentUser] = useState('Anonymous User');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      setCurrentUser(userName);
    }
  }, []);

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
    setReviews([newReview, ...reviews]);
    setRating(0);
    setHover(0);
    setComment('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 font-sans">
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-10 bg-black opacity-30"></div>
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          className="w-32 h-32 object-contain rounded-full border-4 border-white shadow-lg mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold tracking-tight">{company.name}</h1>
        <p className="mt-2 text-lg opacity-80">{company.industry}</p>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-teal-800 mb-6 border-b-2 border-teal-200 pb-2">About {company.name}</h2>
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
                <p className="text-gray-600">{company.location}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" détaire="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Established</h3>
                <p className="text-gray-600">{new Date(company.establishedDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Employees</h3>
                <p className="text-gray-600">{company.employeeCount}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Website</h3>
                <p className="text-gray-600">
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{company.website}</a>
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
          <h2 className="text-2xl font-semibold text-teal-800 mb-6 border-b-2 border-teal-200 pb-2">Reviews</h2>
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
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
            >
              Submit Review
            </button>
          </form>
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
                          color={index < review.rating ? '#FFD700' : '#e4e5e9'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
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
  );
}

export default LeapFrogProfile;