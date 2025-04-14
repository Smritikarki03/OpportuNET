import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import axios from "axios";


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [auth] = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [postedJobs, setPostedJobs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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
          "Cache-Control": "no-cache",
        },
      });

      const result = await response.json();
      console.log("User data from server:", result);

      if (response.ok) {
        setUser(result);
        localStorage.setItem("user", JSON.stringify(result));
        console.log("User state set:", result);

        let isProfileIncomplete = false;
        if (result.role === "jobseeker") {
          isProfileIncomplete = !result.name || !result.skills?.length || !result.resume;
        } else if (result.role === "employer") {
          isProfileIncomplete = !result.name || !result.skills?.length || !result.resume;
        }
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

  const fetchPostedJobs = useCallback(async () => {
    if (!user || !user._id) return; // Wait until user is loaded
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs?postedBy=${user._id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setPostedJobs(response.data);
      console.log("Fetched posted jobs:", response.data);
    } catch (error) {
      console.error("Error fetching posted jobs:", error);
      setError("Failed to fetch posted jobs: " + (error.response?.data?.message || error.message));
    }
  }, [user, auth.token]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchUserData();
      // Clear the refresh flag
      navigate(location.pathname, { replace: true });
    } else if (location.state?.updatedUser) {
      setUser(location.state.updatedUser);
      setIsLoading(false);
      localStorage.setItem("user", JSON.stringify(location.state.updatedUser));
      const result = location.state.updatedUser;
      let isProfileIncomplete = false;
      if (result.role === "jobseeker") {
        isProfileIncomplete = !result.name || !result.skills?.length || !result.resume;
      } else if (result.role === "employer") {
        isProfileIncomplete = !result.name || !result.skills?.length || !result.resume;
      }
      setShowPopup(isProfileIncomplete);
    } else {
      fetchUserData();
    }
  }, [fetchUserData, location.state, navigate, location.pathname]);

  // Separate useEffect for fetching posted jobs after user is loaded
  useEffect(() => {
    if (user && user.role === "employer") {
      fetchPostedJobs();
    }
  }, [user, fetchPostedJobs]);

  const closePopup = () => setShowPopup(false);

  const handleAccept = async (applicantId) => {
    try {
      const response = await fetch("http://localhost:5000/api/employer/acceptApplicant", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ applicantId }),
      });

      const result = await response.json();
      if (response.ok) {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        console.error("Failed to accept applicant:", result.message);
      }
    } catch (error) {
      console.error("Error accepting applicant:", error);
    }
  };

  const handleReject = async (applicantId) => {
    try {
      const response = await fetch("http://localhost:5000/api/employer/rejectApplicant", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ applicantId }),
      });

      const result = await response.json();
      if (response.ok) {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        console.error("Failed to reject applicant:", result.message);
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
    }
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.ok) {
        fetchPostedJobs();
      } else {
        console.error("Failed to toggle job status");
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!user) return <div className="text-center text-gray-500">Please log in to view your profile.</div>;

  console.log("Rendering user:", user);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {user.image ? (
                <img
                  src={`http://localhost:5000${user.image}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => console.log("Image load error:", e, "URL:", `http://localhost:5000${user.image}`)}
                  onLoad={() => console.log("Image loaded successfully:", `http://localhost:5000${user.image}`)}
                />
              ) : (
                <span className="text-gray-500">{user.role === "employer" ? "Company Logo" : "Profile"}</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-teal-700">
                {user.name || "User Name"} {user.role === "employer" && user.companyName ? `from ${user.companyName}` : ""}
              </h1>
              <p className="text-gray-600">{user.role === "jobseeker" ? "Job Seeker" : "Employer"}</p>
              <p className="text-gray-600">{user.email || "Not provided"}</p>
              <p className="text-gray-600">{user.phone || "9000000000"}</p>
              {user.role === "employer" && user.location && (
                <p className="text-gray-600">Location: {user.location}</p>
              )}
              {user.role === "employer" && user.experienceLevel && (
                <p className="text-gray-600">Experience Level: {user.experienceLevel}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/EditProfilePage", { state: { user } })}
            className="text-gray-500 hover:text-gray-700"
            title="Edit Profile"
          >
            ✏️ Edit
          </button>
        </div>

        {user.role === "employer" && (
          <>
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-teal-700">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="bg-teal-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        {user.role !== "employer" && (
          <>
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-teal-700">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="bg-teal-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-teal-700">{user.role === "employer" ? "CV" : "Resume"}</h2>
          <p className="mt-2 text-teal-600">
            {user.resume ? (
              <a
                href={`http://localhost:5000${user.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => console.log("Resume link clicked:", `http://localhost:5000${user.resume}`)}
              >
                View {user.role === "employer" ? "CV" : "Resume"}
              </a>
            ) : (
              "No resume uploaded"
            )}
          </p>
        </div>
      </div>

      {user.role === "employer" && (
        <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-teal-700">Posted Jobs</h2>
            <button
              onClick={() => navigate("/JobPost")}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              + Post New Job
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2 px-4">Title</th>
                  <th className="py-2 px-4">Location</th>
                  <th className="py-2 px-4">Salary</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {postedJobs.length > 0 ? (
                  postedJobs.map((job, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{job.title}</td>
                      <td className="py-2 px-4">{job.location}</td>
                      <td className="py-2 px-4">{job.salary}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            job.status === "Active"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {job.status || "Active"}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => navigate(`/edit-job/${job._id}`)}
                          className="text-teal-600 hover:text-teal-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleJobStatus(job._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          {job.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                      No jobs posted yet. Click "Post New Job" to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-teal-700 mb-4">
          {user.role === "employer" ? "Job Applicants" : "Applied Jobs"}
        </h2>
        <div className="overflow-x-auto">
          {user.role === "employer" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Job Role</th>
                  <th className="py-2 px-4">CV</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {user.jobApplicants?.length > 0 ? (
                  user.jobApplicants.map((applicant, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{applicant.name || "N/A"}</td>
                      <td className="py-2 px-4">{applicant.jobRole || "N/A"}</td>
                      <td className="py-2 px-4">
                        {applicant.cv ? (
                          <a
                            href={`http://localhost:5000${applicant.cv}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline"
                          >
                            View CV
                          </a>
                        ) : (
                          "No CV"
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            applicant.status === "PENDING"
                              ? "bg-gray-200 text-gray-800"
                              : applicant.status === "ACCEPTED"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {applicant.status || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 px-4 flex space-x-2">
                        <button
                          onClick={() => handleAccept(applicant.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          disabled={applicant.status !== "PENDING"}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(applicant.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          disabled={applicant.status !== "PENDING"}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-2 px-4 text-gray-500">
                      No applicants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
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
                              : "bg-teal-200 text-teal-800"
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
          )}
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">
              Welcome, {user.name || "User"}!
            </h2>
            <p className="mb-4">
              {user.role === "employer"
                ? "Please complete your employer profile to unlock more features! Add your company details, location, experience level, skills, education, and CV."
                : "Please complete your profile to unlock more features!"}
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                navigate("/EditProfilePage", { state: { user } });
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