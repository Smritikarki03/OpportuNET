import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Handle error messages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading when the form is submitted

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Login successful! Welcome, ${data.user.email}`);
        
        // Store both token and user in localStorage
        localStorage.setItem("auth", JSON.stringify({
          user: data.user,
          token: data.token,
        }));

        // Redirect user
        navigate("/");
      } else {
        const error = await response.json();
        setError(error.message || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading once the process is complete
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-teal-700 flex items-center justify-center">
        <div className="text-white text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg">
            We're glad to see you again. Please login to continue.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-sm bg-teal-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-teal-800">Login</h2>
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          <form onSubmit={handleLogin} className="mt-4">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-teal-700"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-teal-700"
              >
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
              className={`w-full bg-teal-700 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
            <a
              href="/selectSignup"
              className="text-teal-500 hover:underline font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
