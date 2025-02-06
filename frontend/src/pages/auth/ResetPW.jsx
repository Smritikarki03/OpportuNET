import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        email,
        newPassword,
      });

      setPasswordSuccess("Your password has been successfully updated.");

      // Redirect to login page after a short delay
      setTimeout(() => navigate("/login"), 2000); // 2-second delay
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Error updating password. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-700">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-teal-700">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below.</p>
        </div>

        {passwordSuccess && (
          <p className="mt-4 text-center text-sm text-green-700 font-semibold">
            {passwordSuccess}
          </p>
        )}

        {passwordError && (
          <p className="mt-4 text-center text-sm text-red-700 font-semibold">
            {passwordError}
          </p>
        )}

        <form onSubmit={handleSubmitNewPassword} className="mt-6">
          {/* New Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-700 focus:border-teal-700"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-700 focus:border-teal-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-teal-700 text-white font-medium rounded-md shadow hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
