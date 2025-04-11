import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/company');
        setCompany(response.data);
      } catch (error) {
        console.error('Error fetching company data:', error);
        setError('Failed to load company data.');
      }
    };

    fetchCompanyData();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const newReview = { user: 'Employer', comment: review, rating };
      await axios.post('http://localhost:5000/api/company/reviews', newReview);
      setCompany((prev) => ({
        ...prev,
        reviews: [...prev.reviews, newReview],
      }));
      setReview('');
      setRating('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (!company) {
    return <div className="text-center text-teal-700">Loading...</div>;
  }

  console.log('Company data:', company);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex flex-col items-center">
          <img src={company.logo || 'default-logo.png'} alt="Company Logo" className="w-32 h-32 rounded-full border-2 border-blue-500" />
          <h1 className="text-3xl font-bold text-teal-700 mt-4">{company.name}</h1>
          <p className="text-gray-600 mt-2">{company.location}</p>
          <p className="text-gray-600 mt-2">{company.description}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-teal-700">Ratings and Reviews</h2>
          <div className="mt-4 space-y-4 text-left">
            {company.reviews?.map((review, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-gray-800"><strong>Review by {review.user}</strong></p>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            )) || <p className="text-gray-600">No reviews yet.</p>}
          </div>
          <form onSubmit={handleReviewSubmit} className="mt-6">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Write your review..."
              required
            />
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="border border-gray-300 rounded-md p-2 mt-2"
              required
            >
              <option value="">Rate ★</option>
              <option value="1">1 ★</option>
              <option value="2">2 ★</option>
              <option value="3">3 ★</option>
              <option value="4">4 ★</option>
              <option value="5">5 ★</option>
            </select>
            <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition duration-200 mt-2">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;