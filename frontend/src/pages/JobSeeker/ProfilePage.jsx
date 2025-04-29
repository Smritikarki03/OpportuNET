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

      // Fetch user info
      const userResponse = await fetch("http://localhost:5000/api/auth/userInfo", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
          "Cache-Control": "no-cache",
        },
      });

      const userData = await userResponse.json();

      if (userResponse.ok) {
        const processedUser = {
          ...userData,
          _id: auth?.user?.id || auth?.user?._id || userData._id || userData.id
        };

        // If user is an employer, fetch their posted jobs
        if (processedUser.role === 'employer') {
          const jobsResponse = await fetch("http://localhost:5000/api/jobs", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          });

          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            console.log("Fetched jobs data:", jobsData);
            setPostedJobs(jobsData);
          } else {
            console.error("Failed to fetch jobs:", await jobsResponse.text());
          }
        }
        
        setUser(processedUser);
        localStorage.setItem("user", JSON.stringify(processedUser));

        let isProfileIncomplete = false;
        if (processedUser.role === "jobseeker") {
          isProfileIncomplete = !processedUser.name || !processedUser.skills?.length || !processedUser.resume;
        } else if (processedUser.role === "employer") {
          isProfileIncomplete = !processedUser.name || !processedUser.skills?.length || !processedUser.resume;
        }
        setShowPopup(isProfileIncomplete);
      } else {
        setError(userData.message || "Failed to load user data.");
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchUserData();
      // Clear the refresh flag
      navigate(location.pathname, { replace: true });
    } else if (location.state?.updatedUser) {
      const updatedUser = location.state.updatedUser;
      console.log("Setting user from location state:", updatedUser);
      console.log("User ID from location state:", updatedUser._id);
      setUser(updatedUser);
      
      // Set posted jobs from updated user data if user is an employer
      if (updatedUser.role === 'employer' && updatedUser.postedJobs) {
        setPostedJobs(updatedUser.postedJobs);
      }
      
      setIsLoading(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      let isProfileIncomplete = false;
      if (updatedUser.role === "jobseeker") {
        isProfileIncomplete = !updatedUser.name || !updatedUser.skills?.length || !updatedUser.resume;
      } else if (updatedUser.role === "employer") {
        isProfileIncomplete = !updatedUser.name || !updatedUser.skills?.length || !updatedUser.resume;
      }
      setShowPopup(isProfileIncomplete);
    } else {
      fetchUserData();
    }
  }, [fetchUserData, location.state, navigate, location.pathname]);

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

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.ok) {
          // Remove the deleted job from the state
          setPostedJobs(postedJobs.filter(job => job._id !== jobId));
        } else {
          console.error('Failed to delete job');
          setError('Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        setError('Error deleting job');
      }
    }
  };

  if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!user) return <div className="text-center text-gray-500">Please log in to view your profile.</div>;

  console.log("Rendering user:", user);

  return (
    <>
      <Header />
      <br/>
      <br/>
      <br/>
      <br/>
      
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
          <>
            {/* Posted Jobs Section */}
            <div className="max-w-4xl mx-auto mt-8 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-semibold text-gray-900">{postedJobs.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {postedJobs.filter(job => job.status === 'Active').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Inactive Jobs</p>
                      <p className="text-2xl font-semibold text-red-600">
                        {postedJobs.filter(job => job.status === 'Inactive').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posted Jobs Table */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-teal-700">Posted Jobs</h2>
                    <button
                      onClick={() => navigate("/post-job")}
                      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Post New Job
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {postedJobs.length > 0 ? (
                        postedJobs.map((job) => (
                          <tr key={job._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="py-4 px-6">
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">{job.location}</td>
                            <td className="py-4 px-6 text-sm text-gray-500">{job.salary}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                  job.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {job.status || "Active"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => navigate(`/description/${job._id}`)}
                                  className="text-teal-600 hover:text-teal-900 font-medium text-sm"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => navigate(`/jobs/edit/${job._id}`)}
                                  className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job._id)}
                                  className="text-red-600 hover:text-red-900 font-medium text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 px-6 text-center">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <h3 className="mt-4 text-sm font-medium text-gray-900">No jobs posted yet</h3>
                              <p className="mt-1 text-sm text-gray-500">Get started by creating a new job posting</p>
                              <div className="mt-6">
                                <button
                                  onClick={() => navigate("/post-job")}
                                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200"
                                >
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                  Post New Job
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
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
                    <th className="py-2 px-4">Job Title</th>
                    <th className="py-2 px-4">Applied Date</th>
                    <th className="py-2 px-4">Resume</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.some(job => job.applications?.length > 0) ? (
                    postedJobs.map(job => 
                      job.applications?.map((application, index) => (
                        <tr key={`${job._id}-${index}`} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{application.applicantName}</td>
                          <td className="py-2 px-4">{job.title}</td>
                          <td className="py-2 px-4">
                            {new Date(application.appliedDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4">
                            {application.resume ? (
                              <a
                                href={`http://localhost:5000${application.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:underline"
                              >
                                View Resume
                              </a>
                            ) : (
                              "No Resume"
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                application.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : application.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {application.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            {application.status === "PENDING" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAccept(application._id)}
                                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(application._id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                        No applications received yet.
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
    </>
  );
};

export default ProfilePage;