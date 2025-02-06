import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-teal-700 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">OpportuNET</div>
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/about" className="hover:underline">About Us</Link></li>
          <li><Link to="/services" className="hover:underline">Browse</Link></li>
          <li><Link to="/services" className="hover:underline">Help</Link></li>
          <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          <li><Link to="/connect" className="hover:underline">Connect</Link></li>
        </ul>
      </div>
    </nav>
  );
};

const RatingsAndReviews = () => {
  const [reviews, setReviews] = useState([
    { id: 1, name: "Alice", rating: 5, review: "Great place to work! 😊" },
    { id: 2, name: "John", rating: 4, review: "Good team environment! 👍" },
  ]);

  const [newReview, setNewReview] = useState({ review: "", rating: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newReview.review && newReview.rating) {
      setReviews([...reviews, { id: reviews.length + 1, ...newReview }]);
      setNewReview({ review: "", rating: 0 });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-10 w-full">
        {/* Company Info */}
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-2/3 border border-gray-200">
          <img
            className="w-28 h-28 mx-auto rounded-full border-4 border-teal-500"
            src="https://via.placeholder.com/120"
            alt="Company"
          />
          <h2 className="text-2xl font-semibold mt-4 text-teal-700">Company Name</h2>
          <p className="text-gray-600 text-md mt-2">
            We value our employees and their feedback. Your voice matters!
          </p>
        </div>

        {/* Reviews Section */}
        <div className="w-2/3 mt-10">
          <h3 className="text-xl font-semibold text-teal-700 mb-5">Reviews</h3>
          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-300 flex justify-between">
                <span className="font-medium text-gray-700 text-lg">{r.review}</span>
                <span className="text-yellow-500 text-xl">{"★".repeat(r.rating)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Review */}
        <form
          onSubmit={handleSubmit}
          className="w-2/3 mt-8 bg-white p-5 rounded-xl shadow-lg flex gap-4 border border-gray-400"
        >
          <input
            type="text"
            name="review"
            value={newReview.review}
            onChange={handleInputChange}
            className="flex-1 p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Write something..."
            required
          />
          <select
            name="rating"
            value={newReview.rating}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="0" disabled>⭐</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>
          <button
            type="submit"
            className="bg-teal-700 text-white px-5 py-3 rounded-lg text-lg hover:bg-teal-800 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingsAndReviews;
