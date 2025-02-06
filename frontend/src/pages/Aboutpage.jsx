import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 text-white py-4">
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

      {/* About Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800">About Us</h2>
        <p className="mt-4 text-gray-600">
          At OpportuNET, we connect job seekers with employers seamlessly, providing opportunities for everyone to grow.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
