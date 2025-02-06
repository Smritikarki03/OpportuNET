import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "A password reset link has been sent to your email.", type: "success" });
        // Navigate to the login page after success
        setTimeout(() => navigate("/login"), 2000); // 2-second delay
      } else {
        setMessage({ text: data.message || "Something went wrong. Please try again.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error. Please try again later.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-700">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-teal-700">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your email to receive a password reset link.</p>
        </div>

        {message && (
          <p className={`mt-4 text-center text-sm font-semibold ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-700 focus:border-teal-700 p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
              loading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-700 hover:bg-teal-800 text-white"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
