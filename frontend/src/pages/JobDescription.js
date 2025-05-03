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
          const { token } = JSON.parse(authData);
          const userResponse = await axios.get("http://localhost:5000/api/auth/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (userResponse.data.appliedJobs) {
            const appliedJob = userResponse.data.appliedJobs.find(
              job => job.role === response.data.title && 
                     job.company === response.data.company
            );
            
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
                <span className={`font-semibold mb-2 ${
                  applicationStatus === 'PENDING' ? 'text-yellow-600' :
                  applicationStatus === 'ACCEPTED' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  {applicationStatus === 'PENDING' ? '✓ Application Pending Review' :
                   applicationStatus === 'ACCEPTED' ? '✓ Application Accepted' :
                   '✗ Application Rejected'}
                </span>
              )}
              <button
                onClick={handleApply}
                className={`px-6 py-2 rounded-lg transition ${
                  hasApplied && applicationStatus !== 'REJECTED'
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-purple-700 text-white"
                }`}
                disabled={hasApplied && applicationStatus !== 'REJECTED'}
              >
                {hasApplied && applicationStatus === 'PENDING' ? "Application Pending" :
                 hasApplied && applicationStatus === 'ACCEPTED' ? "Application Accepted" :
                 hasApplied && applicationStatus === 'REJECTED' ? "Apply Again" :
                 "Apply Now"}
              </button>
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