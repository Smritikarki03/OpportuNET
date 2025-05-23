import React, { useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from "axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null); // To show success or error message

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/contact", formData);
      setStatus("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("Error sending message, please try again later.");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-teal-50 text-teal-900"> {/* Changed to bg-teal-50 */}
        {/* Page Title */}
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-teal-900">Contact Us</h1>
          <p className="mt-2 text-lg text-teal-700">
            We're here to help you with any inquiries. Feel free to reach out to us!
          </p>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Side - Contact Info */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-teal-900">Get in Touch</h2>
              <p className="text-lg text-teal-700">
                If you have any questions, feel free to reach out to us through the form below or via
                the contact details provided.
              </p>

              <div className="space-y-4">
                <p className="text-lg">
                  Email:{" "}
                  <a href="mailto:info@opportunet.com" className="text-teal-600 hover:underline">
                    info@opportunet.com
                  </a>
                </p>
                <p className="text-lg">
                  Phone: <span className="text-teal-600">+123 456 7890</span>
                </p>
                <p className="text-lg">
                  Address: <span className="text-teal-600">123 Job Avenue, Kathmandu, Nepal</span>
                </p>
              </div>

              {/* Social Media Links */}
              <div className="flex space-x-6 mt-6">
                {/* Replace with actual links and ensure Font Awesome is included */}
                <a
                  href="https://facebook.com" // Replace with actual link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-500"
                >
                  <i className="fab fa-facebook fa-2x"></i>
                </a>
                <a
                  href="https://twitter.com" // Replace with actual link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-500"
                >
                  <i className="fab fa-twitter fa-2x"></i>
                </a>
                <a
                  href="https://linkedin.com" // Replace with actual link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-500"
                >
                  <i className="fab fa-linkedin fa-2x"></i>
                </a>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <h2 className="text-3xl font-bold text-teal-700 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-lg text-teal-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-4 mt-2 border-2 border-teal-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-lg text-teal-700">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 mt-2 border-2 border-teal-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-lg text-teal-700">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full p-4 mt-2 border-2 border-teal-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-800"
                    placeholder="Type your message"
                    rows="6"
                    required
                  />
                </div>

                {/* Status Message */}
                {status && (
                  <div
                    className={`mt-4 text-lg text-center ${
                      status.includes("successfully") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {status}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-600 transition"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;