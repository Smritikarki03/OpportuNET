import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      const shouldShowPopup = storedUser.role === "jobseeker" && !storedUser.isProfileViewed;
      setShowPopup(shouldShowPopup);
      setIsLoading(false);
    } else {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/userInfo", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        setUser(result);
        const shouldShowPopup = result.role === "jobseeker" && !result.isProfileViewed;
        setShowPopup(shouldShowPopup);
        localStorage.setItem("user", JSON.stringify(result));
      } else {
        setError("Failed to load user data.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (user && user.role === "jobseeker" && !user.isProfileViewed) {
      setShowPopup(true);
      updateProfileViewed();
    }
  };

  const updateProfileViewed = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/updateProfileViewed", {
        method: "POST", // Changed from PUT to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isProfileViewed: true }),
      });
      const result = await response.json();
      if (response.ok) {
        setUser((prev) => ({ ...prev, isProfileViewed: true }));
        localStorage.setItem("user", JSON.stringify({ ...user, isProfileViewed: true }));
      }
    } catch (error) {
      console.error("Error updating profile viewed status:", error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-teal-700 mb-4">Profile</h1>
      <button
        onClick={handleViewProfile}
        className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
      >
        View Profile
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Welcome, {user.name}!</h2>
            <p className="mb-4">This is your first time viewing your profile. Please complete your profile to unlock more features!</p>
            <button
              onClick={() => navigate("/edit-profile")}
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
            >
              Complete Profile
            </button>
            <button
              onClick={closePopup}
              className="ml-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </div>
  );
};

export default ProfilePage;