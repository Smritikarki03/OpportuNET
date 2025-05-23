import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import axios from "axios";
import EmailOTP from '../../Components/EmailOTP';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useAuth();
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [pendingLogin, setPendingLogin] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First try to login directly
      const userRes = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // If OTP is required for first login
      if (userRes.data.otpRequired) {
        setStep('otp');
        setPendingLogin({ email: email.trim().toLowerCase(), password: password.trim() });
        return;
      }

      const { user, token } = userRes.data;
      if (token) {
        const userName = user.name || user.firstName || user.username || email.split("@")[0];
        const authData = { user, token };
        setAuth(authData);
        localStorage.setItem("auth", JSON.stringify(authData));
        localStorage.setItem("userName", userName);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("isCompanySetup", user.isCompanySetup?.toString() || "false");
        
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
      if (err.response?.status === 404) {
        // User not found, try OTP flow
        try {
          await axios.post("http://localhost:5000/api/auth/send-otp", {
            email: email.trim().toLowerCase(),
            role: "jobseeker"
          });
          setStep('otp');
        } catch (otpErr) {
          setError("Failed to send OTP. Please try again.");
        }
      } else if (err.response?.status === 403) {
        setError("Your account is awaiting approval from the admin.");
      } else if (err.response?.status === 410) {
        setError("Your account was rejected by the admin.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      // If this is OTP for first login
      if (pendingLogin.email) {
        const response = await axios.post("http://localhost:5000/api/auth/login-verify-otp", {
          email: pendingLogin.email,
          otp,
        });
        const { user, token } = response.data;
        const userName = user.name || user.firstName || user.username || pendingLogin.email.split("@")[0];
        const authData = { user, token };
        setAuth(authData);
        localStorage.setItem("auth", JSON.stringify(authData));
        localStorage.setItem("userName", userName);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user.id);
        navigate("/");
        return;
      }
      // Otherwise, fallback to registration OTP (legacy)
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
        role: "jobseeker"
      });
      // If OTP is verified, proceed with registration
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: "jobseeker"
      });
      const { user, token } = response.data;
      const userName = user.name || user.firstName || user.username || email.split("@")[0];
      const authData = { user, token };
      setAuth(authData);
      localStorage.setItem("auth", JSON.stringify(authData));
      localStorage.setItem("userName", userName);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.id);
      navigate("/");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Error during verification. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: email.trim().toLowerCase(),
        role: "jobseeker"
      });
      alert("A new OTP has been sent to your email.");
    } catch (err) {
      setOtpError("Failed to resend OTP. Please try again later.");
    } finally {
      setOtpLoading(false);
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
          {step === 'login' ? (
            <>
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
                  Sign Up
                </a>
              </p>
            </>
          ) : (
            <EmailOTP
              email={pendingLogin.email || email}
              onVerify={handleVerifyOtp}
              onResend={() => {}}
              loading={otpLoading}
              error={otpError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 