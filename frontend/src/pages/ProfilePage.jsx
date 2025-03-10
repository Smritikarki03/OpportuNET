import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [auth] = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = auth.token;
      if (!token) {
        setError("No authentication token found. Please log in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/userInfo", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result);
        localStorage.setItem("user", JSON.stringify(result));

        // Check if profile is incomplete
        const isProfileIncomplete = !result.name || !result.skills?.length || !result.resume;
        setShowPopup(isProfileIncomplete);
      } else {
        setError(result.message || "Failed to load user data.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, location.state]); // Ensure data updates after navigating back

  // Function to close the popup
  const closePopup = () => setShowPopup(false);

  if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!user) return <div className="text-center text-gray-500">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Profile Card */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500">Profile</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{user.name || "User Name"}</h1>
              <p className="text-gray-600">{user.role === "jobseeker" ? "Job Seeker" : user.role}</p>
              <p className="text-gray-600">{user.email || "Not provided"}</p>
              <p className="text-gray-600">{user.phone || "9000000000"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/edit-profile", { state: { user } })}
            className="text-gray-500 hover:text-gray-700"
            title="Edit Profile"
          >
            ✏️ Edit
          </button>
        </div>

        {/* Skills Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.skills?.length > 0 ? (
              user.skills.map((skill, index) => (
                <span key={index} className="bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Resume Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Resume</h2>
          <p className="mt-2 text-blue-600">
            <a href={user.resume || "#"} target="_blank" rel="noopener noreferrer">
              {user.resume ? "View Resume" : "No resume uploaded"}
            </a>
          </p>
        </div>
      </div>

      {/* Applied Jobs Section */}
      <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Applied Jobs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Job Role</th>
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {user.appliedJobs?.length > 0 ? (
                user.appliedJobs.map((job, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{job.date || "N/A"}</td>
                    <td className="py-2 px-4">{job.role || "N/A"}</td>
                    <td className="py-2 px-4">{job.company || "N/A"}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          job.status === "PENDING"
                            ? "bg-gray-200 text-gray-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {job.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 px-4 text-gray-500">
                    No jobs applied yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Completion Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">
              Welcome, {user.name || "User"}!
            </h2>
            <p className="mb-4">
              Please complete your profile to unlock more features!
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                navigate("/edit-profile", { state: { user } });
              }}
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
    </div>
  );
};

export default ProfilePage;
