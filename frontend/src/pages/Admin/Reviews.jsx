import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar';

const ReviewsPage = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth || !auth.token || auth.user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/reviews', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setReviews(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.response?.data?.message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [auth, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 ml-64 min-h-screen overflow-auto p-8 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-teal-700 mb-1">Reviews</h1>
              <p className="text-gray-500">Manage and monitor user reviews for companies</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500 border-solid"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No reviews available.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {reviews.map((review) => (
                        <tr key={review._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{review.userId?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-teal-700 font-semibold">{review.companyId?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold">{review.rating}/5</span>
                            <span className="ml-2">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: i < review.rating ? '#ffc107' : '#e4e5e9', fontSize: '1.1em' }}>★</span>
                              ))}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs text-gray-700">{review.comment}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="bg-red-100 text-red-700 px-4 py-1 rounded-lg hover:bg-red-200 font-bold shadow-sm transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReviewsPage;