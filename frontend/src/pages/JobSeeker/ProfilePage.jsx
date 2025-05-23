import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [auth] = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [postedJobs, setPostedJobs] = useState([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [interviewTimeInput, setInterviewTimeInput] = useState("");
  const [statusChange, setStatusChange] = useState({});
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [renewJobId, setRenewJobId] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const appliedJobsRef = useRef(null);
  const jobApplicantsRef = useRef(null);

  // Add debug logging
  useEffect(() => {
    console.log('Auth context:', auth);
    console.log('Auth token:', auth?.token);
    console.log('Auth user:', auth?.user);
  }, [auth]);

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
      const userResponse = await axios.get("http://localhost:5000/api/auth/userInfo", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (userResponse.status === 200) {
        const userData = userResponse.data;
        const processedUser = {
          ...userData,
          _id: auth?.user?.id || auth?.user?._id || userData._id || userData.id
        };

        // If user is an employer, fetch their posted jobs with applications
        if (processedUser.role === 'employer') {
          try {
            console.log('Fetching jobs for employer:', processedUser._id);
            const jobsResponse = await axios.get("http://localhost:5000/api/jobs", {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            });

            if (jobsResponse.status === 200) {
              const jobsData = jobsResponse.data;
              console.log("Fetched jobs data:", jobsData);
              
              // Process jobs data to ensure applications array exists
              const processedJobs = jobsData.map(job => ({
                ...job,
                applications: job.applications || [],
                totalApplicants: (job.applications || []).length
              }));
              
              setPostedJobs(processedJobs);
              processedUser.postedJobs = processedJobs;
              
              console.log("Set posted jobs with applications:", processedJobs);
            } else {
              console.error("Failed to fetch jobs:", jobsResponse.data);
            }
          } catch (error) {
            console.error("Error fetching employer jobs:", error);
          }
        }
        // If user is a jobseeker, fetch their applied jobs/applications
        if (processedUser.role === "jobseeker") {
          try {
            const appsRes = await axios.get(
              `http://localhost:5000/api/applications/user/${processedUser._id}`,
              { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            // Map applications to the format expected by the table
            const appliedJobs = (appsRes.data || []).map(app => {
              // Format date to only show date part
              let formattedDate = "N/A";
              if (app.appliedDate) {
                formattedDate = new Date(app.appliedDate).toLocaleDateString();
              } else if (app.createdAt) {
                formattedDate = new Date(app.createdAt).toLocaleDateString();
              }
              // Use populated jobId for job title and company if available
              let jobTitle = app.jobTitle || (app.jobId && app.jobId.title) || app.role || "N/A";
              let companyName = app.company || (app.jobId && app.jobId.company) || "N/A";
              return {
                date: formattedDate,
                role: jobTitle,
                company: companyName,
                status: app.status,
                jobId: app.jobId?._id || app.jobId || (app.job && app.job._id),
                applicationId: app._id,
              };
            });
            processedUser.appliedJobs = appliedJobs;
          } catch (err) {
            console.error("Error fetching applied jobs:", err);
            processedUser.appliedJobs = [];
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
        setError(userResponse.data.message || "Failed to load user data.");
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

  useEffect(() => {
    if (location.state?.scrollTo === 'appliedJobs' && appliedJobsRef.current) {
      appliedJobsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (location.state?.scrollTo === 'jobApplicants' && jobApplicantsRef.current) {
      jobApplicantsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const closePopup = () => setShowPopup(false);

  const handleAccept = async (jobId, applicantId) => {
    try {
      console.log('Accepting application:', { jobId, applicantId });
      const response = await axios.put(
        `http://localhost:5000/api/jobs/${jobId}/applications/${applicantId}/status`,
        { status: 'ACCEPTED' },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Show success message
        alert('Application accepted successfully!');
        // Refresh the jobs data to get updated application statuses
        fetchUserData();
      } else {
        console.error("Failed to accept applicant:", response.data.message);
        alert('Failed to accept application. Please try again.');
      }
    } catch (error) {
      console.error("Error accepting applicant:", error);
      alert('Error accepting application. Please try again.');
    }
  };

  const handleReject = async (jobId, applicantId) => {
    try {
      console.log('Rejecting application:', { jobId, applicantId });
      const response = await axios.put(
        `http://localhost:5000/api/jobs/${jobId}/applications/${applicantId}/status`,
        { status: 'REJECTED' },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Show success message
        alert('Application rejected successfully!');
        // Refresh the jobs data to get updated application statuses
        fetchUserData();
      } else {
        console.error("Failed to reject applicant:", response.data.message);
        alert('Failed to reject application. Please try again.');
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      alert('Error rejecting application. Please try again.');
    }
  };

  const handleStatusChange = async (jobId, applicantId, newStatus, interviewTime) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'INTERVIEW_SCHEDULED' && interviewTime) {
        payload.interviewTime = interviewTime;
      }
      const response = await axios.put(
        `http://localhost:5000/api/jobs/${jobId}/applications/${applicantId}/status`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.status === 200) {
        alert(`Application status updated to ${newStatus.replace('_', ' ')}!`);
        fetchUserData();
      } else {
        alert('Failed to update application status. Please try again.');
      }
    } catch (error) {
      alert('Error updating application status. Please try again.');
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

  const handleViewCoverLetter = (application) => {
    setSelectedCoverLetter(application);
    setShowCoverLetterModal(true);
  };

  const CoverLetterModal = ({ coverLetter, onClose }) => {
    if (!coverLetter) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-teal-700">Cover Letter</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {coverLetter.coverLetterFile ? (
            <iframe
              src={`http://localhost:5000/${coverLetter.coverLetterFile}`}
              className="w-full h-[60vh] border-0"
              title="Cover Letter PDF"
            />
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{coverLetter.coverLetter}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleArchiveApplication = async (applicationId, archived) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/archive`,
        { archived },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      fetchUserData();
    } catch (error) {
      alert('Error archiving application.');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      fetchUserData();
    } catch (error) {
      alert('Error deleting application.');
    }
  };

  // Filter archived applications for the modal
  const archivedApplications = postedJobs
    .flatMap(job => (job.applications || []).map(app => ({ ...app, jobTitle: job.title, jobId: job._id })))
    .filter(app => app.archived);

  const handleViewApplication = async (job) => {
    try {
      let params = { userId: user._id };
      if (job.jobId) {
        params.jobId = job.jobId;
      } else if (job.role && job.company) {
        // Fallback: try to find the jobId by matching job title and company
        // This requires a backend endpoint or logic to find the application by job title, company, and userId
        // For now, try to fetch all applications for this user and find the matching one
        const allAppsRes = await axios.get(`http://localhost:5000/api/applications/user/${user._id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const found = allAppsRes.data.find(app => app.applicantName === user.name && app.status === job.status && app.role === job.role && app.company === job.company);
        if (found) {
          setSelectedApplication(found);
          return;
        } else {
          alert('Could not find application details.');
          return;
        }
      }
      // Normal fetch by jobId and userId
      const response = await axios.get(
        `http://localhost:5000/api/applications/single`,
        {
          params,
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setSelectedApplication({ ...job, ...response.data });
    } catch (error) {
      alert('Could not fetch application details.');
    }
  };

  // Fetch saved jobs for job seekers
  const fetchSavedJobs = useCallback(async () => {
    try {
      if (auth.user?.role !== 'jobseeker') return;
      const response = await axios.get('http://localhost:5000/api/auth/saved-jobs', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setSavedJobs(response.data.savedJobs || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  }, [auth]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleRemoveSavedJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/saved-jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setSavedJobs(prev => prev.filter(job => job._id !== jobId));
      toast.success('Job removed from saved jobs.');
    } catch (error) {
      toast.error('Failed to remove job from saved jobs.');
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
      
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg px-4 py-6">
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
            <div className="max-w-6xl mx-auto mt-8 space-y-6">
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
                                <button
                                  onClick={() => {
                                    setRenewJobId(job._id);
                                    setRenewDate("");
                                  }}
                                  className="text-yellow-600 hover:text-yellow-900 font-medium text-sm"
                                >
                                  Renew
                                </button>
                              </div>
                              {renewJobId === job._id && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <input
                                    type="date"
                                    value={renewDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setRenewDate(e.target.value)}
                                    className="border rounded px-2 py-1 text-sm"
                                  />
                                  <button
                                    className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm"
                                    onClick={async () => {
                                      if (!renewDate) {
                                        alert("Please select a new deadline date.");
                                        return;
                                      }
                                      try {
                                        await axios.put(`http://localhost:5000/api/jobs/${job._id}`, { deadline: renewDate }, {
                                          headers: { Authorization: `Bearer ${auth.token}` }
                                        });
                                        setRenewJobId(null);
                                        setRenewDate("");
                                        fetchUserData();
                                        alert("Deadline updated successfully!");
                                      } catch (err) {
                                        alert("Failed to update deadline.");
                                      }
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                    onClick={() => setRenewJobId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
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

        {user.role === "employer" && (
        <div ref={jobApplicantsRef} className="max-w-6xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-teal-700 mb-4">Job Applicants</h2>
          <div className="overflow-x-auto">
              <span
                className="text-teal-600 hover:text-teal-800 underline cursor-pointer mb-4 inline-block"
                onClick={() => setShowArchiveModal(true)}
                role="button"
                tabIndex={0}
              >
                View Archived Applications
              </span>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Job Title</th>
                    <th className="py-2 px-4">Applied Date</th>
                    <th className="py-2 px-4">Resume</th>
                    <th className="py-2 px-4">Cover Letter</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.some(job => job.applications?.length > 0) ? (
                    postedJobs.map(job => {
                      // Get all applications from the job
                      const applications = job.applications || [];
                      
                      // Sort applications by date, most recent first
                      const sortedApplications = [...applications]
                        .filter(app => !app.archived)
                        .sort((a, b) => new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt));

                      return sortedApplications.map((application, index) => (
                        <tr key={`${job._id}-${index}`} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">
                            {application.applicantName}
                          </td>
                          <td className="py-2 px-4">{job.title}</td>
                          <td className="py-2 px-4">
                            {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4">
                            {application.resume ? (
                              <a
                                href={`http://localhost:5000/${application.resume}`}
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
                            {(application.coverLetter || application.coverLetterFile) ? (
                              <button
                                onClick={() => handleViewCoverLetter(application)}
                                className="text-teal-600 hover:underline"
                              >
                                View Cover Letter
                              </button>
                            ) : (
                              "No Cover Letter"
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex flex-col space-y-2">
                              <select
                                value={statusChange[`${job._id}-${application.applicantId || application.userId}`] || application.status}
                                onChange={e => {
                                  // Always use all-caps value
                                  const value = e.target.value;
                                  setStatusChange(prev => ({ ...prev, [`${job._id}-${application.applicantId || application.userId}`]: value }));
                                }}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="APPLIED">Applied</option>
                                <option value="REVIEWED">Reviewed</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                <option value="INTERVIEWED">Interviewed</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                              {statusChange[`${job._id}-${application.applicantId || application.userId}`] === 'INTERVIEW_SCHEDULED' && (
                                <input
                                  type="datetime-local"
                                  className="border rounded px-2 py-1 text-sm mt-1"
                                  value={interviewTimeInput}
                                  onChange={e => setInterviewTimeInput(e.target.value)}
                                />
                              )}
                              <button
                                className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm mt-1"
                                onClick={async () => {
                                  const newStatus = (statusChange[`${job._id}-${application.applicantId || application.userId}`] || application.status).toUpperCase();
                                  if (newStatus === 'INTERVIEW_SCHEDULED' && !interviewTimeInput) {
                                    alert('Please select interview time.');
                                    return;
                                  }
                                  await handleStatusChange(
                                    job._id,
                                    application.applicantId || application.userId,
                                    newStatus,
                                    newStatus === 'INTERVIEW_SCHEDULED' ? interviewTimeInput : undefined
                                  );
                                  if (newStatus !== 'INTERVIEW_SCHEDULED') setInterviewTimeInput("");
                                }}
                              >
                                Update
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex flex-row space-x-4 justify-center">
                              <button
                                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                                onClick={async () => {
                                  await handleArchiveApplication(application._id, !application.archived);
                                }}
                              >
                                {application.archived ? 'Unarchive' : 'Archive'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                        No applications received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {user.role === "jobseeker" && (
          <div ref={appliedJobsRef} className="max-w-6xl mx-auto mt-8 bg-white rounded-xl shadow-2xl py-6 px-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700 mb-2">Applied Jobs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-base text-gray-700">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Job Role</th>
                    <th className="py-3 px-4 font-semibold">Company</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {user.appliedJobs && user.appliedJobs.length > 0 ? (
                    user.appliedJobs.map((job, index) => {
                      let statusColor = "bg-gray-100 text-gray-800";
                      if (job.status === "APPLIED") statusColor = "bg-blue-100 text-blue-800";
                      else if (job.status === "REVIEWED") statusColor = "bg-yellow-100 text-yellow-800";
                      else if (job.status === "SHORTLISTED") statusColor = "bg-purple-100 text-purple-800";
                      else if (job.status === "INTERVIEW_SCHEDULED") statusColor = "bg-orange-100 text-orange-800";
                      else if (job.status === "INTERVIEWED") statusColor = "bg-indigo-100 text-indigo-800";
                      else if (job.status === "ACCEPTED") statusColor = "bg-green-100 text-green-800";
                      else if (job.status === "REJECTED") statusColor = "bg-red-100 text-red-800";
                      return (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="py-3 px-4">{job.date || "N/A"}</td>
                          <td className="py-3 px-4">{job.role || "N/A"}</td>
                          <td className="py-3 px-4">{job.company || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}>
                              {job.status || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-row space-x-4 justify-center">
                              <button
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                onClick={() => handleViewApplication(job)}
                              >
                                View
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 font-medium text-sm"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
                                    if (job.applicationId) {
                                      handleDeleteApplication(job.applicationId);
                                    } else if (job.jobId && user._id) {
                                      // Fallback: fetch applicationId from backend
                                      try {
                                        const response = await axios.get(
                                          `http://localhost:5000/api/applications/single`,
                                          {
                                            params: { jobId: job.jobId, userId: user._id },
                                            headers: { Authorization: `Bearer ${auth.token}` },
                                          }
                                        );
                                        if (response.data && response.data._id) {
                                          handleDeleteApplication(response.data._id);
                                        } else {
                                          alert('Could not find application to delete.');
                                        }
                                      } catch (err) {
                                        alert('Could not find application to delete.');
                                      }
                                    } else {
                                      alert('Delete not available for this application.');
                                    }
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 px-4 text-center text-gray-500 text-lg">
                        No jobs applied yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        </div>
        )}

        {/* Saved Jobs Table */}
        {user && user.role === 'jobseeker' && (
          <div className="max-w-6xl mx-auto mt-8 bg-white rounded-xl shadow-2xl py-6 px-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700 mb-2">Saved Jobs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {savedJobs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No saved jobs.</td>
                    </tr>
                  ) : (
                    savedJobs.map((job) => {
                      // Robust date parsing and debug logging
                      console.log('Saved Job:', job.title, 'Deadline:', job.deadline, 'Parsed:', Date.parse(job.deadline), 'Now:', new Date());
                      const isExpired = job.deadline && !isNaN(Date.parse(job.deadline)) && new Date(job.deadline) < new Date();
                      const isInactive = job.status && job.status !== 'Active';
                      return (
                        <tr key={job._id} className={isExpired || isInactive ? 'bg-gray-100 text-gray-400' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{job.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{job.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{job.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{job.salary}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2 items-center">
                            {isExpired ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs mr-7">Expired</span>
                            ) : isInactive ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Closed</span>
                            ) : (
                              <Link to={`/description/${job._id}`} className="text-teal-600 hover:underline">View Details</Link>
                            )}
                            <button
                              onClick={() => handleRemoveSavedJob(job._id)}
                              className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-red-200 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

        {showCoverLetterModal && (
          <CoverLetterModal
            coverLetter={selectedCoverLetter}
            onClose={() => setShowCoverLetterModal(false)}
          />
        )}

        {/* Archive Modal */}
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-2xl font-bold text-teal-700">Archived Applications</h3>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold transition"
                  title="Close"
                >
                  &times;
                </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-base text-gray-700">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Job Title</th>
                    <th className="py-3 px-4 font-semibold">Applied Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedApplications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500 py-6">No archived applications.</td>
                    </tr>
                  ) : (
                    archivedApplications.map((app, idx) => (
                      <tr
                        key={app._id}
                        className={idx % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="py-3 px-4">{app.applicantName}</td>
                        <td className="py-3 px-4">{app.jobTitle}</td>
                        <td className="py-3 px-4">{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{app.status}</td>
                        <td className="py-3 px-4">
                          <button
                            className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                            onClick={() => handleArchiveApplication(app._id, false)}
                          >
                            Unarchive
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-200 relative">
              <button
                onClick={() => setSelectedApplication(null)}
                className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition"
                title="Close"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold text-teal-700 mb-4">Application Details</h3>
              <p><strong>Date:</strong> {selectedApplication.date || selectedApplication.appliedDate || 'N/A'}</p>
              <p><strong>Job Role:</strong> {selectedApplication.role || 'N/A'}</p>
              <p><strong>Company:</strong> {selectedApplication.company || 'N/A'}</p>
              <p><strong>Status:</strong> {selectedApplication.status || 'N/A'}</p>
              <p>
                <strong>CV:</strong>{' '}
                {selectedApplication.resume ? (
                  <a
                    href={`http://localhost:5000/${selectedApplication.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline"
                  >
                    View CV
                  </a>
                ) : (
                  'No CV uploaded'
                )}
              </p>
              <p>
                <strong>Cover Letter:</strong>{' '}
                {selectedApplication.coverLetterFile ? (
                  <a
                    href={`http://localhost:5000/${selectedApplication.coverLetterFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline"
                  >
                    View Cover Letter
                  </a>
                ) : selectedApplication.coverLetter ? (
                  <span className="block mt-2 whitespace-pre-line">{selectedApplication.coverLetter}</span>
                ) : (
                  'No cover letter'
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;