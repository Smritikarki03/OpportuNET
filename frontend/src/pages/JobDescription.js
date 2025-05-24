import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const JobDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(response.data);
        
        // Check if user has already applied
        const authData = localStorage.getItem("auth");
        if (authData) {
          const { token, user } = JSON.parse(authData);
          const userResponse = await axios.get("http://localhost:5000/api/auth/userInfo", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (userResponse.data.appliedJobs) {
            // Debug logging
            console.log('Job being viewed:', response.data);
            console.log('User appliedJobs:', userResponse.data.appliedJobs);
            const appliedJob = userResponse.data.appliedJobs.find(job => {
              if (job.jobId) {
                // Always compare as strings
                if (job.jobId.toString() === response.data._id.toString()) {
                  return true;
                }
                if (typeof job.jobId === 'object' && job.jobId !== null && job.jobId._id && job.jobId._id.toString() === response.data._id.toString()) {
                  return true;
                }
              }
              // Fallback: match by title and company (case-insensitive, trimmed)
              return (
                job.role?.trim().toLowerCase() === response.data.title?.trim().toLowerCase() &&
                job.company?.trim().toLowerCase() === response.data.company?.trim().toLowerCase()
              );
            });
            
            if (appliedJob) {
              setHasApplied(true);
              setApplicationStatus(appliedJob.status);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job:", error);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = () => {
    const authData = localStorage.getItem("auth");
    if (!authData) {
      alert("Please log in to apply for this job.");
      navigate("/Login");
      return;
    }

    if (hasApplied && applicationStatus === 'PENDING') {
      alert("You have already applied for this job and it's pending review.");
      return;
    }

    if (hasApplied && applicationStatus === 'ACCEPTED') {
      alert("Your application has already been accepted for this job.");
      return;
    }

    navigate(`/apply/${id}`);
  };

  if (loading) {
    return <div className="text-center text-teal-700">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center text-red-600">Job not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
              <div className="flex space-x-4 mt-2">
                <span className="text-gray-600">{job.noOfPositions} Positions</span>
                <span className="text-gray-600">{job.jobType}</span>
                <span className="text-gray-600">{job.salary} Rs</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {hasApplied && (
                <>
                  <span className={`font-semibold mb-2 ${
                    applicationStatus === 'APPLIED' ? 'text-blue-600' :
                    applicationStatus === 'REVIEWED' ? 'text-yellow-600' :
                    applicationStatus === 'SHORTLISTED' ? 'text-purple-600' :
                    applicationStatus === 'INTERVIEW_SCHEDULED' ? 'text-orange-600' :
                    applicationStatus === 'INTERVIEWED' ? 'text-indigo-600' :
                    applicationStatus === 'ACCEPTED' ? 'text-green-600' :
                    applicationStatus === 'REJECTED' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {applicationStatus === 'APPLIED' ? '✓ Application Submitted' :
                     applicationStatus === 'REVIEWED' ? '✓ Application Reviewed' :
                     applicationStatus === 'SHORTLISTED' ? '✓ Application Shortlisted' :
                     applicationStatus === 'INTERVIEW_SCHEDULED' ? '✓ Interview Scheduled' :
                     applicationStatus === 'INTERVIEWED' ? '✓ Interviewed' :
                     applicationStatus === 'ACCEPTED' ? '✓ Application Accepted' :
                     applicationStatus === 'REJECTED' ? '✗ Application Rejected' :
                     '✓ Application Status Unknown'}
                  </span>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-teal-600 underline text-sm mb-2"
                  >
                    Refresh Status
                  </button>
                </>
              )}
              {(!window.localStorage.getItem('auth') || (JSON.parse(window.localStorage.getItem('auth'))?.user?.role !== 'employer')) && (
                <>
                  <button
                    onClick={handleApply}
                    className={`px-6 py-2 rounded-lg transition mb-1 ${
                      hasApplied && applicationStatus !== 'REJECTED'
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-teal-600 hover:bg-purple-700 text-white"
                    }`}
                    disabled={hasApplied && applicationStatus !== 'REJECTED'}
                  >
                    {hasApplied && applicationStatus === 'APPLIED' ? "Application Submitted" :
                     hasApplied && applicationStatus === 'REVIEWED' ? "Application Reviewed" :
                     hasApplied && applicationStatus === 'SHORTLISTED' ? "Application Shortlisted" :
                     hasApplied && applicationStatus === 'INTERVIEW_SCHEDULED' ? "Interview Scheduled" :
                     hasApplied && applicationStatus === 'INTERVIEWED' ? "Interviewed" :
                     hasApplied && applicationStatus === 'ACCEPTED' ? "Application Accepted" :
                     hasApplied && applicationStatus === 'REJECTED' ? "Apply Again" :
                     "Apply Now"}
                  </button>
                  {hasApplied && applicationStatus !== 'REJECTED' && (
                    <span className="text-sm text-gray-500 mt-1">You have already applied for this job.</span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Role:</strong> {job.title}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Requirements:</strong> {job.requirements}</p>
              <p><strong>Experience:</strong> {job.experienceLevel}</p>
              <p><strong>Salary:</strong> {job.salary} Rs</p>
              <p><strong>Total Applicants:</strong> {job.totalApplicants || 0}</p>
              <p><strong>Posted Date:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
              <p><strong>Application Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDescription;