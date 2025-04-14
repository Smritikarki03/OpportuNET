import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", { email, password }); // Debug: Log input
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim().toLowerCase(), // Normalize email
        password: password.trim(), // Trim password
      });

      console.log("Server response:", response.data); // Debug: Log response
      const { user, token } = response.data;

      if (token) {
        const userName = user.name || user.firstName || user.username || email.split("@")[0];
        setAuth({ user, token });
        localStorage.setItem("auth", token);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user.id); // Store user ID
        localStorage.setItem("isCompanySetup", user.isCompanySetup.toString()); // Store isCompanySetup flag

        if (user.role === "admin") {
          navigate("/AdminDB");
        } else if (user.role === "employer") {
          if (!user.isApproved) {
            setError("Your account is awaiting approval from the admin.");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login error details:", err.response ? err.response.data : err.message); // Detailed error log
      if (err.response?.status === 403) {
        setError("Your account is awaiting approval from the admin.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-teal-700 flex items-center justify-center">
        <div className="text-white text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg">We're glad to see you again. Please login to continue.</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-sm bg-teal-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-teal-800">Login</h2>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-teal-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 block w-full border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-teal-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 block w-full border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-teal-700 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-4 text-sm text-teal-600 text-center">
            <button
              onClick={() => navigate("/Forgotpw")}
              className="text-teal-500 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </p>
          <p className="mt-2 text-sm text-teal-600 text-center">
            Don't have an account?{" "}
            <a href="/selectSignup" className="text-teal-500 hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 